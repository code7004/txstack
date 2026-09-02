import { Link } from "react-router-dom";

/** `/about` 의 인덱스 화면. */
export function AboutHome() {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">About</h1>
        <p className="text-slate-600 dark:text-slate-300">만든 사람과, 묻고 답하는 자리.</p>
      </header>

      <ul className="list-inside list-disc text-slate-600 dark:text-slate-300">
        <li>
          <Link to="/about/profile" className="underline">
            Profile
          </Link>{" "}
          — 만든 사람과 만든 이유
        </li>
        <li>
          <Link to="/about/contact" className="underline">
            Contact
          </Link>{" "}
          — 질문 · 제안 · 버그
        </li>
      </ul>
    </>
  );
}
