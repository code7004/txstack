import { Link } from "react-router-dom";
import { Page } from "../components/Page";

/** **읽는 차례 그대로다.** 트리의 순서와 같아서 장 끝의 "다음" 을 따라가도 같은 길이 된다. */
const STEPS = [
  { to: "/docs/start", title: "Getting Started", time: "5분", what: "설치하고 첫 화면을 띄운다. 여기까지만 따라와도 쓸 수 있다" },
  { to: "/docs/tutorial", title: "Tutorial", time: "15분", what: "검색 · 목록 · 등록 · 삭제가 붙은 화면 하나를 끝까지 만든다" },
  { to: "/docs/guide", title: "Guide", time: "필요할 때", what: "겉모습을 토큰으로 바꾸고, 다크모드를 켜고, 화면 골격을 세운다" },
  { to: "/docs/components", title: "Components", time: "찾아볼 때", what: "부품 49종의 레퍼런스 — 카탈로그(Storybook)로 간다" }
];

/** `/docs` 의 인덱스 화면. 트리에서 `index: true` 로 선언돼 있다. */
export function DocsHome() {
  return (
    <Page title="Documents" lead={'처음이라면 1 부터 차례로. 각 장 끝의 "다음" 을 누르면 이 순서대로 이어진다.'}>
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
