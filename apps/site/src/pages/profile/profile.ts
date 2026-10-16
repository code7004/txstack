/**
 * **Profile 화면이 그리는 공개용 내용.** 화면(`pages/Profile.tsx`)은 이 값을 배치만 한다.
 *
 * 문구의 출처와 확인 내역은 `docs/011_profile_content.md` 가 갖는다. 여기를 고치면 그 문서도 맞춘다.
 * 원본 개인 문서의 경로나 비공개 내용(전화번호 · 주소 · 회사명 · 직함)은 넣지 않는다.
 */

const REPO = "https://github.com/code7004/txstack";

export interface ProfileLink {
  label: string;
  /** `/` 로 시작하면 사이트 안, 아니면 바깥 주소 */
  href: string;
}

export const PROFILE = {
  name: "김재훈",
  role: "제품의 기획부터 설계·개발·운영까지 전 과정을 수행하는 개발자",
  intro: [
    "안녕하세요, 김재훈입니다. 제품의 목적과 사용자 요구를 파악해 기능을 기획하고, 시스템 설계부터 구현·배포·운영까지 직접 수행합니다. 화면과 API, 데이터가 어떻게 동작하고 운영되어야 하는지 전체 흐름을 고려해 제품을 만듭니다.",
    "게임과 의료·재활 소프트웨어부터 관리자 시스템, 데이터 분석 플랫폼, 통합 운영 서비스까지 다양한 제품을 개발해 왔습니다. 새로운 분야에서도 해결해야 할 문제를 분석하고, 실제로 사용할 수 있는 제품으로 완성하는 데 강점이 있습니다.",
    "기능 구현과 함께 운영 중 발생할 오류와 복구, 유지보수도 고려합니다. 반복되는 기능은 공통 구조로 정리하고, 서비스마다 다른 정책은 분리해 다음 개발에도 활용할 수 있도록 설계합니다.",
    "현재는 여러 프로젝트에서 사용하던 공통 UI와 훅을, 라우트 메타데이터·HTTP 설정과 함께 독립적으로 설치해 사용할 수 있는 라이브러리 txstack으로 발전시키고 있습니다."
  ],
  /** 협업 문의 창구. Profile 머리와 Contact 가 같이 쓴다 */
  email: "code7004@gmail.com",
  links: [{ label: "GitHub", href: REPO }] satisfies ProfileLink[]
};

/** 핵심 역량. 카드마다 그것을 확인할 수 있는 자리를 붙인다 */
export const STRENGTHS: { title: string; desc: string; story: string; links: ProfileLink[] }[] = [
  {
    title: "업무 화면 구조화",
    desc: "폼·필터·목록·메뉴를 공통 컴포넌트와 상태 구조로 정리해, 새 관리 화면을 같은 방식으로 만들 수 있게 합니다.",
    story: "여러 필터 조합을 주소에 담아, 새로고침하거나 공유해도 같은 화면이 나오도록 했습니다.",
    links: [
      { label: "Components", href: "/docs/components" },
      { label: "URL State", href: "/docs/guide/url-state" },
      { label: "Example", href: "/example" }
    ]
  },
  {
    title: "시스템 흐름 이해",
    desc: "화면 요구사항을 API 응답 구조·데이터 모델·배포·운영까지 이어서 설계합니다.",
    story: "원천 DB와 분석 저장소를 나누고, 중복·누락 없이 다시 실행할 수 있는 수집 구조를 함께 설계했습니다.",
    links: [{ label: "Projects", href: "#projects" }]
  },
  {
    title: "검증 가능한 개발",
    desc: "요구사항과 예외 상황, 변경 이력과 검증 결과를 함께 남깁니다.",
    story: "FDA 승인을 받은 의료기기 소프트웨어의 클라이언트를 개발하며 설계·검증 절차에 대응했습니다.",
    links: [{ label: "Case Study", href: "/about/case-study" }]
  }
];

export interface Project {
  name: string;
  problem: string;
  work: string[];
  role: string;
  tech: string[];
  /** 기간 · 규모처럼 짧은 사실 */
  facts?: string[];
  /** 실제로 열리는 곳만. 상세가 없으면 비운다 */
  links?: ProfileLink[];
}

