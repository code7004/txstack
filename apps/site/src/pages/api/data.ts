import type { Row } from "../../components/Reference";
import { slug } from "../../lib/slug";
import { STORYBOOK_URL } from "../../lib/links";

/**
 * **API 표의 내용.** 페이지가 이것으로 표를 그리고, 사이트 검색이 같은 것을 색인한다 —
 * 문서를 고치면 검색도 함께 고쳐진다. `searchable` 은 첫 칸이 이름(옵션 · 필드 · 메서드)인 표다.
 * 입력별 결과처럼 첫 칸이 문장인 표는 검색에 올리지 않는다.
 */
export interface ApiTable {
  /** 이 표가 놓인 섹션 제목 — 검색 결과가 그 앵커로 간다 */
  section: string;
  /** 표 위의 작은 제목(RefLabel). 없으면 섹션 제목만 쓴다 */
  label?: string;
  searchable: boolean;
  rows: Row[];
}

export interface ApiPage {
  path: string;
  label: string;
}

export const API_PAGES: Record<"ui" | "axios" | "hooks" | "routeMeta", ApiPage> = {
  ui: { path: "/api/ui", label: "ui" },
  axios: { path: "/api/axios", label: "axios" },
  hooks: { path: "/api/hooks", label: "hooks" },
  routeMeta: { path: "/api/route-meta", label: "route-meta" }
};

