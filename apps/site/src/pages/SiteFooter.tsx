import { Link } from "react-router-dom";
import { STORYBOOK_TARGET, STORYBOOK_URL } from "../lib/links";

const PACKAGES = [
  ["@txstack/ui", "/api/ui"],
  ["@txstack/route-meta", "/api/route-meta"],
  ["@txstack/hooks", "/api/hooks"],
  ["@txstack/axios", "/api/axios"],
  ["@txstack/fns", "/api/fns"]
] as const;

const DOCS = [
  ["Getting Started", "/docs/start"],
  ["Tutorial", "/docs/tutorial"],
  ["Guide", "/docs/guide"],
  ["Components", "/docs/components"]
] as const;

const Column = ({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) => (
  <nav aria-label={title} className="flex flex-col gap-2">
    <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">{title}</h2>
    {links.map(([label, to]) => (
      <Link key={to} to={to} className="text-sm hover:underline">
        {label}
      </Link>
    ))}
  </nav>
);

/**
 * 셸의 `footer` 자리에 들어간다. **맨 아래 줄은 셸이 그리고**(경계선 · 자리),
 * 그 안의 배치는 여기가 정한다.
 */
export function SiteFooter() {
  return (
    <div className="flex flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap gap-10">
        <div className="flex min-w-56 flex-col gap-2">
          <span className="font-mono text-sm font-semibold">txstack</span>
          <p className="text-sm text-slate-500 dark:text-slate-400">관리 화면과 서비스를 위한 React 라이브러리. 여러 프로젝트에서 재사용할 수 있도록 쓰기 쉽고 바꾸기 쉽게 만들었습니다.</p>
        </div>

        <Column title="Packages" links={PACKAGES} />
        <Column title="Documents" links={DOCS} />

        <nav aria-label="Links" className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">Links</h2>
          <a href="https://github.com/code7004/txstack" className="text-sm hover:underline" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={STORYBOOK_URL} className="text-sm hover:underline" target={STORYBOOK_TARGET}>
            Storybook — 컴포넌트 props ↗
          </a>
          <Link to="/about/contact" className="text-sm hover:underline">
            Contact
          </Link>
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span>MIT License</span>
        <span aria-hidden>·</span>
        <span>Built with txstack</span>
      </div>
    </div>
  );
}
