import { Link, Outlet } from "react-router-dom";
import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../components/CodeBlock";

export function Start() {
  return (
    <article className="flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Getting Started</h1>
        <p className="text-slate-600 dark:text-slate-300">설치하고 첫 화면이 뜨기까지. 여기까지만 따라와도 쓸 수 있다.</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">1. 설치</h2>
        <CodeBlock language="bash" title="sh">{`pnpm add @txstack/ui`}</CodeBlock>
        <p className="text-slate-600 dark:text-slate-300">
          <code>react</code> · <code>react-dom</code> 은 peer 라 앱이 이미 가진 것을 쓴다. 스타일시트는 <strong>앱에 한 번</strong>이다.
        </p>
        <CodeBlock title="main.tsx">{`import "@txstack/ui/styles.css";`}</CodeBlock>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">2. 첫 화면</h2>
        <CodeBlock title="SignUp.tsx">{`import { TxButton, TxForm } from "@txstack/ui";

<TxForm labelWidth="5rem" onSubmit={submit}>
  <TxForm.Input caption="이름" placeholder="홍길동" />
  <TxForm.Input caption="메일" type="email" error={errors.email} />
  <TxButton type="submit" label="가입" />
</TxForm>;`}</CodeBlock>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">3. Tailwind 를 함께 쓴다면</h2>
        <p className="text-slate-600 dark:text-slate-300">
          우리 스타일은 <code>@layer tx</code> 안에 있다. 레이어 순서를 한 줄 정해 두면 <code>className</code> 으로 준 유틸리티가 이긴다.
        </p>
        <CodeBlock language="css" title="app.css">{`@layer theme, base, tx, components, utilities;

@import "tailwindcss";
@import "@txstack/ui/styles.css";`}</CodeBlock>
        <TxAlert variant="info" title="순서가 중요하다">
          <code>tx</code> 는 preflight(<code>base</code>) 뒤, 유틸리티 앞이어야 한다. 앞에 두면 preflight 가 버튼의 배경과 여백을 지우고, 뒤에 두면 <code>className</code> 이 안 먹는다.
        </TxAlert>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">다음</h2>
        <ul className="list-inside list-disc text-slate-600 dark:text-slate-300">
          <li>
            <Link to="/docs/guide/tokens" className="underline">
              Guide — 겉모습을 토큰으로 바꾸기
            </Link>
          </li>
          <li>
            <Link to="/docs/tutorial" className="underline">
              Tutorial — 한 화면을 처음부터 끝까지
            </Link>
          </li>
          <li>
            <Link to="/docs/components" className="underline">
              Components — 부품 카탈로그
            </Link>
          </li>
        </ul>
      </section>

      <Outlet />
    </article>
  );
}
