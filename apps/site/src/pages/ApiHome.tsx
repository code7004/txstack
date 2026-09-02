import { Link } from "react-router-dom";

const PACKAGES = [
  { to: "/api/ui", name: "@txstack/ui", what: "Tx* 컴포넌트 49종" },
  { to: "/api/route-meta", name: "@txstack/route-meta", what: "라우트를 메타데이터 트리 하나로" },
  { to: "/api/hooks", name: "@txstack/hooks", what: "범용 훅과 URL 쿼리 상태" },
  { to: "/api/axios", name: "@txstack/axios", what: "정책 주입식 HTTP 클라이언트" }
];

/** `/api` 의 인덱스 화면. */
export function ApiHome() {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">API</h1>
        <p className="text-slate-600 dark:text-slate-300">각 패키지가 무엇을 내보내는지. 왼쪽에서 패키지를 고른다.</p>
      </header>

      <ul className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
        {PACKAGES.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="underline">
              {item.name}
            </Link>{" "}
            — {item.what}
          </li>
        ))}
      </ul>
    </>
  );
}
