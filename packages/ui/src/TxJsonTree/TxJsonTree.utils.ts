import type { TxJsonPath, TxJsonType } from "./TxJsonTree.types";

/**
 * 값의 타입을 가른다. **`null` 은 `typeof` 로 `"object"` 라서 먼저 걸러야 한다.**
 *
 * JSON 이 아닌 것(`undefined` · 함수 · `Date` …)이 섞여 들어올 수 있다 — 소비자가
 * 넘기는 것은 응답 객체지 검증된 JSON 이 아니다. 그런 것은 `"string"` 으로 보고
 * 그리는 쪽에서 `String(value)` 로 보여 준다. **빠뜨리는 것보다 보이는 것이 낫다.**
 */
export function getJsonType(value: unknown): TxJsonType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";

  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean") return type;
  if (type === "object") return "object";

  return "string";
}

/** 안에 다른 줄을 품는 타입인가. */
export function isBranch(value: unknown): value is Record<string, unknown> | unknown[] {
  const type = getJsonType(value);
  return type === "object" || type === "array";
}

/**
 * 경로를 하나의 문자열로 만든다. 펼침 상태와 반짝임을 이것으로 짚는다.
 *
 * 배열 인덱스로 React `key` 를 삼으면 한 줄을 지웠을 때 펼침·편집 상태가 **엉뚱한 줄로
 * 옮겨 간다.** 원본이 그랬다. 경로로 짚으면 그런 일이 없다.
 */
export function pathKey(path: TxJsonPath): string {
  return JSON.stringify(path);
}

/** 그 타입의 빈 값. 새 줄을 만들 때 쓴다. */
export function emptyOf(type: TxJsonType): unknown {
  switch (type) {
    case "string":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "null":
      return null;
    case "array":
      return [];
    case "object":
      return {};
  }
}

/** 원본을 건드리지 않고 한 겹 복사한다. */
function copy(node: unknown): Record<string, unknown> | unknown[] {
  return Array.isArray(node) ? [...node] : { ...(node as Record<string, unknown>) };
}

/**
 * 경로가 가리키는 자리에 값을 놓는다. **원본은 그대로 두고 새 것을 낸다** —
 * 지나온 길만 복사하므로 손대지 않은 가지는 참조가 유지된다.
 */
export function setIn(data: unknown, path: TxJsonPath, value: unknown): unknown {
  if (path.length === 0) return value;

  const [head, ...rest] = path;
  const next = copy(data);

  // 배열이면 인덱스, 객체면 키. 경로가 그 구분을 들고 있다
  (next as Record<string | number, unknown>)[head] = setIn((data as Record<string | number, unknown>)?.[head], rest, value);
  return next;
}

/** 경로가 가리키는 줄을 지운다. 배열이면 자리도 함께 당겨진다. */
export function removeIn(data: unknown, path: TxJsonPath): unknown {
  if (path.length === 0) return data;

  const parentPath = path.slice(0, -1);
  const last = path[path.length - 1];
  const parent = getIn(data, parentPath);

  if (Array.isArray(parent)) {
    const next = parent.filter((_, index) => index !== Number(last));
    return setIn(data, parentPath, next);
  }

  const next = { ...(parent as Record<string, unknown>) };
  delete next[String(last)];
  return setIn(data, parentPath, next);
}

/** 경로가 가리키는 값을 읽는다. 없으면 `undefined`. */
export function getIn(data: unknown, path: TxJsonPath): unknown {
  return path.reduce<unknown>((node, step) => (node == null ? undefined : (node as Record<string | number, unknown>)[step]), data);
}

/**
 * 이전 값과 견주어 **달라진 자리**를 모은다. `watch` 가 반짝일 줄을 여기서 얻는다.
 *
 * 사라진 줄은 담지 않는다 — 반짝일 자리가 이미 없다.
 */
export function diffPaths(prev: unknown, next: unknown, path: TxJsonPath = [], out: TxJsonPath[] = []): TxJsonPath[] {
  if (Object.is(prev, next)) return out;

  const prevType = getJsonType(prev);
  const nextType = getJsonType(next);

  // 타입이 바뀌었으면 그 줄이 통째로 바뀐 것이다. 안쪽까지 파고들지 않는다
  if (prevType !== nextType || !isBranch(next)) {
    out.push(path);
    return out;
  }

  if (Array.isArray(next)) {
    const prevArray = prev as unknown[];

    next.forEach((item, index) => {
      // 늘어난 자리는 견줄 것이 없다. 새로 생긴 줄이다
      if (index >= prevArray.length) out.push([...path, index]);
      else diffPaths(prevArray[index], item, [...path, index], out);
    });

    return out;
  }

  const prevObject = prev as Record<string, unknown>;
  const nextObject = next as Record<string, unknown>;

  for (const key of Object.keys(nextObject)) {
    if (!(key in prevObject)) out.push([...path, key]);
    else diffPaths(prevObject[key], nextObject[key], [...path, key], out);
  }

  return out;
}
