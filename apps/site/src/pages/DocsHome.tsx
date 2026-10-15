import { Link } from "react-router-dom";
import { Page } from "../components/Page";

/** **읽는 차례 그대로다.** 트리의 순서와 같아서 장 끝의 "다음" 을 따라가도 같은 길이 된다. */
const STEPS = [
  { to: "/docs/start", title: "Getting Started", time: "저장소 빌드 포함", what: "필요한 패키지를 고르고, 설치해서 첫 화면을 띄웁니다" },
  { to: "/docs/tutorial", title: "Tutorial", time: "15분", what: "네 패키지를 모두 써서 검색, 등록, 삭제가 있는 목록 화면을 끝까지 만듭니다" },
  { to: "/docs/guide", title: "Guide", time: "필요할 때", what: "디자인 바꾸기, 다크 모드, 화면 틀, 입력 폼, 확인 창과 알림, 표, 라우팅과 메뉴, URL 상태, API 클라이언트" },
  { to: "/docs/components", title: "Components", time: "찾아볼 때", what: "분류마다 실제로 동작하는 작은 화면으로 컴포넌트를 둘러봅니다" }
];

/** `/docs` 의 인덱스 화면. 트리에서 `index: true` 로 선언돼 있다. */
export function DocsHome() {
  return (
    <Page title="Documents" lead={'처음이라면 1번부터 차례로 읽어 보세요. 각 장 끝의 "다음"을 누르면 이 순서대로 이어집니다.'}>
      <ol className="flex flex-col gap-3">
        {STEPS.map((step, index) => (
          <li key={step.to}>
            <Link to={step.to} className="site-card flex items-start gap-4 rounded-lg border p-4">
              <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold" style={{ backgroundColor: "var(--tx-color-primary)", color: "var(--tx-color-on-accent)" }}>
                {index + 1}
              </span>

              <span className="flex flex-col gap-1">
                <span className="flex items-baseline gap-2">
                  <span className="font-semibold">{step.title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{step.time}</span>
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{step.what}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Page>
  );
}
