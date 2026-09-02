import { Section } from "./Section";

/** 진짜 요청을 부르는 화면이 여기 온다 — `@txstack/axios` 와 `@txstack/hooks` 의 검증 자리다. */
export function Examples() {
  return (
    <Section title="Examples">
      <p className="text-slate-600 dark:text-slate-300">공개 API 를 실제로 불러 목록 · 검색 · 쪽 번호를 돌려 보는 화면이 들어온다. 조회 조건은 주소에 실려 뒤로가기가 동작한다.</p>
    </Section>
  );
}
