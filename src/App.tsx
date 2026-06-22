import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Bell, User, Share, Lightbulb, Zap, AlertCircle, 
  CheckSquare, Target, ChevronRight, Pin, PinOff, 
  LayoutGrid, PlayCircle, X, Send, ChevronUp, ChevronDown,
  Plus, MoreVertical, GitBranch, ArrowRight, List, Search,
  Trash2, Edit3, Sparkles, Check, Paperclip, ChevronLeft, FileText, Clock, HelpCircle, Eye
} from 'lucide-react';

// ==========================================
// TYPES DEFINITIONS
// ==========================================

interface FeatureAc {
  id: string;
  text: string;
  checked: boolean;
}

interface Feature {
  id: string;
  title: string;
  status: '완료' | '작성중' | '대기중';
  priority: 'High' | 'Medium' | 'Low';
  assignee: string;
  idCode: string;
  desc?: string;
  ac?: FeatureAc[];
  exceptions?: string;
}

interface Requirement {
  id: string;
  number: number;
  title: string;
  isStarred?: boolean;
  features: Feature[];
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  questions?: string[];
  chips?: { label: string; action: string }[];
}

interface UserFlow {
  id: string;
  title: string;
  date: string;
}

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================

const INITIAL_PRD_DOCUMENT = {
  title: "새로운 인맥을 만들고 싶은 사람들을 위해 관심사 기반으로 빠르고 매끄러운 소셜 네트워킹 및 커피챗 연결 앱",
  sections: {
    overview: {
      title: "개요",
      oneLiner: "관심사 기반 소셜 네트워킹 및 커피챗 연결 앱",
      goal: "사용자들이 공동 관심사를 가진 새로운 인맥을 쉽고 효율적으로 형성하고, 커피챗을 통해 의미 있는 만남을 활성화하여 전문적 및 개인적 성장을 도모하는 것.",
      background: "현대 사회에서 새로운 사람들을 만나고 인맥을 형성하는 것은 중요하지만, 기존의 소셜 미디어나 오프라인 모임만으로는 공통 관심사를 가진 사람들을 찾고 유의미한 관계를 맺기 어렵습니다. 특히 전문적 종사자나 이직을 고려하는 사람들에게는 더욱 필요한 부분입니다."
    },
    problem: {
      title: "문제 및 해결 방안",
      search: "사용자들이 공동 관심사를 가진 사람들을 찾기 어렵고, 기존의 네트워크를 넘어 새로운 전문적/개인적 인맥을 형성하는 데 어려움을 겪고 있습니다.",
      solution: "관심사 기반 매칭 알고리즘을 통해 사용자와 유사한 관심사를 가진 사람들을 연결하고, 커피챗 스케줄링 및 예약 기능을 제공하여 자연스러운 만남을 유도합니다. 또한, 그룹 채팅 및 커뮤니티 게시판을 통해 소통을 활성화하고, 프로필 기반 인맥 탐색 기능을 통해 사용자 스스로 새로운 인맥을 발견할 수 있도록 지원합니다.",
      differentiation: "단순한 소셜 인맥을 넘어, '커피챗'이라는 구체적인 만남 방식을 중심으로 설계하여 실질적인 네트워킹을 유도합니다. 또한, AI 기반 매칭 정확도 향상 및 신뢰할 수 있는 프로필 검증 메커니즘을 통해 무분별한 만남이 아닌, 서로에게 진짜 도움이 될 수 있는 시너지를 얻을 수 있는 인맥을 연결하는 데 집중합니다."
    },
    target: {
      title: "타겟 및 시나리오",
      targetUser: "새로운 인맥을 형성하고 싶은 전문직 종사자 (IT 개발자, 마케터, 디자이너 등) 및 이직을 고민하는 사람들, 특정 직종 또는 직무에 대한 정보를 얻고 싶거나 멘토를 찾거나, 잠재적 협업자를 만나고자 하는 20대 후반에서 40대 초반의 적극적인 커리어 관리자.",
      scenario: "사용자는 앱에 가입하여 자신의 관심사 및 직무 정보를 상세히 등록합니다. 이후 관심사 매칭 알고리즘을 통해 추천받은 인물들을 탐색하거나, 특정 관심사 그룹에 가입합니다. 관심 있는 사람을 발견하면 커피챗을 신청하고, 앱 내에서 스케줄을 조율하여 실제 만남을 가집니다. 만남 후에는 그룹 채팅이나 커뮤니티 게시판을 통해 지속적으로 소통하며 네트워크를 확장합니다."
    },
    success: {
      title: "성공·위험 요소",
      metrics: "월간 활성 사용자 수(MAU), 주간 커피챗 성사 건수, 사용자당 평균 커피챗 횟수, 신규 사용자 가입률, 사용자 유지율, 커뮤니티 게시물 작성 수.",
      risks: "사용자 확보의 어려움, 비활성 사용자 증가, 매칭 정확도 부족으로 인한 사용자 불만, 악의적인 사용자 또는 부적절한 만남 발생 가능성, 개인 정보 보호 및 보안 문제."
    }
  }
};

const INITIAL_REQUIREMENTS: Requirement[] = [
  {
    id: "req-1",
    number: 1,
    title: "관심사 기반 매칭 시스템",
    isStarred: true,
    features: [
      {
        id: "feat-1-1",
        title: "사용자 프로필 기반 추천 알고리즘",
        idCode: "R-TWDPLF",
        status: "작성중",
        priority: "High",
        assignee: "Manny",
        desc: "사용자가 등록한 관심사, 직무, 경험 등을 바탕으로 유사한 프로필을 가진 다른 사용자를 추천하는 알고리즘.",
        ac: [
          { id: "ac-1", text: "사용자는 가입 시 최소 3개 이상의 관심사를 선택할 수 있어야 한다.", checked: true },
          { id: "ac-2", text: "시스템은 사용자의 프로필 정보(관심사, 직무, 경험 등)를 기반으로 매일 자정 추천 리스트를 갱신해야 한다.", checked: false },
          { id: "ac-3", text: "사용자는 추천받은 인물의 프로필을 상세히 열람할 수 있어야 한다.", checked: false }
        ],
        exceptions: "추천할 사용자가 0명일 경우, '새로운 사용자를 찾고 있어요' 안내 문구 노출 및 관심사 범위 확대 제안."
      },
      {
        id: "feat-1-2",
        title: "매칭 선호도 필터링",
        idCode: "R-MATCHFIL",
        status: "대기중",
        priority: "Medium",
        assignee: "Unassigned",
        desc: "사용자가 추천 화면 및 탐색 화면에서 직무, 연차, 지역 등의 조건을 직접 필터링하여 매칭 정밀도를 높이는 기능.",
        ac: [
          { id: "ac-1-2-1", text: "필터링 패널에서 직무 1개 이상 및 최대 5년 연차 범위를 다중 슬라이더로 조절할 수 있어야 한다.", checked: false }
        ]
      },
      {
        id: "feat-1-3",
        title: "관심사 태그 관리 시스템",
        idCode: "R-TAGMNG",
        status: "완료",
        priority: "Low",
        assignee: "JH",
        desc: "마이페이지에서 자신의 프로필 관심사 키워드 태그를 자유롭게 수정, 추가, 정렬하는 기능.",
        ac: [
          { id: "ac-1-3-1", text: "자동 완성 입력을 통해 이미 가입된 태그 중 하나를 손쉽게 클릭하여 추가할 수 있어야 한다.", checked: true }
        ]
      }
    ]
  },
  {
    id: "req-2",
    number: 2,
    title: "커피챗 스케줄링 및 예약 기능",
    isStarred: true,
    features: [
      {
        id: "feat-2-1",
        title: "인앱 캘린더 연동",
        idCode: "R-COFCAL",
        status: "작성중",
        priority: "High",
        assignee: "Manny",
        desc: "사용자의 외부 캘린더(Google Calendar, Outlook)와 연동하여 실시간 약속 가능 일시를 추출하고 인앱에서 시뮬레이션 예약이 가능하도록 하는 기능.",
        ac: [
          { id: "ac-2-1-1", text: "상호 연동 동의 절차 후 캘린더의 일정을 안전하게 동기화해야 한다.", checked: false },
          { id: "ac-2-1-2", text: "상대방에게 가능한 시간대 슬롯을 카카오톡 또는 이메일 링크 형식으로 제안할 수 있어야 한다.", checked: false }
        ]
      },
      {
        id: "feat-2-2",
        title: "예약 확정 및 자동 리마인더 알림",
        idCode: "R-CALNOTI",
        status: "대기중",
        priority: "Medium",
        assignee: "Unassigned",
        desc: "커피챗 약속 수락, 일정 조율 및 확정 단계 시 상대방에게 실시간 인앱 푸시 및 알림 이메일을 전송합니다."
      }
    ]
  },
  {
    id: "req-3",
    number: 3,
    title: "프로필 관리 및 탐색",
    isStarred: true,
    features: [
      {
        id: "feat-3-1",
        title: "프로필 완성도 검증 시스템",
        idCode: "R-PROFCOMP",
        status: "대기중",
        priority: "Low",
        assignee: "Unassigned",
        desc: "이력서, 포트폴리오 링크, 한줄 소개 및 재직 분야 등 핵심 내용을 작성할 때마다 진척 게이지(ProgressBar)를 통해 넛지하는 사용자 시스템."
      }
    ]
  },
  {
    id: "req-4",
    number: 4,
    title: "그룹 채팅 및 커뮤니티 게시판",
    isStarred: true,
    features: []
  },
  {
    id: "req-5",
    number: 5,
    title: "알림 시스템",
    isStarred: true,
    features: []
  }
];

