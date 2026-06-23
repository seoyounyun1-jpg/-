# Manyfast AI Coach Prototype

이 프로젝트는 PM의 제품 기획과 의사결정을 돕는 AI 코치 "Manyfast"의 프로토타입입니다. 
AI Studio 기반으로 작성된 초기 코드를 Antigravity 환경으로 이전하여, 실제 서비스 가능 수준으로 업그레이드하였습니다.

## 주요 개선 사항 (Claude 피드백 반영)
1. **AI API 연결 완료**: 더 이상 하드코딩된 목업이 아니라, Gemini 3.5 Flash 모델과 연결되어 사용자의 입력과 컨텍스트(활성 탭, 기획 내용 등)를 기반으로 실제 분석을 제공합니다.
2. **단일 파일 구조 유지 및 이유**: 빠른 프로토타이핑과 AI Prompt Context 전달을 용이하게 하기 위해 `App.tsx` 단일 파일 구조를 채택했습니다. 
3. **인라인 모달 UI 적용**: 기존 `prompt()` 호출을 모두 컴포넌트 내장 모달 팝업으로 교체했습니다.
4. **신뢰성/WTP 검증 추가**: 마인드맵의 동적 설명, 유저플로우 커피챗 레인 기능 상세, AI Coach의 WTP 챌린지 항목(최소 5개) 등 추가적인 검증이 구현되었습니다.
5. **PRD 직접 수정 가능**: 모든 PRD 기획 항목을 텍스트 영역으로 변경하여 직접 내용을 수정할 수 있도록 업데이트했습니다.

## 기술 스택
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4
- **Backend**: Express, Google Gemini SDK (`@google/genai`)

## 로컬 실행 방법
1. `.env` 파일을 생성하고 `GEMINI_API_KEY=당신의_키` 를 입력합니다.
2. `npm install`
3. `npm run dev` 를 통해 로컬 서버와 Vite를 동시에 실행합니다.
