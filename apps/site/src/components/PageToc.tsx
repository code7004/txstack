import { useEffect, useState, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { anchorsOf } from "../lib/slug";

interface Heading {
  id: string;
  text: string;
}

/** 세 개 미만이면 목차가 오히려 군더더기다 */
const MIN_HEADINGS = 3;

/**
 * "이 페이지에서". **본문의 `h2` 를 읽어 만든다** — 장마다 목차를 손으로 적으면 제목을 고칠 때
 * 반드시 어긋난다.
 *
 * 넓은 화면에서만 오른쪽에 선다. 좁은 화면은 본문 폭이 먼저다.
 */
export function PageToc({ root }: { root: RefObject<HTMLElement | null> }) {
  const { pathname } = useLocation();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>();

  // 화면이 바뀌면 제목을 다시 읽는다. 앵커는 사이트 검색과 같은 규칙으로 만든다(lib/slug)
  useEffect(() => {
    const nodes = Array.from(root.current?.querySelectorAll<HTMLHeadingElement>("h2") ?? []);
    const ids = anchorsOf(nodes.map((node) => node.textContent ?? ""));

    setHeadings(
      nodes.map((node, index) => {
        node.id ||= ids[index]!;
        return { id: node.id, text: node.textContent ?? "" };
      })
    );
  }, [pathname, root]);

  // 지금 읽고 있는 제목. 화면 위쪽 1/3 을 지난 마지막 제목이다
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
      {headings.map(({ id, text }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={active === id ? "location" : undefined}
          className="site-toc__link border-s-2 py-1 ps-3"
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