const INITIAL_CHATS: ChatMessage[] = [
  {
    id: "msg-0",
    sender: "ai",
    text: "안녕하세요! 저는 기획 작업을 도와드릴 Manny입니다. 제품을 더 자세히 기획하기 위한 질문을 드릴게요."
  },
  {
    id: "msg-1-q",
    sender: "ai",
    text: "Q1. 이 서비스의 주요 타겟 사용자는 누구인가요?"
  },
  {
    id: "msg-1-a",
    sender: "user",
    text: "직장인 및 이직 희망자"
  },
  {
    id: "msg-2-q",
    sender: "ai",
    text: "Q2. 현재 타겟 사용자들이 겪는 가장 큰 어려움은 무엇인가요?"
  },
  {
    id: "msg-2-a",
    sender: "user",
    text: "비슷한 관심사를 가진 사람 찾기 어려움"
  },
  {
    id: "msg-3-q",
    sender: "ai",
    text: "Q3. 이 제품이 궁극적으로 달성하고자 하는 가장 중요한 목표는 무엇인가요?"
  },
  {
    id: "msg-3-a",
    sender: "user",
    text: "커피챗을 통한 네트워킹 활성화"
  },
  {
    id: "msg-4-q",
    sender: "ai",
    text: "Q4. 사용자들이 인맥을 형성하고 만남을 가질 수 있도록 제공할 핵심 기능은 무엇인가요? (복수 선택)"
  },
  {
    id: "msg-4-a",
    sender: "user",
    text: "관심사 기반 매칭 알고리즘, 커피챗 일정 조율 및 예약, 그룹 채팅 및 커뮤니티 게시판, 프로필 기반 인맥 탐색"
  },
  {
    id: "msg-5-q",
    sender: "ai",
    text: "Q5. 사용자가 이 앱을 처음부터 끝까지 이용하는 전형적인 흐름은 어떻게 될까요?"
  },
  {
    id: "msg-5-a",
    sender: "user",
    text: "회원가입 ➜ 주변 탐색 ➜ 그룹 가입 ➜ 모임 참여"
  },
  {
    id: "msg-6-q",
    sender: "ai",
    text: "Q6. 이 서비스는 주로 어떤 형태로 제공될 예정인가요?"
  },
  {
    id: "msg-6-a",
    sender: "user",
    text: "모바일 앱 (iOS/Android)"
  },
  {
    id: "msg-final",
    sender: "ai",
    text: "제출해주신 답변을 바탕으로 PRD 초안 생성을 완료했어요. 이어서 대화를 계속할 수 있어요!",
    chips: [
      { label: "⚡ 기능명세서 완성하기", action: "GOTO_SPEC" },
      { label: "❓ 매니페스트 어떻게 써요?", action: "HOW_TO_MANIFEST" },
      { label: "🪄 기획 문서 전체 검토하기", action: "REVIEW_ALL" }
    ]
  }
];

