/**
 * 제목 글자를 주소 조각(`#…`)으로. **"이 페이지에서" 목차와 사이트 검색이 같은 함수를 쓴다** —
 * 둘이 다르게 만들면 검색 결과를 눌렀을 때 그 제목으로 가지 못한다.
 *
 * 한글은 그대로 둔다. 브라우저가 알아서 인코딩한다.
 */
export const slug = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");

/**
 * 한 페이지의 제목들을 앵커로. 같은 글자의 제목이 둘이면 뒤에 번호를 붙인다(`try-it`, `try-it-2`).
 * 비어 있는 제목은 `section` 이 된다.
 */
export function anchorsOf(titles: string[]): string[] {
  const seen = new Map<string, number>();

  return titles.map((title) => {
    const base = slug(title) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count + 1}` : base;
  });
}
