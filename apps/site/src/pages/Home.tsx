import { useState } from "react";
import { Link } from "react-router-dom";
import { TxAlert, TxButton, TxCard, TxCopyButton, TxForm, TxTag } from "@txstack/ui";
import { CodeBlock } from "../components/CodeBlock";
import { LinkCard, LinkCardGrid } from "../components/LinkCard";

const PACKAGES = [
  { name: "@txstack/ui", what: "UI를 위한 다양한 Tx* 컴포넌트. 스타일시트 한 줄로 적용하고, 디자인은 CSS 변수로 바꿉니다", to: "/api/ui", tag: "React" },
  { name: "@txstack/route-meta", what: "라우트를 메타데이터 트리 하나로 관리합니다. 라우터·메뉴·브레드크럼이 모두 여기서 만들어집니다", to: "/api/route-meta", tag: "React" },
  { name: "@txstack/hooks", what: "범용 훅과 URL 쿼리 상태 관리", to: "/api/hooks", tag: "React" },
  { name: "@txstack/axios", what: "정책을 주입받는 HTTP 클라이언트. 토큰·401 처리·응답 형식을 앱이 정합니다", to: "/api/axios", tag: "React 불필요" }
];

/** 왜 만들었나. 프로젝트 이름은 싣지 않는다 — 공개 사이트다 */
const STORY = [
  { title: "Copied code, again and again", body: "여러 서비스가 같은 UI 컴포넌트와 HTTP 설정을 각자 복사해 썼습니다. 고칠 일이 생기면 프로젝트마다 다시 고쳐야 했고, 조금씩 서로 달라졌습니다." },
  { title: "Extract only what is shared", body: "어느 서비스에도 묶이지 않도록 도메인 지식을 걷어 내고, 공통된 부분만 네 개의 패키지로 나눴습니다." },
  { title: "The next project is the test", body: "다음 프로젝트가 설치만으로 그대로 쓸 수 있는지를 기준으로 삼았습니다. 그렇지 않다면 라이브러리가 아니라 앱 코드입니다." }
];

/** 세 가지 원칙. 각각 그 원칙을 보여 주는 문서로 간다 */
const PRINCIPLES = [
  { title: "Easy to use", body: "설치하고 스타일시트 한 줄이면 바로 씁니다. 확인 창이나 알림도 Provider 없이 호출만 하면 됩니다.", to: "/docs/start" },
  { title: "Easy to customize", body: "디자인은 CSS 변수만 바꾸면 됩니다. 컴포넌트를 직접 고칠 필요가 없고, 다크 모드도 같은 방식으로 바뀝니다.", to: "/docs/guide/tokens" },
  { title: "The app owns the policy", body: "인증 토큰, 401 처리, 응답 형식처럼 서비스마다 다른 규칙은 라이브러리가 정하지 않고 앱이 옵션으로 넘깁니다.", to: "/api/axios" }
];

