import { buildRouteObjects, getNavigableRoutes, useCurrentRouteNode, type NavRoute } from "@txstack/route-meta";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation, useRoutes } from "react-router-dom";
import { TxAppShell, TxButton, TxNavBar, TxSideNav } from "@txstack/ui";
import { DocPager } from "./components/DocPager";
import { PageToc } from "./components/PageToc";
import { SiteFooter } from "./pages/SiteFooter";
import { SiteSearch } from "./search/SiteSearch";
import { routes } from "./routes";

/**
 * **모듈 상수로 둔다.** 렌더마다 다시 만들면 라우터가 매번 트리를 읽고,
 * `useCurrentRouteNode` 의 반환도 매번 새 객체가 된다.
 */
const ROUTE_OBJECTS = buildRouteObjects(routes);
const MENU = getNavigableRoutes(routes);

const STORAGE_KEY = "txstack-site-theme";

/** 다크모드는 `<html class="dark">` 토글이다. 어느 시점에 켤지는 앱이 정한다. */
function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark((prev) => !prev) };
}

/** 가로 줄 한 칸. 그냥 링크다 — 하위는 줄이 함께 쓰는 패널(`SITE_MAP`)이 한꺼번에 보여 준다. */
const barItem = (item: NavRoute) => <TxNavBar.Item key={item.key} label={item.meta?.label ?? item.key} as={NavLink} to={item.path} />;

/** 패널 속 링크 한 줄. 자식이 있으면 그 아래로 한 단 들여 이어 간다(`Guide › Tokens`) */
const mapLink = (item: NavRoute): ReactNode => (
  <li key={item.key} className="flex flex-col gap-0.5">
    <NavLink to={item.path} className="site-map__link">
      {item.meta?.label ?? item.key}
    </NavLink>
    {item.children && <ul className="flex flex-col gap-0.5 border-s ps-3 site-map__nest">{item.children.map(mapLink)}</ul>}
  </li>
);

/**
 * **어느 칸에 얹어도 사이트 전체가 한 판에 펼쳐진다** — 줄의 `panel` 이다. 묶음 하나가 한 열이고,
 * 제목도 링크다. 하위가 없는 묶음(`Example`)은 설명을 대신 둔다.
 *
 * 이 판은 **마우스 전용 지름길**이다. 키보드 · 터치로는 열리지 않으므로, 여기 있는 링크는 전부
 * 각 묶음의 인덱스 화면(`/docs` 등)에서도 닿는다 — 그 규칙을 지키는 것은 사이트 몫이다.
 */
const SITE_MAP = (
  <div className="grid grid-cols-4 gap-8">
    {MENU.filter((section) => section.path !== "/").map((section) => (
      <section key={section.key} className="flex flex-col gap-2">
        <NavLink to={section.path} className="site-map__title">
          {section.meta?.label ?? section.key}
        </NavLink>
        {section.children ? <ul className="flex flex-col gap-0.5">{section.children.map(mapLink)}</ul> : <p className="text-sm text-slate-500 dark:text-slate-400">{section.meta?.description}</p>}
      </section>
    ))}
  </div>
);

/**
 * 왼쪽 줄 한 칸. **자식이 있으면 펼치는 항목**이 된다 — `Documents › Guide › Tokens` 처럼
 * 세 단까지 간다. 자식을 가진 항목은 스스로 링크가 되지 않으므로, 그 화면으로 가는 길은
 * 가로 줄의 패널이 맡는다.
 */
const sideItem = (item: NavRoute): ReactNode =>
  item.children ? (
    <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} defaultOpen>
      {item.children.map(sideItem)}
    </TxSideNav.Item>
  ) : (
    <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} as={NavLink} to={item.path} />
  );

/**
 * **화면이 바뀌면 맨 위에서 시작한다.** 브라우저는 SPA 의 주소 변경을 새 문서로 보지 않아
 * 앞 화면의 스크롤 위치를 그대로 둔다 — "다음 장" 을 누르면 다음 장의 중간에 떨어진다.
 * 주소에 조각(`#…`)이 있으면 그 제목으로 간다.
 */
function useScrollReset() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
}

/**
 * 셸이 왼쪽 줄을 서랍으로 넣는 폭. **셸의 `breakpoint` 기본값과 같아야 한다** — 어긋나면
 * 가로 줄이 사라졌는데 서랍은 아직 안 생기는 틈이 생긴다.
 */
const NARROW = 960;