export const PROJECTS: Project[] = [
  {
    name: "txstack",
    problem: "여러 서비스가 같은 UI 컴포넌트와 HTTP 설정을 각자 소스 폴더에 복사해 쓰고 있어, 고칠 때마다 서비스마다 다시 고쳐야 했습니다.",
    work: [
      "공통 부분을 어느 서비스의 도메인도 모르는 네 개의 패키지(UI·라우트 메타데이터·훅·HTTP 클라이언트)로 나눴습니다.",
      "서비스마다 다른 인증·응답 처리 정책은 옵션으로 주입받습니다.",
      "UI와 훅은 아래 두 플랫폼을 포함한 여러 서비스의 관리 화면에서 쓰였습니다."
    ],
    role: "설계 · 구현 · 문서",
    tech: ["React", "TypeScript", "CSS 변수 토큰", "pnpm 모노레포", "Vitest"],
    links: [
      { label: "GitHub", href: REPO },
      { label: "Case Study", href: "/about/case-study" },
      { label: "Example", href: "/example" }
    ]
  },
  {
    name: "대용량 운영 데이터 분석 플랫폼",
    problem: "여러 운영사의 사용자·결제 로그가 월 1억 건 이상 쌓이는데 데이터가 흩어져 있고, 운영팀이 통계를 보려면 개발자에게 요청해야 했습니다.",
    work: [
      "원천 DB에서 분석 저장소로 데이터를 증분 수집하는 구조와 집계 API, 운영자가 직접 쓰는 분석 대시보드를 만들었습니다.",
      "커서 기반으로 수집해 중복 적재를 막고, 중단되어도 이어서 다시 실행할 수 있게 했습니다.",
      "필터·테이블·URL 쿼리 상태 등 분석 화면은 txstack의 UI와 훅으로 구성했습니다."
    ],
    role: "풀스택 — 아키텍처 설계 · 백엔드 · 프론트엔드 · 운영 자동화",
    tech: ["React", "txstack", "Node.js", "MySQL", "Elasticsearch", "AWS"],
    facts: ["2025.03 ~ 2025.10", "월 1억 건 이상 운영"]
  },
  {
    name: "Terabase — 통합 운영 플랫폼",
    problem: "외부 BaaS로는 인증·데이터 구조를 세밀하게 바꾸거나 내부 보안 정책을 적용하기 어려웠습니다.",
    work: [
      "인증·데이터(Terastore)·파일 저장(Terabucket)·배포(Terasite)·다국어(Teralocalize) 관리를 자체 인프라 위의 모듈로 나누고, 운영자 화면 한곳에서 관리하게 했습니다.",
      "빌드 결과물을 올리고 버전을 지정하면 서비스에 반영되는 배포 흐름을 만들었습니다.",
      "운영자 화면은 txstack의 UI와 훅으로 구성했습니다."
    ],
    role: "시스템 아키텍처 설계 · 풀스택 개발 · 운영 자동화",
    tech: ["React", "txstack", "Node.js", "PostgreSQL", "Elasticsearch", "Socket.io", "AWS S3"],
    facts: ["2023.05 ~ 2025.03"]
  }
];

/** 품질 기준의 배경. 카드 대신 짧은 문단으로 둔다 */
export const QUALITY_BACKGROUND = [
  "FDA 승인을 받은 의료·재활 소프트웨어 UINCare(가정용 Home, 병원·센터용 HomePlus)와 RehabMaster에서 센서로 환자의 동작을 판정하는 Unity3D 메인 클라이언트를 개발했습니다.",
  "같은 동작에는 반복해도 같은 판정이 나와야 했고, 센서 오류가 환자 안전에 영향을 주지 않도록 방어적으로 설계해야 했습니다. 요구사항·설계·구현·검증을 문서로 잇는 V-Model 방식으로 일하며 클라이언트의 설계·검증 문서에 대응했고, 이 경험이 지금도 상태 표현과 예외 흐름, 변경 이력을 먼저 보는 기준이 되었습니다."
];