export const TABLES = {
  ui: {
    installEntry: {
      section: "Install",
      searchable: true,
      rows: [
        ["@txstack/ui", "Tx* 컴포넌트 (아래 목록)", "react · react-dom >=18", "기본 진입점. 런타임 의존성은 clsx 하나뿐입니다"],
        ["@txstack/ui/styles.css", "스타일시트", "—", "앱 진입점에서 한 번만 불러옵니다. 없으면 컴포넌트에 스타일이 적용되지 않습니다"],
        ["@txstack/ui/aggrid", "TxAgGrid · TxAgGridProvider", "ag-grid-community · ag-grid-react ^35", "표를 쓸 때만 peer를 함께 설치합니다"],
        ["@txstack/ui/daypicker", "TxDayPicker · TxDayPickerRange · TxFormDayPicker · TxFormDayPickerRange", "react-day-picker ^10", "날짜 선택을 쓸 때만 peer를 함께 설치합니다"]
      ] as Row[]
    }
  },
  axios: {
    installEntry: {
      section: "Install",
      searchable: true,
      rows: [
        ["@txstack/axios", "createHttpClient · parseApiError · removeUndefined · isTokenExpired · attachInterceptors", "axios >=1.6", "기본 진입점"],
        ["@txstack/axios/singleton", "initHttpClient · getHttpClient · resetHttpClient", "axios >=1.6", "전역 클라이언트가 필요한 기존 코드를 옮길 때만 씁니다"]
      ] as Row[]
    },
    httpClientOptions: {
      section: "createHttpClient",
      label: "HttpClientOptions",
      searchable: true,
      rows: [
        ["baseURL", "string", "필수", '요청 주소의 앞부분. 예: "/api", "https://api.example.com"'],
        ["timeout", "number", "0 (제한 없음)", "응답을 기다리는 최대 시간(ms). 넘으면 요청이 실패합니다"],
        ["headers", "Record<string, string>", "—", "모든 요청에 붙일 헤더. Content-Type은 넣지 마세요(아래 참고)"],
        ["withCredentials", "boolean", "false", "다른 도메인 요청에 쿠키를 함께 보낼지. 쿠키 인증을 쓸 때만 켭니다"],
        ["getToken", "() => string | null | undefined | Promise<…>", "—", "요청마다 불려 인증 헤더를 만듭니다. 값이 없으면 헤더를 붙이지 않습니다"],
        ["authHeader", "string", '"Authorization"', "인증 헤더 이름"],
        ["authScheme", "string", '"Bearer"', "토큰 앞에 붙는 말. 빈 문자열이면 토큰만 넣습니다"],
        ["onUnauthorized", "(error: AxiosError) => void", "—", "401 응답을 받으면 불립니다. 로그아웃 같은 처리를 여기서 합니다"],
        ["onError", "(error: AxiosError) => void", "—", "모든 오류 응답에서 불립니다(401 포함, onUnauthorized 다음)"],
        ["unwrap", "(data: unknown) => unknown", "res.data 그대로", "응답에서 실제 데이터를 꺼냅니다. 응답이 { body: T } 형식이면 data => data.body"],
        ["onRequest", "(log: RequestLog) => void", "—", "요청이 나가기 직전에 불립니다. 로그를 모니터링 도구로 보낼 때 씁니다"],
        ["onResponse", "(log: ResponseLog) => void", "—", "응답을 받으면 불립니다. durationMs로 느린 요청을 찾을 수 있습니다"],
        ["maskFields", "string[]", "password, privateKey, token, accessToken, refreshToken", "로그에서 값을 가릴 필드 이름. onRequest · onResponse에 넘기기 전에 가립니다"],
        ["debug", "boolean", "false", "켜면 요청 · 응답 · 오류를 콘솔에 출력합니다. onRequest · onResponse를 직접 넘기면 그쪽이 우선합니다"]
      ] as Row[]
    },
    httpClientMembers: {
      section: "HttpClient",
      searchable: true,
      rows: [
        ["get", "get<T>(url, params?, config?)", "Promise<T>", "두 번째 인자가 쿼리 문자열이 됩니다"],
        ["post", "post<T>(url, body?, config?)", "Promise<T>", "객체는 JSON으로, FormData는 multipart로 보냅니다"],
        ["put", "put<T>(url, body?, config?)", "Promise<T>", ""],
        ["patch", "patch<T>(url, body?, config?)", "Promise<T>", ""],
        ["delete", "delete<T>(url, options?: DeleteOptions, config?)", "Promise<T>", "쿼리(params)와 본문(body)을 함께 보낼 수 있습니다"],
        ["getBlob", "getBlob(url, config?)", "Promise<Blob>", "unwrap을 거치지 않은 원본. 파일 내려받기에 씁니다. 브라우저와 Node 모두 Blob을 돌려줍니다"],
        ["getText", "getText(url, config?)", "Promise<string>", "unwrap을 거치지 않은 원본 텍스트. CSV 등에 씁니다"],
        ["setBaseURL", "setBaseURL(baseURL)", "void", "앱이 시작된 뒤에 서버 주소가 정해질 때 바꿉니다"],
        ["setConfig", "setConfig(config: Partial<AxiosRequestConfig>)", "void", "내부 axios 인스턴스의 기본 설정에 덮어씁니다"],
        ["instance", "AxiosInstance", "—", "내부 axios 인스턴스. 이 클라이언트로 처리할 수 없는 요청에 직접 씁니다"]
      ] as Row[]
    },
    parseApiErrorCases: {
      section: "parseApiError",
      searchable: false,
      rows: [
        ["응답 본문이 있는 axios 오류", "본문의 statusCode → HTTP 상태 → 500", '본문의 message, 없으면 "Request failed"', "error · path · timestamp도 본문에서 옮깁니다"],
        ["본문이 없는 axios 오류", "HTTP 상태, 없으면 500", "axios 오류 메시지", "시간 초과 · 네트워크 오류가 여기에 해당합니다"],
        ["일반 Error", "500", "error.message", ""],
        ["그 밖의 값", "500", '"Unknown error"', ""]
      ] as Row[]
    },
    iapierror: {
      section: "parseApiError",
      label: "IApiError",
      searchable: true,
      rows: [
        ["statusCode", "number", "—", "HTTP 상태 코드 또는 서버가 보낸 코드"],
        ["message", "string", "—", "사용자에게 보여 줄 메시지"],
        ["error", "string?", "—", "서버가 보낸 오류 이름"],
        ["path", "string?", "—", "오류가 난 요청 경로"],
        ["timestamp", "string?", "—", "서버가 기록한 시각"]
      ] as Row[]
    },
    requestlog: {
      section: "Types",
      label: "RequestLog",
      searchable: true,
      rows: [
        ["method", "string", "—", "대문자 HTTP 메서드"],
        ["url", "string", "—", "요청 경로"],
        ["params", "unknown", "—", "쿼리. maskFields가 가려진 값입니다"],
        ["data", "unknown", "—", "본문. maskFields가 가려진 값입니다"]
      ] as Row[]
    },
    responselog: {
      section: "Types",
      label: "ResponseLog",
      searchable: true,
      rows: [
        ["status", "number", "—", "HTTP 상태 코드"],
        ["method", "string", "—", "대문자 HTTP 메서드"],
        ["url", "string", "—", "요청 경로"],
        ["data", "unknown", "—", "응답 본문. maskFields가 가려진 값입니다"],
        ["durationMs", "number", "—", "요청부터 응답까지 걸린 시간"]
      ] as Row[]
    },
    deleteoptions: {
      section: "Types",
      label: "DeleteOptions",
      searchable: true,
      rows: [
        ["params", "unknown", "—", "쿼리 문자열"],
        ["body", "unknown", "—", "요청 본문"]
      ] as Row[]
    }
  },
  hooks: {
    installEntry: {
      section: "Install",
      searchable: true,
      rows: [
        ["@txstack/hooks/useObjectState", "useObjectState", "react >=18", "객체 상태를 부분 업데이트로 다룹니다"],
        ["@txstack/hooks/useUrlQuery", "useUrlQuery · UseUrlQueryOptions", "react >=18 · react-router-dom >=6", "URL 쿼리를 상태처럼 다룹니다. 이 진입점을 쓸 때만 react-router-dom이 필요합니다"]
      ] as Row[]
    },
    objectStateParams: {
      section: "useObjectState",
      label: "Parameters",
      searchable: true,
      rows: [
        ["initialValue", "T", "필수", "처음 값. postParse가 있으면 처음 값에도 적용됩니다"],
        ["postParse", "(next: T) => Partial<T>", "—", "합친 직후 불려 추가로 바꿀 값을 돌려줍니다. 값 정규화나 서로 연결된 필드 정리에 씁니다"]
      ] as Row[]
    },
    objectStateReturns: {
      section: "useObjectState",
      label: "Returns",
      searchable: true,
      rows: [
        ["[0] state", "T", "바뀔 때만 새 객체", "지금 상태"],
        ["[1] update", "(patch) => void", "항상 같은 함수", "부분 객체 또는 (prev) => 부분 객체를 받아 합칩니다. 결과가 이전과 얕은 비교로 같으면 다시 렌더링하지 않습니다"]
      ] as Row[]
    },
    useurlqueryoptions: {
      section: "useUrlQuery",
      label: "UseUrlQueryOptions",
      searchable: true,
      rows: [
        ["defaults", "T", "필수", "주소에 값이 없을 때 쓸 기본값. 결과의 키 목록과, 값을 읽을 때의 타입(숫자 · 불리언 · 문자열)이 이것으로 정해집니다"],
        ["urlKeys", "(keyof T)[]", "—", "기본값에는 없지만 주소에서 읽을 키"],
        ["queryTypes", 'Partial<Record<keyof T, "string" | "number" | "boolean">>', "—", "기본값만으로 타입을 정할 수 없을 때(기본값이 undefined 등) 읽는 방법을 직접 지정합니다"],
        ["postParse", "(query: Partial<T>) => Partial<T>", "—", "주소와 기본값을 합친 직후 불려 추가로 바꿀 값을 돌려줍니다"],
        ["replace", "boolean", "true", "true면 방문 기록을 쌓지 않고 지금 주소를 바꿉니다. 조건마다 뒤로 가기로 되돌리려면 false"],
        ["encode", "boolean", "false", "쿼리 전체를 base64url JSON 하나로 감춥니다(?_q=eyJ…)"],
        ["encodeKey", "string", '"_q"', "encode를 켰을 때 쓸 키 이름"]
      ] as Row[]
    },
    urlQueryReturns: {
      section: "useUrlQuery",
      label: "Returns",
      searchable: true,
      rows: [
        ["[0] query", "T", "주소가 바뀔 때만 새 객체", "지금 조건. useEffect 의존성에 그대로 넣어도 됩니다"],
        ["[1] setQuery", "(patch) => void", "항상 같은 함수", "부분 객체 또는 (prev) => 부분 객체를 받아 지금 조건과 합친 뒤 주소에 씁니다"]
      ] as Row[]
    },
    urlRules: {
      section: "useUrlQuery",
      label: "URL read · write rules",
      searchable: false,
      rows: [
        ["setQuery 호출", "합친 결과의 모든 키", "—", "기본값과 같은 값도 적습니다. 결과가 이전과 같으면 주소를 바꾸지 않습니다"],
        ["null · undefined", "적지 않음", "기본값", ""],
        ['빈 문자열 ""', "?q=", '""', "빈 값도 키는 남습니다"],
        ["숫자 · 불리언", "?page=2 · ?on=true", "기본값의 타입대로", '기본값이 문자열이면 "2"로 읽습니다'],
        ["배열", "?ids[]=1&ids[]=2", "배열", "같은 키를 두 번 적어도(?ids=1&ids=2) 배열로 읽습니다. 쉼표로는 나누지 않습니다"],
        ["기본값에 없는 키", "—", "결과에 없음", "urlKeys로 지정하면 읽습니다"]
      ] as Row[]
    }
  },
  routeMeta: {
    installEntry: { section: "Install", searchable: true, rows: [["@txstack/route-meta", "buildRouteObjects · getNavigableRoutes · useCurrentRouteNode · RouteRenderer · 타입", "react >=18 · react-router-dom >=6", "진입점은 하나입니다"]] as Row[] },
    pathroutenode: {
      section: "RouteTree",
      label: "PathRouteNode",
      searchable: true,
      rows: [
        ["path", "string", "필수", '절대 경로로 씁니다. 예: "/members/:id"'],
        ["element", "ReactNode", "—", "보여 줄 화면"],
        ["children", "RouteTree", "—", "하위 화면"],
        ["meta", "RouteMeta", "—", "메뉴 · 현재 위치에 쓰이는 정보(아래 표)"],
        ["enabled", "boolean", "true", "false면 라우터에도 메뉴에도 등록하지 않습니다"],
        ["loader · action · errorElement", "React Router 타입", "—", "React Router에 그대로 전달합니다"]
      ] as Row[]
    },
    indexroutenode: {
      section: "RouteTree",
      label: "IndexRouteNode",
      searchable: true,
      rows: [
        ["index", "true", "필수", "부모 주소로 들어왔을 때 보일 화면입니다"],
        ["path · children", "never", "—", "가질 수 없습니다. React Router 규칙을 타입으로 막아 둡니다"],
        ["element · meta · enabled · loader · action · errorElement", "", "—", "PathRouteNode와 같습니다"]
      ] as Row[]
    },
    routemeta: {
      section: "RouteTree",
      label: "RouteMeta",
      searchable: true,
      rows: [
        ["label", "string", "—", "메뉴 · 경로 표시 · 탭 제목에 보일 이름"],
        ["icon", "ReactNode", "—", "메뉴 아이콘"],
        ["description", "string", "—", "설명. 메뉴 패널이나 인덱스 화면에 씁니다"],
        ["hidden", "boolean", "false", "메뉴에서만 뺍니다. 라우터에는 등록되어 주소로는 열립니다"],
        ["permissions", "string[]", "—", "접근 권한. 메뉴에 보일지는 getNavigableRoutes의 canAccess가 정합니다"]
      ] as Row[]
    },
    filterRules: {
      section: "getNavigableRoutes",
      label: "Router vs. menu filtering",
      searchable: false,
      rows: [
        ["enabled: false", "제외", "제외", ""],
        ["meta.hidden", "등록", "제외", "주소로는 열립니다"],
        ["meta.permissions", "등록", "canAccess로 판정", "판정에서 빠지면 하위 항목도 함께 빠집니다"],
        ["index: true", "등록", "제외", "주소가 없어 메뉴 항목이 될 수 없습니다"]
      ] as Row[]
    },
    navroute: {
      section: "getNavigableRoutes",
      label: "NavRoute",
      searchable: true,
      rows: [
        ["key", "string", "—", "트리에 쓴 키. React의 key로도 씁니다"],
        ["path", "string", "—", "이동할 주소"],
        ["meta", "RouteMeta?", "—", "트리에 쓴 meta 그대로"],
        ["children", "NavRoute[]?", "—", "남은 하위 항목. 모두 걸러졌으면 이 필드가 없습니다"]
      ] as Row[]
    },
    currentroute: {
      section: "useCurrentRouteNode",
      label: "CurrentRoute",
      searchable: true,
      rows: [
        ["node", "RouteNode | null", "—", "지금 주소의 노드. 맞는 것이 없으면 null"],
        ["meta", "RouteMeta?", "—", "node.meta 바로가기. 탭 제목에 씁니다"],
        ["matches", "RouteNode[]", "—", "맨 위부터 지금까지의 노드. 경로 표시에 씁니다"],
        ["params", "Params", "—", '주소 매개변수. 예: { id: "42" }'],
        ["pathname", "string", "—", "지금 주소의 경로"]
      ] as Row[]
    },
    typeList: {
      section: "Types",
      searchable: true,
      rows: [
        ["RouteTree", "Record<string, RouteNode>", "", "라우트 트리"],
        ["RouteNode", "PathRouteNode | IndexRouteNode", "", "트리의 노드 한 개"],
        ["PathRouteNode", "{ path, element?, children?, meta?, … }", "", "주소가 있는 노드"],
        ["IndexRouteNode", "{ index: true, element?, meta?, … }", "", "부모 주소의 첫 화면"],
        ["RouteMeta", "{ label?, icon?, description?, hidden?, permissions? }", "", "메뉴 · 현재 위치 정보"],
        ["NavRoute", "{ key, path, meta?, children? }", "", "getNavigableRoutes의 결과 한 칸"],
        ["CanAccess", "(permissions, node) => boolean", "", "권한 판정 함수"],
        ["CurrentRoute", "{ node, meta, matches, params, pathname }", "", "useCurrentRouteNode의 결과"],
        ["RouteHandle", "{ node: RouteNode }", "", "buildRouteObjects가 각 라우트의 handle에 싣는 값. matchRoutes 결과에서 원래 노드를 찾을 때 씁니다"]
      ] as Row[]
    }
  }
} satisfies Record<keyof typeof API_PAGES, Record<string, ApiTable>>;