function useNarrow() {
  const query = `(max-width: ${NARROW - 1}px)`;
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setNarrow(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return narrow;
}

const SITE_NAME = "txstack";

/**
 * 지금 자리. 하위 항목(왼쪽 줄)과 탭 제목이 여기서 나온다.
 *
 * **탭 제목은 트리의 `label` 을 쓴다** — 탭이 여럿 열려 있으면 제목만으로 구분해야 한다.
 * 인덱스 화면은 자기 `meta` 가 없으므로 그 묶음의 이름을 쓴다. 없는 주소(`hidden`)도 제목은 갖는다.
 */
function useCurrentPlace() {
  const { matches } = useCurrentRouteNode(routes);
  const top = matches[0];

  // 가까운 쪽부터 이름 둘 — 자기 이름과 바로 위 묶음의 이름
  const [label, section] = [...matches]
    .reverse()
    .map((node) => node.meta?.label)
    .filter((name, index, all): name is string => !!name && all.indexOf(name) === index);
  const home = top?.path === "/";

  useEffect(() => {
    // `ui` 처럼 짧은 이름은 묶음을 붙여야 탭에서 읽힌다 — "ui · API"
    const place = section ? `${label} · ${section}` : label;
    document.title = !place || home ? `${SITE_NAME} — 서비스 개발에 필요한 React 라이브러리` : `${place} — ${SITE_NAME}`;
  }, [label, section, home]);

  return { home, sub: MENU.find((item) => item.path === top?.path)?.children };
}

function Layout({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme();
  const { home, sub } = useCurrentPlace();
  const narrow = useNarrow();
  const body = useRef<HTMLDivElement>(null);
  useScrollReset();

  return (
    <TxAppShell
      header={
        <div className="flex w-full items-center gap-3">
          {/* 이름은 모노스페이스로 — 도구라는 신호가 여기서 먼저 온다 */}
          <NavLink to="/" className="font-mono text-base font-semibold tracking-tight">
            TXSTACK
          </NavLink>

          <div className="ms-auto flex items-center gap-1">
            {/* 사이트 검색 — 페이지 · 섹션 · API 항목. 색인은 코드에 이미 있는 것을 모은다(search/searchIndex) */}
            <SiteSearch narrow={narrow} />
            <a href="https://github.com/code7004/txstack" className="rounded px-3 py-2 text-sm hover:underline" target="_blank" rel="noreferrer">
              GitHub
            </a>
            {/* 아이콘 하나로 줄여 헤더가 붐비지 않게 한다. 이름은 스크린리더가 읽는다 */}
            <TxButton label={dark ? "☀" : "☾"} aria-label={dark ? "밝게" : "어둡게"} variant="ghost" onClick={toggle} />
          </div>
        </div>
      }
      /*
       * **좁은 화면에서는 가로 줄을 내리고 서랍 하나로 모은다.** 셸은 왼쪽 줄만 서랍으로 넣고
       * 가로 줄은 그대로 두는데, 다섯 칸이 폰 폭에 안 들어가 옆으로 넘친다. 그래서 서랍에
       * 트리 전체를 그린다 — Home 처럼 하위 항목이 없는 화면에서도 ☰ 가 생긴다.
       */
      top={!narrow && <TxNavBar panel={SITE_MAP}>{MENU.map(barItem)}</TxNavBar>}
      /* 넓을 때는 하위 항목이 있는 섹션에서만 왼쪽 줄이 선다 — 없는 화면에서 빈 기둥이 남지 않는다 */
      left={
        narrow ? (
          <TxSideNav className="p-3">{MENU.map(sideItem)}</TxSideNav>
        ) : (
          sub && (
            /* 셸의 `left` 는 여백을 정하지 않는다 — 무엇이 들어올지 모르기 때문이다. 여기서 준다 */
            <TxSideNav className="p-3">{sub.map(sideItem)}</TxSideNav>
          )
        )
      }
      /* 맨 아래 줄. 셸이 자리와 경계선을 주고, 안의 배치는 사이트가 정한다 */
      /* 좁을 때 서랍에는 하위가 아니라 전체 메뉴가 든다. 이름도 그에 맞춘다 */
      labels={narrow ? { left: "메뉴" } : undefined}
      footer={<SiteFooter />}
      style={{ "--tx-app-shell-left-width": "13rem" } as React.CSSProperties}
    >
      {/* 본문 + 넓은 화면에서만 서는 "이 페이지에서". 목차는 본문의 h2 를 읽어 만든다 */}
      {/*
       * **글의 폭은 여기 한 곳에서 정한다.** 페이지마다 따로 주면 장을 넘길 때 본문이 출렁인다.
       * Home 은 보여 주는 화면이라 넓게, 문서는 읽는 화면이라 좁게.
       */}
      <div className={`mx-auto flex w-full gap-10 px-4 py-8 sm:px-6 sm:py-10 ${home ? "max-w-6xl" : "max-w-[76rem]"}`}>
        <div ref={body} className={`min-w-0 flex-1 ${home ? "" : "max-w-4xl"}`}>
          {children}
          <DocPager menu={MENU} />
        </div>
        {/* Home 은 둘러보는 화면이라 목차가 오히려 군더더기다 */}
        {!home && <PageToc root={body} />}
      </div>
    </TxAppShell>
  );
}

export function App() {
  const screen = useRoutes(ROUTE_OBJECTS);

  return <Layout>{screen}</Layout>;
}
