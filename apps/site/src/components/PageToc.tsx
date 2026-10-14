import { useEffect, useState, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { anchorsOf } from "../lib/slug";

interface Heading {
  id: string;
  text: string;
  /** 소제목(`h3[data-toc]`)이면 한 단 들여 바로 위 제목 아래에 놓는다 */
  sub: boolean;
}

/** 세 개 미만이면 목차가 오히려 군더더기다 */
const MIN_HEADINGS = 3;

/**
 * "이 페이지에서". **본문의 `h2` 를 읽어 만든다** — 장마다 목차를 손으로 적으면 제목을 고칠 때
 * 반드시 어긋난다.
 *
 * 소제목은 **`data-toc` 를 붙인 `h3` 만** 읽는다. 모든 `h3` 를 읽으면 예제 화면 안의 제목까지
 * 목차에 끼어든다 — 목차에 올릴지는 페이지가 정한다.
 *
 * 넓은 화면에서만 오른쪽에 선다. 좁은 화면은 본문 폭이 먼저다.
 */
export function PageToc({ root }: { root: RefObject<HTMLElement | null> }) {
  const { pathname } = useLocation();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>();

  // 화면이 바뀌면 제목을 다시 읽는다. 앵커는 사이트 검색과 같은 규칙으로 만든다(lib/slug)
  useEffect(() => {
    // 창(모달 · 서랍) 안의 제목은 뺀다. 닫혀 있어도 그 제목이 문서에 남아 있어서 목차에 끼어든다
    const nodes = Array.from(root.current?.querySelectorAll<HTMLHeadingElement>("h2, h3[data-toc]") ?? []).filter((node) => !node.closest("dialog, [role='dialog']"));

    // 제목(h2)의 앵커는 사이트 검색과 똑같이 h2 끼리만 센다. 소제목은 따로 세고, 겹치면 뒤에 붙여 가른다
    const titles = nodes.filter((node) => node.tagName === "H2");
    const subs = nodes.filter((node) => node.tagName === "H3");
    const titleIds = anchorsOf(titles.map((node) => node.textContent ?? ""));
    // 소제목은 짧은 이름(data-toc-label)이 있으면 그것으로 보이고 앵커도 만든다
    const label = (node: HTMLElement) => node.dataset.tocLabel ?? node.textContent ?? "";
    const subIds = anchorsOf(subs.map(label)).map((id) => (titleIds.includes(id) ? `${id}-sub` : id));

    setHeadings(
      nodes.map((node) => {
        const sub = node.tagName === "H3";
        node.id ||= sub ? subIds[subs.indexOf(node)]! : titleIds[titles.indexOf(node)]!;
        return { id: node.id, text: sub ? label(node) : (node.textContent ?? ""), sub };
      })
    );
  }, [pathname, root]);

  // 지금 읽고 있는 제목. 화면 위쪽 1/3 을 지난 마지막 제목이다 — 소제목도 함께 센다
  useEffect(() => {
    if (headings.length < MIN_HEADINGS) return;

    const update = () => {
      const line = window.innerHeight / 3;
      let current = headings[0]?.id;

      for (const { id } of headings) {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top < line) current = id;
      }

      setActive(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [headings]);

  if (headings.length < MIN_HEADINGS) return null;

  return (
    <nav aria-label="이 페이지에서" className="site-toc sticky top-28 hidden max-h-[calc(100vh-8rem)] w-48 shrink-0 flex-col gap-1 overflow-y-auto text-sm xl:flex">
      <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">On this page</p>
      {headings.map(({ id, text, sub }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={active === id ? "location" : undefined}
          className={`site-toc__link border-s-2 py-1 ${sub ? "ps-6 text-xs" : "ps-3"}`}
          onClick={(event) => {
            // 라우터를 거치지 않고 그 자리로만 간다. 주소에는 조각을 남겨 공유할 수 있게 한다
            event.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            history.replaceState(history.state, "", `#${id}`);
          }}
        >
          {text}
        </a>
      ))}
    </nav>
  );
}
