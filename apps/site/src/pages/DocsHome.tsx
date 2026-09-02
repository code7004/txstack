import { Link } from "react-router-dom";
import { TxCard, TxGrid } from "@txstack/ui";

const SECTIONS = [
  { to: "/docs/start", title: "Getting Started", what: "설치하고 첫 화면이 뜨기까지. 여기까지만 따라와도 쓸 수 있다" },
  { to: "/docs/guide", title: "Guide", what: "겉모습을 토큰으로 바꾸고, 다크모드를 켜고, 화면 골격을 세운다" },
  { to: "/docs/components", title: "Components", what: "부품 49종의 레퍼런스 — 스토리북으로 간다" },
  { to: "/docs/tutorial", title: "Tutorial", what: "목록 · 등록 화면을 처음부터 끝까지 만들어 본다" }
];

/** `/docs` 의 인덱스 화면. 트리에서 `index: true` 로 선언돼 있다. */
export function DocsHome() {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-slate-600 dark:text-slate-300">처음 오면 위에서 아래로 읽는다. 왼쪽 줄에서 언제든 건너뛸 수 있다.</p>
      </header>

      <TxGrid columns={2} className="gap-4">
        {SECTIONS.map((item) => (
          <TxCard key={item.to} title={item.title}>
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">{item.what}</p>
              <Link to={item.to} className="text-sm underline">
                보기
              </Link>
            </div>
          </TxCard>
        ))}
      </TxGrid>
    </>
  );
}
