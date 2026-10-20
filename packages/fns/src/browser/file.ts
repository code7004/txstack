/**
 * 파일 읽기 · 내려받기. **브라우저 전용**이다.
 *
 * ```ts
 * import * as file from "@txstack/fns/browser/file";
 * const text = await file.readText(input.files[0]);
 * file.download("numbers.txt", ["01012345678", "01087654321"]);
 * ```
 */

/** `<input type="file">` 로 고른 파일을 글자로 읽는다 */
export function readText(source: Blob): Promise<string> {
  // Blob.text() 는 오래된 Safari(<14)에 없어 FileReader 로 읽는다
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("파일을 읽지 못했습니다"));
    reader.readAsText(source);
  });
}

/**
 * 내용을 파일로 내려받게 한다. 문자열 배열은 앞뒤 공백을 지우고 빈 줄을 뺀 뒤 줄바꿈으로 잇는다.
 * 파일 이름은 **확장자까지** 준다.
 *
 * @returns 내려받을 내용이 없으면(빈 배열 · 빈 문자열) 아무것도 하지 않고 `false`
 */
export function download(filename: string, content: string | readonly string[] | Blob, type: string = "text/plain;charset=utf-8"): boolean {
  const blob =
    content instanceof Blob
      ? content
      : new Blob(
          [
            typeof content === "string"
              ? content
              : content
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .join("\n")
          ],
          { type }
        );
  if (blob.size === 0) return false;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return true;
}
