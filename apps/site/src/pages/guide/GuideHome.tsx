import { Link } from "react-router-dom";
import { TxCard, TxGrid } from "@txstack/ui";

const TOPICS = [
  { to: "/docs/guide/tokens", title: "Tokens", what: "겉모습을 CSS 변수로 바꾼다. 값을 직접 돌려 볼 수 있다" },
  { to: "/docs/guide/dark-mode", title: "Dark mode", what: "클래스 하나로 토큰이 뒤집힌다. 부품에는 다크 분기가 없다" },
  { to: "/docs/guide/layout", title: "Layout", what: "셸의 슬롯 · 좁은 화면 · 가로와 세로 내비게이션" }
];

export function GuideHome() {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Guide</h1>
        <p className="text-slate-600 dark:text-slate-300">부품을 어떻게 쓰는지가 아니라, 부품을 내 화면에 맞추는 법. 셋 다 예제가 실제로 돈다.</p>
      </header>

      <TxGrid columns={3} className="gap-4">
        {TOPICS.map((item) => (
          <TxCard key={item.to} title={item.title} className="transition-colors hover:border-[color:var(--tx-color-primary)]">
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