/** 주요 기능. 원칙이 "어떤 생각으로" 라면 이쪽은 "무엇을 할 수 있나" 다. 각각 그 기능의 가이드로 간다 */
const FEATURES = [
  { pkg: "ui", title: "49 components", body: "입력 폼, 표, 날짜 선택, 확인 창, 알림, 탭, 파일 업로드까지 서비스 화면에 필요한 컴포넌트를 갖췄습니다.", to: "/docs/components" },
  { pkg: "ui", title: "Theming and dark mode", body: "색, 모서리, 간격을 CSS 변수로 바꾸고, 클래스 하나로 모든 컴포넌트를 다크 모드로 전환합니다.", to: "/docs/guide/tokens" },
  { pkg: "ui", title: "App shell", body: "헤더, 위쪽 메뉴, 왼쪽 메뉴, 본문 자리를 한 번에 잡고, 좁은 화면에서는 메뉴가 서랍으로 들어갑니다.", to: "/docs/guide/layout" },
  { pkg: "route-meta", title: "Menus from routes", body: "라우트를 한 곳에 선언하면 메뉴, 현재 위치 표시, 권한별 메뉴가 모두 거기서 만들어집니다.", to: "/docs/guide/routing" },
  { pkg: "hooks", title: "Search state in the URL", body: "목록의 검색어, 필터, 페이지를 주소에 담아 새로고침하거나 링크를 공유해도 같은 화면이 열립니다.", to: "/docs/guide/url-state" },
  { pkg: "axios", title: "API client", body: "토큰 첨부, 401 처리, 오류 메시지 정리, 민감한 값을 가린 요청 로그를 한 곳에서 설정합니다.", to: "/docs/guide/http-client" }
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

  const error = tried && !email.includes("@") ? "메일 형식이 아닙니다" : undefined;

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
          <TxTag>React 18+</TxTag>
          <TxTag>TypeScript</TxTag>
        </div>

        <h1 className="max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">
          서비스 개발에 필요한 <span style={{ color: "var(--tx-color-primary-strong)" }}>React 라이브러리</span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300">
          여러 프로젝트에서 반복해 쓰던 코드를 재사용할 수 있도록, <strong>쓰기 쉽고 바꾸기 쉽게</strong> 만들었습니다.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/docs/start" className="tx-button" data-variant="primary">
            <span className="tx-button__label">Getting Started</span>
          </Link>

          {/* 설치 한 줄. 복사는 우리 부품이 한다 */}
          <div className="flex max-w-full min-w-0 items-center gap-2 rounded-lg border px-3 py-1.5" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }}>
            <code className="min-w-0 overflow-x-auto font-mono text-sm whitespace-nowrap">pnpm add @txstack/ui</code>
            <TxCopyButton value="pnpm add @txstack/ui" variant="ghost" className="text-xs" />
          </div>

          {/* 아직 npm 에 없다. 그대로 따라 치면 실패하므로 지금 설치하는 길로 보낸다 */}
          <Link to="/docs/start#2-install" className="text-sm text-slate-500 underline dark:text-slate-400">
            npm 배포 준비 중 — 지금 설치하는 방법
          </Link>
        </div>
      </section>

      {/* --- 왜 만들었나 ---------------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Why txstack</h2>
          <p className="text-slate-600 dark:text-slate-300">실제 서비스를 개발하면서 반복되던 코드에서 출발했습니다.</p>
        </header>

        <ol className="grid gap-3 md:grid-cols-3">
          {STORY.map((step, index) => (
            <li key={step.title} className="site-card flex flex-col gap-2 rounded-lg border p-4">
              <span className="font-mono text-xs font-semibold text-[color:var(--tx-color-primary-strong)]">0{index + 1}</span>
              <span className="font-semibold">{step.title}</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{step.body}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* --- 원칙 ------------------------------------------------------------ */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Three principles</h2>

        <div className="grid gap-3 md:grid-cols-3">
          {PRINCIPLES.map((item) => (
            <LinkCard key={item.title} to={item.to} title={item.title}>
              {item.body}
            </LinkCard>
          ))}
        </div>
      </section>

      {/* --- 주요 기능 -------------------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Key features</h2>
          <p className="text-slate-600 dark:text-slate-300">카드를 누르면 해당 기능의 가이드로 이동합니다. 가이드의 예제는 페이지 안에서 직접 써 볼 수 있습니다.</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item) => (
            <LinkCard key={item.title} to={item.to} title={item.title} aside={<span className="font-mono text-xs text-slate-500 dark:text-slate-400">{item.pkg}</span>}>
              {item.body}
            </LinkCard>
          ))}
        </div>
      </section>

      {/* --- 코드와 결과를 나란히 --------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">@txstack/ui example</h2>
          <p className="text-slate-600 dark:text-slate-300">
            <code>TxForm</code>으로 입력란, 오류 메시지, 제출 버튼을 묶은 가입 폼입니다.
          </p>
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

        <LinkCardGrid>
          {PACKAGES.map((item) => (
            <LinkCard key={item.name} to={item.to} title={<span className="font-mono text-sm">{item.name}</span>} aside={<TxTag>{item.tag}</TxTag>}>
              {item.what}
            </LinkCard>
          ))}
        </LinkCardGrid>
      </section>

      {/* --- 이 사이트가 증거다 ---------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">This site is built with txstack</h2>
          <p className="text-slate-600 dark:text-slate-300">
            지금 보고 계신 화면의 틀, 메뉴, 버튼, 카드가 모두 txstack 컴포넌트입니다. 사이트의 색과 모서리 모양은 컴포넌트를 고치지 않고, <strong>아래처럼 CSS 변수 몇 줄만 지정해서</strong> 바꿨습니다.
          </p>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <CodeBlock title="theme.css" language="css">{`:root {
  --tx-color-primary: #2dd4bf;      /* 채움 색 — 라이트·다크 공통 */
  --tx-color-on-accent: #04231f;    /* 채움 위의 글자는 어둡게 */
  --tx-color-primary-strong: #0f766e;    /* 글자·테두리용 진한 색 */
  --tx-radius: 0.375rem;            /* 모서리 반경 */
}`}</CodeBlock>

          <TxAlert variant="info" title="디자인을 바꾸려고 컴포넌트를 고칠 필요가 없습니다">
            색, 글자, 간격 같은 디자인 값을 CSS 변수로 열어 두었습니다. 변수만으로 바꿀 수 없는 부분이 생기면, 라이브러리에 변수를 더해서 해결합니다.
          </TxAlert>
        </div>
      </section>
    </div>
  );
}