// ==========================================
// CORE APP
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState<'PRD' | '기능명세서' | '유저플로우'>('PRD');
  
  // Left Sidebar Chat States
  const [chats, setChats] = useState<ChatMessage[]>(INITIAL_CHATS);
  const [typingInput, setTypingInput] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Document states
  const [prdDoc, setPrdDoc] = useState(INITIAL_PRD_DOCUMENT);
  const [roles, setRoles] = useState<string[]>(['User']);
  const [roleInput, setRoleInput] = useState<string>('');
  const [devices, setDevices] = useState<string[]>(['iOS', 'Android']);
  const [deviceInput, setDeviceInput] = useState<string>('');

  // Spec States
  const [requirements, setRequirements] = useState<Requirement[]>(INITIAL_REQUIREMENTS);
  const [selectedReqId, setSelectedReqId] = useState<string>('req-1');
  const [selectedFeatId, setSelectedFeatId] = useState<string>('feat-1-1');
  const [reqSearchQuery, setReqSearchQuery] = useState<string>('');
  const [specSubLayout, setSpecSubLayout] = useState<'document' | 'mindmap'>('document');
  const [selectedMindmapNode, setSelectedMindmapNode] = useState<string>('req-1');

  // AI Decision Coach panel states
  const [coachOpen, setCoachOpen] = useState<boolean>(false);
  const [coachPinned, setCoachPinned] = useState<boolean>(false);
  const [coachActiveTab, setCoachActiveTab] = useState<'comment' | 'risk' | 'bench'>('comment');
  const [coachChatInput, setCoachChatInput] = useState<string>('');
  const [coachAnswers, setCoachAnswers] = useState<string[]>([
    "Manny Coach: 분석해 본 결과 '관심사 기반 매칭'의 우선순위는 매우 합당합니다. 다만 매칭 노쇼율을 억제하기 위해 가벼운 페널티 가이드를 수용 기준(AC)에 적용해보시는 것을 권장합니다."
  ]);

  // Dynamic Real-time Coach Analysis State backed by Gemini 3.5 Flash
  const [coachAnalysis, setCoachAnalysis] = useState<any>({
    facts: [
      {
        claim: "매칭 네트워크 환경에서 빈 타임 캘린더 예약을 조율하는 단계가 사용성이 가장 까다롭고 이탈이 큰 지점입니다.",
        source: "Industry heuristic (unverified)"
      },
      {
        claim: "초기 타겟 직장인 소셜 네트워킹은 노쇼 처벌 페널티 없이는 단순 신청 횟수가 성사율로 전이되기 힘듭니다.",
        source: "User-provided"
      }
    ],
    assumptions: [
      {
        assumption: "사용자들이 추천 목록 갱신을 위해 상시로 매니패스트 프로필에 성실하고 풍부한 관심 태그를 기동할 것이다.",
        risk: "High",
        validationSuggestion: "실제 이직/커리어 모임 직장인 15명을 상대로, 가입 프로필 태그 3개 초과 기입 시 이탈률 허들 진단."
      }
    ],
    recommendations: [
      {
        action: "Add AC: 캘린더 연동 실패 및 스케줄링 충돌 시, 시스템이 카카오톡 푸시/알림톡 연계 수동 조율용 예약 대기 슬롯 링크를 발행한다.",
        target: "AC",
        rationale: "스케줄링 충돌이 발생하면 기획 상 별도의 복구 플로우가 부재하여 사용자는 그 즉시 이탈(Churn)하는 결과를 낳기 때문입니다.",
        confidence: "Heuristic"
      },
      {
        action: "Update PRD Problem: 커피챗 탐색 자체의 편의보다 최종 오프라인/온라인 예약 성사 시점의 시간 비동기 마찰과 약속 미이행 리스크를 핵심 과제로 설정한다.",
        target: "PRD",
        rationale: "PM이 명문화하고 있는 core metrics가 단순히 가입 및 커피챗 신청 횟수(Proxy metric)에 매료되어, 약속 노쇼라는 실질 성사율 변수를 간과하고 있기 때문.",
        confidence: "Verified"
      }
    ],
    challenges: [
      {
        question: "사용자들이 이 서비스에 대해 1회 커피챗당 실제 가치(WTP)를 단 1,000원이라도 지불할 행동 유인이 있는가? 무료 매칭만 소모 후 종료될 위험은 없나?",
        category: "WTP"
      }
    ],
    coachSummary: "현재 설계된 관심사 대칭 및 매칭 프로세스는 깔끔하나, 캘린더 마찰 시 예외 대안(AC)이 비어있어 이탈 가능성이 막대합니다. 디시전 코치가 제시한 리스크 기반 검토 항목을 확인하고, 우측 추천 상자를 클릭해 기획 문서에 일괄 자동 적용하십시오."
  });
  const [coachLoading, setCoachLoading] = useState<boolean>(false);

  // Flow State
  const [activeFlowId, setActiveFlowId] = useState<string>('flow-1');
  const [flows, setFlows] = useState<UserFlow[]>([
    { id: 'flow-1', title: '새 플로우 1', date: '2026.06.22' }
  ]);
  const [selectedFlowNode, setSelectedFlowNode] = useState<string>('node-2');

  const activeNodeDetails = useMemo(() => {
    const nodesMap: { [key: string]: { title: string; goal: string; desc: string; trigger: string } } = {
      'node-1': {
        title: "앱 시작 (EntryPoint Entry)",
        goal: "사용자가 네이티브 설치 후 최초 메인 랜딩을 마주할 때 로딩 속도 1.5초 이내 진입 보장.",
        desc: "초기 모바일 스플래시 및 가용 토크를 설정하기 위한 통신 로딩 구간.",
        trigger: "구조적 안정성을 위해 가입 온보딩 페이지로의 세션을 유지하는 가드 로직 필요."
      },
      'node-2': {
        title: "온보딩/인증 (Onboarding Portal)",
        goal: "이용자가 이탈 없이 가치 경험 전 단계인 계정 데이터 세팅을 마치는 것.",
        desc: "앱 시작 직후 나타나는 소셜 계정 생성 또는 일반 계정 로그인 스크린.",
        trigger: "회원 가입 필수 단계를 최소화하고 후-기입 유입 기획으로 보완 유망."
      },
      'node-3': {
        title: "소셜 로그인 (OAuth Integration)",
        goal: "최소한의 가중치로 1클릭 간편 인증 마감.",
        desc: "카카오, 네이버, Google 등 주요 소셜 연동을 활용한 쉬운 계정 생성과 매칭 연동 프로필 추출.",
        trigger: "가중 조건 필터링에서 취미/직종 추출을 스킵 가능하게 제공 유망."
      },
      'node-4': {
        title: "이메일 회원가입 (Traditional Join)",
        goal: "최소 정보만으로 패스워드 검증 후 신규 식별 기둥 구축.",
        desc: "비밀번호 검증 가이드를 부드럽게 에이전시 피드백으로 감싸 이탈 방출 최소화.",
        trigger: "비밀번호 자율 가이드 툴팁과 입력 양식의 직관적 에러 렌더링 제공 필요."
      },
      'node-5': {
        title: "관심사 선택 (Preference Selector)",
        goal: "가입 유저에게 적어도 3개 이상의 핵심 키워드를 기입하도록 넛징.",
        desc: "개발, 마케팅, 디자인 등 매치 엔진을 기동하는 태그 키워드 세팅 인터랙션 스크린.",
        trigger: "사전 정의된 추천 태그를 bento 다이내믹 그리드로 노출하여 매칭 성사 속도 극대화."
      }
    };
    return nodesMap[selectedFlowNode] || nodesMap['node-2'];
  }, [selectedFlowNode]);

  // AI 분석 API 호출 및 동기화 함수
  const triggerCoachAnalysis = async (customMessage?: string) => {
    setCoachLoading(true);
    try {
      const currentReq = requirements.find(r => r.id === selectedReqId) || requirements[0];
      const currentFeat = currentReq?.features?.find(f => f.id === selectedFeatId) || currentReq?.features?.[0];

      const payload = {
        activeTab,
        activeFeature: currentFeat ? {
          name: currentFeat.title,
          priority: currentFeat.priority,
          ac: currentFeat.ac?.map(acItem => acItem.text) || []
        } : null,
        prdSlice: prdDoc ? {
          problemStatement: prdDoc.sections.problem.search,
          targetUser: prdDoc.sections.target.targetUser,
          successMetrics: prdDoc.sections.success.metrics
        } : null,
        activeFlowNode: activeNodeDetails ? {
          label: activeNodeDetails.title,
          type: "Flow Component",
          notes: activeNodeDetails.desc
        } : null,
        userMessage: customMessage || ""
      };

      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("API call failed");

      const data = await response.json();
      if (data && data.coachSummary) {
        setCoachAnalysis(data);
        if (customMessage) {
          setCoachAnswers(prev => [...prev, `Manny Coach: ${data.coachSummary}`]);
        }
      }
    } catch (e) {
      console.error("Manny Coach API failed, using fallback mock data:", e);
    } finally {
      setCoachLoading(false);
    }
  };

  // 피드백 추천 항목 본문 직접 반영 자동화 함수
  const handleApplyRecommendation = (rec: any) => {
    if (rec.target === "AC") {
      const currentReq = requirements.find(r => r.id === selectedReqId) || requirements[0];
      let currentFeat = currentReq?.features?.find(f => f.id === selectedFeatId);
      
      if (!currentFeat && currentReq?.features?.length > 0) {
        currentFeat = currentReq.features[0];
      }
      
      if (!currentFeat) {
        alert("적용할 활성 기능 명세를 선택해 주세요.");
        return;
      }
      
      let acText = rec.action.replace(/^Add AC:\s*/i, "").replace(/['"‘“`]/g, "");

      setRequirements(prev => prev.map(req => {
        return {
          ...req,
          features: req.features.map(feat => {
            if (feat.id === currentFeat.id) {
              const currentAc = feat.ac || [];
              if (currentAc.some(a => a.text === acText)) return feat;
              return {
                ...feat,
                ac: [...currentAc, { id: `ac-applied-${Date.now()}`, text: acText, checked: false }]
              };
            }
            return feat;
          })
        };
      }));
      alert(`🎉수용 기준(AC)에 제안서가 반영되었습니다:\n"${acText}"`);
    } else if (rec.target === "PRD") {
      let updatedPrd = { ...prdDoc };
      
      if (rec.action.toLowerCase().includes("problem") || rec.action.includes("문제")) {
        updatedPrd.sections.problem.search = `${updatedPrd.sections.problem.search}\n\n[Manny Coach 리브랜딩 적용]: ${rec.action}`;
      } else if (rec.action.toLowerCase().includes("metric") || rec.action.includes("지표")) {
        updatedPrd.sections.success.metrics = `${updatedPrd.sections.success.metrics}, ${rec.action.replace(/^Update Success Metrics:\s*/i, "")}`;
      } else {
        updatedPrd.sections.target.targetUser = `${updatedPrd.sections.target.targetUser}\n\n[Manny Coach 반영]: ${rec.action}`;
      }
      
      setPrdDoc(updatedPrd);
      alert(`🎉PRD 기획 문서 타겟/정의 항목에 코치 피드백이 적용되었습니다!`);
    } else if (rec.target === "FlowNode") {
      alert(`🎉유저 플로우 현재 노드의 'AI 수치 이탈 가드라인'에 대체 예외 조치가 주입 완료되었습니다!`);
    } else {
      alert(`🎉제품 출시 및 마케팅 극복 전략으로 벤치마크 기동방안이 설정되었습니다!`);
    }
  };

  useEffect(() => {
    if (coachOpen || coachPinned) {
      const timer = setTimeout(() => {
        triggerCoachAnalysis();
      }, 505);
      return () => clearTimeout(timer);
    }
  }, [activeTab, selectedReqId, selectedFeatId, selectedFlowNode, coachOpen, coachPinned]);

  // Multi-step auto-scroll to Chat Bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  // Handle Spec bottom navigation
  const handleMoveToSpec = () => {
    setActiveTab('기능명세서');
  };

  // Chat message submission from Left sidebar
  const handleSendChatMessage = async (text?: string) => {
    const finalMsg = text || typingInput;
    if (!finalMsg.trim()) return;

    const userMessage: ChatMessage = {
      id: `usermsg-${Date.now()}`,
      sender: 'user',
      text: finalMsg
    };

    setChats(prev => [...prev, userMessage]);
    setTypingInput('');

    // Dynamic AI loading step
    const aiPlaceholder: ChatMessage = {
      id: `aimsg-loading-${Date.now()}`,
      sender: 'ai',
      text: "Manny AI가 기획서 컨텍스트를 분석하여 답변을 생성하는 중입니다..."
    };
    setChats(prev => [...prev, aiPlaceholder]);

    try {
      const historyPayload = chats.filter(c => !c.id.includes("loading"));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalMsg, history: historyPayload })
      });

      if (!response.ok) throw new Error("API status non-200");
      const data = await response.json();

      setChats(prev => prev.map(c => {
        if (c.id.includes("loading")) {
          return {
            id: `aimsg-${Date.now()}`,
            sender: 'ai',
            text: data.text || "답변을 가져올 수 없었습니다.",
            chips: finalMsg.toLowerCase().includes("검토") ? [
              { label: "⚡ 기능명세서 완성하기", action: "GOTO_SPEC" },
              { label: "🪄 기획 문서 전체 검토하기", action: "REVIEW_ALL" }
            ] : undefined
          };
        }
        return c;
      }));
    } catch (e) {
      // Offline fallback state
      setTimeout(() => {
        setChats(prev => prev.map(c => {
          if (c.id.includes("loading")) {
            return {
              id: `aimsg-${Date.now()}`,
              sender: 'ai',
              text: getDynamicAiResponse(finalMsg)
            };
          }
          return c;
        }));
      }, 600);
    }
  };

  // Helper AI replies matching prompt intent (Offline fallback source of truth)
  const getDynamicAiResponse = (input: string): string => {
    const cleanLower = input.toLowerCase();
    if (cleanLower.includes('기능명세서') || cleanLower.includes('spec')) {
      return "기능명세서 작업용 요구사항 구조를 최적화 완료했습니다. 이제 '기능명세서' 탭을 활성화 하시면 상세 액티브 요구사항과 3단 수용 기준을 정밀 조정할 수 있습니다.";
    }
    if (cleanLower.includes('검토') || cleanLower.includes('review')) {
      return "기획 문서를 전수 정적 수동 진단한 결과, '문제 정의 -> 대안 제시' 흐름의 맥락 일관성은 98%로 우수합니다. '속성 설정'에서 사용자 유형 및 매칭 세그먼트 가용 단계를 보완하는 것이 좋겠습니다.";
    }
    if (cleanLower.includes('매니페스트') || cleanLower.includes('manifest')) {
      return "매니패스트는 기획 결과물을 실시간 프로토타이핑 파일과 정합성 검증으로 자동 라우팅해주는 설정 스키마입니다. 필요시 화면에서 추가 생성 명령을 전달해 보세요.";
    }
    return "좋은 피드백입니다! 기획안의 완결성을 위해 오른쪽 의사결정 코치 패널에서 AC(수용기준) 정합성 분석 및 벤치마킹 데이터 검토를 추가로 수행하는 것을 추천합니다.";
  };

  const handleChipAction = (action: string) => {
    if (action === "GOTO_SPEC") {
      setActiveTab('기능명세서');
    } else if (action === "HOW_TO_MANIFEST") {
      handleSendChatMessage("매니패스트 어떻게 작성해?");
    } else if (action === "REVIEW_ALL") {
      handleSendChatMessage("기획 문서 전체 검토해 줘.");
    }
  };

  // Document attributes modification
  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleInput.trim() && !roles.includes(roleInput.trim())) {
      setRoles(prev => [...prev, roleInput.trim()]);
      setRoleInput('');
    }
  };

  const handleRemoveRole = (target: string) => {
    setRoles(prev => prev.filter(r => r !== target));
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (deviceInput.trim() && !devices.includes(deviceInput.trim())) {
      setDevices(prev => [...prev, deviceInput.trim()]);
      setDeviceInput('');
    }
  };

  const handleRemoveDevice = (target: string) => {
    setDevices(prev => prev.filter(d => d !== target));
  };

  // Spec requirements & feature changes
  const activeReq = useMemo(() => {
    return requirements.find(r => r.id === selectedReqId) || requirements[0];
  }, [requirements, selectedReqId]);

  const activeFeature = useMemo<Feature | undefined>(() => {
    if (!activeReq.features || activeReq.features.length === 0) return undefined;
    return activeReq.features.find(f => f.id === selectedFeatId) || activeReq.features[0];
  }, [activeReq, selectedFeatId]);

  const handleToggleAc = (featId: string, acId: string) => {
    setRequirements(prev => prev.map(req => {
      return {
        ...req,
        features: req.features.map(feat => {
          if (feat.id === featId && feat.ac) {
            return {
              ...feat,
              ac: feat.ac.map(acItem => {
                if (acItem.id === acId) {
                  return { ...acItem, checked: !acItem.checked };
                }
                return acItem;
              })
            };
          }
          return feat;
        })
      };
    }));
  };

  const handleAddNewAc = (featId: string) => {
    const text = prompt("새로운 수용 기준(Acceptance Criteria)을 입력하세요:");
    if (!text || !text.trim()) return;

    setRequirements(prev => prev.map(req => {
      return {
        ...req,
        features: req.features.map(feat => {
          if (feat.id === featId) {
            const currentAc = feat.ac || [];
            return {
              ...feat,
              ac: [...currentAc, { id: `ac-custom-${Date.now()}`, text: text.trim(), checked: false }]
            };
          }
          return feat;
        })
      };
    }));
  };

  const handleAddNewFeature = (reqId: string) => {
    const title = prompt("새로운 상세 기능명을 입력하세요:");
    if (!title || !title.trim()) return;

    const newFeature: Feature = {
      id: `feat-custom-${Date.now()}`,
      title: title.trim(),
      idCode: `R-CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      status: '대기중',
      priority: 'Medium',
      assignee: 'Unassigned',
      desc: '새롭게 인입된 수동 기획 기능 명세 구조입니다. 상세 요구사항에 맞춤 설정을 등록해 보세요.',
      ac: [
        { id: `ac-init-${Date.now()}`, text: `${title.trim()}에 적합한 기본 성능 수용 기준을 충족해야 한다.`, checked: false }
      ]
    };

    setRequirements(prev => prev.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          features: [...req.features, newFeature]
        };
      }
      return req;
    }));

    setSelectedFeatId(newFeature.id);
  };

  const handleAddNewRequirement = () => {
    const title = prompt("새로운 요구사항 대분류명을 입력하세요:");
    if (!title || !title.trim()) return;

    const newReq: Requirement = {
      id: `req-custom-${Date.now()}`,
      number: requirements.length + 1,
      title: title.trim(),
      isStarred: true,
      features: []
    };

    setRequirements(prev => [...prev, newReq]);
    setSelectedReqId(newReq.id);
  };

  // Filtered requirements list based on searching
  const filteredRequirements = useMemo(() => {
    if (!reqSearchQuery.trim()) return requirements;
    return requirements.filter(req => 
      req.title.toLowerCase().includes(reqSearchQuery.toLowerCase()) || 
      req.features.some(f => f.title.toLowerCase().includes(reqSearchQuery.toLowerCase()))
    );
  }, [requirements, reqSearchQuery]);

  // Coach panel message sending (Real-time Decision Coach API Integration)
  const handleSendCoachMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachChatInput.trim()) return;
    const originalInput = coachChatInput;
    setCoachAnswers(prev => [...prev, `나: ${originalInput}`]);
    setCoachChatInput('');

    setCoachAnswers(prev => [...prev, "Manny Coach: 질문의 맥락과 현재 기획 상태를 매칭하여 재진단 중입니다..."]);

    try {
      // API call representing the dynamic coach chat answer
      const currentReq = requirements.find(r => r.id === selectedReqId) || requirements[0];
      const currentFeat = currentReq?.features?.find(f => f.id === selectedFeatId) || currentReq?.features?.[0];

      const payload = {
        activeTab,
        activeFeature: currentFeat ? {
          name: currentFeat.title,
          priority: currentFeat.priority,
          ac: currentFeat.ac?.map(acItem => acItem.text) || []
        } : null,
        prdSlice: prdDoc ? {
          problemStatement: prdDoc.sections.problem.search,
          targetUser: prdDoc.sections.target.targetUser,
          successMetrics: prdDoc.sections.success.metrics
        } : null,
        activeFlowNode: activeNodeDetails ? {
          label: activeNodeDetails.title,
          type: "Flow Component",
          notes: activeNodeDetails.desc
        } : null,
        userMessage: originalInput
      };

      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error();
      const data = await response.json();

      setCoachAnswers(prev => prev.map(ans => 
        ans.includes("재진단 중입니다") 
          ? `Manny Coach: ${data.coachSummary || "맥락 진단을 수용했습니다. 추천 보완 사항을 확인해 보세요."}` 
          : ans
      ));
      if (data && data.coachSummary) {
        setCoachAnalysis(data);
      }
    } catch {
      // Offline safety feedback fallback
      setCoachAnswers(prev => prev.map(ans => 
        ans.includes("재진단 중입니다") 
          ? `Manny Coach: 말씀하신 "${originalInput}" 영역은 실제 제품 캘린더 정합 리스크를 완화하는 데 탁월한 AC 구성이 될 수 있습니다. 우측 탭에서 벤치마킹 사항을 직접 기획에 이식해 보십시오.` 
          : ans
      ));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F3F4F6] text-gray-800 font-sans overflow-hidden">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER                                             */}
      {/* ========================================================= */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0 z-20 shadow-xs">
        <div className="flex items-center space-x-4">
          
          {/* Logo with purple pattern & title */}
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
              M
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-gray-900 truncate max-w-[200px] md:max-w-[280px]">
                  관심사 기반 소셜 네트워킹 및 커피챗 연...
                </span>
                <Edit3 size={11} className="text-gray-400 hover:text-gray-600" />
                <Clock size={11} className="text-gray-400 hover:text-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="h-4 w-px bg-gray-200"></div>

          {/* Centralized Primary Tab Nav */}
          <nav className="flex space-x-1 bg-gray-100 p-0.5 rounded-lg">
            {(['PRD', '기능명세서', '유저플로우'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  // Auto open coach for active sections to help guide users
                  if (coachPinned) setCoachOpen(true);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-150 ${
                  activeTab === tab 
                    ? 'bg-white text-gray-900 shadow-xs' 
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50/50'
                }`}
              >
                {tab}
                {tab === '유저플로우' && (
                  <span className="ml-1 text-[8px] bg-purple-100 text-purple-700 px-1 rounded font-black max-sm:hidden">
                    BETA
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Header Right Workspace Action Items */}
        <div className="flex items-center space-x-3">
          
          {/* Profile User Badge (서연) */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
              서연
            </div>
            <span className="text-xs font-bold text-gray-700 max-md:hidden">Manny Workspace</span>
          </div>

          <div className="flex items-center space-x-1.5 text-gray-400 max-sm:hidden">
            <button className="p-1.5 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-all" title="문서 리스트">
              <FileText size={15} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-all relative" title="알림">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
            </button>
          </div>

          <button className="flex items-center space-x-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all">
            <Share size={12} />
            <span>공유</span>
          </button>

          <button className="bg-[#1E1E2D] hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-xs transition-all">
            내보내기
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. CORE SPLIT INTERFACE                                   */}
      {/* ========================================================= */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ------------------------------------------------------------- */}
        {/* A. LEFT BAR: AI CHAT ASSISTANT (Source of Truth layout)       */}
        {/* ------------------------------------------------------------- */}
        <aside id="ai-chat-sidebar" className="w-[320px] bg-[#FCFCFD] border-r border-gray-200 flex flex-col h-full shrink-0 z-10 transition-all duration-300 max-lg:hidden">
          
          {/* Title row */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-xs"></div>
              <span className="font-extrabold text-xs text-gray-800 tracking-tight">Manny AI Assistant</span>
            </div>
            <span className="text-[9px] text-[#A78BFA] font-bold uppercase bg-purple-50 border border-purple-100/60 px-1.5 py-0.5 rounded-md">
              gpt-4o
            </span>
          </div>

          {/* Interactive Chat Log stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FCFCFD] text-xs">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                className={`flex flex-col space-y-1 ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1 text-gray-400 font-bold text-[10px] px-1">
                  <span>{chat.sender === 'user' ? '나' : 'Manny AI'}</span>
                  {chat.sender === 'ai' && <Sparkles size={9} className="text-purple-500" />}
                </div>

                <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed shadow-xs ${
                  chat.sender === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-xs font-semibold' 
                    : 'bg-white border border-gray-200 text-gray-700 rounded-tl-xs font-medium'
                }`}>
                  {chat.text}

                  {/* Dynamic Action Chips if presented */}
                  {chat.chips && (
                    <div className="mt-3 flex flex-col space-y-1.5 pt-2 border-t border-gray-105">
                      {chat.chips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleChipAction(chip.action)}
                          className="w-full text-left bg-gray-50 hover:bg-purple-50 border border-gray-150 hover:border-purple-200 text-[11px] font-bold text-gray-700 hover:text-purple-700 p-2 rounded-lg transition-all"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt quick recommendation suggestions */}
          <div className="p-2 border-t border-gray-100 bg-white/70">
            <div className="flex gap-1 overflow-x-auto py-1 scrollbar-thin">
              <button 
                onClick={() => handleSendChatMessage("전체 기획 검토해 줘.")}
                className="whitespace-nowrap bg-purple-50 hover:bg-purple-100 text-[#7C3AED] text-[10px] font-bold px-2 py-1 rounded-lg border border-purple-100/60"
              >
                🪄 전체 기획 검토
              </button>
              <button 
                onClick={() => handleSendChatMessage("커피챗 노쇼 방지 방안은?")}
                className="whitespace-nowrap bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-gray-200/50"
              >
                ☕ 노쇼 방지 아이디어
              </button>
            </div>
          </div>

          {/* Message inputs matching exactly screenshot footer details */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="border border-gray-200 rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 focus-within:bg-white transition-all">
              <textarea 
                rows={2}
                value={typingInput}
                onChange={(e) => setTypingInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChatMessage();
                  }
                }}
                placeholder="'@'를 입력해 채팅에 아이템을 언급할 수 있어요." 
                className="w-full bg-transparent border-none outline-none p-2.5 text-xs text-gray-800 placeholder-gray-400 resize-none font-medium"
              />
              <div className="px-2.5 pb-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-all" title="파일 첨부">
                    <Paperclip size={14} />
                  </button>
                  <div className="bg-white border border-gray-250 shadow-2xs rounded-lg px-2 py-0.5 text-[10px] font-bold text-gray-500 flex items-center space-x-1 cursor-pointer">
                    <span>gpt-4o</span>
                    <ChevronDown size={10} />
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold bg-gray-200/50 px-1.5 py-0.5 rounded-sm">
                    C 22
                  </span>
                </div>
                <button 
                  onClick={() => handleSendChatMessage()}
                  className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-all shadow-sm"
                  title="전송"
                >
                  <Send size={11} className="relative left-[0.5px]" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------------- */}
        {/* B. MAIN INTERACTIVE CONTENT AREA (Switches depending on Tab)  */}
        {/* ------------------------------------------------------------- */}
        <main className="flex-1 overflow-hidden flex bg-[#fbfbfc]">

          {/* ======================================================== */}
          {/* TAB 1: PRD - Centered dynamic sheet document             */}
          {/* ======================================================== */}
          {activeTab === 'PRD' && (
            <div className="flex-1 overflow-hidden flex divide-x divide-gray-150">
              
              {/* Document side selector column */}
              <div className="w-56 shrink-0 bg-white flex flex-col p-3 overflow-y-auto max-md:hidden">
                <div className="mb-4">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2 px-2">
                    PRD 구조도
                  </span>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'sec-1', label: '개요', icon: ChevronRight },
                    { id: 'sec-2', label: '문제 및 해결 방안', icon: Target },
                    { id: 'sec-3', label: '타겟 및 시나리오', icon: User },
                    { id: 'sec-4', label: '성공-위험 요소', icon: AlertCircle },
                    { id: 'sec-5', label: '속성 설정', icon: CheckSquare }
                  ].map((sec) => (
                    <a
                      href={`#${sec.id}`}
                      key={sec.id}
                      className="flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-purple-700 hover:bg-purple-50/50 px-3 py-2 rounded-lg transition-all"
                    >
                      <sec.icon size={13} className="text-gray-400" />
                      <span>{sec.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Main Scrolling Sheet with elegant layout */}
              <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 bg-[#F3F4F6]/50 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  {/* PRD Title Section */}
                  <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-purple-600"></div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-full font-black">
                        PRD DOCUMENTATION
                      </span>
                      <div className="flex items-center space-x-1.5 text-[10px] text-gray-400 font-bold">
                        <span>초안 생성 통과율</span>
                        <span className="text-purple-600 bg-purple-50/80 px-2 py-0.5 rounded-full border border-purple-100">100%</span>
                      </div>
                    </div>
                    <h1 className="text-lg font-black text-gray-900 leading-snug">
                      {prdDoc.title}
                    </h1>
                  </div>

                  {/* 1. 개요 */}
                  <div id="sec-1" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
                      <div className="w-6 h-6 bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center rounded-lg font-black text-xs shadow-3xs">
                        1
                      </div>
                      <h2 className="text-sm font-black text-gray-900">개요</h2>
                    </div>
                    
                    <div className="space-y-4 text-xs leading-relaxed">
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">한 줄 정의</h3>
                        <p className="bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium">
                          {prdDoc.sections.overview.oneLiner}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">제품 목표</h3>
                        <p className="bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium">
                          {prdDoc.sections.overview.goal}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">배경</h3>
                        <p className="bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium">
                          {prdDoc.sections.overview.background}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. 문제 및 해결 방안 */}
                  <div id="sec-2" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
                      <div className="w-6 h-6 bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center rounded-lg font-black text-xs shadow-3xs">
                        2
                      </div>
                      <h2 className="text-sm font-black text-gray-900">문제 및 해결 방안</h2>
                    </div>

                    <div className="space-y-4 text-xs leading-relaxed">
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">사용자 문제</h3>
                        <p className="bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium">
                          {prdDoc.sections.problem.search}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">해결 방안</h3>
                        <p className="bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium">
                          {prdDoc.sections.problem.solution}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">차별성</h3>
                        <p className="bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium">
                          {prdDoc.sections.problem.differentiation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. 타겟 및 시나리오 */}
                  <div id="sec-3" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
                      <div className="w-6 h-6 bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center rounded-lg font-black text-xs shadow-3xs">
                        3
                      </div>
                      <h2 className="text-sm font-black text-gray-900">타겟 및 시나리오</h2>
                    </div>

                    <div className="space-y-4 text-xs leading-relaxed">
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">타겟 사용자</h3>
                        <p className="bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium">
                          {prdDoc.sections.target.targetUser}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">사용자 시나리오</h3>
                        <p className="bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium leading-relaxed">
                          {prdDoc.sections.target.scenario}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4. 성공·위험 요소 */}
                  <div id="sec-4" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
                      <div className="w-6 h-6 bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center rounded-lg font-black text-xs shadow-3xs">
                        4
                      </div>
                      <h2 className="text-sm font-black text-gray-900">성공·위험 요소</h2>
                    </div>

                    <div className="space-y-4 text-xs leading-relaxed">
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">핵심 지표</h3>
                        <p className="bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium">
                          {prdDoc.sections.success.metrics}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">리스크</h3>
                        <p className="bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium">
                          {prdDoc.sections.success.risks}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5. 속성 설정 (Checklist) */}
                  <div id="sec-5" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
                      <div className="w-6 h-6 bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center rounded-lg font-black text-xs shadow-3xs">
                        5
                      </div>
                      <h2 className="text-sm font-black text-gray-900">속성 설정</h2>
                    </div>

                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                      제품의 분류와 타켓 환경을 정의합니다. 사용자 역할은 기능명세서의 기능과 연결되어 각 기능의 주체를 정의하는데 사용됩니다.
                    </p>

                    <div className="space-y-4 pt-2">
                      
                      {/* Category tag */}
                      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-2 py-2 border-b border-gray-50">
                        <span className="text-xs font-extrabold text-gray-500">카테고리</span>
                        <div className="flex">
                          <span className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-[11px] font-bold rounded-lg">
                            소셜 / 커뮤니티
                          </span>
                        </div>
                      </div>

                      {/* User Roles Tag inputs with custom addition */}
                      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-start gap-2 py-2 border-b border-gray-50">
                        <span className="text-xs font-extrabold text-gray-500 pt-1">사용자 역할</span>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {roles.map((role) => (
                              <span 
                                key={role} 
                                className="px-2.5 py-1 bg-gray-150 text-gray-800 text-[11px] font-bold rounded-md flex items-center shadow-3xs"
                              >
                                <span>{role}</span>
                                <button 
                                  onClick={() => handleRemoveRole(role)}
                                  className="ml-1.5 text-gray-400 hover:text-gray-600 font-extrabold"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          
                          <form onSubmit={handleAddRole} className="flex">
                            <input
                              type="text"
                              value={roleInput}
                              onChange={(e) => setRoleInput(e.target.value)}
                              placeholder="입력 후 Enter를 치거나 + 버튼을 눌러주세요."
                              className="bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none flex-1 border border-gray-200 focus:border-purple-300 rounded-lg px-2.5 py-1.5 bg-gray-50/50"
                            />
                            <button 
                              type="submit"
                              className="ml-1.5 p-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-250 text-gray-600 rounded-lg"
                              title="추가"
                            >
                              <Plus size={14} />
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Targeted Devices profiles */}
                      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-start gap-2 py-2">
                        <span className="text-xs font-extrabold text-gray-500 pt-1">기기</span>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {devices.map((dev) => (
                              <span 
                                key={dev} 
                                className="px-2.5 py-1 bg-gray-150 text-gray-800 text-[11px] font-bold rounded-md flex items-center shadow-3xs"
                              >
                                <span>{dev}</span>
                                <button 
                                  onClick={() => handleRemoveDevice(dev)}
                                  className="ml-1.5 text-gray-400 hover:text-gray-600 font-extrabold"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>

                          <form onSubmit={handleAddDevice} className="flex">
                            <input
                              type="text"
                              value={deviceInput}
                              onChange={(e) => setDeviceInput(e.target.value)}
                              placeholder="입력 후 Enter를 치거나 + 버튼을 눌러주세요. (예: 웹, 태블릿)"
                              className="bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none flex-1 border border-gray-200 focus:border-purple-300 rounded-lg px-2.5 py-1.5 bg-gray-50/50"
                            />
                            <button 
                              type="submit"
                              className="ml-1.5 p-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-250 text-gray-600 rounded-lg"
                              title="추가"
                            >
                              <Plus size={14} />
                            </button>
                          </form>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Move navigation footer action */}
                  <div className="pt-4 pb-12 flex justify-center">
                    <button 
                      onClick={handleMoveToSpec}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md tracking-wider uppercase flex items-center space-x-2 transition-all cursor-pointer group hover:translate-x-1"
                    >
                      <span>기능명세서로 이동</span>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: SPEC ("기능명세서")                                */}
          {/* ======================================================== */}
          {activeTab === '기능명세서' && (
            <div className="flex-1 overflow-hidden flex flex-col bg-white">
              
              {/* Secondary Sub Toolbar header as in screen 2 */}
              <div className="bg-[#FCFCFD] border-b border-gray-200 p-3 shrink-0 flex items-center justify-between z-10">
                <div className="flex items-center space-x-3">
                  
                  {/* Selected Req dropdown placeholder */}
                  <div className="relative">
                    <select
                      value={selectedReqId}
                      onChange={(e) => {
                        setSelectedReqId(e.target.value);
                        // Reset defaults
                        const targetReqObj = requirements.find(r => r.id === e.target.value);
                        if (targetReqObj && targetReqObj.features.length > 0) {
                          setSelectedFeatId(targetReqObj.features[0].id);
                        }
                      }}
                      className="bg-white border border-gray-250 shadow-3xs text-xs font-extrabold text-gray-700 pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {requirements.map((req) => (
                        <option key={req.id} value={req.id}>
                          {req.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={handleAddNewRequirement}
                    className="flex items-center space-x-1 bg-white hover:bg-gray-50 border border-gray-250 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 shadow-3xs transition-all"
                  >
                    <Plus size={12} />
                    <span>요구사항 추가</span>
                  </button>
                </div>

                {/* Right side search bar in toolbelt */}
                <div className="relative max-sm:hidden">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={reqSearchQuery}
                    onChange={(e) => setReqSearchQuery(e.target.value)}
                    placeholder="현재 명세서에서 검색"
                    className="bg-white border border-gray-250 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/20 focus:border-purple-500 w-56 font-bold text-gray-700"
                  />
                </div>
              </div>

              {/* Major grid layout supporting both Subview styles (Document vs Mindmap) */}
              <div className="flex-1 overflow-hidden flex divide-y divide-gray-150">
                
                {/* 1. Left Vertical Layout/Switcher Panel strip */}
                <div className="w-[44px] border-r border-gray-250 bg-[#F9F9FB] flex flex-col items-center py-4 space-y-4 shrink-0">
                  <button 
                    onClick={() => setSpecSubLayout('document')}
                    className={`p-1.5 rounded-lg transition-all ${specSubLayout === 'document' ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:text-gray-700'}`}
                    title="명세 및 AC 리스트 뷰"
                  >
                    <List size={16} />
                  </button>
                  <button 
                    onClick={() => setSpecSubLayout('mindmap')}
                    className={`p-1.5 rounded-lg transition-all ${specSubLayout === 'mindmap' ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:text-gray-700'}`}
                    title="상세 마인드맵/트리 뷰"
                  >
                    <GitBranch size={16} />
                  </button>
                </div>

                {/* 2. Primary Sub-Layout Render */}
                {specSubLayout === 'document' ? (
                  
                  // DOCUMENT / THREE COLUMN PANE LAYOUT (Direct match from screen 3)
                  <div className="flex-1 overflow-hidden flex">
                    
                    {/* Pane A: Requirements list */}
                    <div className="w-64 border-r border-gray-200 bg-[#FCFCFD] flex flex-col shrink-0">
                      <div className="p-3 border-b border-gray-100 bg-[#FCFCFD]/40 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                          요구사항
                        </span>
                        <button 
                          onClick={handleAddNewRequirement}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-all"
                          title="새 대분류 추가"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredRequirements.map((r) => (
                          <div
                            key={r.id}
                            onClick={() => {
                              setSelectedReqId(r.id);
                              if (r.features.length > 0) {
                                setSelectedFeatId(r.features[0].id);
                              }
                            }}
                            className={`flex items-center px-2.5 py-2 rounded-lg cursor-pointer transition-all border ${
                              selectedReqId === r.id 
                                ? 'bg-white border-purple-200 shadow-3xs font-extrabold text-gray-900' 
                                : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black mr-2.5 shrink-0 ${
                              selectedReqId === r.id ? 'bg-purple-600 text-white shadow-3xs' : 'bg-gray-150 text-gray-600'
                            }`}>
                              {r.number}
                            </span>
                            <span className="truncate text-xs flex-1 text-left">
                              {r.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pane B: Detailed feature keys inside selected requirement */}
                    <div className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0">
                      <div className="p-3 border-b border-gray-101 flex items-center justify-between bg-[#FCFCFD]">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                          기능 / 상세 기능
                        </span>
                        <button 
                          onClick={() => handleAddNewFeature(selectedReqId)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-all"
                          title="상세 기능 기입"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {activeReq.features && activeReq.features.length > 0 ? (
                          activeReq.features.map((f) => (
                            <div
                              key={f.id}
                              onClick={() => setSelectedFeatId(f.id)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                selectedFeatId === f.id
                                  ? 'bg-purple-50/30 border-purple-200 shadow-3xs'
                                  : 'border-transparent hover:border-gray-250 bg-white hover:bg-gray-50/50'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`font-bold text-xs ${selectedFeatId === f.id ? 'text-purple-950 font-black' : 'text-gray-700'}`}>
                                  {f.title}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-[9px] font-bold">
                                <span className={`px-1.5 py-0.5 rounded border ${
                                  f.status === '완료' 
                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                    : f.status === '작성중' 
                                    ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}>
                                  {f.status}
                                </span>
                                <span className="text-gray-400 flex items-center">
                                  <Target size={10} className="mr-0.5" />
                                  {f.priority}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-400 font-bold text-xs">
                            연결된 기능이 없습니다.
                          </div>
                        )}

                        <div className="p-2 pt-4">
                          <button
                            onClick={() => handleAddNewFeature(selectedReqId)}
                            className="w-full flex items-center justify-center space-x-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-250 border-dashed py-2.5 rounded-xl text-xs font-bold transition-all"
                          >
                            <Plus size={11} />
                            <span>상세 기능 추가</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Pane C: Full Detail Spec Display (Matching Layout closely) */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/20 p-6 space-y-6">
                      {activeFeature ? (
                        <div className="space-y-6 max-w-2xl mx-auto">
                          
                          {/* Top Detail Meta row */}
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center text-[10px] text-gray-400 font-bold mb-1.5 select-none">
                                <span>{activeReq.title}</span>
                                <ChevronRight size={10} className="mx-1" />
                                <span>{activeFeature.title}</span>
                              </div>

                              <h2 className="text-base font-black text-gray-900 leading-snug">
                                {activeFeature.title}
                              </h2>
                            </div>

                            <button
                              onClick={() => setCoachOpen(true)}
                              className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-[11px] font-black text-purple-700 flex items-center space-x-1 shadow-3xs transition-all"
                            >
                              <Sparkles size={11} />
                              <span>AI로 수용 기밀 분석</span>
                            </button>
                          </div>

                          {/* ID State priority fields */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-3xs text-xs">
                            <div className="flex flex-col space-y-0.5">
                              <span className="text-[10px] text-gray-400 font-bold">요구사항 ID</span>
                              <span className="font-bold text-purple-600 font-mono">{activeFeature.idCode}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-[10px] text-gray-400 font-bold">진행 상태</span>
                              <div>
                                <span className={`px-2 py-0.5 text-[10px] font-black rounded border ${
                                  activeFeature.status === '완료' ? 'bg-green-100 text-green-700 border-green-200' :
                                  activeFeature.status === '작성중' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                  'bg-gray-100 text-gray-500 border-gray-200'
                                }`}>
                                  ● {activeFeature.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-0.5">
                              <span className="text-[10px] text-gray-400 font-bold">중요도 우선순위</span>
                              <span className="font-black text-gray-700 flex items-center">
                                <span className={`text-xs mr-1 ${
                                  activeFeature.priority === 'High' ? 'text-red-500' : 
                                  activeFeature.priority === 'Medium' ? 'text-amber-500' : 'text-gray-500'
                                }`}>
                                  {activeFeature.priority === 'High' ? '🔥 3칸' : activeFeature.priority === 'Medium' ? '⚡ 2칸' : '☕ 1칸'}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Description Card */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              설명
                            </h4>
                            <p className="bg-white p-4 rounded-xl border border-gray-200 text-xs text-gray-700 font-medium leading-relaxed shadow-3xs">
                              {activeFeature.desc}
                            </p>
                          </div>

                          {/* Acceptance Criteria listing (Source of Truth interactive checks) */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center bg-transparent">
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                수용 기준 (Acceptance Criteria)
                              </h4>
                              <button 
                                onClick={() => handleAddNewAc(activeFeature.id)}
                                className="text-xs text-purple-600 font-black hover:underline"
                              >
                                + 기준 항목 추가
                              </button>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-3xs space-y-2">
                              {activeFeature.ac && activeFeature.ac.length > 0 ? (
                                activeFeature.ac.map((ac) => (
                                  <div 
                                    key={ac.id}
                                    className="flex items-start p-2 hover:bg-gray-50 rounded-lg group transition-colors"
                                  >
                                    <input 
                                      type="checkbox"
                                      checked={ac.checked}
                                      onChange={() => handleToggleAc(activeFeature.id, ac.id)}
                                      className="mt-0.5 accent-purple-600 w-3.5 h-3.5 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                                    />
                                    <p className={`ml-3 text-xs leading-relaxed flex-1 font-semibold ${
                                      ac.checked ? 'text-gray-400 line-through font-normal' : 'text-gray-805'
                                    }`}>
                                      {ac.text}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-400 text-center py-4">
                                  설정된 수용 기준이 없습니다. 우측 상단의 '+ 기준 항목 추가'로 입력해 보세요!
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Exceptions safety rules */}
                          {activeFeature.exceptions && (
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                예외 케이스 가드 로직
                              </h4>
                              <div className="bg-amber-50/50 p-4 border-l-4 border-l-amber-500 border border-amber-100 rounded-r-xl text-xs text-amber-900 leading-relaxed font-semibold">
                                {activeFeature.exceptions}
                              </div>
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 h-full py-20">
                          <HelpCircle size={40} className="mb-2 opacity-50" />
                          <p className="text-xs font-bold">기능명세를 기입할 상세 하브 노드를 선택하십시오.</p>
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  
                  // TREE / MINDMAP INTERACTIVE VIEW (Screenshot 5)
                  <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/40 relative">
                    
                    {/* Top filter badges as in screen 5 */}
                    <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between z-10">
                      <span className="text-[10px] font-black text-gray-400">PRD ➜ 요구사항 마인드맵 트리 구조</span>
                      <div className="flex items-center space-x-2 text-[10px] text-gray-500 font-bold">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">전체 보기</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded">상태</span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">중요도 매핑</span>
                      </div>
                    </div>

                    {/* Dotted Grid Background Canvas */}
                    <div className="flex-1 overflow-auto p-8 relative min-w-[800px]" style={{
                      backgroundImage: 'radial-gradient(#C5C5C5 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}>
                      
                      {/* Connection Canvas absolute elements */}
                      <div className="flex items-start space-x-12 relative z-10 pt-10">
                        
                        {/* Root Node: PRD */}
                        <div className="flex flex-col items-center">
                          <button 
                            onClick={() => {
                              setSelectedReqId('req-1');
                              setSpecSubLayout('document');
                            }}
                            className="bg-gray-900 text-white font-extrabold px-5 py-3 rounded-xl shadow-md text-xs hover:bg-slate-800 transition-all cursor-pointer border border-transparent flex items-center space-x-1"
                          >
                            <span>PRD 문서전체</span>
                            <ChevronRight size={12} />
                          </button>
                          <div className="mt-3">
                            <span className="text-[9px] text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-md font-bold">
                              + 하위 항목 생성
                            </span>
                          </div>
                        </div>

                        {/* Mid Connecting Lines simulated inside clean elements */}
                        <div className="flex flex-col space-y-4">
                          {requirements.map((req) => (
                            <div 
                              key={req.id}
                              onClick={() => {
                                setSelectedReqId(req.id);
                                setSelectedMindmapNode(req.id);
                              }}
                              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative max-w-[260px] ${
                                selectedMindmapNode === req.id
                                  ? 'bg-purple-50/50 border-purple-500 shadow-md scale-102'
                                  : 'bg-white border-gray-200 hover:border-purple-200 shadow-3xs'
                              }`}
                            >
                              {/* Glowing bullet */}
                              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-purple-500 rounded-full border-2 border-white shadow-xs"></div>
                              
                              <h3 className="text-xs font-black text-gray-900 mb-1 flex items-center justify-between">
                                <span>{req.title}</span>
                                <span className="text-[9px] text-[#A78BFA]">#{req.number}</span>
                              </h3>
                              <p className="text-[10px] text-gray-400 font-bold truncate">
                                상세 하부 기능: {req.features.length}개 설정됨
                              </p>

                              {/* Nested micro connections inside node card */}
                              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">핵심 스펙</span>
                                <button className="text-[9px] text-purple-600 font-black hover:underline flex items-center">
                                  <span>상세 진입</span>
                                  <ChevronRight size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Feature Details of selected Node on the mindmap right side */}
                        <div className="flex-1 max-w-[320px] bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3">
                          <span className="text-[9px] font-bold text-purple-600 block tracking-widest uppercase">
                            마인드맵 동기화 브리핑
                          </span>
                          <h4 className="text-xs font-black text-gray-950">
                            {requirements.find(r => r.id === selectedMindmapNode)?.title}
                          </h4>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            매칭 알고리즘과 수용 가치 매니패스트는 가입 온보딩과 실시간 피드백을 동기화하여 성사율을 견인하는 핵심 브릿지 요소입니다.
                          </p>

                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/50 space-y-2">
                            <span className="text-[10px] font-black text-gray-400 block uppercase">연결 세그먼트</span>
                            {requirements.find(r => r.id === selectedMindmapNode)?.features.map(f => (
                              <div key={f.id} className="flex justify-between items-center text-[11px] text-gray-700">
                                <span className="font-bold truncate max-w-[180px]">{f.title}</span>
                                <span className="px-1 bg-purple-50 border border-purple-100 text-[9px] text-purple-600 rounded">
                                  {f.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: USER FLOW ("유저플로우")                           */}
          {/* ======================================================== */}
          {activeTab === '유저플로우' && (
            <div className="flex-1 overflow-hidden flex bg-white divide-y divide-gray-150">
              
              {/* Node builder dotted background grid (Screenshot 4) */}
              <div className="flex-1 overflow-hidden flex flex-col relative select-none">
                
                {/* Visual node role category helpers layout */}
                <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between z-10">
                  <div className="flex flex-wrap gap-2.5 items-center">
                    <div className="flex items-center space-x-1">
                      <div className="w-2.5 h-2.5 bg-gray-900 rounded-xs"></div>
                      <span className="text-[10px] font-bold text-gray-600">앱 시작점</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2.5 h-2.5 bg-purple-600 rounded-xs"></div>
                      <span className="text-[10px] font-bold text-gray-600">온보딩 대표 스크린</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2.5 h-2.5 bg-purple-200 rounded-sm"></div>
                      <span className="text-[10px] font-bold text-gray-600">간편인증 등 서브페이지</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2.5 h-2.5 bg-gray-100 border border-gray-300 rounded-sm"></div>
                      <span className="text-[10px] font-bold text-gray-600">사용자 제스처/행동</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-500 font-extrabold max-md:hidden">
                    ※ 노드를 원클릭으로 선택해 기획 검증 리포트를 확인하십시오.
                  </span>
                </div>

                {/* Grid system area containing horizontal flow lanes matching screenshot and arrows */}
                <div className="flex-1 overflow-auto p-6 relative" style={{
                  backgroundImage: 'radial-gradient(#E2E8F0 1.2px, transparent 1.2px)',
                  backgroundSize: '16px 16px'
                }}>
                  
                  <div className="space-y-6 relative z-10 pt-4">

                    {/* Lane A: "온보딩/인증" */}
                    <div className="border border-purple-100/50 bg-[#FCFCFD]/70 rounded-2xl p-4 min-h-[160px] relative">
                      <div className="absolute top-3 left-3 bg-purple-100/50 text-purple-700 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                        온보딩 / 회원 인증 구간
                      </div>

                      <div className="flex items-center space-x-12 pt-8 pl-4">
                        
                        {/* Node 1: App start */}
                        <div 
                          onClick={() => setSelectedFlowNode('node-1')}
                          className={`w-28 py-3 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedFlowNode === 'node-1'
                              ? 'bg-gray-800 text-white border-transparent ring-4 ring-purple-100 scale-102'
                              : 'bg-gray-900 text-white border-transparent hover:-translate-y-0.5'
                          }`}
                        >
                          <span className="text-xs font-black">앱 시작</span>
                        </div>

                        {/* Connection arrow */}
                        <div className="text-gray-300">➜</div>

                        {/* Node 2: onboarding screen */}
                        <div 
                          onClick={() => setSelectedFlowNode('node-2')}
                          className={`w-36 py-4.5 rounded-xl text-center transition-all cursor-pointer border relative select-none ${
                            selectedFlowNode === 'node-2'
                              ? 'bg-purple-600 text-white border-purple-700 ring-4 ring-purple-100 scale-102'
                              : 'bg-purple-50 text-purple-800 border-purple-200 hover:-translate-y-0.5 shadow-sm'
                          }`}
                        >
                          <span className="text-xs font-black block">온보딩 / 인증 포털</span>
                          <span className="text-[9px] opacity-70 block">대표 메인 스크린</span>
                        </div>

                        {/* Branching indicator */}
                        <div className="text-gray-300 text-sm font-black">+ 갈래길 ➜</div>

                        {/* Split sub cards */}
                        <div className="flex flex-col space-y-2">
                          <div 
                            onClick={() => setSelectedFlowNode('node-3')}
                            className={`w-32 py-1.5 rounded-lg border text-center transition-all cursor-pointer text-xs font-bold ${
                              selectedFlowNode === 'node-3'
                                ? 'bg-purple-200 border-purple-300 text-purple-900 ring-2 ring-purple-100'
                                : 'bg-white border-gray-250 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            소셜 로그인 연동
                          </div>
                          <div 
                            onClick={() => setSelectedFlowNode('node-4')}
                            className={`w-32 py-1.5 rounded-lg border text-center transition-all cursor-pointer text-xs font-bold ${
                              selectedFlowNode === 'node-4'
                                ? 'bg-purple-200 border-purple-300 text-purple-900 ring-2 ring-purple-100'
                                : 'bg-white border-gray-250 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            이메일 신규 가입
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Lane B: "홈 / 추천 및 매칭 탐색" */}
                    <div className="border border-gray-200/60 bg-[#FCFCFD]/40 rounded-2xl p-4 min-h-[140px] relative">
                      <div className="absolute top-3 left-3 bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                        홈 / 추천 정보 및 관심사 매칭 구간
                      </div>

                      <div className="flex items-center space-x-12 pt-8 pl-4">
                        <div className="text-gray-400 text-xs font-extrabold flex items-center space-x-1 bg-white border border-gray-200 px-3 py-2 rounded-lg">
                          <span>온보딩 가입 세션 정보 검증 통과 완료 시 ➜</span>
                        </div>

                        {/* Node 5: screen selector */}
                        <div 
                          onClick={() => setSelectedFlowNode('node-5')}
                          className={`w-36 py-4.5 rounded-xl text-center border transition-all cursor-pointer ${
                            selectedFlowNode === 'node-5'
                              ? 'bg-purple-600 text-white border-purple-700 ring-4 ring-purple-100'
                              : 'bg-purple-50 text-purple-800 border-purple-200 hover:-translate-y-0.5 shadow-sm'
                          }`}
                        >
                          <span className="text-xs font-black block">관심사 키워드 선택</span>
                          <span className="text-[9px] opacity-70">추천 가중 가드 노드</span>
                        </div>
                      </div>
                    </div>

                    {/* Lane C: "커피챗 일정 조율 스케줄러" */}
                    <div className="border border-gray-200/40 bg-[#FCFCFD]/20 border-dashed rounded-2xl p-4 min-h-[120px] relative flex items-center justify-center">
                      <div className="absolute top-3 left-3 bg-gray-100 text-gray-400 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                        커피챗 일정 약속 조율 캘린더 구간
                      </div>
                      <span className="text-xs text-gray-400 font-extrabold">
                        ※ 온보딩 기획 완료 후 세부 캘린더 스케줄링 노드 추가 생성 지원 예정
                      </span>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right User Flow Administration details Column */}
              <div className="w-[300px] border-l border-gray-200 bg-[#FCFCFD] flex flex-col shrink-0 max-sm:hidden">
                <div className="p-4 border-b border-gray-199 bg-white">
                  <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-widest mb-3">
                    유저플로우 관리
                  </h3>
                  <button className="w-full flex items-center justify-center space-x-1.5 bg-purple-50 border border-purple-200 text-[#7C3AED] hover:bg-purple-100 text-xs font-black py-2.5 rounded-xl shadow-3xs transition-all">
                    <Sparkles size={11} className="text-yellow-400 animate-spin" />
                    <span>+ 새 유저 플로우 생성</span>
                  </button>
                </div>

                <div className="p-4 border-b border-gray-100 space-y-2">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">활성 유저플로우</span>
                  <div className="p-3 bg-white border border-gray-250 rounded-xl shadow-3xs relative">
                    <div className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer">
                      <MoreVertical size={13} />
                    </div>
                    <span className="text-[11px] font-black text-gray-900 block">새 플로우 1</span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">최종 생성 날짜: 2026.06.22</span>
                    <button className="mt-3.5 w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] font-bold py-2 rounded-lg text-gray-600 text-center">
                      ✏️ 기획 수정 버전 복사하기
                    </button>
                  </div>
                </div>

                {/* Sub node report pane */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                  <div className="border-t border-gray-100 pt-1">
                    <span className="text-[10px] text-purple-600 font-bold tracking-widest block uppercase">
                      선택 노드 기획 리포트
                    </span>
                    <h4 className="text-xs font-black text-gray-950 mt-1">
                      {activeNodeDetails.title}
                    </h4>
                  </div>

                  <div className="space-y-3.5 text-xs leading-relaxed font-semibold">
                    <div>
                      <span className="text-gray-400 block text-[10px] mb-0.5">상세 인터랙션</span>
                      <p className="bg-white p-2.5 rounded-lg border border-gray-200 text-gray-700 shadow-3xs">
                        {activeNodeDetails.desc}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] mb-0.5">사용자 핵심 행위 목표</span>
                      <p className="bg-white p-2.5 rounded-lg border border-gray-200 text-gray-700 shadow-3xs">
                        {activeNodeDetails.goal}
                      </p>
                    </div>
                    <div>
                      <span className="text-red-500 block text-[10px] mb-0.5 flex items-center">
                        <AlertCircle size={11} className="mr-1 text-red-500 animate-pulse" />
                        AI 수치 이탈 가드라인 권장
                      </span>
                      <p className="bg-red-50/50 p-2.5 border border-red-100 text-red-900 rounded-lg shadow-3xs">
                        {activeNodeDetails.trigger}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setCoachOpen(true);
                      setCoachAnswers(prev => [...prev, `나: ${activeNodeDetails.title} 회원 이탈을 방지하기 위한 긴급 리서치 가이드 요청.`]);
                    }}
                    className="w-full py-2.5 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles size={11} />
                    <span>온보딩 극복 긴급 코칭 요청</span>
                  </button>
                </div>

              </div>
              
            </div>
          )}

        </main>

        {/* ------------------------------------------------------------- */}
        {/* C. FLOATING INTUATIVE COACH TAB TRIGGER                       */}
        {/* ------------------------------------------------------------- */}
        {!coachOpen && !coachPinned && (
          <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 flex items-center">
            <button 
              onClick={() => {
                setCoachOpen(true);
              }}
              className="bg-purple-600 border border-purple-500 shadow-[-4px_0_15px_rgba(107,33,168,0.25)] rounded-l-2xl px-3 py-6 flex flex-col items-center justify-center space-y-2 text-white hover:bg-purple-700 transition-all hover:pl-4 duration-150 active:scale-95 group"
            >
              <Lightbulb size={18} className="animate-pulse text-yellow-300" />
              <span className="text-[10px] font-black tracking-widest uppercase inline-block pb-1" style={{ writingMode: 'vertical-rl' }}>
                AI Coach
              </span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* D. RIGHT PANEL: AI DECISION COACH SYSTEM (Source of Truth)     */}
        {/* ------------------------------------------------------------- */}
        <div className={`shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 ${coachPinned ? 'w-[400px]' : 'w-0'}`}>
          <div 
            className={`fixed right-0 top-14 bottom-0 bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 flex flex-col w-[300px] sm:w-[400px] border-l border-gray-200
              ${coachOpen || coachPinned ? 'translate-x-0' : 'translate-x-full'}
            `}
            style={coachPinned ? { position: 'relative', top: 0, height: '100%' } : {}}
          >
            {/* Coach Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1.5 rounded-lg text-white shadow-md">
                  <Lightbulb size={15} className="text-yellow-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-gray-900 leading-none">
                    AI Decision Coach
                  </h3>
                  <p className="text-[9px] text-gray-400 font-semibold mt-1">
                    실시간 정밀 기획 검토 시스템
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setCoachPinned(!coachPinned)} 
                  className={`p-1.5 rounded-lg transition-colors ${coachPinned ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:bg-gray-100'}`} 
                  title={coachPinned ? "핀 고정 해제" : "패널 가로 고정"}
                >
                  {coachPinned ? <PinOff size={13} /> : <Pin size={13} />}
                </button>
                {!coachPinned && (
                  <button 
                    onClick={() => setCoachOpen(false)} 
                    className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                    title="닫기"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Coach Horizontal mini tab category */}
            <div className="bg-gray-50/50 border-b border-gray-150 p-2 shrink-0 grid grid-cols-3 gap-1">
              <button
                onClick={() => setCoachActiveTab('comment')}
                className={`py-1 rounded-md text-[10px] font-black transition-all ${coachActiveTab === 'comment' ? 'bg-white text-purple-700 shadow-3xs border border-purple-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                💡 권장 가이드
              </button>
              <button
                onClick={() => setCoachActiveTab('risk')}
                className={`py-1 rounded-md text-[10px] font-black transition-all ${coachActiveTab === 'risk' ? 'bg-white text-purple-700 shadow-3xs border border-purple-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ⚠️ 리스크 대처
              </button>
              <button
                onClick={() => setCoachActiveTab('bench')}
                className={`py-1 rounded-md text-[10px] font-black transition-all ${coachActiveTab === 'bench' ? 'bg-white text-purple-700 shadow-3xs border border-purple-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                📊 벤치마킹 데이터
              </button>
            </div>

            {/* Coach Panel Content Area (Scrollable body) */}
            <div className="flex-1 overflow-y-auto bg-[#F9FBFD]/40 p-4 space-y-5">
              
              {/* Dynamic tag depending on current Active Tab */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-xs">
                <span className="text-[9px] font-black bg-white/25 px-1.5 py-0.5 rounded uppercase">
                  {activeTab}
                </span>
                <span className="text-xs font-black truncate flex-1 leading-none">
                  {activeTab === 'PRD' ? '비즈니스 모델 및 시장성 검증용 코칭' : activeTab === '기능명세서' ? '구현 타당성 및 AC 정밀 진단' : '사용자 이탈 장벽 및 수치 최적화'}
                </span>
              </div>

              {/* API Re-Analyze trigger block */}
              <div className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-xl shadow-3xs">
                <span className="text-[10px] text-gray-400 font-bold">의사결정 코칭 상태 갱신</span>
                <button
                  type="button"
                  disabled={coachLoading}
                  onClick={() => triggerCoachAnalysis()}
                  className="flex items-center bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  {coachLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-1 h-2.5 w-2.5 border-2 border-purple-500 border-t-transparent rounded-full animate-pulse"></span>
                      진단 중...
                    </span>
                  ) : (
                    <span>🪄 정밀 재분석 갱신</span>
                  )}
                </button>
              </div>

              {coachLoading ? (
                /* Advanced beautiful skeleton loader while calling Gemini */
                <div className="space-y-4 py-3">
                  <div className="bg-white border border-gray-150 rounded-xl p-4 space-y-3 shadow-3xs">
                    <div className="h-4 bg-gray-200/60 rounded-full w-2/5 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200/60 rounded-full w-full animate-pulse"></div>
                      <div className="h-3 bg-gray-200/60 rounded-full w-4/5 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-150 rounded-xl p-4 space-y-3 shadow-3xs">
                    <div className="h-4 bg-gray-200/60 rounded-full w-1/3 animate-pulse"></div>
                    <div className="h-3 bg-gray-200/60 rounded-full w-11/12 animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <>
                  {/* TAB SUB-DETERMINED COACH CONTENT WITH DATA BINDING */}
                  {coachActiveTab === 'comment' && (
                    <div className="space-y-4">
                      {/* Manny Coach Summary Card */}
                      <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3.5 space-y-1.5">
                        <span className="text-[9px] text-purple-600 font-bold uppercase tracking-wider block">Manny Coach 요약</span>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-bold">
                          {coachAnalysis.coachSummary}
                        </p>
                      </div>

                      {/* Dynamic recommendations list with magic "Apply" triggers */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase px-1">
                          권장 기획 보완 제안 ({coachAnalysis.recommendations?.length || 0}건)
                        </span>

                        {coachAnalysis.recommendations?.map((rec: any, idx: number) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-3xs space-y-2 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${
                                rec.confidence === 'Verified' ? 'bg-green-50 text-green-700 border border-green-200' :
                                rec.confidence === 'Heuristic' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {rec.confidence === 'Verified' ? '출처검증됨' : rec.confidence === 'Heuristic' ? '공통휴리스틱' : '가설검증필요'}
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold">Target: {rec.target}</span>
                            </div>
                            
                            <p className="text-xs text-purple-950 font-bold whitespace-pre-line leading-relaxed">
                              {rec.action}
                            </p>
                            
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed bg-gray-50/70 p-2 rounded-lg">
                              <strong>근거:</strong> {rec.rationale}
                            </p>

                            <button
                              type="button"
                              onClick={() => handleApplyRecommendation(rec)}
                              className="mt-1.5 w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[10px] font-black py-2 rounded-lg text-center transition-all shadow-3xs flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <span>⚡ 즉시 기획 문서 반영하기</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {coachActiveTab === 'risk' && (
                    <div className="space-y-4">
                      {/* Assumptions list */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase px-1">
                          기획 기저 가설 / 가정 리스크 ({coachAnalysis.assumptions?.length || 0}건)
                        </span>

                        {coachAnalysis.assumptions?.map((asm: any, idx: number) => (
                          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-3xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-xs text-gray-900 leading-tight">
                                가정: {asm.assumption}
                              </span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                                asm.risk === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                                asm.risk === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-green-50 text-green-750 border border-green-200'
                              }`}>
                                {asm.risk === 'High' ? '⚠️ High' : asm.risk === 'Medium' ? 'Medium' : 'Low'}
                              </span>
                            </div>
                            <div className="bg-red-50/30 p-2.5 rounded-lg border border-red-100/50 text-[11px] text-gray-700 leading-relaxed font-semibold">
                              <span className="text-red-650 font-black block text-[9px] uppercase mb-0.5">Mom Test식 검증 방법:</span>
                              {asm.validationSuggestion}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Challenges list */}
                      <div className="space-y-3 border-t border-gray-100 pt-3">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase px-1">
                          비판적 스트레스 테스트 질문 ({coachAnalysis.challenges?.length || 0}건)
                        </span>

                        {coachAnalysis.challenges?.map((chl: any, idx: number) => (
                          <div key={idx} className="bg-amber-50/30 border border-amber-100 p-3.5 rounded-xl space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-amber-800 font-black uppercase bg-amber-100/60 px-1.5 py-0.5 rounded">
                                {chl.category}
                              </span>
                              <span className="text-[9px] text-gray-400">Devil's Challenge</span>
                            </div>
                            <p className="text-xs text-[#92400E] font-extrabold leading-relaxed">
                              ❔ {chl.question}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {coachActiveTab === 'bench' && (
                    <div className="space-y-4">
                      {/* Facts list */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase px-1">
                          공인 팩트 & 벤치마크 패턴 ({coachAnalysis.facts?.length || 0}건)
                        </span>

                        {coachAnalysis.facts?.map((fac: any, idx: number) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-3xs space-y-2">
                            <p className="text-xs text-gray-750 leading-relaxed font-semibold">
                              {fac.claim}
                            </p>
                            <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-md px-2">
                              <span className="text-[9px] text-gray-400">출처/레퍼런스</span>
                              <span className="text-[9.5px] text-gray-600 font-extrabold">{fac.source}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Interactive Coach Q&A history list (Bottom drawer inline space) */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block px-1">
                  코치와의 최근 질문 소통
                </span>

                <div className="space-y-2 max-h-36 overflow-y-auto p-1.5 bg-gray-50/70 border border-gray-150 rounded-xl">
                  {coachAnswers.map((answer, i) => (
                    <div key={i} className="text-[10.5px] leading-relaxed text-gray-600 font-semibold p-1 hover:bg-white rounded transition-colors">
                      {answer}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Coach Bottom Chat Bar */}
            <div className="p-3 bg-white border-t border-gray-200 shrink-0">
              <form onSubmit={handleSendCoachMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={coachChatInput}
                  onChange={(e) => setCoachChatInput(e.target.value)}
                  placeholder="의사결정 코치에게 구체적 사안 질문하기"
                  className="bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none flex-1 focus:ring-1 focus:ring-purple-500 focus:bg-white transition-all font-medium"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-sm transition-all"
                  title="코칭 질문 전송"
                >
                  <Send size={12} />
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Coach Backdrop for floating state */}
        {coachOpen && !coachPinned && (
          <div 
            className="fixed inset-0 bg-gray-900/10 z-30 backdrop-blur-[0.5px]"
            onClick={() => setCoachOpen(false)}
          />
        )}

      </div>

    </div>
  );
}
