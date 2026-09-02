import { useState } from "react";
import { Link } from "react-router-dom";
import { TxAlert, TxButton, TxCard, TxCopyButton, TxForm, TxGrid, TxTag } from "@txstack/ui";
import { CodeBlock } from "../components/CodeBlock";

const PACKAGES = [
  { name: "@txstack/ui", what: "Tx* 컴포넌트 49종. 스타일시트 한 줄, 겉모습은 CSS 변수로 바꾼다", to: "/api/ui", tag: "React" },
  { name: "@txstack/route-meta", what: "라우트를 메타데이터 트리 하나로 — 라우터 · 메뉴 · 브레드크럼이 거기서 나온다", to: "/api/route-meta", tag: "React" },
  { name: "@txstack/hooks", what: "범용 훅과 URL 쿼리 상태", to: "/api/hooks", tag: "React" },
  { name: "@txstack/axios", what: "정책 주입식 HTTP 클라이언트. 토큰 · 401 · 응답 봉투를 앱이 정한다", to: "/api/axios", tag: "React 없이도" }
];

const HERO_CODE = `import { TxButton, TxForm } from "@txstack/ui";
import "@txstack/ui/styles.css";

export function SignUp() {
  return (
    <TxForm noValidate labelWidth="4rem" onSubmit={submit}>
      <TxForm.Input caption="이름" placeholder="홍길동" required />
      <TxForm.Input caption="메일" type="email" error={errors.email} />
      <TxButton type="submit" label="가입" />
    </TxForm>
  );
}`;

/** 오른쪽에서 **진짜로 도는** 폼. 왼쪽 코드가 이것을 그대로 만든다. */
function HeroDemo() {
  const [email, setEmail] = useState("");
  const [tried, setTried] = useState(false);

  const error = tried && !email.includes("@") ? "메일 형태가 아니다" : undefined;

  return (
    <TxForm
      noValidate
      labelWidth="4rem"
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        setTried(true);
      }}
    >
      <TxForm.Input caption="이름" placeholder="홍길동" required />
      <TxForm.Input caption="메일" type="email" placeholder="you@company.com" value={email} onChangeText={setEmail} error={error} />
      <TxButton type="submit" label="가입" />
    </TxForm>
  );
}

export function Home() {
  return (
    <div className="flex flex-col gap-16">
      {/* --- 히어로 ------------------------------------------------------- */}
      <section className="flex flex-col gap-6 pt-4">
        <div className="flex items-center gap-2">
          <TxTag>MIT</TxTag>
          <TxTag>pnpm workspace</TxTag>
          <TxTag>React 18+</TxTag>
        </div>

        <h1 className="max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">
          같은 화면을 <span style={{ color: "var(--tx-color-primary)" }}>다시 짓지 않는다</span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300">
          여러 프로젝트에서 다시 쓰는 React 라이브러리 네 개. 부품은 <strong>쉽게 쓰고 쉽게 바꾸는 것</strong>을 노렸고, 정책(인증 · 권한 · 응답 형태)은 라이브러리가 정하지 않고 앱이 준다.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/docs/start" className="tx-button" data-variant="primary">
            <span className="tx-button__label">Getting Started</span>
          </Link>

          {/* 설치 한 줄. 복사는 우리 부품이 한다 */}
          <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }}>
            <code className="font-mono text-sm">pnpm add @txstack/ui</code>
            <TxCopyButton value="pnpm add @txstack/ui" variant="ghost" className="text-xs" />
          </div>
        </div>
      </section>

      {/* --- 코드와 결과를 나란히 --------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">왼쪽을 쓰면 오른쪽이 나온다</h2>
          <p className="text-slate-600 dark:text-slate-300">오른쪽 폼은 그림이 아니라 실제로 도는 것이다. 메일 칸을 비운 채 가입을 눌러 보라.</p>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <CodeBlock title="SignUp.tsx">{HERO_CODE}</CodeBlock>

          <TxCard title="결과" className="h-full">
            <HeroDemo />
          </TxCard>
        </div>
      </section>

      {/* --- 패키지 ------------------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Packages</h2>

        <TxGrid columns={2} className="gap-4">
          {PACKAGES.map((item) => (
            <TxCard key={item.name} title={<span className="font-mono text-sm">{item.name}</span>} className="transition-colors hover:border-[color:var(--tx-color-primary)]">
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.what}</p>
                <div className="flex items-center gap-2">
                  <TxTag>{item.tag}</TxTag>
                  <Link to={item.to} className="text-sm underline">
                    API
                  </Link>
                </div>
              </div>
            </TxCard>
          ))}
        </TxGrid>
      </section>

      {/* --- 이 사이트가 증거다 ---------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">이 사이트가 그 증거다</h2>
          <p className="text-slate-600 dark:text-slate-300">
            지금 보고 있는 껍데기가 <code>TxAppShell</code> 이고, 위 메뉴는 트리 하나에서 나온다. 겉모습은 <strong>부품 CSS 를 한 줄도 덮지 않고</strong> 토큰만 다시 정의해서 만들었다.
          </p>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <CodeBlock title="theme.css" language="css">{`:root {
  --tx-color-primary: #0f766e;   /* 브랜드 색 하나 */
  --tx-radius: 0.375rem;          /* 도구 느낌은 반경에서 온다 */
}

.dark {
  --tx-color-primary: #2dd4bf;   /* 어두운 바탕에서는 밝은 쪽으로 */
}`}</CodeBlock>

          <TxAlert variant="info" title="토큰을 못 바꾸면 그건 우리 잘못이다">
            부품 클래스에 손대야 하는 순간이 오면 <strong>토큰이 부족하다는 신호</strong>로 읽는다. 사이트를 만들며 나온 그런 자리들은 저장소의 <code>docs/005_site.md</code> 에 모아 두었다.
          </TxAlert>
        </div>
      </section>
    </div>
  );
}
