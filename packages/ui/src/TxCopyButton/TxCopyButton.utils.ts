/**
 * **내부 전용.** 글자를 클립보드에 넣는다.
 *
 * `navigator.clipboard` 는 **보안 컨텍스트(https · localhost)에서만** 있다.
 * 사내 도구가 평문 http 로 뜨는 일이 흔한데 거기서는 아예 없으므로, 그때는
 * 숨긴 `<textarea>` 와 `execCommand` 로 물러선다 — 낡았지만 **그 자리에서는 유일한 길**이다.
 */
export async function writeToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 권한이 없거나 창이 포커스를 잃은 경우다. 아래로 한 번 더 시도한다
    }
  }

  if (typeof document === "undefined") return false;

  const area = document.createElement("textarea");
  area.value = text;
  // 화면 밖에 두되 `display: none` 은 안 된다 — 선택할 수 없으면 복사도 안 된다
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-9999px";
  area.style.opacity = "0";

  document.body.append(area);
  area.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}
