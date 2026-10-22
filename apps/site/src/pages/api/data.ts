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

export const API_PAGES: Record<"ui" | "axios" | "hooks" | "routeMeta" | "fns", ApiPage> = {
  ui: { path: "/api/ui", label: "ui" },
  axios: { path: "/api/axios", label: "axios" },
  hooks: { path: "/api/hooks", label: "hooks" },
  routeMeta: { path: "/api/route-meta", label: "route-meta" },
  fns: { path: "/api/fns", label: "fns" }
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
    },
    /** 전역 토큰. 값은 packages/ui/src/tokens.css 에서 옮겼다 — 둘째 칸이 기본값, 셋째 칸이 다크 모드 값 */
    tokens: {
      section: "Design tokens",
      searchable: true,
      rows: [
        ["--tx-color-primary", "#2563eb", "—", "채우는 색. 버튼 배경, 스위치, 체크박스"],
        ["--tx-color-primary-strong", "#1d4ed8", "#60a5fa", "배경 위에서 글자로 읽히는 강조색. 현재 메뉴, 탭, 포커스 링"],
        ["--tx-color-on-accent", "#ffffff", "—", "강조색 배경 위의 글자색"],
        ["--tx-color-danger", "#ef4444", "#dc2626", "되돌릴 수 없는 동작(삭제 등)"],
        ["--tx-color-warning", "#a16207", "#facc15", "막지는 않지만 주의를 줘야 하는 상황"],
        ["--tx-color-success", "#15803d", "#4ade80", "성공을 알리는 상황"],
        ["--tx-color-surface", "#ffffff", "#1f2937", "카드, 입력창처럼 배경 위에 올라온 면"],
        ["--tx-color-muted", "#e5e7eb", "#374151", "보조 버튼처럼 배경에 가라앉은 면"],
        ["--tx-color-border", "#d1d5db", "#4b5563", "테두리"],
        ["--tx-color-text", "#111827", "#f3f4f6", "글자색"],
        ["--tx-color-backdrop", "rgb(0 0 0 / 40%)", "—", "모달 · 서랍 뒤를 덮는 막"],
        ["--tx-color-state", "#111827", "#f3f4f6", "hover · pressed 상태에서 섞는 색"],
        ["--tx-state-hover", "16%", "—", "hover 때 섞는 비율"],
        ["--tx-state-pressed", "28%", "—", "누를 때 섞는 비율"],
        ["--tx-radius", "0.375rem", "—", "모서리 둥글기"],
        ["--tx-focus-ring", "2px solid var(--tx-color-primary-strong)", "—", "키보드 포커스 표시"],
        ["--tx-focus-ring-offset", "2px", "—", "포커스 표시와 요소 사이 간격"]
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
        [
          "maskFields",
          "string[]",
          "password, privateKey, token, accessToken, refreshToken",
          "로그에서 값을 가릴 키 이름(대소문자 구분). onRequest · onResponse와 debug 콘솔 로그에 넘기기 전에, 중첩된 객체 · 배열 · JSON 문자열과 URL 쿼리까지 가립니다. 원본 요청 · 응답과 onError가 받는 오류는 바꾸지 않습니다"
        ],
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
        ["url", "string", "—", "요청 경로. 쿼리의 maskFields 값은 가려진 채입니다"],
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
        ["url", "string", "—", "요청 경로. 쿼리의 maskFields 값은 가려진 채입니다"],
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
    installEntry: {
      section: "Install",
      searchable: true,
      rows: [["@txstack/route-meta", "buildRouteObjects · getNavRoutes · useCurrentRoute · useBreadcrumbs · RouteTreeRenderer · 타입", "react >=18 · react-router-dom >=6", "진입점은 하나입니다"]] as Row[]
    },
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
        ["permissions", "string[]", "—", "접근 권한. 메뉴에 보일지는 getNavRoutes의 canAccess가 정합니다"],
        ["breadcrumb", "boolean", "true", "false면 경로(useBreadcrumbs)에 칸으로 나오지 않습니다. 아래 칸은 그대로입니다. 레이아웃만 맡는 루트에 줍니다"]
      ] as Row[]
    },
    filterRules: {
      section: "getNavRoutes",
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
      section: "getNavRoutes",
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
      section: "useCurrentRoute",
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
    breadcrumb: {
      section: "useBreadcrumbs",
      label: "Breadcrumb",
      searchable: true,
      rows: [
        ["key", "string", "—", "트리에 쓴 키. React의 key로도 씁니다"],
        ["path", "string", "—", "실제 주소. 동적 세그먼트가 채워져 있습니다(/users/8213)"],
        ["label", "ReactNode", "—", "meta.label. 이것이 없는 노드는 칸이 되지 않습니다"],
        ["meta", "RouteMeta?", "—", "트리에 쓴 meta 그대로"]
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
        ["RouteMeta", "{ label?, icon?, description?, hidden?, permissions?, breadcrumb? }", "", "메뉴 · 현재 위치 정보"],
        ["NavRoute", "{ key, path, meta?, children? }", "", "getNavRoutes의 결과 한 칸"],
        ["CanAccess", "(permissions, node) => boolean", "", "권한 판정 함수"],
        ["CurrentRoute", "{ node, meta, matches, params, pathname }", "", "useCurrentRoute의 결과"],
        ["Breadcrumb", "{ key, path, label, meta? }", "", "useBreadcrumbs의 결과 한 칸. TxBreadcrumb의 items가 그대로 받습니다"],
        ["RouteHandle", "{ node: RouteNode, key: string }", "", "buildRouteObjects가 각 라우트의 handle에 싣는 값. matchRoutes 결과에서 원래 노드와 키를 찾을 때 씁니다"]
      ] as Row[]
    }
  },
  fns: {
    installEntry: {
      section: "Install",
      searchable: true,
      rows: [
        ["@txstack/fns", "아래 함수 전부", "어디서나", "루트 진입점. 함수 이름이 패키지 안에서 겹치지 않아 여기 하나로 충분합니다. browser 함수도 불러오기만으로는 document를 건드리지 않습니다"],
        ["@txstack/fns/num", "isNumeric · toNumber · formatNumber · formatPercent · formatCompact · formatBytes", "—", "숫자 판정 · 변환 · 포맷"],
        ["@txstack/fns/date", "dayRange · lastDays · localTimeZone · parseYmd · isoWeek · parseTimestamps · splitSeconds · elapsed", "—", "날짜 · 기간 · 경과 시간. dayjs 없이 Date만 씁니다"],
        ["@txstack/fns/rand", "randomFloat · randomInt · randomDate · randomPick · randomIp · shortId", "—", "랜덤 값과 짧은 ID. 목업 데이터용이며 암호용이 아닙니다"],
        ["@txstack/fns/str", "hashColor · paletteColor · PALETTE · emailLocalPart · hasSpecialChars · hasNonAscii", "—", "문자열과 문자열에서 만든 색"],
        ["@txstack/fns/obj", "diffObject · undefinedToNull", "—", "객체. lodash에 있는 것은 두지 않습니다"],
        ["@txstack/fns/arr", "sortByOrder", "—", "정해 준 순서대로 정렬"],
        ["@txstack/fns/form", "checkForm · checkEmpty · checkPattern", "—", "폼 값의 빈 칸과 형식 검사"],
        ["@txstack/fns/async", "sleep · withLoading", "—", "기다리기와 로딩 · 오류 처리 감싸기"],
        ["@txstack/fns/math", "lerp · lerpVector · toRadians · toDegrees · rotate", "—", "보간 · 각도 · 2D 회전"],
        ["@txstack/fns/phone-kr", "normalizePhone · parseMobile · maskPhone · maskIfPhone · validatePhones · dedupePhones · excludePhones", "—", "한국 전화번호. 대량 처리는 1만 건마다 화면에 양보합니다"],
        ["@txstack/fns/browser/cookie", "getCookie · setCookie · removeCookie", "브라우저", "쿠키 읽기 · 쓰기. 값은 JSON으로 저장합니다"],
        ["@txstack/fns/browser/css", "injectCSS · removeCSS", "브라우저", ":hover · ::before처럼 인라인 style로 안 되는 규칙을 실행 중에 넣습니다"],
        ["@txstack/fns/browser/file", "readTextFile · downloadFile", "브라우저", "파일을 글자로 읽기와 내려받기"]
      ] as Row[]
    },
    num: {
      section: "num",
      searchable: true,
      rows: [
        ["isNumeric", "(value: unknown) => boolean", "—", '유한한 숫자로 읽히는가. "1.5" · "1e3"은 참, "" · " " · "1,234" · "12abc" · 배열은 거짓입니다'],
        ["toNumber", "(value, fallback?) => number | undefined", "—", "숫자로 바꿉니다. 바꿀 수 없으면 fallback입니다. null도 0이 아니라 fallback이 됩니다"],
        ["formatNumber", "(value: Numberish, options?: FormatOptions) => string", "—", "자릿수 구분. Intl.NumberFormat 옵션(통화 · 소수 자릿수 등)을 그대로 받습니다"],
        ["formatPercent", "(ratio, digits = 1, options?) => string", "digits 1", '비율(0~1)을 백분율로. 소수 자릿수는 고정입니다 — 0.5는 "50.0%"'],
        ["formatCompact", "(value, options?) => string", "소수 1자리", "큰 수를 짧게. ko-KR이면 만 · 억, en-US면 K · M"],
        ["formatBytes", "(value, decimals = 2) => string", "decimals 2", '1024 기준 B · KB · MB · GB · TB · PB. 음수와 빈 값은 "0 B"'],
        ["Numberish", "number | string | null | undefined", "—", "포맷 함수가 받는 값"],
        ["FormatOptions", "Intl.NumberFormatOptions & { locale?, fallback? }", "환경 로케일", "locale을 빼면 실행 환경의 로케일. fallback을 주면 빈 값에 0 대신 그 글자"]
      ] as Row[]
    },
    date: {
      section: "date",
      searchable: true,
      rows: [
        ["dayRange", "(from, to, now?) => [Date, Date]", "now: 지금", "오늘 기준 from일째 0시부터 to일째 23:59:59.999까지"],
        ["lastDays", "(days, now?) => [Date, Date]", "now: 지금", "오늘을 포함한 최근 days일. lastDays(1)은 오늘 하루입니다"],
        ["localTimeZone", "() => string", "—", '실행 환경의 IANA 시간대("Asia/Seoul")'],
        ["parseYmd", "(ymd: string) => Date | null", "—", '"20251231" → 그날 0시. 형식이 다르거나 없는 날짜면 null'],
        ["isoWeek", "(value: Date | string) => IsoWeek | null", "—", "ISO 8601 주차. 12월 말이 다음 해 1주차일 수 있습니다"],
        ["parseTimestamps", "(value) => [Date, Date] | null", "—", "쉼표로 이은 밀리초 두 개(주소 쿼리의 기간) → [시작, 끝]"],
        ["splitSeconds", "(total, { pad?, dayLabel? }) => SplitSeconds", 'pad true · dayLabel "d "', '초를 일 · 시 · 분 · 초로 나누고 "1d 01:01:01" 꼴 글자도 줍니다'],
        ["elapsed", "(seconds, { decimals?, t? }) => string", "decimals 2", '경과 시간을 "1m 30s"처럼. t에 i18n 번역 함수를 넘기면 단위 글자가 바뀝니다'],
        ["IsoWeek", "{ year, week, key }", "—", 'key는 "2026-W01"'],
        ["SplitSeconds", "{ days, hours, minutes, seconds, formatted }", "—", "splitSeconds의 결과"],
        ["ElapsedKey", '"just_now" | "second" | "minute" | "hour" | "day" | "month" | "year"', "—", "elapsed가 t에 넘기는 키"]
      ] as Row[]
    },
    rand: {
      section: "rand",
      searchable: true,
      rows: [
        ["randomFloat", "(min, max, bias?, weight = 0.8) => number", "—", "min 이상 max 미만의 실수. bias로 한쪽에 쏠리게 합니다"],
        ["randomInt", "(min, max, bias?, weight?) => number", "—", "min 이상 max 미만의 정수"],
        ["randomDate", "(start: Date, end: Date, bias?, weight?) => Date", "—", "범위 안의 날짜"],
        ["randomPick", "(items, bias?, weight?) => T | undefined", "—", "배열에서 하나. 빈 배열이면 undefined"],
        ["randomIp", "() => string", "—", '"x.x.x.x" 꼴의 IPv4 주소'],
        ["shortId", "() => string", "—", "시각 + 랜덤 + 순번. 같은 밀리초에 불러도 겹치지 않습니다"]
      ] as Row[]
    },
    str: {
      section: "str",
      searchable: true,
      rows: [
        ["hashColor", "(value: string) => string", '"#407adf"', "문자열마다 늘 같은 #rrggbb 색. 아바타 · 태그 색에 씁니다"],
        ["paletteColor", "(index: number) => string", "—", "PALETTE에서 순번으로 색 하나. 넘치면 처음으로 돕니다"],
        ["PALETTE", "readonly string[]", "—", "Tailwind 500 계열 열다섯 색"],
        ["emailLocalPart", "(email: string) => string", "—", "@ 앞부분. @가 없으면 그대로"],
        ["hasSpecialChars", "(value: string) => boolean", "—", "키보드 특수문자가 있는가. 밑줄과 공백은 아닙니다"],
        ["hasNonAscii", "(value: string) => boolean", "—", "ASCII 밖의 글자(한글 · 이모지 등)가 있는가"]
      ] as Row[]
    },
    obj: {
      section: "obj · arr",
      searchable: true,
      rows: [
        ["diffObject", "(prev, next, isEqual = Object.is) => Partial<T>", "Object.is", "next에서 바뀐 필드만. 깊은 비교는 _.isEqual 같은 함수를 넘깁니다"],
        ["undefinedToNull", "(value: T) => UndefinedToNull<T>", "—", "undefined인 필드를 null로 바꾼 새 객체. JSON으로 보낼 때 필드가 빠지지 않습니다"],
        ["UndefinedToNull", "{ [K in keyof T]: … | null }", "—", "undefinedToNull의 결과 타입"],
        ["sortByOrder", '(items, order, by, direction = "asc") => T[]', "asc", "정해 준 순서대로 정렬한 새 배열. 목록에 없는 값은 뒤에서 글자 순입니다"]
      ] as Row[]
    },
    form: {
      section: "form",
      searchable: true,
      rows: [
        ["checkForm", "(values, rules?, options?) => FormError<T> | null", "—", "빈 칸을 먼저, 그다음 형식을 봅니다. 첫 번째로 걸린 필드 하나만 알려 줍니다"],
        ["checkEmpty", "(values, { optional?, message? }) => FormError<T> | null", "—", "빈 필드를 찾습니다. 공백만 있는 문자열과 빈 배열도 빈 것, 0 · false는 값이 있는 것입니다"],
        ["checkPattern", "(values, rules) => FormError<T> | null", "—", "형식이 틀린 필드를 찾습니다. 빈 필드는 건너뜁니다"],
        ["FormError", "Partial<Record<keyof T, string>>", "—", "걸린 필드 하나 → 메시지"],
        ["PatternRule", "{ pattern: RegExp; message: string }", "—", "형식 규칙 하나"],
        ["PatternRules", "Partial<Record<keyof T, PatternRule>>", "—", "필드 이름 → 형식 규칙"],
        ["CheckEmptyOptions", "{ optional?, message? }", "—", "비워도 되는 필드와 빈 칸 메시지"]
      ] as Row[]
    },
    async: {
      section: "async · math",
      searchable: true,
      rows: [
        ["sleep", "(ms = 1000) => Promise<void>", "1000", "ms 뒤에 풀리는 Promise"],
        ["withLoading", "(fn, { onLoading?, onError? }) => (...args) => Promise<R | undefined>", "—", "비동기 함수에 로딩 상태와 오류 처리를 붙입니다. onError가 없으면 오류를 다시 던집니다"],
        ["WithLoadingOptions", "{ onLoading?, onError? }", "—", "withLoading의 옵션"],
        ["lerp", "(start, end, t) => number", "—", "선형 보간. t가 0이면 start, 1이면 end"],
        ["lerpVector", "(start: Vector2, end: Vector2, t) => Vector2", "—", "좌표의 선형 보간"],
        ["toRadians", "(degree) => number", "—", "도 → 라디안"],
        ["toDegrees", "(radian) => number", "—", "라디안 → 도"],
        ["rotate", "(point, center, degree) => Vector2", "—", "center를 축으로 degree만큼 돌린 좌표"],
        ["Vector2", "{ x: number; y: number }", "—", "2D 좌표"]
      ] as Row[]
    },
    phone: {
      section: "phone-kr",
      searchable: true,
      rows: [
        ["normalizePhone", "(input) => string", "—", "숫자만 남기고 휴대폰 번호 꼴로. +82 · 82-010 · 앞자리 생략을 맞춥니다"],
        ["parseMobile", "(input) => string | null", "—", "010 휴대폰이면 숫자만 남긴 값, 아니면 null"],
        ["maskPhone", "(input) => string", "—", '가운데 자리를 *로 가립니다. "010****5678"'],
        ["maskIfPhone", "(keyword) => string", "—", "전화번호처럼 보일 때만 가립니다. 검색어를 화면 · 로그에 남길 때 씁니다"],
        ["validatePhones", "(numbers) => Promise<{ valid, invalid }>", "—", "휴대폰 번호 목록을 가릅니다. valid는 정규화한 값, invalid는 원본"],
        ["dedupePhones", "(numbers) => Promise<{ uniques, duplicates }>", "—", "중복을 걸러 냅니다. 정규화는 하지 않으니 validatePhones를 먼저 거칩니다"],
        ["excludePhones", "(source, blocked) => Promise<{ remains, excluded }>", "—", "source에서 blocked에 든 번호를 뺍니다"]
      ] as Row[]
    },
    browser: {
      section: "browser",
      searchable: true,
      rows: [
        ["getCookie", "(name, fallback: T) => T", "—", "저장한 값을 읽습니다. 없으면 fallback"],
        ["setCookie", "(name, value, options?: SetCookieOptions) => void", "30일 · / · Lax", "값을 JSON으로 저장합니다"],
        ["removeCookie", "(name, { path? }) => void", "—", "쿠키를 지웁니다"],
        ["SetCookieOptions", "{ days?, path?, sameSite?, secure? }", "—", "sameSite가 None이면 secure를 자동으로 켭니다"],
        ["injectCSS", "(styleId, selector, rules: CssRules) => boolean", "—", "규칙을 넣습니다. 같은 선택자가 있으면 그 자리에서 바꿉니다"],
        ["removeCSS", "(styleId) => void", "—", "injectCSS로 만든 <style>을 통째로 지웁니다"],
        ["CssRules", "Record<string, string | number>", "—", "camelCase와 CSS 이름(--변수 포함)을 둘 다 받습니다"],
        ["readTextFile", "(source: Blob) => Promise<string>", "—", "고른 파일을 글자로 읽습니다"],
        ["downloadFile", "(filename, content, type?) => boolean", "text/plain", "내려받게 합니다. 문자열 배열은 다듬어 줄로 잇습니다. 내용이 없으면 false"]
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
      { name: "TxSwitch", desc: "바로 켜고 끄는 스위치(토글)" },
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
      { name: "TxAppShell", desc: "헤더 · 메뉴 · 본문 · 하단을 잡는 화면 틀. 좁은 화면에서는 메뉴가 서랍으로 들어가고 하단 탭바를 둘 수 있습니다" },
      { name: "TxNavBar", desc: "가로 메뉴. 항목별 패널이나 메뉴 전체를 펼치는 패널을 둘 수 있습니다" },
      { name: "TxSideNav", desc: "세로 메뉴. 아이콘만 남기고 접히고, 하위 메뉴는 트리로 펼쳐집니다" },
      { name: "TxTabBar", desc: "좁은 화면 아래쪽의 탭 줄. TxAppShell 의 tabBar 자리에 넣으면 좁을 때만 화면 아래에 붙습니다" },
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
      { name: "TxDropMenu", desc: "눌러서 펼치는 메뉴. 누르는 것은 label, 항목은 children" },
      { name: "TxContextMenu", desc: "오른쪽 클릭 메뉴. 감싼 대상(children) 위에서 menu 를 띄웁니다" },
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

/**
 * **`@txstack/fns` 로 옮기며 바뀐 이름.** 세 서비스의 `core/extensions.ts` 에 있던 이름으로 찾아도
 * 새 함수에 닿게 한다 — 사이트 검색이 옛 이름마다 항목을 하나씩 만들고, API › fns 의 `Former names` 표가 같은 것을 그린다.
 *
 * `[옛 이름, TABLES.fns 의 표, 그 표의 새 이름, 주의]`. lodash 로 넘긴 것처럼 새 이름이 표에 없으면 표를 `null` 로 둔다.
 * `getCookie` · `formatBytes` · `maskPhone` 처럼 이름이 그대로인 것은 두지 않는다.
 */
export type FnsTableKey = Exclude<keyof typeof TABLES.fns, "installEntry">;

export const FNS_FORMER: [former: string, table: FnsTableKey | null, now: string, note?: string][] = [
  ["waitForSeconds", "async", "sleep", "이름은 seconds지만 원래도 ms를 받았습니다"],
  ["networkWrapper", "async", "withLoading", "alert를 띄우던 자리는 onError에서 직접"],
  ["rand", "rand", "randomFloat"],
  ["randInt", "rand", "randomInt"],
  ["randDate", "rand", "randomDate"],
  ["randPick", "rand", "randomPick", "빈 배열이면 undefined"],
  ["randIP", "rand", "randomIp"],
  ["shortUID", "rand", "shortId"],
  ["numberToStartEndDate", "date", "lastDays", "(-14, 0) → lastDays(14). dayRange(-14, 0)이 아닙니다 — 옛 함수는 시작에 하루를 더했습니다"],
  ["numberToPeriod", "date", "lastDays", "(-14, 0) → lastDays(14)"],
  ["timeZone", "date", "localTimeZone", "상수 → 함수 호출"],
  ["yyyymmddToTime", "date", "parseYmd", "parseYmd(s)?.getTime(). 잘못된 값이면 null"],
  ["getISOWeekKey", "date", "isoWeek"],
  ["elapsedTimeToLabel", "date", "elapsed", "(sec, 2, $t) → elapsed(sec, { decimals: 2, t: $t })"],
  ["numberWithDelimiter", "num", "formatNumber"],
  ["toFormattedNumber", "num", "formatNumber", '빈 값에 ""이 필요하면 { fallback: "" }'],
  ["num2str", "num", "formatNumber"],
  ["num2String", "num", "formatNumber"],
  ["num2Money", "num", "formatNumber", '{ style: "currency", currency: "KRW" }'],
  ["num2Percent", "num", "formatPercent"],
  ["compactFormatter", "num", "formatCompact", '한국어로 고정하려면 { locale: "ko-KR" }'],
  ["isNumber", "num", "isNumeric", '"12abc"는 이제 false'],
  ["safeNumber", "num", "toNumber"],
  ["stringToHex", "str", "hashColor"],
  ["numberToHex", "str", "paletteColor"],
  ["emailToId", "str", "emailLocalPart"],
  ["containsNonAscii", "str", "hasNonAscii"],
  ["intergrity", "obj", "undefinedToNull"],
  ["sortArray", "obj", "sortByOrder", 'sortArray(t, s) → sortByOrder(t, s, "name")'],
  ["checkEmptyFields", "form", "checkEmpty", "exclude → { optional }"],
  ["checkRegexFields", "form", "checkPattern", "규칙의 reg → pattern"],
  ["lerpVector2", "async", "lerpVector"],
  ["toRotation", "async", "rotate", "({ x1, y1, cx, cy, degree }) → rotate({ x, y }, { x, y }, degree)"],
  ["toSin", "async", "toRadians", "Math.sin(toRadians(d))"],
  ["toCos", "async", "toRadians", "Math.cos(toRadians(d))"],
  ["normalizePhoneNumber", "phone", "normalizePhone"],
  ["validPhoneNumber", "phone", "parseMobile", "실패하면 false 대신 null"],
  ["maskKeyword", "phone", "maskIfPhone"],
  ["validatePhoneNumbersAsync", "phone", "validatePhones"],
  ["dedupePhoneNumbersAsync", "phone", "dedupePhones"],
  ["excludePhonesAsync", "phone", "excludePhones", "결과 필드 duplicates → excluded"],
  ["createCSS", "browser", "injectCSS"],
  ["createCSSWithPseudo", "browser", "injectCSS"],
  ["readTextFileAsync", "browser", "readTextFile"],
  ["downloadMessageFile", "browser", "downloadFile", '(name, lines) → downloadFile(name + ".txt", lines)'],
  ["mapping", null, "_.pick", "lodash"],
  ["keyCopy", null, "Object.assign", "표준 API"],
  ["numSort", null, "_.sortBy", "lodash"],
  ["isInRange", null, "_.inRange", "lodash. 끝값을 포함하지 않고 경계를 생략할 수 없습니다"]
];

/** 옛 이름이 가는 곳 — 새 함수의 예제(옮길 때 바로 쓰는 법이 보인다), 없으면 lodash 를 다룬 Import 섹션 */
export const formerTarget = ([, table, now]: (typeof FNS_FORMER)[number]) => `${API_PAGES.fns.path}#${table ? `example-${slug(now)}` : "import"}`;

export const componentAnchor = (name: string) => `component-${slug(name)}`;

/**
 * 컴포넌트 이름이 놓인 줄. `TxDayPickerRange` 처럼 다른 줄의 `also` 에 들어 있는 이름은 그 줄로 간다 —
 * 목록은 한 계열을 한 줄로 묶는다.
 */
export const componentRowAnchor = (name: string) => {
  const row = CATALOG.flatMap(([, items]) => items).find((item) => item.name === name || item.also?.includes(name));
  return componentAnchor(row?.name ?? name);
};
