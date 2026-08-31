/** **내부 전용.** */

/** 바이트를 사람이 읽는 크기로. */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  // 1024 미만은 소수 한 자리까지만. `1.5 MB` 는 읽히고 `1.4931640625 MB` 는 안 읽힌다
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

/**
 * 줄을 가리키는 값.
 *
 * **파일 이름으로는 안 된다** — 같은 파일을 두 번 고르는 일이 흔하고, 그러면 두 줄이
 * 한 값을 가리켜 하나를 지우면 둘 다 사라진다.
 */
let seq = 0;
export function nextUploadId() {
  seq += 1;
  return `tx-upload-${seq}`;
}

/** **테스트 전용.** 번호를 처음으로 되돌린다. */
export function resetUploadIdForTest() {
  seq = 0;
}
