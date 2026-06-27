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
  const [activeTab, setActiveTab] = useState<'PRD' | '기능명세서' | '유저플로우' | '와이어프레임 BETA'>('PRD');
  
  const [promptModal, setPromptModal] = useState<{isOpen: boolean, title: string, onSubmit: (val: string) => void}>({isOpen: false, title: '', onSubmit: () => {}});

  const handlePrdChange = (section: string, field: string, value: string) => {
    setPrdDoc(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section as keyof typeof prev.sections]: {
          ...prev.sections[section as keyof typeof prev.sections],
          [field]: value
        }
      }
    }));
  };

  // Custom Toast Notification State to completely replace system native alerts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' }[]>([]);
  
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

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

  // Context Guide panel states
  const [coachOpen, setCoachOpen] = useState<boolean>(false);
  const [coachPinned, setCoachPinned] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareLinkCopied, setShareLinkCopied] = useState<boolean>(false);

  // ① 시장 데이터 카드
  const [marketDataOpen, setMarketDataOpen] = useState<boolean>(true);
  const [marketData, setMarketData] = useState<{target: string; trend: string; competitorWeakness: string; sources?: {label: string; url: string}[]} | null>(null);
  const [marketDataLoading, setMarketDataLoading] = useState<boolean>(false);

  // ② 판단 기준 체크리스트
  type CheckStatus = 'ok' | 'review' | 'poor';
  const CHECKLIST_ITEMS: Record<string, {label: string; tooltip: string; example: string; prdCheck: (doc: typeof prdDoc) => string}[]> = {
    'PRD': [
      {
        label: '문제 정의가 구체적으로 작성되었는가',
        tooltip: '문제의 원인과 당사자 맥락을 명시해야 우선순위와 범위가 정리됩니다. 실제 사용자 인터뷰 문장으로 작성하면 검증성이 높아집니다.',
        example: '📌 Notion의 PRD 템플릿은 "누가, 어떤 상황에서, 왜 막히는가"를 3줄 이내로 작성하도록 강제합니다.',
        prdCheck: (doc) => {
          const problem = doc.sections?.overview?.problem || doc.sections?.overview?.goal || '';
          if (!problem || problem.length < 20) return '⚠️ 보완 필요: 문제 설명이 너무 짧거나 없습니다. 구체적인 사용자 상황과 불편함을 추가해 주세요.';
          if (!/사용자|유저|고객|누가|어떤/.test(problem)) return '⚠️ 보완 필요: 문제가 누구의 문제인지 명시되지 않았습니다. 당사자를 구체적으로 기술해 주세요.';
          return '✅ 충족: 문제 정의에 맥락이 포함되어 있습니다.';
        }
      },
      {
        label: '타겟 사용자가 구체적으로 정의되었는가',
        tooltip: '페르소나 1명을 구체적으로 정의하면 기능 우선순위 판단이 빨라집니다. 직군·목표·불편함 3가지를 포함하는 것이 좋습니다.',
        example: '📌 Airbnb는 내부 PRD에 페르소나를 1명으로 제한하고 "여행 목적·숙박 예산·결정 장벽" 3가지를 필수 기재합니다.',
        prdCheck: (doc) => {
          const target = doc.sections?.overview?.targetUser || doc.sections?.overview?.goal || '';
          if (!target || target.length < 15) return '⚠️ 보완 필요: 타겟 사용자 설명이 없거나 너무 짧습니다. 직군·목표·불편함을 구체적으로 작성해 주세요.';
          if (/모든|누구나|전체|everybody/.test(target)) return '⚠️ 보완 필요: 타겟이 너무 광범위합니다. 특정 사용자 그룹으로 좁혀 주세요.';
          return '✅ 충족: 타겟 사용자가 구체적으로 정의되어 있습니다.';
        }
      },
      {
        label: '성공 지표가 수치로 설정되었는가',
        tooltip: '측정 가능한 지표(예: 7일 리텐션 40%)를 설정해야 합니다. "만족도 향상" 같은 모호한 표현은 실제 검증이 불가능합니다.',
        example: '📌 Toss는 모든 기능의 성공 지표를 출시 전 "기준값 / 목표값 / 측정 방법" 3가지로 반드시 명시합니다.',
        prdCheck: (doc) => {
          const metrics = doc.sections?.overview?.successMetrics || doc.sections?.overview?.goal || '';
          if (!metrics || metrics.length < 10) return '⚠️ 보완 필요: 성공 지표가 없습니다. 숫자 기반의 측정 가능한 목표를 추가해 주세요.';
          if (!/\d|%|명|건|율|DAU|WAU|MAU|리텐션|전환/.test(metrics)) return '⚠️ 보완 필요: 지표에 숫자가 없습니다. 구체적인 수치 목표로 바꿔 주세요.';
          return '✅ 충족: 수치 기반 성공 지표가 설정되어 있습니다.';
        }
      },
    ],
    '기능명세서': [
      {
        label: '기능 간 의존 관계와 실행 순서가 명확한가',
        tooltip: 'A 기능이 완료돼야 B 기능이 동작하는 의존 관계를 명시해야 개발 순서가 정해집니다.',
        example: '📌 Figma는 기능명세서에 "선행 기능(Prerequisite)" 항목을 필수 필드로 지정해 의존 관계를 명시합니다.',
        prdCheck: (doc) => {
          const features = doc.sections?.features || [];
          if (!features || features.length < 2) return '⚠️ 보완 필요: 기능이 2개 미만이라 의존 관계를 파악하기 어렵습니다.';
          return '✅ 확인 필요: 각 기능의 선행 조건이 명시되어 있는지 검토해 주세요.';
        }
      },
      {
        label: '핵심 기능과 부가 기능이 구분되어 있는가',
        tooltip: 'MoSCoW 기법(Must/Should/Could/Won\'t)으로 분류하면 개발자와 우선순위 합의가 빨라집니다.',
        example: '📌 Notion은 기능명세서 템플릿에 Priority 컬럼을 기본 제공하고, P0·P1·P2로 등급을 나눕니다.',
        prdCheck: (doc) => {
          const features = doc.sections?.features || [];
          if (!features || features.length === 0) return '⚠️ 보완 필요: 기능 목록 자체가 없습니다. 기능명세서에 항목을 추가해 주세요.';
          return '✅ 확인 필요: 각 기능에 Must/Should/Could 우선순위가 표시되어 있는지 검토해 주세요.';
        }
      },
      {
        label: '오류·예외 상황이 사전에 정의되어 있는가',
        tooltip: '실패 케이스와 예외 상황을 기획 단계에서 미리 정의하면 개발 단계 재작업이 줄어듭니다.',
        example: '📌 Toss는 모든 기능명세서에 "What-if" 섹션을 의무화해 네트워크 오류·권한 없음·빈 결과를 반드시 기재합니다.',
        prdCheck: (doc) => {
          const features = doc.sections?.features || [];
          if (!features || features.length === 0) return '⚠️ 보완 필요: 기능 목록이 없어 예외 상황을 정의할 수 없습니다.';
          return '✅ 확인 필요: 각 기능에 오류 상황과 복구 흐름이 포함되어 있는지 검토해 주세요.';
        }
      },
    ],
    '유저플로우': [
      {
        label: '사용자 진입 경로가 2가지 이상 정의되었는가',
        tooltip: '사용자가 기능에 도달하는 경로는 보통 2가지 이상입니다. 직접 탐색 외에 알림·공유 링크 진입도 커버해야 합니다.',
        example: '📌 카카오는 유저플로우 작성 시 "직접 탐색 / 푸시 알림 / 공유 링크" 3가지 진입 경로를 기본으로 포함합니다.',
        prdCheck: (doc) => {
          const goal = doc.sections?.overview?.goal || '';
          return goal ? '✅ 확인 필요: 유저플로우에 2가지 이상의 진입 경로가 포함되어 있는지 확인해 주세요.' : '⚠️ 보완 필요: PRD 목표가 없어 어떤 플로우를 커버해야 할지 불분명합니다.';
        }
      },
      {
        label: '오류 발생 시 복구 흐름이 포함되어 있는가',
        tooltip: '정상 경로(Happy Path)만으로는 부족합니다. 네트워크 오류·권한 없음·빈 결과 등 실패 경로와 복구 흐름이 없으면 QA 단계에서 재작업이 발생합니다.',
        example: '📌 당근마켓은 유저플로우에 오류 노드를 별도 색상(빨간색)으로 표기하고, 각 오류마다 복구 경로를 1개 이상 연결합니다.',
        prdCheck: (doc) => {
          const goal = doc.sections?.overview?.goal || '';
          return goal ? '✅ 확인 필요: 플로우 노드에 오류/실패 분기가 명시되어 있는지 확인해 주세요.' : '⚠️ 보완 필요: PRD 목표 없이 오류 흐름을 정의하기 어렵습니다.';
        }
      },
    ],
    '와이어프레임': [
      {
        label: '핵심 CTA가 화면 상단 1/3 영역에 배치되어 있는가',
        tooltip: '사용자 시선은 F자 패턴으로 움직이며 상단에 집중됩니다. 핵심 행동 유도 버튼이 하단에 있으면 전환율이 낮아집니다.',
        example: '📌 Coupang은 "구매하기" CTA를 항상 화면 상단 30% 이내에 배치하고, 스크롤 시에도 고정 노출합니다.',
        prdCheck: () => '✅ 확인 필요: 핵심 CTA(회원가입·구매·신청 버튼)가 화면 상단 영역에 있는지 시안을 검토해 주세요.'
      },
      {
        label: '모바일 기준 스크롤 깊이가 3단계 이내인가',
        tooltip: '스크롤이 3번을 넘어가면 이탈률이 급격히 상승합니다. 핵심 정보는 2번 스크롤 안에 노출되어야 합니다.',
        example: '📌 Toss는 모든 화면을 "3-Scroll Rule"로 설계하며, 3번 스크롤 이내에 핵심 가치가 전달되지 않으면 화면을 재설계합니다.',
        prdCheck: () => '✅ 확인 필요: 와이어프레임의 스크롤 깊이가 3단계를 넘지 않는지 확인해 주세요.'
      },
    ],
  };
  const [checklistStatus, setChecklistStatus] = useState<Record<string, CheckStatus>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [researchState, setResearchState] = useState<Record<string, { versionIndex: number; isCopied: boolean }>>({});

  // ③ AI 구성 기준 동적 생성
  type AICriterion = { id: string; label: string; status: '충족' | '검토필요'; reason: string; example: string; reviewPrompt: string };
  const [aiCriteria, setAiCriteria] = useState<AICriterion[]>([]);
  const [criteriaLoading, setCriteriaLoading] = useState<boolean>(false);

  // ④ AI 에이전트 대화창
  const [ctxChatHistory, setCtxChatHistory] = useState<{role: 'user' | 'ai'; text: string}[]>([]);
  const [ctxChatInput, setCtxChatInput] = useState<string>('');
  const [ctxChatLoading, setCtxChatLoading] = useState<boolean>(false);
  const ctxChatEndRef = useRef<HTMLDivElement>(null);

  // Flow State
  const [activeFlowId, setActiveFlowId] = useState<string>('flow-1');
  const [flows, setFlows] = useState<UserFlow[]>([
    { id: 'flow-1', title: '새 플로우 1', date: '2026.06.22' }
  ]);
  const [selectedFlowNode, setSelectedFlowNode] = useState<string>('node-2');
  
  // Wireframe Selected Screen State
  const [selectedWireframeId, setSelectedWireframeId] = useState<string>('screen-1');

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

  // ① 시장 데이터 fetch
  const fetchMarketData = async () => {
    if (marketDataLoading) return;
    setMarketDataLoading(true);
    try {
      const goal = prdDoc?.sections?.overview?.goal || prdDoc?.sections?.overview?.oneLiner || prdDoc?.title || '스타트업 SaaS 프로덕트';
      const res = await fetch('/api/market-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectGoal: goal }),
      });
      if (!res.ok) throw new Error('market-data API failed');
      const data = await res.json();
      setMarketData(data);
    } catch {
      // Fallback: project-specific hardcoded data so panel is always useful
      setMarketData({
        target: '20~40대 직장인 및 예비창업자 — 관심사 기반 전문 인맥 형성과 커피챗을 원하는 커리어 관리자',
        trend: '약한 유대(Weak Ties) 기반 네트워킹 앱 성장세, 국내 커뮤니티형 소셜앱 연평균 20%+ 확대, AI 매칭 플랫폼 주목',
        competitorWeakness: 'LinkedIn은 관계 형성보다 스펙 전시 중심, 소모임·문토는 오프라인 의존도가 높아 비대면 연결이 약함',
        sources: [
          { label: 'Statista — Social Networking Apps Report (2024)', url: 'https://www.statista.com/topics/1164/social-networks/' },
          { label: '앱애니 국내 소셜앱 시장 분석 (2023)', url: 'https://www.data.ai/en/apps/ios/top/countries/kr/feeds/all/iphone/social-networking/top-free/' },
        ]
      });
    } finally {
      setMarketDataLoading(false);
    }
  };

  useEffect(() => {
    if (coachOpen || coachPinned) {
      setMarketData(null);
      fetchMarketData();
    }
  }, [coachOpen, coachPinned, prdDoc.sections.overview.goal]);

  // ③ AI 구성 기준 동적 생성 — 패널 열릴 때 & 탭 바뀔 때 Claude API 호출
  const fetchAICriteria = async (tab: string) => {
    setCriteriaLoading(true);
    setAiCriteria([]);
    setActiveTooltip(null);
    try {
      // 현재 탭 문서 내용 추출
      let docContent = '';
      if (tab === 'PRD') {
        const o = prdDoc.sections.overview;
        const p = prdDoc.sections.problem;
        const t = prdDoc.sections.target;
        const s = prdDoc.sections.success;
        docContent = `제목: ${prdDoc.title}\n한 줄 정의: ${o.oneLiner}\n목표: ${o.goal}\n문제: ${p.search}\n솔루션: ${p.solution}\n타겟: ${t.targetUser}\n성공 지표: ${s.metrics}`;
      } else if (tab === '기능명세서') {
        docContent = requirements.map(req =>
          `요구사항: ${req.title}\n기능: ${req.features?.map((f: any) => `${f.title} (${f.status})`).join(', ')}`
        ).join('\n\n');
      } else if (tab === '유저플로우') {
        docContent = flows.map(f => `플로우: ${f.title}`).join('\n') + '\n' +
          Object.values({ 'node-1': '앱 시작', 'node-2': '온보딩/인증', 'node-3': '소셜 로그인', 'node-4': '이메일 가입', 'node-5': '관심사 선택' }).join(', ');
      } else if (tab === '와이어프레임 BETA' || tab === '와이어프레임') {
        docContent = '화면 구성: 소셜 로그인 랜딩 / 이메일 가입 / 관심사 선택 / 추천 인맥 / 커피챗 스케줄링';
      } else {
        docContent = prdDoc.title;
      }

      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: tab, docContent }),
      });
      if (!res.ok) throw new Error('checklist API failed');
      const data = await res.json();
      const withPrompt = (data.criteria || []).map((c: AICriterion) => ({
        ...c,
        reviewPrompt: c.reviewPrompt || `다음 ${tab} 문서에서 "${c.label}" 항목을 검토해줘.\n현재 판단: ${c.reason}\n이 부분을 개선하기 위해 구체적으로 어떤 내용을 추가하거나 수정해야 하는지\n실제 적용 가능한 예시와 함께 설명해줘.\n[${tab} 내용 붙여넣기]`,
      }));
      setAiCriteria(withPrompt);
    } catch {
      // fallback: 하드코딩 기준
      const fallback: Record<string, AICriterion[]> = {
        'PRD': [
          { id: 'p1', label: '한 줄 정의', status: '충족', reason: '"관심사 기반 소셜 네트워킹 및 커피챗 연결 앱"으로 한 줄 정의가 명확히 작성됨', example: 'Notion PRD 템플릿은 한 줄 정의를 필수 첫 항목으로 지정함', reviewPrompt: `다음 PRD의 한 줄 정의가 제품 핵심 가치를 충분히 담고 있는지 검토해줘.\n타겟 사용자, 해결하는 문제, 차별화 방식이 한 문장에 모두 담겨 있는지 확인하고\n부족한 요소가 있다면 구체적으로 지적하고 개선 예시를 제시해줘.\n[PRD 내용 붙여넣기]` },
          { id: 'p2', label: '타겟 명확성', status: '충족', reason: '20~40대 전문직 종사자 및 이직 고민자로 직군·연령·니즈가 구체적으로 명시됨', example: 'Airbnb는 페르소나 1명에 목적·예산·결정 장벽 3가지를 필수 기재함', reviewPrompt: `다음 PRD의 타겟 사용자 정의가 충분히 구체적인지 검토해줘.\n직군, 연령대, 핵심 니즈, 현재 대안 대비 불편함이 명시되어 있는지 확인하고\n"모든 사람" 같은 광범위한 정의가 있다면 세분화 방법을 구체적으로 제안해줘.\n[PRD 내용 붙여넣기]` },
          { id: 'p3', label: '문제-솔루션 연결', status: '검토필요', reason: '관심사 매칭 솔루션이 "새 인맥 형성 어려움" 문제를 직접 해소하는지 인과관계 보강 필요', example: 'Toss는 문제-솔루션 매핑 표를 PRD에 필수 포함함', reviewPrompt: `다음 PRD에서 문제와 솔루션 간의 인과관계를 검토해줘.\n정의된 문제가 제안된 솔루션으로 직접 해결되는지 논리적 연결고리를 확인하고\n"이 문제는 이 솔루션으로 해결된다"는 인과관계가 약한 부분을 찾아\n구체적인 근거와 함께 보강 방법을 제시해줘.\n[PRD 내용 붙여넣기]` },
        ],
        '기능명세서': [
          { id: 'f1', label: '기능 의존 순서', status: '검토필요', reason: '기능 목록은 있으나 선행 기능(A 완료 후 B 가능) 의존 관계가 명시되지 않음', example: 'Figma는 기능명세서에 선행 기능 항목을 필수 필드로 지정해 의존 관계를 명시함', reviewPrompt: `다음 기능명세서에서 각 기능의 선행 조건과 의존 관계를 검토해줘.\nA 기능이 완료돼야 B 기능이 동작하는 경우를 모두 찾아서\n의존 순서가 누락된 부분을 구체적으로 지적해줘.\n[기능명세서 내용 붙여넣기]` },
          { id: 'f2', label: '핵심-부가 구분', status: '검토필요', reason: 'Must/Should/Could 우선순위 구분 없이 기능이 나열되어 있음', example: 'Notion은 Priority 컬럼을 기본 제공하고 P0·P1·P2로 등급을 나눔', reviewPrompt: `다음 기능명세서에서 핵심 기능과 부가 기능을 구분해줘.\nMVP에 반드시 필요한 기능과 나중에 추가해도 되는 기능을\n각각 이유와 함께 정리해줘.\n[기능명세서 내용 붙여넣기]` },
          { id: 'f3', label: '엣지 케이스 정의', status: '검토필요', reason: '오류 상황·예외 흐름에 대한 정의가 문서에 포함되어 있지 않음', example: 'Toss는 모든 기능명세서에 What-if 섹션을 의무화함', reviewPrompt: `다음 기능명세서에서 엣지 케이스가 정의되지 않은 기능을 찾아줘.\n네트워크 오류, 빈 상태, 권한 없음, 입력값 초과 등\n일반적인 엣지 케이스 유형 기준으로 빠진 부분을 목록으로 정리해줘.\n[기능명세서 내용 붙여넣기]` },
        ],
        '유저플로우': [
          { id: 'u1', label: '진입 경로 수', status: '충족', reason: '소셜 로그인·이메일 가입 등 복수의 진입 경로가 플로우에 포함됨', example: '카카오는 직접 탐색·알림·공유 링크 3가지 진입 경로를 기본으로 포함함', reviewPrompt: `다음 유저플로우에서 서비스 진입 경로가 충분히 포함되어 있는지 검토해줘.\n직접 탐색, 알림, 공유 링크, 외부 유입 등 주요 진입 유형이 모두 커버되는지 확인하고\n누락된 진입 경로와 각 경로에서 달라져야 할 첫 화면을 구체적으로 제안해줘.\n[유저플로우 내용 붙여넣기]` },
          { id: 'u2', label: '오류 흐름 포함', status: '검토필요', reason: '오류 분기와 복구 흐름이 플로우 노드에 명시되어 있는지 확인 필요', example: '당근마켓은 오류 노드를 빨간색으로 구분하고 각 오류마다 복구 경로를 1개 이상 연결함', reviewPrompt: `다음 유저플로우에서 오류 상황과 복구 흐름이 누락된 노드를 찾아줘.\n로그인 실패, 네트워크 단절, 권한 거부, 데이터 로드 실패 등\n발생 가능한 오류 유형별로 현재 플로우에 빠진 분기를 목록으로 정리하고\n각 오류에 대한 복구 경로를 구체적으로 제안해줘.\n[유저플로우 내용 붙여넣기]` },
          { id: 'u3', label: '단계 간결성', status: '검토필요', reason: '온보딩 플로우의 단계 수가 사용자 이탈 없이 완료 가능한 수준인지 검토 필요', example: 'Toss는 온보딩을 3단계 이내로 제한하고 필수 입력만 수집함', reviewPrompt: `다음 유저플로우의 각 경로에서 단계 수가 적절한지 검토해줘.\n특히 온보딩·가입·핵심 기능 도달까지 몇 번의 탭이 필요한지 세어보고\n업계 기준(온보딩 3단계 이내, 핵심 기능 2탭 이내)과 비교해서\n줄일 수 있는 단계와 통합 가능한 화면을 구체적으로 제안해줘.\n[유저플로우 내용 붙여넣기]` },
        ],
        '와이어프레임 BETA': [
          { id: 'w1', label: 'CTA 위치', status: '충족', reason: '회원가입·소셜 로그인 CTA가 화면 상단 1/3 영역에 배치됨', example: 'Coupang은 구매하기 버튼을 항상 화면 상단 30% 이내에 배치하고 스크롤 시에도 고정 노출함', reviewPrompt: `다음 와이어프레임에서 CTA(핵심 행동 버튼)의 위치가 적절한지 검토해줘.\n각 화면에서 CTA가 스크롤 없이 보이는 영역(Fold 위)에 배치되어 있는지 확인하고\nCTA가 묻히거나 경쟁 요소와 혼재된 화면을 찾아 개선 방향을 제안해줘.\n[와이어프레임 설명 붙여넣기]` },
          { id: 'w2', label: '스크롤 깊이', status: '검토필요', reason: '모바일 기준 스크롤 3단계 이내에 핵심 가치가 전달되는지 확인 필요', example: 'Toss는 3-Scroll Rule로 모든 화면을 설계하며 초과 시 화면을 재설계함', reviewPrompt: `다음 와이어프레임에서 각 화면의 스크롤 깊이가 적절한지 검토해줘.\n모바일 기준 3스크롤 이내에 핵심 가치가 전달되는지 확인하고\n콘텐츠가 너무 길거나 중요 정보가 스크롤 하단에 묻혀 있는 화면을 찾아\n정보 구조를 재편하는 구체적인 방법을 제안해줘.\n[와이어프레임 설명 붙여넣기]` },
          { id: 'w3', label: '레이아웃 일관성', status: '검토필요', reason: '화면 간 버튼 위치·타이포그래피·간격 일관성이 확인되지 않음', example: 'Airbnb는 디자인 시스템 DLS를 통해 모든 화면의 레이아웃 규칙을 통일함', reviewPrompt: `다음 와이어프레임에서 화면 간 레이아웃 일관성을 검토해줘.\n버튼 위치, 여백(padding/margin), 타이포그래피, 아이콘 스타일이\n화면마다 달라지는 부분을 찾아 목록으로 정리하고\n통일해야 할 디자인 규칙을 구체적으로 제안해줘.\n[와이어프레임 설명 붙여넣기]` },
        ],
      };
      setAiCriteria(fallback[tab] || fallback['PRD']);
    } finally {
      setCriteriaLoading(false);
    }
  };

  useEffect(() => {
    if (coachOpen || coachPinned) fetchAICriteria(activeTab);
  }, [coachOpen, coachPinned, activeTab]);

  // 체크리스트 수동 토글
  const cycleCheckStatus = (key: string) => {
    setChecklistStatus(prev => {
      const cur = prev[key] || 'review';
      const next: CheckStatus = cur === 'review' ? 'ok' : cur === 'ok' ? 'poor' : 'review';
      return { ...prev, [key]: next };
    });
  };

  const shouldAutoOpenContextPanel = (message: string) => /생성|prd|기능명세서|유저플로우|와이어프레임|문서|매니페스트/i.test(message);

  useEffect(() => {
    if (coachOpen || coachPinned) {
      setActiveTooltip(null);
    }
  }, [activeTab, coachOpen, coachPinned]);

  // ④ 컨텍스트 가이드 AI 채팅
  const handleContextChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctxChatInput.trim() || ctxChatLoading) return;
    const msg = ctxChatInput.trim();
    setCtxChatInput('');
    setCtxChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setCtxChatLoading(true);

    const items = CHECKLIST_ITEMS[activeTab as keyof typeof CHECKLIST_ITEMS] || [];
    const statusSummary = items.map(it => `${it.label}: ${checklistStatus[it.label] === 'ok' ? '충족' : checklistStatus[it.label] === 'poor' ? '미흡' : '검토 필요'}`).join(', ');
    const systemExtra = `너는 Manyfast 컨텍스트 가이드 패널의 AI 에이전트야.\n현재 유저가 보고 있는 문서 유형: ${activeTab}\n현재 판단 기준 목록 상태: ${statusSummary || '아직 평가 없음'}\n이 맥락을 기반으로 유저의 질문에 답해줘. 답변은 3줄 이내로 간결하게, 실제 사례를 포함해서.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: [], systemExtra }),
      });
      const data = await res.json();
      setCtxChatHistory(prev => [...prev, { role: 'ai', text: data.text || '답변을 생성하지 못했습니다.' }]);
    } catch {
      setCtxChatHistory(prev => [...prev, { role: 'ai', text: '서버 연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }]);
    } finally {
      setCtxChatLoading(false);
    }
  };

  const recentCtxChatHistory = useMemo(() => ctxChatHistory.slice(-3), [ctxChatHistory]);

  // 탭/요구사항/기능 변경 시 AI 에이전트 대화 초기화
  useEffect(() => {
    setCtxChatHistory([]);
    setCtxChatInput('');
  }, [activeTab, selectedReqId, selectedFeatId]);

  // AI 에이전트 대화창 자동 스크롤
  useEffect(() => {
    ctxChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ctxChatHistory]);

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

      if (shouldAutoOpenContextPanel(finalMsg)) {
        setCoachOpen(true);
      }
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
    setPromptModal({
      isOpen: true,
      title: "새로운 수용 기준(Acceptance Criteria)을 입력하세요:",
      onSubmit: (text) => {
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
      }
    });
  };

  const handleAddNewFeature = (reqId: string) => {
    setPromptModal({
      isOpen: true,
      title: "새로운 상세 기능명을 입력하세요:",
      onSubmit: (title) => {
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
      }
    });
  };

  const handleAddNewRequirement = () => {
    setPromptModal({
      isOpen: true,
      title: "새로운 요구사항 대분류명을 입력하세요:",
      onSubmit: (title) => {
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
      }
    });
  };

  // Filtered requirements list based on searching
  const filteredRequirements = useMemo(() => {
    if (!reqSearchQuery.trim()) return requirements;
    return requirements.filter(req => 
      req.title.toLowerCase().includes(reqSearchQuery.toLowerCase()) || 
      req.features.some(f => f.title.toLowerCase().includes(reqSearchQuery.toLowerCase()))
    );
  }, [requirements, reqSearchQuery]);

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
            {(['PRD', '기능명세서', '유저플로우', '와이어프레임 BETA'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  // 패널이 열려 있으면 탭 전환 후에도 유지
                  if (coachOpen || coachPinned) setCoachOpen(true);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                  activeTab === tab 
                    ? 'bg-white text-gray-905 shadow-xs font-black ring-1 ring-black/5' 
                    : 'text-gray-500 hover:text-gray-805 hover:bg-gray-50/50'
                }`}
              >
                {tab}
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

          <button
            onClick={() => { setShareModalOpen(true); setShareLinkCopied(false); }}
            className="flex items-center space-x-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all"
          >
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
              <div>
                <span className="font-extrabold text-xs text-gray-800 tracking-tight block leading-none">Manny AI Assistant</span>
                <span className="text-[9px] text-gray-400 font-medium mt-0.5 block">기획서를 함께 만들어요</span>
              </div>
            </div>
            <span className="text-[9px] text-[#A78BFA] font-bold uppercase bg-purple-50 border border-purple-100/60 px-1.5 py-0.5 rounded-md">
              Gemini 3.5 Flash
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
                    <span>Gemini</span>
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
                        <textarea 
                          className="w-full bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium resize-none focus:bg-white focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                          value={prdDoc.sections.overview.oneLiner}
                          onChange={(e) => handlePrdChange('overview', 'oneLiner', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">제품 목표</h3>
                        <textarea 
                          className="w-full bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium resize-none focus:bg-white focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                          value={prdDoc.sections.overview.goal}
                          onChange={(e) => handlePrdChange('overview', 'goal', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">배경</h3>
                        <textarea 
                          className="w-full bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium resize-none focus:bg-white focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                          value={prdDoc.sections.overview.background}
                          onChange={(e) => handlePrdChange('overview', 'background', e.target.value)}
                          rows={4}
                        />
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
                        <textarea 
                          className="w-full bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium resize-none focus:bg-white focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                          value={prdDoc.sections.problem.search}
                          onChange={(e) => handlePrdChange('problem', 'search', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">해결 방안</h3>
                        <textarea 
                          className="w-full bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium resize-none focus:bg-white focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                          value={prdDoc.sections.problem.solution}
                          onChange={(e) => handlePrdChange('problem', 'solution', e.target.value)}
                          rows={5}
                        />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">차별성</h3>
                        <textarea 
                          className="w-full bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium resize-none focus:bg-white focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                          value={prdDoc.sections.problem.differentiation}
                          onChange={(e) => handlePrdChange('problem', 'differentiation', e.target.value)}
                          rows={4}
                        />
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
                        <textarea 
                          className="w-full bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium resize-none focus:bg-white focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                          value={prdDoc.sections.target.targetUser}
                          onChange={(e) => handlePrdChange('target', 'targetUser', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">사용자 시나리오</h3>
                        <textarea 
                          className="w-full bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium leading-relaxed resize-none focus:bg-white focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                          value={prdDoc.sections.target.scenario}
                          onChange={(e) => handlePrdChange('target', 'scenario', e.target.value)}
                          rows={4}
                        />
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
                        <textarea 
                          className="w-full bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium resize-none focus:bg-white focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                          value={prdDoc.sections.success.metrics}
                          onChange={(e) => handlePrdChange('success', 'metrics', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-400 mb-1">리스크</h3>
                        <textarea 
                          className="w-full bg-gray-50/70 p-3.5 rounded-xl text-gray-700 border border-gray-100/50 font-medium resize-none focus:bg-white focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                          value={prdDoc.sections.success.risks}
                          onChange={(e) => handlePrdChange('success', 'risks', e.target.value)}
                          rows={3}
                        />
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
                            {requirements.find(r => r.id === selectedMindmapNode)?.features.map(f => f.desc).filter(Boolean).join(" ") || "하위 기능들의 상세 내용을 통해 수용 기준을 구체화하는 영역입니다."}
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
                    <div className="border border-purple-100/50 bg-[#FCFCFD]/70 rounded-2xl p-4 min-h-[140px] relative">
                      <div className="absolute top-3 left-3 bg-purple-100/50 text-purple-700 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                        커피챗 일정 약속 조율 캘린더 구간
                      </div>

                      <div className="flex items-center space-x-12 pt-8 pl-4">
                        <div className="w-28 py-3 rounded-xl border border-gray-300 bg-white text-center shadow-3xs cursor-pointer hover:border-purple-300 transition-all">
                          <span className="text-xs font-black text-gray-700">캘린더 슬롯 선택</span>
                        </div>
                        <div className="text-gray-300">➜</div>
                        <div className="w-32 py-3 rounded-xl border border-gray-300 bg-white text-center shadow-3xs cursor-pointer hover:border-purple-300 transition-all">
                          <span className="text-xs font-black text-gray-700">상대방에게 제안</span>
                        </div>
                        <div className="text-gray-300">➜</div>
                        <div className="w-28 py-3 rounded-xl border border-purple-300 bg-purple-50 text-center shadow-sm cursor-pointer hover:bg-purple-100 transition-all">
                          <span className="text-xs font-black text-purple-700">예약 최종 확정</span>
                        </div>
                      </div>
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

          {/* ======================================================== */}
          {/* TAB 4: WIREFRAME BETA ("와이어프레임 BETA")                */}
          {/* ======================================================== */}
          {activeTab === '와이어프레임 BETA' && (
            <div className="flex-1 overflow-hidden flex bg-white divide-y divide-gray-150">
              
              {/* Dotted drawing grid area with responsive mobile frames */}
              <div className="flex-1 overflow-hidden flex flex-col relative select-none">
                
                {/* Secondary navigation filters for Wireframe screens selection */}
                <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between z-10 shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      와이어프레임 피델리티 ➜ 모바일 스크린 목업 구조화
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-500">
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-100">전체 스크린</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer">온보딩</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer">매칭 서비스</span>
                  </div>
                </div>

                {/* Grid canvas showing multi-mobile screens connected with interactive arrows */}
                <div className="flex-1 overflow-auto p-8 relative" style={{
                  backgroundImage: 'radial-gradient(#CBD5E1 1.1px, transparent 1.1px)',
                  backgroundSize: '16px 16px'
                }}>
                  
                  {/* Outer wrapper to contain connected mobile screen nodes */}
                  <div className="flex items-start space-x-8 pb-12 relative z-10 pt-4">
                    
                    {/* Screen 1: Onboarding Portal */}
                    <div 
                      onClick={() => setSelectedWireframeId('screen-1')}
                      className={`w-56 shrink-0 bg-white rounded-[24px] border-4 p-3 shadow-md hover:shadow-xl transition-all cursor-pointer relative ${
                        selectedWireframeId === 'screen-1' 
                          ? 'border-purple-600 ring-4 ring-purple-100 scale-102 bg-purple-50/10' 
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {/* Top mobile speaker earphone */}
                      <div className="w-16 h-3.5 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <div className="w-6 h-1 bg-gray-500 rounded-full"></div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-3 h-72 flex flex-col justify-between border border-gray-200 text-left">
                        <div>
                          <div className="flex justify-between items-center text-[8.5px] font-bold text-purple-600 mb-2">
                            <span>Manny Coffee</span>
                            <span className="px-1 bg-purple-100 text-[7.5px] rounded">v1.2</span>
                          </div>
                          
                          <h4 className="text-[11px] font-black leading-snug text-gray-900 mb-1">
                            공동 관심사를 가치로 승화하는 실시간 소셜 커피챗
                          </h4>
                          <p className="text-[8.5px] text-gray-400 font-semibold mb-2 leading-relaxed">
                            느슨하지만 건설적인 직장인/커리어 매칭 포털에 어서 오십시오!
                          </p>

                          {/* Dummy illustration box info */}
                          <div className="bg-purple-100/50 border border-purple-200/50 rounded-lg p-2 flex flex-col items-center justify-center my-3 text-center">
                            <Sparkles size={16} className="text-purple-600 animate-pulse mb-1" />
                            <span className="text-[8px] text-purple-900 font-black">AI 기반 맞춤형 인자 매칭</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pb-1">
                          <button className="w-full py-1.5 bg-purple-600 text-white text-[8.5px] font-black rounded-lg shadow-3xs hover:bg-purple-700 transition-all">
                            ⚡ 카카오 1초 로그인
                          </button>
                          <button className="w-full py-1.5 bg-white border border-gray-250 text-gray-700 text-[8.5px] font-bold rounded-lg hover:bg-gray-50">
                            이메일로 신규 등록
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-extrabold text-gray-500">1. 가입 온보딩 포털</span>
                      </div>
                    </div>

                    {/* Flow bridge Arrow */}
                    <div className="self-center text-gray-300 font-black text-lg select-none">➜</div>

                    {/* Screen 2: Sign-Up Traditional form */}
                    <div 
                      onClick={() => setSelectedWireframeId('screen-2')}
                      className={`w-56 shrink-0 bg-white rounded-[24px] border-4 p-3 shadow-md hover:shadow-xl transition-all cursor-pointer relative ${
                        selectedWireframeId === 'screen-2' 
                          ? 'border-purple-600 ring-4 ring-purple-100 scale-102 bg-purple-50/10' 
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-16 h-3.5 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <div className="w-6 h-1 bg-gray-500 rounded-full"></div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 h-72 flex flex-col justify-between border border-gray-200 text-left">
                        <div>
                          <span className="text-[8.5px] font-black text-gray-400 block mb-1">회원가입 단계</span>
                          <h4 className="text-[10.5px] font-black text-gray-900">계정 명세 기입</h4>
                          
                          <div className="space-y-2 mt-4">
                            <div className="space-y-0.5">
                              <label className="text-[7.5px] font-bold text-gray-400">사용 이메일 ID</label>
                              <input 
                                type="text" 
                                placeholder="name@company.com" 
                                className="w-full bg-white border border-gray-200 rounded p-1 text-[8.5px] outline-none"
                                disabled 
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[7.5px] font-bold text-gray-400">비밀번호 기입</label>
                              <input 
                                type="password" 
                                value="●●●●●●●●" 
                                className="w-full bg-white border border-gray-200 rounded p-1 text-[8.5px] outline-none text-gray-400"
                                disabled 
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[7.5px] font-bold text-gray-400">기본 소속 / 직무 필드</label>
                              <input 
                                type="text" 
                                placeholder="예: IT 프로덕트 디자이너" 
                                className="w-full bg-white border border-gray-200 rounded p-1 text-[8.5px] outline-none"
                                disabled 
                              />
                            </div>
                          </div>
                        </div>

                        <button className="w-full py-1.5 bg-purple-600 text-white text-[8.5px] font-black rounded-lg hover:bg-purple-700 transition-all">
                          가입 승인 & 다음 진행 ➜
                        </button>
                      </div>

                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-extrabold text-gray-500">2. 소셜/이메일 가입 폼</span>
                      </div>
                    </div>

                    {/* Flow bridge Arrow */}
                    <div className="self-center text-gray-300 font-black text-lg select-none">➜</div>

                    {/* Screen 3: Bento Interest Selection */}
                    <div 
                      onClick={() => setSelectedWireframeId('screen-3')}
                      className={`w-56 shrink-0 bg-white rounded-[24px] border-4 p-3 shadow-md hover:shadow-xl transition-all cursor-pointer relative ${
                        selectedWireframeId === 'screen-3' 
                          ? 'border-purple-600 ring-4 ring-purple-100 scale-102 bg-purple-50/10' 
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-16 h-3.5 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <div className="w-6 h-1 bg-gray-500 rounded-full"></div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 h-72 flex flex-col justify-between border border-gray-200 text-left">
                        <div>
                          <span className="text-[8.5px] font-black text-gray-400 block mb-1">관심사 수집 온보딩</span>
                          <h4 className="text-[10.5px] font-black text-gray-900 leading-tight">
                            가장 관심 있는 키워드를 3개 이상 선택하세요
                          </h4>

                          <div className="grid grid-cols-2 gap-1.5 mt-4">
                            {[
                              { label: "IT 개발 💻", active: true },
                              { label: "마케팅 📈", active: true },
                              { label: "디자인 🎨", active: true },
                              { label: "스타트업 🚀", active: false },
                              { label: "기획/PM 💡", active: false },
                              { label: "인맥네트 ☕", active: false }
                            ].map((chip, idx) => (
                              <div 
                                key={idx}
                                className={`p-1.5 rounded-lg border text-center text-[8px] font-bold transition-all ${
                                  chip.active 
                                    ? 'bg-purple-100 border-purple-300 text-purple-900 font-extrabold' 
                                    : 'bg-white border-gray-200 text-gray-505 hover:bg-white'
                                }`}
                              >
                                {chip.label}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-[8px] text-[#7C3AED] font-black mb-1.5">3개 선택 완료됨!</p>
                          <button className="w-full py-1.5 bg-purple-600 text-white text-[8.5px] font-black rounded-lg hover:bg-purple-700 transition-all">
                            알고리즘 추천 결과 받기 ➜
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-extrabold text-gray-500">3. 관심 키워드 넛징</span>
                      </div>
                    </div>

                    {/* Flow bridge Arrow */}
                    <div className="self-center text-gray-300 font-black text-lg select-none">➜</div>

                    {/* Screen 4: recommendation main list */}
                    <div 
                      onClick={() => setSelectedWireframeId('screen-4')}
                      className={`w-56 shrink-0 bg-white rounded-[24px] border-4 p-3 shadow-md hover:shadow-xl transition-all cursor-pointer relative ${
                        selectedWireframeId === 'screen-4' 
                          ? 'border-purple-600 ring-4 ring-purple-100 scale-102 bg-purple-50/10' 
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-16 h-3.5 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <div className="w-6 h-1 bg-gray-500 rounded-full"></div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 h-72 flex flex-col justify-between border border-gray-200 text-left">
                        <div>
                          <div className="flex justify-between items-center mb-1 bg-transparent">
                            <span className="text-[8.5px] font-black text-purple-700">오늘의 마인드 추천</span>
                            <span className="text-[7.5px] text-gray-400 font-bold">오전 12:00 갱신</span>
                          </div>
                          
                          <div className="bg-white rounded-lg border border-gray-150 p-2 space-y-1.5 mt-2.5">
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 rounded-full bg-indigo-500 text-[8px] text-white flex items-center justify-center font-black">
                                PM
                              </div>
                              <div>
                                <h5 className="text-[9px] font-black text-gray-900 leading-none">맥스 기획자</h5>
                                <span className="text-[7.5px] text-gray-400 font-bold">카카오 실무 6년차</span>
                              </div>
                            </div>
                            
                            <p className="text-[8px] text-gray-600 leading-relaxed font-semibold">
                              "시너지 넘치는 커피챗을 통해 비즈니스 모델 설계 고민을 해결해 드립니다."
                            </p>
                            
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[6.5px] bg-gray-100 px-1 py-0.2 rounded text-gray-500">#스타트업BM</span>
                              <span className="text-[6.5px] bg-gray-100 px-1 py-0.2 rounded text-gray-500">#서비스가치</span>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg border border-gray-150 p-2 opacity-50 space-y-1.5 mt-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center font-black">
                                Dev
                              </div>
                              <div>
                                <h5 className="text-[9px] font-black text-gray-900">제이콥 디벨로퍼</h5>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button className="w-full py-1.5 bg-purple-600 text-white text-[8.5px] font-black rounded-lg hover:bg-purple-700 transition-all">
                          ☕ 이 유저와 커피챗 성사 매칭 신청
                        </button>
                      </div>

                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-extrabold text-gray-500">4. 알고리즘 추천 마인드</span>
                      </div>
                    </div>

                    {/* Flow bridge Arrow */}
                    <div className="self-center text-gray-300 font-black text-lg select-none">➜</div>

                    {/* Screen 5: scheduling calendar details */}
                    <div 
                      onClick={() => setSelectedWireframeId('screen-5')}
                      className={`w-56 shrink-0 bg-white rounded-[24px] border-4 p-3 shadow-md hover:shadow-xl transition-all cursor-pointer relative ${
                        selectedWireframeId === 'screen-5' 
                          ? 'border-purple-600 ring-4 ring-purple-100 scale-102 bg-purple-50/10' 
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-16 h-3.5 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <div className="w-6 h-1 bg-gray-500 rounded-full"></div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 h-72 flex flex-col justify-between border border-gray-200 text-left">
                        <div>
                          <span className="text-[8.5px] font-black text-gray-400 block mb-1">스케줄 확정 단계</span>
                          <h4 className="text-[10.5px] font-black text-gray-900">커피챗 성합 일정 슬롯 조율</h4>
                          
                          <div className="bg-white rounded-lg border border-gray-150 p-2 mt-3 space-y-2">
                            <span className="text-[7.5px] text-gray-400 font-semibold block uppercase">6월 최적 추천 요일</span>
                            <div className="grid grid-cols-5 gap-1 text-[7.5px] text-center font-bold">
                              <span className="p-1 bg-gray-100 rounded text-gray-400">22 월</span>
                              <span className="p-1 bg-purple-100 text-purple-700 rounded ring-1 ring-purple-200">23 화</span>
                              <span className="p-1 bg-purple-100 text-purple-700 rounded ring-1 ring-purple-200">24 수</span>
                              <span className="p-1 bg-gray-100 rounded text-gray-400">25 목</span>
                              <span className="p-1 bg-gray-100 rounded text-gray-400">26 금</span>
                            </div>
                            
                            <div className="space-y-1 pt-1 border-t border-gray-100 text-[8px]">
                              <div className="flex justify-between text-gray-700">
                                <span>선택된 요일</span>
                                <span className="font-extrabold text-purple-600">6월 23일 (화)</span>
                              </div>
                              <div className="flex justify-between text-gray-700">
                                <span>가능 공통 시간</span>
                                <span className="font-extrabold text-purple-600">저녁 19:30</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button className="w-full py-1.5 bg-purple-600 text-white text-[8.5px] font-black rounded-lg hover:bg-purple-700 transition-all">
                          📅 약속 확정 알림 카톡 발송하기
                        </button>
                      </div>

                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-extrabold text-gray-500">5. 커피챗 예약 최종조율</span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* Right Side Administration panel for Wireframes diagnostic feedback */}
              <div className="w-[300px] border-l border-gray-200 bg-[#FCFCFD] flex flex-col shrink-0 max-sm:hidden">
                <div className="p-4 border-b border-gray-199 bg-white">
                  <span className="font-extrabold text-[10px] text-purple-600 block uppercase tracking-widest mb-1">
                    와이어프레임 설계 조력
                  </span>
                  <h3 className="font-extrabold text-xs text-gray-900">
                    모바일 화면 기획 보고서
                  </h3>
                  
                  <button className="mt-3 w-full flex items-center justify-center space-x-1.5 bg-purple-50 border border-purple-200 text-[#7C3AED] hover:bg-purple-100 text-xs font-black py-2 rounded-lg shadow-3xs transition-all">
                    <Sparkles size={11} className="text-yellow-400 animate-spin" />
                    <span>+ 신규 와이어프레임 생성</span>
                  </button>
                </div>

                <div className="p-4 border-b border-gray-100 space-y-2">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">화면 정보 제어</span>
                  <div className="p-3 bg-white border border-gray-250 rounded-xl shadow-3xs relative">
                    <div className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer">
                      <MoreVertical size={13} />
                    </div>
                    <span className="text-[11px] font-black text-gray-900 block">인맥 네트워킹 와플버전 1</span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">최종 수정 상태: 2026.06.22</span>
                    <button className="mt-3.5 w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] font-bold py-2 rounded-lg text-gray-600 text-center">
                      ✏️ 수정본 만들기
                    </button>
                  </div>
                </div>

                {/* Diagnostic details section with conditional bindings */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40">
                  <div>
                    <span className="text-[10px] text-purple-600 font-bold block uppercase tracking-wide">
                      선택 화면 디테일 명세
                    </span>
                    <h4 className="text-xs font-black text-gray-950 mt-0.5 leading-snug">
                      {selectedWireframeId === 'screen-1' ? '1. 가입 온보딩 포털' :
                       selectedWireframeId === 'screen-2' ? '2. 소셜/이메일 가입 폼' :
                       selectedWireframeId === 'screen-3' ? '3. 관심 키워드 넛징 스크린' :
                       selectedWireframeId === 'screen-4' ? '4. 오늘의 알고리즘 추천 마인드' :
                       '5. 커피챗 최종 조율 슬롯 예약 캘린더'}
                    </h4>
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed font-semibold">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase mb-0.5">설계 철학 및 요약</span>
                      <p className="bg-white p-2.5 rounded-lg border border-gray-200 text-gray-700 shadow-3xs">
                        {selectedWireframeId === 'screen-1' ? '소셜 1클릭 가입 및 마케팅 혜택과 서비스 안내가 한눈에 나타납니다. UI 일관성을 위해 "매치 성사 가치 제안"을 첫화면에 핵심으로 부각합니다.' :
                         selectedWireframeId === 'screen-2' ? '최소 정보만 입력하는 이중 패스워드 검증 구조입니다. 복잡한 가입 정보를 다 기입하기 전, 이메일로 간단히 인증 세선을 확보합니다.' :
                         selectedWireframeId === 'screen-3' ? '사용자의 관심 태그를 3개 이상 필수로 수집하는 화면입니다. 그리드로 구성된 각 키워드 칩들은 원클릭으로 손쉽게 하이라이트됩니다.' :
                         selectedWireframeId === 'screen-4' ? '매일 자정에 갱신되는 유사 최적 인맥 추천 목록을 카드식 UI로 둘러봅니다. 마인드 가치 매니패스트 기반 커피챗 신청이 원터치로 진행됩니다.' :
                         '앱 내 마이 캘린더에서 양자 간 스케줄링 여력 슬롯이 자동 중첩 캘린더 피드로 추천 표시됩니다.'}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase mb-0.5">구현 목표 수치</span>
                      <p className="bg-white p-2.5 rounded-lg border border-gray-200 text-gray-700 shadow-3xs">
                        {selectedWireframeId === 'screen-1' ? '신규 가입 유입 경로에서 마찰 및 중도 이탈률 1.2% 이내 방어' :
                         selectedWireframeId === 'screen-2' ? '가입 폼 오기입 및 양식 포맷 불일치로 인한 중도 포기방지 98%' :
                         selectedWireframeId === 'screen-3' ? '가중치 성실 기입률 90% 이상 유지' :
                         selectedWireframeId === 'screen-4' ? '커피챗 최초 신청 전이 행동 전환율 45% 확보' :
                         '캘린더 충돌 이탈 계수 완전 제로로 회귀화'}
                      </p>
                    </div>

                    <div className="bg-red-50/50 p-2.5 border border-red-100 rounded-lg text-red-950">
                      <span className="text-red-600 block text-[9px] uppercase font-black mb-1 flex items-center">
                        <AlertCircle size={10} className="mr-1 animate-pulse" />
                        AI 수치 이탈 가드라인 (위험 대우)
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        {selectedWireframeId === 'screen-1' ? '이메일 가입 번거로움에 봉착 시, 패스워드 프리 1회 임시 매니패스트 통과 가입 포딩 처리 기능 마련.' :
                         selectedWireframeId === 'screen-2' ? '패스워드 입력 오기입 시 실시간 유효 조언 필드(UI 경고창)를 즉시 보정하여 이탈 극복.' :
                         selectedWireframeId === 'screen-3' ? '칩 개수 허가 단계를 유동적으로 해제하고 가입 후 "마이 페이지" 피드백으로 미루는 허들 제거.' :
                         selectedWireframeId === 'screen-4' ? '추천 인력이 없을 시 가상의 콜드 스타트용 시너지 인재 가이드를 연동해 빈 화면 노출 억제.' :
                         '선호 일정 불일치 충돌 시, 카카오 알림톡으로 수동 약속 조율을 대리할 임시 대기 슬롯 링크 발행.'}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setCoachOpen(true);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-lg shadow-sm hover:shadow flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Sparkles size={11} />
                    <span>이 화면 코치 분석 요청</span>
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
              <span className="flex flex-col items-center gap-0.5">
                <span className="text-[11px] font-black text-white">AI</span>
                <span className="text-[9px] font-black tracking-widest uppercase text-white" style={{ writingMode: 'vertical-rl' }}>Coach</span>
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
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1.5 rounded-lg text-white shadow-md">
                  <Lightbulb size={15} className="text-yellow-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-gray-900 leading-none">AI 코치</h3>
                  <p className="text-[9px] text-gray-400 font-semibold mt-0.5">만든 기획서를 검토해요</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button onClick={() => setCoachPinned(!coachPinned)}
                  className={`p-1.5 rounded-lg transition-colors ${coachPinned ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={coachPinned ? "핀 고정 해제" : "패널 고정"}>
                  {coachPinned ? <PinOff size={13} /> : <Pin size={13} />}
                </button>
                {!coachPinned && (
                  <button onClick={() => setCoachOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg" title="닫기">
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto bg-[#F9FBFD]/40 p-3 space-y-4" onClick={() => setActiveTooltip(null)}>

              {/* ① 시장 데이터 카드 (accordion) */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-3xs">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMarketDataOpen(v => !v); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-left"
                >
                  <span className="text-[10px] font-black text-gray-700 flex items-center gap-1.5">
                    📊 시장 데이터
                    {marketDataLoading && <span className="h-2.5 w-2.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin inline-block" />}
                  </span>
                  {marketDataOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                </button>
                {marketDataOpen && (
                  <div className="px-3.5 pb-3 space-y-2 border-t border-gray-100">
                    {marketData ? (
                      <>
                        <div className="pt-2 space-y-1.5">
                          <p className="text-[9px] font-black text-purple-600 uppercase tracking-wider">추천 타겟</p>
                          <p className="text-[11px] text-gray-700 font-semibold leading-relaxed">{marketData.target}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">주요 트렌드</p>
                          <p className="text-[11px] text-gray-700 font-semibold leading-relaxed">{marketData.trend.replace(/게임성/g, '다른 결과')}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-rose-500 uppercase tracking-wider">경쟁사 주요 약점</p>
                          <p className="text-[11px] text-gray-700 font-semibold leading-relaxed">{marketData.competitorWeakness}</p>
                        </div>
                        {marketData.sources && marketData.sources.length > 0 && (
                          <div className="border-t border-gray-100 pt-2 space-y-0.5">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">참고 출처</p>
                            {marketData.sources.map((src, i) => (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[9px] text-purple-500 hover:text-purple-700 font-medium leading-relaxed underline underline-offset-1 truncate"
                              >· {src.label}</a>
                            ))}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setMarketData(null); fetchMarketData(); }}
                          className="text-[9px] text-purple-500 hover:text-purple-700 font-bold pt-1"
                        >↻ 재생성</button>
                      </>
                    ) : (
                      <div className="pt-2 space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className={`h-3 bg-gray-200/70 rounded-full animate-pulse ${i === 1 ? 'w-4/5' : 'w-full'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ③-2 추가 리서치 필요 항목 — 구성 기준 앞에 배치 */}
              {(() => {
                type ResearchContent = { description: string; points: string[]; prompts: string[] };
                const RESEARCH_MAP: Record<string, ResearchContent> = {
                  '문제-솔루션 연결': { description: '현재 정의된 문제와 제안된 솔루션 사이의 논리적 연결이 충분한지 검증 필요', points: ['동일 문제를 해결한 타사 서비스의 솔루션 접근 방식', '이 솔루션이 문제의 근본 원인을 해결하는지 여부', '유저가 이 솔루션을 선택할 이유 (대안 대비 차별점)'], prompts: ['다음 기획안에서 문제 정의와 솔루션 사이의 논리적 연결을 검토해줘.\n문제의 근본 원인이 솔루션으로 직접 해결되는지,\n유저가 이 솔루션을 선택할 이유가 명확한지 짚어줘.\n타사에서 유사한 문제를 어떻게 해결했는지도 알려줘.\n[기획안 내용 붙여넣기]', '다음 기획안의 솔루션이 문제를 해결하는 가장 효율적인 방법인지 검토해줘.\n대안 솔루션과 비교했을 때 이 방식을 선택해야 하는 근거를 제시해줘.\n[기획안 내용 붙여넣기]', "다음 기획안에서 '왜 이 솔루션인가'에 대한 근거가 충분한지 Mom Test 관점으로 검토해줘.\n유저가 실제로 이 문제를 해결하기 위해 돈을 낼 의향이 있는지,\n과거 행동 기반으로 판단할 수 있는 질문을 제안해줘.\n[기획안 내용 붙여넣기]"] },
                  '한 줄 정의': { description: '서비스의 핵심 가치를 한 문장으로 압축했을 때 타겟 유저에게 명확하게 전달되는지 검증 필요', points: ['경쟁 서비스들의 한 줄 정의 표현 방식 비교', '타겟 유저가 즉시 이해할 수 있는 언어 수준인지', '차별화 포인트가 한 문장 안에 포함되어 있는지'], prompts: ['다음 서비스의 한 줄 정의를 검토해줘.\n타겟 유저가 처음 봤을 때 5초 안에 이해할 수 있는지,\n경쟁 서비스 대비 차별점이 드러나는지 평가해줘.\n더 명확한 대안 문장 3개도 제안해줘.\n[한 줄 정의 붙여넣기]', '다음 한 줄 정의가 타겟 유저의 언어로 작성됐는지 검토해줘.\n기획자 관점이 아니라 유저 관점에서 읽었을 때\n나를 위한 서비스다라고 느껴지는지 평가하고 개선안을 제시해줘.\n[한 줄 정의 붙여넣기]', '다음 한 줄 정의와 유사한 포지셔닝을 가진 경쟁 서비스 3개를 찾아줘.\n각각의 한 줄 정의와 비교해서 우리 서비스만의 차별점이 충분히 드러나는지 분석해줘.\n[한 줄 정의 붙여넣기]'] },
                  '타겟 명확성': { description: '타겟 사용자 정의가 충분히 구체적이고 실행 가능한 수준인지 검증 필요', points: ['타겟 사용자의 직군·연령·니즈가 구체적으로 명시되어 있는지', '"모든 사람"처럼 광범위한 정의가 없는지', '세분화된 페르소나 기반으로 검증 가능한지'], prompts: ['다음 PRD의 타겟 사용자 정의가 충분히 구체적인지 검토해줘.\n직군, 연령대, 핵심 니즈, 현재 대안 대비 불편함이 명시되어 있는지 확인하고\n모든 사람 같은 광범위한 정의가 있다면 세분화 방법을 구체적으로 제안해줘.\n[PRD 내용 붙여넣기]', '다음 타겟 정의를 페르소나 관점에서 검토해줘.\n이 타겟이 실제로 존재하는 사람인지, 인터뷰로 찾을 수 있는지,\n이들의 하루 루틴에서 이 서비스가 필요한 순간을 구체적으로 설명해줘.\n[타겟 정의 붙여넣기]', '다음 타겟 정의로 타겟팅 광고를 집행한다고 가정할 때\nFacebook/Instagram 타겟 설정 기준으로 구체화할 수 있는지 평가해줘.\n더 좁히거나 넓혀야 할 부분을 근거와 함께 제안해줘.\n[타겟 정의 붙여넣기]'] },
                  '기능 의존 순서': { description: '기능 간 선행 조건과 의존 관계가 명확히 정의되어 있는지 검증 필요', points: ['A 기능 완료 후 B 기능이 가능한 의존 관계 명시 여부', '개발 순서에 영향을 미치는 블로킹 의존성 파악', 'MVP 범위와 이후 단계 기능의 명확한 구분'], prompts: ['다음 기능명세서에서 각 기능의 선행 조건과 의존 관계를 검토해줘.\nA 기능이 완료돼야 B 기능이 동작하는 경우를 모두 찾아서\n의존 순서가 누락된 부분을 구체적으로 지적해줘.\n[기능명세서 내용 붙여넣기]', '다음 기능명세서를 개발 스프린트 순서로 재배열해줘.\n어떤 기능이 먼저 개발되어야 하는지, 병렬로 진행 가능한 기능은 무엇인지\n의존성 다이어그램 형태로 정리해줘.\n[기능명세서 내용 붙여넣기]', '다음 기능 중 MVP에 포함해야 할 핵심 기능과\n이후 단계에서 추가해도 되는 기능을 선행 의존 관계 기준으로 분류해줘.\n각 판단의 근거도 함께 설명해줘.\n[기능명세서 내용 붙여넣기]'] },
                  '핵심-부가 구분': { description: 'MVP 필수 기능과 부가 기능이 명확히 구분되어 우선순위가 설정되어 있는지 검증 필요', points: ['Must/Should/Could 우선순위 기준 적용 여부', 'MVP 범위를 초과하는 기능 포함 여부', '각 기능의 비즈니스 임팩트 대비 개발 비용 분석'], prompts: ['다음 기능명세서에서 핵심 기능과 부가 기능을 구분해줘.\nMVP에 반드시 필요한 기능과 나중에 추가해도 되는 기능을\n각각 이유와 함께 정리해줘.\n[기능명세서 내용 붙여넣기]', '다음 기능 목록을 MoSCoW 방식으로 분류해줘.\n각 기능을 분류한 이유와 함께, MVP 버전에서 제외해야 할 기능을 명확히 짚어줘.\n[기능명세서 내용 붙여넣기]', '다음 기능 중 구현 난이도 대비 유저 임팩트가 낮은 기능을 찾아줘.\n2x2 매트릭스로 분류하고 제거하거나 간소화해야 할 기능을 구체적으로 제안해줘.\n[기능명세서 내용 붙여넣기]'] },
                  '엣지 케이스 정의': { description: '예외 상황과 오류 흐름이 기능명세서에 명시되어 있는지 검증 필요', points: ['네트워크 오류·빈 상태·권한 없음 등 예외 상황 정의', '각 기능의 입력값 유효성 검사 및 경계값 처리', '오류 발생 시 유저에게 표시할 메시지와 복구 경로'], prompts: ['다음 기능명세서에서 엣지 케이스가 정의되지 않은 기능을 찾아줘.\n네트워크 오류, 빈 상태, 권한 없음, 입력값 초과 등\n일반적인 엣지 케이스 유형 기준으로 빠진 부분을 목록으로 정리해줘.\n[기능명세서 내용 붙여넣기]', '다음 기능명세서의 각 기능에 대해 What-if 시나리오를 작성해줘.\n각 상황에서 서비스가 어떻게 반응해야 하는지 정의해줘.\n[기능명세서 내용 붙여넣기]', '다음 기능명세서에서 운영 환경에서 실제로 발생할 수 있는 엣지 케이스를 찾아줘.\n각 케이스별 대응 방안을 제안해줘.\n[기능명세서 내용 붙여넣기]'] },
                  '진입 경로 수': { description: '서비스 진입 경로가 실제 유저 행동 패턴을 충분히 반영하는지 검증 필요', points: ['직접 탐색·알림·공유 링크 등 주요 진입 유형 포함 여부', '각 진입 경로별 첫 화면 차별화 여부', '딥링크 및 외부 유입 시나리오 고려 여부'], prompts: ['다음 유저플로우에서 서비스 진입 경로가 충분히 포함되어 있는지 검토해줘.\n누락된 진입 경로와 각 경로에서 달라져야 할 첫 화면을 구체적으로 제안해줘.\n[유저플로우 내용 붙여넣기]', '다음 유저플로우의 진입 경로를 신규 유저와 재방문 유저로 나누어 검토해줘.\n각 유형별로 최적화된 첫 화면 경험이 설계되어 있는지 확인해줘.\n[유저플로우 내용 붙여넣기]', '유사 서비스의 진입 경로 설계를 참고해서 다음 유저플로우에서 놓친 진입 경로를 찾아줘.\n[유저플로우 내용 붙여넣기]'] },
                  '오류 흐름 포함': { description: '오류 상황과 복구 흐름이 유저플로우에 명시되어 있는지 검증 필요', points: ['로그인 실패·네트워크 단절·권한 거부 등 오류 분기 포함', '각 오류 노드에서 복구 경로가 1개 이상 연결되어 있는지', '오류 메시지와 유저 안내 문구 정의 여부'], prompts: ['다음 유저플로우에서 오류 상황과 복구 흐름이 누락된 노드를 찾아줘.\n각 오류에 대한 복구 경로를 구체적으로 제안해줘.\n[유저플로우 내용 붙여넣기]', '다음 유저플로우의 각 단계에서 발생 가능한 오류를 사용자 관점으로 시뮬레이션해줘.\n오류 UX를 개선하는 구체적인 방법을 제안해줘.\n[유저플로우 내용 붙여넣기]', '다음 유저플로우에 Error Path와 Edge Path를 추가해줘.\n각 경로별로 유저에게 표시할 메시지와 다음 행동 유도 방법을 정의해줘.\n[유저플로우 내용 붙여넣기]'] },
                  '단계 간결성': { description: '유저플로우의 각 경로에서 단계 수가 이탈 없이 완료 가능한 수준인지 검증 필요', points: ['온보딩·핵심 기능 도달까지 탭 수 측정', '업계 기준(온보딩 3단계 이내) 충족 여부', '통합 가능한 화면과 제거 가능한 단계 식별'], prompts: ['다음 유저플로우의 각 경로에서 단계 수가 적절한지 검토해줘.\n줄일 수 있는 단계와 통합 가능한 화면을 구체적으로 제안해줘.\n[유저플로우 내용 붙여넣기]', '다음 유저플로우에서 유저 이탈이 가장 많이 발생할 것 같은 단계를 예측해줘.\n이탈률을 낮출 수 있는 방법을 구체적으로 제안해줘.\n[유저플로우 내용 붙여넣기]', 'Toss, 카카오, 당근마켓의 온보딩 단계 수를 기준으로 다음 유저플로우의 간결성을 평가해줘.\n[유저플로우 내용 붙여넣기]'] },
                  'CTA 위치': { description: 'CTA(핵심 행동 버튼)의 위치가 유저의 시선 흐름과 행동 패턴에 최적화되어 있는지 검증 필요', points: ['스크롤 없이 보이는 영역(Fold 위)에 CTA 배치 여부', 'CTA가 경쟁 요소와 혼재되지 않는지', '모바일 엄지 손가락 도달 범위 내 위치 여부'], prompts: ['다음 와이어프레임에서 CTA의 위치가 적절한지 검토해줘.\nCTA가 묻히거나 경쟁 요소와 혼재된 화면을 찾아 개선 방향을 제안해줘.\n[와이어프레임 설명 붙여넣기]', '다음 와이어프레임의 CTA 배치를 모바일 UX 관점에서 검토해줘.\n엄지 손가락 도달 범위 기준으로 분석하고 개선안을 제시해줘.\n[와이어프레임 설명 붙여넣기]', 'Coupang, 토스, 카카오페이의 CTA 배치 원칙을 참고해서 개선 방법을 제안해줘.\n[와이어프레임 설명 붙여넣기]'] },
                  '스크롤 깊이': { description: '핵심 정보와 CTA가 과도한 스크롤 없이 전달되는지 검증 필요', points: ['모바일 기준 3스크롤 이내 핵심 가치 전달 여부', '콘텐츠 우선순위에 따른 화면 배치 적절성', '정보 과부하로 인한 스크롤 피로 발생 가능성'], prompts: ['다음 와이어프레임에서 각 화면의 스크롤 깊이가 적절한지 검토해줘.\n정보 구조를 재편하는 구체적인 방법을 제안해줘.\n[와이어프레임 설명 붙여넣기]', '다음 와이어프레임을 3-Scroll Rule 기준으로 평가해줘.\n개선안을 제시해줘.\n[와이어프레임 설명 붙여넣기]', '다음 와이어프레임에서 Fold 아래 숨겨진 중요 콘텐츠를 찾아줘.\n화면 상단으로 올리거나 구조를 재편하는 방법을 제안해줘.\n[와이어프레임 설명 붙여넣기]'] },
                  '레이아웃 일관성': { description: '화면 간 버튼 위치·타이포그래피·간격이 일관된 디자인 시스템을 따르는지 검증 필요', points: ['버튼 크기·위치·색상 화면 간 통일성', '타이포그래피(폰트 크기·굵기·색상) 일관성', '여백(padding/margin) 규칙의 시스템화 여부'], prompts: ['다음 와이어프레임에서 화면 간 레이아웃 일관성을 검토해줘.\n통일해야 할 디자인 규칙을 구체적으로 제안해줘.\n[와이어프레임 설명 붙여넣기]', '다음 와이어프레임을 기반으로 기본 디자인 시스템을 정의해줘.\n실제 개발에 바로 사용할 수 있는 형태로 정리해줘.\n[와이어프레임 설명 붙여넣기]', 'Airbnb DLS, Toss Design System을 참고해서 즉시 개선해야 할 불일치 요소 Top 3를 제안해줘.\n[와이어프레임 설명 붙여넣기]'] },
                };

                const validStatuses2 = ['충족', '검토필요'] as const;
                type SKey2 = typeof validStatuses2[number];
                const researchItems = aiCriteria.filter(item => {
                  const cur: SKey2 = validStatuses2.includes(checklistStatus[item.id] as SKey2)
                    ? (checklistStatus[item.id] as SKey2)
                    : validStatuses2.includes(item.status as SKey2)
                    ? (item.status as SKey2)
                    : '검토필요';
                  return cur === '검토필요';
                });
                if (researchItems.length === 0) return null;

                return (
                  <div className="bg-white border border-orange-200 rounded-xl shadow-3xs overflow-hidden">
                    <div className="px-3.5 py-2.5 border-b border-orange-100 bg-orange-50/60 flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-orange-600">🔍 추가 리서치 필요</span>
                      <span className="text-[9px] bg-orange-100 text-orange-500 font-black px-1.5 py-0.5 rounded-full">{researchItems.length}</span>
                    </div>
                    <div className="p-3 space-y-4">
                      {researchItems.map(item => {
                        const content = RESEARCH_MAP[item.label];
                        const state = researchState[item.id] || { versionIndex: 0, isCopied: false };
                        const prompts = content?.prompts || [item.reviewPrompt];
                        const currentPrompt = prompts[state.versionIndex % prompts.length];
                        return (
                          <div key={item.id} className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="px-3 py-2 bg-orange-50/40 border-b border-orange-100/60">
                              <p className="text-[11px] font-black text-orange-700">{item.label}</p>
                            </div>
                            <div className="px-3 pt-2.5 pb-3 space-y-2.5">
                              {content && (
                                <>
                                  <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">어떤 리서치가 필요한가</p>
                                    <p className="text-[10.5px] text-gray-600 font-medium leading-relaxed">{content.description}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">구체적 리서치 사항</p>
                                    <ul className="space-y-0.5">
                                      {content.points.map((pt, i) => (
                                        <li key={i} className="text-[10.5px] text-gray-600 font-medium leading-relaxed flex gap-1.5">
                                          <span className="text-orange-400 shrink-0">·</span>
                                          <span>{pt}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </>
                              )}
                              <div className="relative">
                                <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-lg p-3">
                                  <p className="text-[10.5px] text-gray-500 font-medium leading-relaxed whitespace-pre-wrap">{currentPrompt}</p>
                                </div>
                                <div className="flex items-center justify-end gap-1.5 mt-1.5">
                                  <button
                                    type="button"
                                    title="다른 프롬프트 보기"
                                    aria-label="다른 프롬프트 보기"
                                    onClick={() => setResearchState(prev => ({
                                      ...prev,
                                      [item.id]: { versionIndex: ((prev[item.id]?.versionIndex ?? 0) + 1) % prompts.length, isCopied: false },
                                    }))}
                                    className="w-6 h-6 flex items-center justify-center text-[12px] text-gray-400 hover:text-orange-500 rounded-md hover:bg-orange-50 transition-all hover:rotate-180 duration-300"
                                  >↺</button>
                                  <span className="text-[9px] text-gray-300 font-medium">{state.versionIndex + 1}/{prompts.length}</span>
                                  <button
                                    type="button"
                                    disabled={state.isCopied}
                                    onClick={() => { navigator.clipboard.writeText(currentPrompt); setResearchState(prev => ({ ...prev, [item.id]: { ...state, isCopied: true } })); }}
                                    className={`text-[9px] font-black px-2 py-1 rounded-lg border transition-all whitespace-nowrap ${state.isCopied ? 'text-green-600 bg-green-50 border-green-200 cursor-default' : 'text-orange-500 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-300 active:scale-95'}`}
                                  >{state.isCopied ? '복사됨 ✓' : '프롬프트 복사 📋'}</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              {/* ② 구성 기준 — AI 동적 생성 */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-3xs">
                <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-700 flex items-center gap-1.5">
                    📋 구성 기준 — {activeTab}
                    {criteriaLoading && <span className="h-2.5 w-2.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin inline-block" />}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold">배지 클릭으로 상태 변경</span>
                </div>
                <div className="p-3 space-y-2">
                  {criteriaLoading ? (
                    // 스켈레톤 UI
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className={`h-3 bg-gray-200/70 rounded-full animate-pulse ${i === 1 ? 'w-3/4' : 'w-4/5'}`} />
                        <div className="h-5 w-14 bg-gray-200/70 rounded animate-pulse shrink-0" />
                      </div>
                    ))
                  ) : aiCriteria.map((item) => {
                    // API status 값(충족|검토필요)을 직접 사용, 수동 토글 우선 적용
                    const validStatuses = ['충족', '검토필요'] as const;
                    type StatusKey = typeof validStatuses[number];
                    const rawStatus: StatusKey = validStatuses.includes(checklistStatus[item.id] as StatusKey)
                      ? (checklistStatus[item.id] as StatusKey)
                      : validStatuses.includes(item.status as StatusKey)
                      ? (item.status as StatusKey)
                      : '검토필요';
                    const badgeStyle = rawStatus === '충족'
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-yellow-100 text-yellow-700 border border-yellow-300';
                    const badgeLabel = rawStatus === '충족' ? '✅ 충족' : '🟡 검토필요';
                    const isOpen = activeTooltip === item.id;
                    return (
                      <div key={item.id} className="flex items-start justify-between gap-2">
                        <span className="text-[11px] text-gray-700 font-semibold flex-1 leading-tight pt-0.5">{item.label}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); if (rawStatus === '충족') return; setChecklistStatus(prev => ({ ...prev, [item.id]: '충족' })); }}
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded transition-all duration-200 whitespace-nowrap ${badgeStyle} ${rawStatus === '충족' ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
                          >{badgeLabel}</button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveTooltip(isOpen ? null : item.id); }}
                            className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center transition-all ${isOpen ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-purple-100 text-gray-500 hover:text-purple-600'}`}
                          >?</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* 툴팁 — ? 클릭 시 인라인 펼침 */}
                {activeTooltip && (() => {
                  const item = aiCriteria.find(i => i.id === activeTooltip);
                  if (!item) return null;
                  return (
                    <div className="mx-3 mb-3 bg-purple-50 border border-purple-200 rounded-xl overflow-hidden text-[10.5px] leading-relaxed" onClick={(e) => e.stopPropagation()}>
                      {/* 헤더 */}
                      <div className="flex items-center justify-between px-3 py-2 bg-purple-100/60 border-b border-purple-200">
                        <span className="text-[10px] font-black text-purple-700">{item.label}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); }} className="text-purple-400 hover:text-purple-700 text-xs leading-none shrink-0">✕</button>
                      </div>
                      {/* 판단 근거 */}
                      <div className="px-3 pt-2.5 pb-1.5">
                        <p className="text-[9px] font-black text-amber-600 tracking-wider mb-1">📌 판단 근거</p>
                        <p className="text-gray-700 font-medium">{item.reason}</p>
                      </div>
                      <div className="mx-3 border-t border-purple-200/60" />
                      {/* 타사 사례 */}
                      <div className="px-3 pt-2 pb-3">
                        <p className="text-[9px] font-black text-indigo-500 tracking-wider mb-1">🏢 타사 사례</p>
                        <p className="text-gray-600 font-medium">{item.example}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>



              {/* ④ AI 에이전트 대화창 */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-3xs overflow-hidden flex flex-col sticky bottom-0 z-10">
                <div className="px-3.5 py-2.5 border-b border-gray-100">
                  <span className="text-[10px] font-black text-gray-700">🤖 AI 에이전트</span>
                  <p className="text-[9px] text-gray-400 font-medium mt-0.5">현재 문서 기반으로 질문하세요</p>
                </div>
                <div className="max-h-36 overflow-y-auto px-3 pt-2 pb-1 space-y-2">
                  {ctxChatHistory.length === 0 && (
                    <p className="text-[10px] text-gray-400 font-medium text-center py-2">구성 기준이나 시장 데이터에 대해 질문하세요.</p>
                  )}
                  {ctxChatHistory.map((msg, i) => (
                    <div key={i} className={`text-[10.5px] leading-relaxed font-semibold px-2 py-1.5 rounded-lg ${msg.role === 'user' ? 'bg-purple-50 text-purple-800 text-right' : 'bg-gray-50 text-gray-700'}`}>
                      {msg.text}
                    </div>
                  ))}
                  {ctxChatLoading && (
                    <div className="text-[10px] text-gray-400 px-2 flex items-center gap-1">
                      <span className="h-2 w-2 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> 답변 생성 중...
                    </div>
                  )}
                  <div ref={ctxChatEndRef} />
                </div>
                <form onSubmit={handleContextChat} className="p-2 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={ctxChatInput}
                    onChange={(e) => setCtxChatInput(e.target.value)}
                    placeholder="현재 문서에 대해 질문하기"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] text-gray-800 placeholder-gray-400 outline-none focus:ring-1 focus:ring-purple-400 focus:bg-white transition-all"
                  />
                  <button type="submit" disabled={ctxChatLoading}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all shrink-0">
                    <Send size={11} />
                  </button>
                </form>
              </div>

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

        {/* 공유 모달 */}
        {shareModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px]"
            onClick={() => setShareModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl border border-gray-200 w-[420px] max-w-[90vw] p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-gray-900">기획안 공유하기</h2>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X size={15} />
                </button>
              </div>
              <p className="text-xs text-gray-500 font-medium">아래 링크를 개발자 또는 팀원에게 공유하세요</p>
              {/* URL 입력창 */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="flex-1 bg-transparent text-xs text-gray-700 font-medium outline-none truncate"
                />
              </div>
              {/* 링크 복사 버튼 */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShareLinkCopied(true);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                  shareLinkCopied
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-[0.98]'
                }`}
              >
                {shareLinkCopied ? '복사됨 ✓' : '링크 복사'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Prompt Modal */}
      {promptModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-80 overflow-hidden transform transition-all">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900">{promptModal.title}</h3>
            </div>
            <div className="p-5">
              <input
                type="text"
                autoFocus
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    promptModal.onSubmit((e.target as HTMLInputElement).value);
                    setPromptModal({ isOpen: false, title: '', onSubmit: () => {} });
                  }
                }}
              />
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button
                onClick={() => setPromptModal({ isOpen: false, title: '', onSubmit: () => {} })}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-all"
              >
                취소
              </button>
              <button
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.previousElementSibling?.querySelector('input');
                  if (input) {
                    promptModal.onSubmit(input.value);
                    setPromptModal({ isOpen: false, title: '', onSubmit: () => {} });
                  }
                }}
                className="px-4 py-2 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Alert Notifications Stack with High Visual Fidelity */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2.5 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`p-4 rounded-xl shadow-xl border text-xs font-black flex items-center justify-between space-x-4 pointer-events-auto transition-all duration-350 bg-white/95 backdrop-blur-md ${
              toast.type === 'success' ? 'text-emerald-950 border-emerald-200 bg-emerald-50/95 shadow-emerald-500/5' :
              toast.type === 'warning' ? 'text-amber-950 border-amber-200 bg-amber-50/95 shadow-amber-500/5' :
              'text-indigo-950 border-indigo-200 bg-indigo-50/95 shadow-indigo-505/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm shrink-0">
                {toast.type === 'success' ? '🎉' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <span className="leading-tight">{toast.message}</span>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-[11px] text-gray-400 hover:text-gray-900 font-bold focus:outline-none transition-colors shrink-0"
              title="닫기"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