/** 경험이 txstack으로 이어진 과정 */
export const WHY = [
  "여러 관리 화면을 개발하면서 같은 폼과 목록, 라우트와 메뉴 설정을 반복해서 만들었습니다. 서비스마다 복사해 둔 코드는 조금씩 달라졌고, 한 곳을 고치면 다른 곳도 찾아 고쳐야 했습니다.",
  "데이터 분석 플랫폼과 Terabase의 관리 화면은 txstack의 UI와 훅으로 만들었습니다. 그때는 각 서비스의 소스 폴더에 포함해 썼고, 지금은 이를 독립 패키지로 나누고 라우트 메타데이터·HTTP 클라이언트를 더해 설치만으로 쓸 수 있게 정리하고 있습니다.",
  "기준은 하나입니다. 다음 프로젝트가 설치만으로 그대로 쓸 수 있는가. 토큰을 어디서 읽고 401에 무엇을 할지는 앱이 정하고, 라이브러리는 그 정책을 받아 실행합니다."
];

/** 반복되던 문제와, 그 결과를 사이트에서 확인할 자리 */
export const WHY_RESULTS: { problem: string; result: string; link: ProfileLink }[] = [
  { problem: "라우트와 메뉴 정의를 따로 관리", result: "트리 하나에서 라우터·메뉴·현재 위치를 만듭니다", link: { label: "Routing & Menu", href: "/docs/guide/routing" } },
  { problem: "입력·목록·피드백 UI를 반복 작성", result: "공통 컴포넌트로 업무 화면을 조립합니다", link: { label: "Example", href: "/example" } },
  { problem: "서비스마다 다른 인증·응답 처리", result: "정책을 주입받는 HTTP 클라이언트로 모읍니다", link: { label: "HTTP Client", href: "/docs/guide/http-client" } },
  { problem: "저장소 안에서만 동작하는 공통 코드", result: "배포 파일을 별도 앱에 설치해 검증합니다", link: { label: "Case Study", href: "/about/case-study" } }
];

/** 경력 흐름. 회사명 · 직함은 싣지 않는다 */
export const CAREER: { period: string; area: string; desc: string }[] = [
  { period: "2019 ~ 현재", area: "웹·데이터 플랫폼", desc: "관리자 시스템, 데이터 분석 대시보드, 운영 플랫폼, 실시간 서비스, 모바일 앱의 프론트엔드·백엔드" },
  { period: "2018 ~ 2019", area: "BIM · Web/3D", desc: "대용량 3D 건축 모델을 웹에서 탐색하는 뷰어 UI, 객체 선택·속성 조회" },
  { period: "2015 ~ 2018", area: "의료·재활 소프트웨어", desc: "센서 기반 동작 판정 클라이언트, 상태 기반 화면 전환, V-Model 개발" },
  { period: "2004 ~ 2015", area: "게임·클라이언트", desc: "모바일·온라인 게임 클라이언트, 라이브 서비스 운영과 개선" }
];

export const WAYS_OF_WORKING = [
  "사용자가 보는 화면과 데이터가 처리되는 흐름을 함께 살펴봅니다.",
  "반복되는 문제는 공통 구조로 정리하고, 서비스별 정책은 분리합니다.",
  "정상 동작뿐 아니라 실패·재시도·복구와 운영 이력을 고려합니다.",
  "설계 이유와 검증 결과를 남겨 다음 변경을 판단할 근거를 만듭니다."
];

/** 기술은 맥락별로 묶는다. 숙련도 점수는 매기지 않는다 */
export const SKILLS: { group: string; items: string[] }[] = [
  { group: "현재 주요 영역", items: ["React", "TypeScript", "공통 UI 구조", "라우팅", "URL 상태", "React Query", "Redux", "Vite", "Webpack", "Tailwind", "Sass"] },
  { group: "서버·데이터·운영", items: ["Node.js", "NestJS", "Koa", "PostgreSQL", "MySQL", "Elasticsearch", "Socket.io", "AWS"] },
  { group: "확장 경험", items: ["Vue.js", "React Native", "WebAssembly/WebGL", "Unity/C#", "V-Model", "IEC 62304"] }
];
