import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// AI Coach Decision Support API
app.post("/api/coach", async (req, res) => {
  try {
    const { activeTab, activeFeature, prdSlice, activeFlowNode, userMessage } = req.body;

    const systemInstruction = `
You are Manny Coach, a critical PM decision-support AI embedded in Manyfast — a SaaS tool for writing PRDs, feature specs, and user flows.
Your job is NOT to validate or encourage. Your job is to stress-test PM thinking, surface blind spots, and provide evidence-based recommendations grounded in the user's actual document context.

When the user requests feedback, you MUST act as a Devil's Advocate (non-negotiable). Do not praise the user's ideas. Instead, look for gaps, risks, and hard realities.

Follow these behavioral rules:
1. Context-First Analysis:
   - If activeFeature is present -> analyze its AC list specifically. Point out: missing edge cases, untestable criteria, contradictions, failure conditions.
   - If prdSlice is present -> challenge the targetUser definition (force segments, no broad "everybody" TAM) and successMetrics (ask for baseline, measurability, fake proxy metrics).
   - If activeFlowNode is present -> identify drop-off risks, missing error/fallback states for that specific node.
2. Devil's Advocate Mode:
   - Challenge broad assumptions, lazy success metrics, lack of competitors, lack of WTP (willingness to pay) considerations.
   - Use Mom Test framing: suggest asking about past behavior, not hypothetical intent.
3. No Fabricated Statistics:
   - Never state percentages, conversion rates, or benchmark numbers without a verifiable source.
   - If referencing an industry pattern, explicitly state source as "Industry heuristic (unverified — recommend validating with [method])". Never invent fake report titles.
4. Structured Confidence:
   - Recommendation Confidence levels MUST be 'Verified' (backed by specific source), 'Heuristic' (common PM practice), or 'Hypothesis' (logical inference, needs validation).
5. Actionable Over Advisory:
   - Each recommendation must specify exact 'target' ('AC' | 'PRD' | 'FlowNode' | 'Strategy') so the frontend can offer an apply action.
   - Recommendations must be highly specific, actionable text. Instead of "consider fallback", write "Add AC: '태그 검색 결과가 없을 경우, 유사 인기 관심사 태그 Top 5 자동 추천 노출'".

Provide all output texts in Korean (한국어로 상세하고 까칠하게 작성), as requested by the user instruction '모든 답변은 한글로 해줘'.
`;

    const promptText = `
Given the following PM workspace context, perform is a deep, critical risk and decision analysis.

CONTEXT:
- Active Tab: "${activeTab || "PRD"}"
- Active Feature Details (from SPEC):
  ${activeFeature ? JSON.stringify(activeFeature, null, 2) : "None selected (no active feature spec)"}
- PRD Slice (Problem & Target & Metrics):
  ${prdSlice ? JSON.stringify(prdSlice, null, 2) : "None selected (no active context)"}
- Active User Flow Node:
  ${activeFlowNode ? JSON.stringify(activeFlowNode, null, 2) : "None selected (no active flow node)"}
- User's Message/Question:
  "${userMessage || "전체 상태 검증 및 비판적 리스크 분석을 시작합니다."}"

Analyze the context deeply based on your behavioral instructions. Fill in factual points, assumptions, actionable and direct recommendations, and uncomfortable challenges. Output MUST strictly match the response schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["facts", "assumptions", "recommendations", "challenges", "coachSummary"],
          properties: {
            facts: {
              type: Type.ARRAY,
              description: "A list of verifiable factual patterns, industry heuristics, or specified user requirements.",
              items: {
                type: Type.OBJECT,
                required: ["claim", "source"],
                properties: {
                  claim: { type: Type.STRING, description: "A factual statement or industry pattern. Must be objective." },
                  source: { type: Type.STRING, description: "Verifiable URL/Title, 'User-provided', or 'Industry heuristic (unverified)'" }
                }
              }
            },
            assumptions: {
              type: Type.ARRAY,
              description: "List of key assumptions underlying this feature or document plan.",
              items: {
                type: Type.OBJECT,
                required: ["assumption", "risk", "validationSuggestion"],
                properties: {
                  assumption: { type: Type.STRING, description: "What this plan assumes to be true." },
                  risk: { type: Type.STRING, description: "Risk level of this assumption.", enum: ["Low", "Medium", "High"] },
                  validationSuggestion: { type: Type.STRING, description: "Specific, actionable way to validate this assumption (e.g., Mom Test question, user interview, analytics)." }
                }
              }
            },
            recommendations: {
              type: Type.ARRAY,
              description: "Highly actionable steps targeted directly at document elements (AC, PRD, FlowNode, Strategy).",
              items: {
                type: Type.OBJECT,
                required: ["action", "target", "rationale", "confidence"],
                properties: {
                  action: { type: Type.STRING, description: "Specific actionable Korean text (e.g., 'Add AC: ...' or 'Update PRD Target User: ...'). Must be ready to apply directly." },
                  target: { type: Type.STRING, description: "Where to apply this recommendation.", enum: ["AC", "PRD", "FlowNode", "Strategy"] },
                  rationale: { type: Type.STRING, description: "The underlying rationale for why this is critical in this specific context." },
                  confidence: { type: Type.STRING, description: "Confidence level of recommendation.", enum: ["Verified", "Heuristic", "Hypothesis"] }
                }
              }
            },
            challenges: {
              type: Type.ARRAY,
              description: "Uncomfortable questions the PM must face.",
              items: {
                type: Type.OBJECT,
                required: ["question", "category"],
                properties: {
                  question: { type: Type.STRING, description: "A direct, uncomfortable question that forces the PM to re-think their approach." },
                  category: { type: Type.STRING, description: "The core metric category of this challenge.", enum: ["TAM", "WTP", "AC_Gap", "Competitor", "Assumption"] }
                }
              }
            },
            coachSummary: {
              type: Type.STRING,
              description: "A short, 2-3 sentence critical synthesis. Do NOT use generic praise or soft warnings. Be sharp and direct."
            }
          }
        }
      }
    });

    const result = response.text ? JSON.parse(response.text) : {};
    res.json(result);
  } catch (error: any) {
    console.error("AI Coach API execution failed:", error);
    res.status(500).json({
      error: "Manny Coach가 분석 도중 잠시 뇌정지가 왔습니다. 데이터를 확인하고 다시 요청해주세요.",
      details: error.message
    });
  }
});

// general chatbot logic for Left Sidebar chat to use Gemini as well (enhancing functionality)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // System instruction for the PM helper chatbot
    const systemInstruction = `
You are Manny, an intelligent product manager assistant helping a startup PM refine their PRD, functional specifications, and user flows on Manyfast.
Your goal is to answer any queries dynamically, guide correct software specification structure, and suggest standard industry practices.
Always speak politely but clearly in Korean. Avoid overly complex technical jargon, focus purely on functional outcomes.
If they ask about "Manny Coach", refer to the right sidebar decision-coach.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text || "답변을 생성하지 못했습니다." });
  } catch (error: any) {
    console.error("General chat API failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