/**
 * **컴포넌트 목록.** props 는 Storybook 이 갖고, 여기는 "무엇이 있는가" 와 그리로 가는 길만 둔다.
 * 분류는 Storybook 의 제목(`Form/TxButton`)과 같다 — 링크 주소가 거기서 나온다.
 *
 * `also` 는 같은 문서에서 함께 다루는 export 다. 빠짐 검사(`api.test.ts`)가 이 페이지에
 * `@txstack/ui` 의 export 가 전부 나오는지 본다.
 */
export interface CatalogItem {
  name: string;
  desc: string;
  also?: string[];
  sub?: "aggrid" | "daypicker";
  /** autodocs 페이지가 없는 것은 첫 이야기로 보낸다 */
  story?: string;
}

export const CATALOG: [category: string, items: CatalogItem[]][] = [
  [
    "Form",
    [
      { name: "TxButton", desc: "버튼. 비동기 작업 중에는 잠기고 스피너가 붙습니다" },
      { name: "TxInput", desc: "한 줄 입력. 문자열과 숫자를 함께 다룹니다" },
      { name: "TxSearchInput", desc: "검색용 입력. 입력할 때와 Enter를 눌렀을 때를 나눠 알려 줍니다" },
      { name: "TxTextarea", desc: "여러 줄 입력" },
      { name: "TxNumberInput", desc: "숫자 입력과 올리기 · 내리기 버튼" },
      { name: "TxDropdown", desc: "하나를 고르는 드롭다운" },
      { name: "TxDropdownMulti", desc: "여러 개를 고르는 드롭다운" },
      { name: "TxCombobox", desc: "입력하면서 후보를 고르는 입력창" },
      { name: "TxCheckBox", desc: "체크박스" },
      { name: "TxRadioGroup", desc: "여러 개 중 하나를 고르는 라디오 버튼", also: ["TxRadio"] },
      { name: "TxSwitch", desc: "바로 켜고 끄는 스위치" },
      { name: "TxSlider", desc: "끌어서 값을 고르는 슬라이더" },
      { name: "TxFileUpload", desc: "파일을 끌어 놓거나 골라서 올리고, 진행 상태를 보여 줍니다" },
      { name: "TxCapsLockCheck", desc: "비밀번호 입력 중 Caps Lock이 켜져 있으면 알려 줍니다" },
      { name: "TxForm", desc: "폼. 필드마다 라벨과 오류 메시지 자리를 그리고 서로 연결합니다", also: ["TxFormField"] },
      { name: "TxDayPicker", desc: "날짜 선택과 기간 선택. 폼용 필드도 있습니다", also: ["TxDayPickerRange", "TxFormDayPicker", "TxFormDayPickerRange"], sub: "daypicker" }
    ]
  ],
  [
    "Data",
    [
      { name: "TxAgGrid", desc: "ag-grid 기반 표. 목록 화면에서 자주 하는 일을 미리 넣었습니다", also: ["TxAgGridProvider"], sub: "aggrid" },
      { name: "TxPagination", desc: "페이지 번호. 표든 카드 목록이든 함께 씁니다" },
      { name: "TxAvatar", desc: "사람을 나타내는 프로필 이미지 · 이니셜", also: ["TxAvatarGroup"] },
      { name: "TxCarousel", desc: "옆으로 넘겨 보는 슬라이드" },
      { name: "TxJsonTree", desc: "객체를 접을 수 있는 트리로 보여 주고, 값을 고칠 수도 있습니다" }
    ]
  ],
  [
    "Layout",
    [
      { name: "TxAppShell", desc: "헤더 · 메뉴 · 본문 · 하단을 잡는 화면 틀. 좁은 화면에서는 메뉴가 서랍으로 들어갑니다" },
      { name: "TxNavBar", desc: "가로 메뉴. 항목별 패널이나 메뉴 전체를 펼치는 패널을 둘 수 있습니다" },
      { name: "TxSideNav", desc: "세로 메뉴. 아이콘만 남기고 접히고, 하위 메뉴는 트리로 펼쳐집니다" },
      { name: "TxBreadcrumb", desc: "현재 위치까지의 경로" },
      { name: "TxTabs", desc: "탭과 그 아래 내용" },
      { name: "TxCard", desc: "내용을 담는 카드. 테두리 · 모서리 · 그림자 · 여백을 한 곳에서 정합니다" },
      { name: "TxAccordion", desc: "여러 항목 중 하나씩만 펼쳐지는 목록" },
      { name: "TxCollapsible", desc: "눌러서 접고 펴는 영역" },
      { name: "TxFlex", desc: "가로로 늘어놓는 배치" },
      { name: "TxGrid", desc: "칸을 나누는 배치. 폼을 2단 · 3단으로 놓을 때 씁니다" },
      { name: "TxDivider", desc: "구분선" },
      { name: "TxScrollArea", desc: "넘치는 내용을 스크롤하는 영역. 양 끝이 흐려져 내용이 더 있음을 알립니다" }
    ]
  ],
  [
    "Overlay",
    [
      { name: "TxDialog", desc: "확인 · 알림 창. await로 사용자의 선택을 기다립니다" },
      { name: "TxModal", desc: "화면을 덮고 뜨는 창" },
      { name: "TxSlidePanel", desc: "화면 가장자리에서 나오는 패널. 상세 보기나 필터에 씁니다" },
      { name: "TxDropMenu", desc: "눌러서 펼치는 메뉴와 오른쪽 클릭 메뉴", also: ["TxContextMenu"] },
      { name: "TxTooltip", desc: "마우스를 올리면 뜨는 짧은 설명" }
    ]
  ],
  [
    "Feedback",
    [
      { name: "TxToast", desc: "떴다 사라지는 알림. 컴포넌트 밖에서도 호출할 수 있습니다", story: "variants" },
      { name: "TxAlert", desc: "페이지 안에 놓는 안내 상자" },
      { name: "TxEmptyState", desc: "보여 줄 내용이 없을 때의 안내" },
      { name: "TxLoading", desc: "문구가 붙은 로딩 표시. 화면 전체를 덮을 수도 있습니다" },
      { name: "TxSpinner", desc: "회전하는 로딩 아이콘" },
      { name: "TxProgress", desc: "진행률 막대" },
      { name: "TxSkeleton", desc: "내용이 올 자리를 미리 잡아 두는 회색 영역" },
      { name: "TxTag", desc: "상태 · 분류를 표시하는 작은 이름표" },
      { name: "TxBadge", desc: "알림 점 · 개수 표시" },
      { name: "TxTicker", desc: "흘러가는 공지 줄" }
    ]
  ],
  ["Action", [{ name: "TxCopyButton", desc: "눌러서 글자를 복사하는 버튼" }]]
];

/** Storybook 의 문서 주소. 제목 `Form/TxButton` 이 id `form-txbutton` 이 된다 */
export const storyUrl = (category: string, item: CatalogItem) => {
  const id = `${category}-${item.name}`.toLowerCase();
  return `${STORYBOOK_URL}?path=${item.story ? `/story/${id}--${item.story}` : `/docs/${id}--docs`}`;
};

/**
 * **표의 한 줄 · 목록의 한 컴포넌트마다 앵커가 있다.** 검색 결과가 섹션이 아니라 그 줄로 바로 가고,
 * 같은 섹션의 두 항목(`timeout` · `maskFields`)도 서로 다른 주소를 갖는다. 페이지와 검색 색인이
 * 같은 함수로 만든다 — 다르게 만들면 결과를 눌러도 그 줄을 못 찾는다.
 */
export const rowAnchor = (table: ApiTable, name: string) => `row-${slug(table.label ?? table.section)}-${slug(name)}`;

/** 검색에 오르는 표만 줄마다 앵커를 단다 */
export const tableAnchor = (table: ApiTable) => (table.searchable ? (name: string) => rowAnchor(table, name) : undefined);

export const componentAnchor = (name: string) => `component-${slug(name)}`;
