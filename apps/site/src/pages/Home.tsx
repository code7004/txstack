import { Link } from "react-router-dom";
import { TxCopyButton, TxTag } from "@txstack/ui";
import type { CSSProperties } from "react";
import { LinkCard } from "../components/LinkCard";
import { PUBLISHED, PrePublishNote } from "../components/PrePublish";
import { Used } from "../components/Used";
import { HomePreview } from "./home/HomePreview";
import { RouteMenuDemo } from "./home/RouteMenuDemo";
import { ThemeTry } from "./home/ThemeTry";
import { UiGroups } from "./home/UiGroups";

/**
 * **제공하는 UI → 실제로 만드는 화면 → 함께 쓰는 도구 → 설계 배경** 순서다(docs/008).
 * 배경 글보다 실물을 앞에 둔다. 홈은 AG Grid 와 외부 요청을 불러오지 않는다 — 큰 표와 진짜 요청은 Example 이 맡는다.
 */

/** 네 패키지. 다 설치할 필요가 없다 — 필요한 때만 고른다 */
const PACKAGES = [
  { name: "@txstack/ui", when: "버튼 · 폼 · 표 · 메뉴 등 화면 부품이 필요할 때", extra: "표는 ag-grid, 달력은 react-day-picker를 쓸 때만 추가", to: "/api/ui" },
  { name: "@txstack/route-meta", when: "라우트 정의 하나로 메뉴와 지금 위치를 함께 관리할 때", extra: "react-router-dom", to: "/api/route-meta" },
  { name: "@txstack/hooks", when: "객체 상태나 URL 검색 조건을 관리할 때", extra: "URL 상태는 react-router-dom", to: "/api/hooks" },
  { name: "@txstack/axios", when: "인증 · 응답 · 오류 처리 정책을 HTTP 클라이언트에 연결할 때", extra: "axios. React 없이도 동작", to: "/api/axios" }
];

/** 왜 이렇게 만들었나. 프로젝트 이름은 싣지 않는다 — 공개 사이트다 */
const PRINCIPLES = [
  { title: "Extracted from real services", body: "여러 서비스가 각자 복사해 쓰던 UI와 HTTP 설정에서 공통된 부분만 꺼냈습니다. 어느 서비스의 도메인도 모르는 라이브러리가 기준입니다.", to: "/about/case-study" },
  { title: "Design through tokens", body: "디자인은 CSS 변수로 바꿉니다. 컴포넌트를 고치지 않고, 다크 모드도 같은 방식으로 바뀝니다. 이 사이트도 변수만으로 꾸몄습니다.", to: "/docs/guide/styling" },
  { title: "The app owns the policy", body: "인증 토큰, 401 처리, 응답 형식, 메뉴 권한처럼 서비스마다 다른 규칙은 라이브러리가 정하지 않고 앱이 넘깁니다.", to: "/docs/guide/http-client" }
];

