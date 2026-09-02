import { Link } from "react-router-dom";

const PACKAGES = [
  ["@txstack/ui", "/api/ui"],
  ["@txstack/route-meta", "/api/route-meta"],
  ["@txstack/hooks", "/api/hooks"],
  ["@txstack/axios", "/api/axios"]
] as const;

const DOCS = [
  ["Getting Started", "/docs/start"],
  ["Guide", "/docs/guide"],
  ["Components", "/docs/components"],
  ["Tutorial", "/docs/tutorial"]
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
          <p className="text-sm text-slate-500 dark:text-slate-400">여러 프로젝트에서 다시 쓰는 React 라이브러리. 부품은 쉽게 쓰고 쉽게 바꾸며, 정책은 앱이 정한다.</p>
        </div>

        <Column title="Packages" links={PACKAGES} />
        <Column title="Documents" links={DOCS} />

        <nav aria-label="Links" className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">Links</h2>
          <a href="https://github.com/code7004/txstack" className="text-sm hover:underline" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="/storybook/" className="text-sm hover:underline" target="_blank" rel="noreferrer">
            Storybook
          </a>
          <Link to="/about/contact" className="text-sm hover:underline">
            Contact
          </Link>
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span>MIT License</span>
        <span aria-hidden>·</span>
        <span>이 사이트도 txstack 으로 만들었다</span>
      </div>
    </div>
  );
}
