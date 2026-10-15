import { Link } from "react-router-dom";
import { componentRowAnchor } from "../pages/api/data";

/** 이 예제에 쓴 컴포넌트. 누르면 API › ui 의 그 줄로 간다 */
export function Used({ names, label = "쓴 컴포넌트" }: { names: string[]; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      {names.map((name) => (
        <Link key={name} to={`/api/ui#${componentRowAnchor(name)}`} className="site-card rounded border px-1.5 py-0.5 font-mono">
          {name}
        </Link>
      ))}
    </div>
  );
}