export function Home() {
  return (
    <div className="flex flex-col gap-16">
      {/* --- 1. 소개 + 대표 데모 + 주요 행동 ------------------------------------- */}
      <section className="grid items-start gap-8 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <TxTag>MIT</TxTag>
            <TxTag>React 18+</TxTag>
            <TxTag>TypeScript</TxTag>
          </div>

          {/* 첫 화면은 짧게 — 정체(UI)와 대표 장점(라우트 하나로 두 메뉴)만 둔다. 디자인 · URL 상태 · HTTP 는 아래 구역이 맡는다(docs/009) */}
          <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">
            관리 화면을 만드는 <span style={{ color: "var(--tx-color-primary-strong)" }}>React UI</span>와 도구
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300">
            폼 · 표 · 모달 · 레이아웃을 조립하고,{" "}
            <a href="#routes-to-menus" className="underline">
              라우트 설정 하나로 GNB와 사이드바
            </a>
            를 관리하세요.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/docs/components" className="tx-button" data-variant="primary">
              <span className="tx-button__label">UI 둘러보기</span>
            </Link>
            <Link to="/docs/start" className="tx-button" data-variant="secondary">
              <span className="tx-button__label">시작하기</span>
            </Link>
          </div>

          {/* 설치. 배포 전에는 복사 버튼 대신 지금 설치하는 길로 보낸다 — 배포 후 명령을 먼저 복사하면 실패한다 */}
          {PUBLISHED ? (
            <div className="flex w-full max-w-md min-w-0 items-center gap-2 rounded-lg border px-3 py-1.5" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }}>
              <code className="min-w-0 flex-1 overflow-x-auto font-mono text-sm whitespace-nowrap">pnpm add @txstack/ui</code>
              <TxCopyButton value="pnpm add @txstack/ui" variant="ghost" className="shrink-0 text-xs" style={{ "--tx-copy-button-min-width": "5rem" } as CSSProperties} />
            </div>
          ) : (
            <PrePublishNote standalone />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="rounded-lg border p-4" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }}>
            <HomePreview />
          </div>
          <Used names={["TxSearchInput", "TxDropdown", "TxTag", "TxModal", "TxForm", "TxToast", "TxSkeleton", "TxEmptyState", "TxAlert"]} />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            큰 표 · 옆 패널 편집 · 서버 정렬까지 갖춘 화면은{" "}
            <Link to="/example/accounts" className="underline">
              Example › Accounts
            </Link>
            에 있습니다.
          </p>
        </div>
      </section>

      {/* --- 2. 기능군별 UI ---------------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">What's in the UI</h2>
          <p className="text-slate-600 dark:text-slate-300">기능군마다 실제로 동작하는 작은 예시입니다. 컴포넌트 이름을 누르면 API 목록으로, 거기서 Storybook의 props로 이어집니다.</p>
        </header>
        <UiGroups />
      </section>

      {/* --- 3. 라우트 하나로 GNB · 사이드바 -------------------------------------- */}
      <section id="routes-to-menus" className="site-anchor flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">One route tree, both menus</h2>
          <p className="text-slate-600 dark:text-slate-300">
            <strong>라우트 한 곳에 정의하고, GNB와 사이드바를 함께 구성하세요.</strong> 경로와 메뉴 이름, 하위 메뉴를 메타데이터 트리로 선언합니다. 같은 트리에서 라우터와 메뉴 데이터를 만들고, UI 컴포넌트에 연결해 상단 메뉴와 사이드바를 구성합니다.
            메뉴를 추가하거나 이름을 바꿀 때도 이 설정 한 곳만 고칩니다.
          </p>
        </header>
        <RouteMenuDemo />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <code>route-meta</code>는 라우트 변환과 메뉴 데이터를 만들고, 메뉴를 그리는 일은 UI 컴포넌트와 위의 짧은 연결 코드가 합니다. 권한은 메뉴에서 항목을 거르는 데까지입니다. 이 사이트의 메뉴도 같은 방식으로 구성했습니다 —{" "}
          <Link to="/docs/guide/routing" className="underline">
            Routing & Menu
          </Link>
          ,{" "}
          <Link to="/example/routes" className="underline">
            Example › Routes
          </Link>
          .
        </p>
      </section>

      {/* --- 3. 디자인 바꾸기 --------------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Change the design with tokens</h2>
          <p className="text-slate-600 dark:text-slate-300">
            강조색과 모서리, 다크 모드를 바꿔 보세요. 컴포넌트는 그대로 두고 CSS 변수만 바꿉니다. 자세한 방법은{" "}
            <Link to="/docs/guide/styling" className="underline">
              Styling
            </Link>
            과{" "}
            <Link to="/docs/guide/dark-mode" className="underline">
              Dark mode
            </Link>
            에 있습니다.
          </p>
        </header>
        <ThemeTry />
      </section>

      {/* --- 4. 네 패키지 --------------------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Pick only what you need</h2>
          <p className="text-slate-600 dark:text-slate-300">네 패키지는 따로 설치합니다. UI만 써도 되고, 필요한 도구만 더하면 됩니다.</p>
        </header>

        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
          <table className="site-stack-table w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--tx-color-muted)" }}>
                <th className="px-3 py-2 text-start font-semibold">패키지</th>
                <th className="px-3 py-2 text-start font-semibold">이럴 때</th>
                <th className="px-3 py-2 text-start font-semibold">함께 설치</th>
              </tr>
            </thead>
            <tbody>
              {PACKAGES.map((item) => (
                <tr key={item.name} className="border-t align-top" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Link to={item.to} className="font-mono text-xs font-semibold underline">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{item.when}</td>
                  <td data-label="함께 설치" className="px-3 py-2 text-slate-500 dark:text-slate-400">
                    {item.extra}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          <code>route-meta</code>의 권한은 <strong>메뉴에서 항목을 거르는 일</strong>까지입니다. 주소로 직접 들어오는 것을 막는 페이지 접근 제어와 서버의 권한 검증은 앱과 서버가 맡습니다.
        </p>
      </section>

      {/* --- 5. 완성된 화면과 시작하기 -------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">See it in a real screen</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <LinkCard to="/example/app" title="Example">
            대시보드 · 계정 · 오류 로그를 묶은 운영 관리 화면. 검색 · 편집 · 저장 · 실패까지
          </LinkCard>
          <LinkCard to="/docs/tutorial" title="Tutorial">
            네 패키지로 목록 화면 하나를 처음부터 만들어 앱으로 띄우기까지
          </LinkCard>
          <LinkCard to="/docs/start" title="Getting Started">
            필요한 패키지를 고르고 설치해 첫 화면을 띄우기
          </LinkCard>
        </div>
      </section>

      {/* --- 6. 배경과 설계 원칙 -------------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Why txstack</h2>
          <p className="text-slate-600 dark:text-slate-300">
            실제 서비스를 개발하면서 반복되던 코드에서 출발했습니다. 무엇을 왜 나눴고 어떤 결함을 어떻게 고쳤는지는{" "}
            <Link to="/about/case-study" className="underline">
              Case Study
            </Link>
            에 있습니다.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-3">
          {PRINCIPLES.map((item) => (
            <LinkCard key={item.title} to={item.to} title={item.title}>
              {item.body}
            </LinkCard>
          ))}
        </div>
      </section>
    </div>
  );
}
