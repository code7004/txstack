import { useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

type UrlQueryPrimitive = string | number | boolean;
type UrlQueryRecord = Record<string, unknown>;
type UrlQueryPatch<T extends object> = Partial<T> | ((prev: T) => Partial<T>);
type UrlQuerySetter<T extends object> = (patch: UrlQueryPatch<T>) => void;
type UrlQueryValueType = "string" | "number" | "boolean";

/** `encode: true` 일 때 쿼리 전체가 실리는 키의 기본값. `encodeKey` 로 바꿀 수 있다. */
const DEFAULT_ENCODE_KEY = "_q";

export interface UseUrlQueryOptions<T extends object> {
  /**
   * URL 에 값이 없을 때 사용할 기본값.
   *
   * **반환 상태의 키 집합이 이 객체로 결정된다.** 훅이 `{ ...defaults, ...url }` 를 `T` 로 반환하므로,
   * 여기에 없는 키는 런타임에도 존재하지 않는다. 따라서 `Partial<T>` 가 아니라 `T` 다.
   *
   * 값의 타입이 URL 복원 규칙이 된다 — `page: 1` 이면 `?page=2` 를 숫자 `2` 로 읽는다.
   */
  defaults: T;

  /**
   * 아래 옵션들은 `NoInfer` 로 감싼다.
   *
   * 감싸지 않으면 `keyof T` 를 받는 옵션이 T 의 추론 후보가 되어, `queryTypes` 에 적은 키만으로
   * T 가 결정되고 값 타입이 전부 `unknown` 으로 무너진다. 추론은 `defaults` 한 곳에서만 일어나야 한다.
   *
   * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type
   */
  urlKeys?: (keyof NoInfer<T>)[];

  /** `defaults` 값만으로 타입을 정할 수 없을 때(예: 기본값이 `undefined`) 복원 규칙을 직접 준다. */
  queryTypes?: Partial<Record<keyof NoInfer<T>, UrlQueryValueType>>;

  /** URL·기본값 병합 직후 호출되어 추가 패치를 반환한다. 값 정규화나 상호 의존 필드 정리에 쓴다. */
  postParse?: (query: Partial<NoInfer<T>>) => Partial<NoInfer<T>>;

  /** 쿼리 전체를 base64url JSON 한 덩어리로 감춘다. 기본 `false`. */
  encode?: boolean;

  /** `encode: true` 일 때 쓸 키 이름. 기본 `"_q"`. */
  encodeKey?: string;

  /**
   * `true` 면 히스토리에 항목을 쌓지 않고 현재 URL 을 교체한다. **기본 `true`.**
   *
   * 필터를 만질 때마다 히스토리가 쌓이면 뒤로가기를 여러 번 눌러야 이전 화면으로 나간다.
   */
  replace?: boolean;
}

function parseValue(value: string): UrlQueryPrimitive {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

function parseTypedValue(value: string, type?: UrlQueryValueType): UrlQueryPrimitive {
  if (type === "string") return value;
  if (type === "number") return Number(value);
  if (type === "boolean") return value === "true";

  return parseValue(value);
}

function getDefaultType(defaultValue: unknown): UrlQueryValueType | undefined {
  if (typeof defaultValue === "string") return "string";
  if (typeof defaultValue === "number") return "number";
  if (typeof defaultValue === "boolean") return "boolean";

  return undefined;
}

function isEmptyValue(value: unknown): value is null | undefined {
  return value === null || value === undefined || value === "undefined";
}

function shallowEqual<T extends object>(a: T, b: T): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key as keyof T] !== b[key as keyof T]) return false;
  }

  return true;
}

function encodeObject(value: Record<string, unknown>): string {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/**
 * 실패하면 `null` 을 돌려 기본값으로 넘어간다. **콘솔에 찍지 않는다** —
 * 사용자가 주소를 손으로 고친 것뿐인데 라이브러리가 앱 콘솔을 오염시킬 이유가 없다.
 */
function decodeObject(value: string): UrlQueryRecord | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as unknown;

    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? (parsed as UrlQueryRecord) : null;
  } catch {
    return null;
  }
}

function parseSearchParams(params: URLSearchParams, encodeKey: string, queryTypes?: Partial<Record<string, UrlQueryValueType>>, defaults?: Record<string, unknown>): UrlQueryRecord {
  const encoded = params.get(encodeKey);
  if (encoded) return decodeObject(encoded) ?? {};

  const result: UrlQueryRecord = {};
  const handledKeys = new Set<string>();

  params.forEach((_, key) => {
    if (handledKeys.has(key)) return;
    handledKeys.add(key);

    const isArrayKey = key.endsWith("[]");
    const cleanKey = isArrayKey ? key.slice(0, -2) : key;
    const values = params.getAll(key);
    const valueType = queryTypes?.[cleanKey] ?? getDefaultType(defaults?.[cleanKey]);

    if (values.length > 1 || isArrayKey) {
      result[cleanKey] = values.map((value) => parseTypedValue(value, valueType));
      return;
    }

    /**
     * **콤마로 쪼개지 않는다.** 한때 값에 `,` 가 있으면 배열로 나눴는데, 그러면
     * `defaults: { q: "" }` 로 `string` 을 선언한 자리에 런타임에 `string[]` 이 들어온다 —
     * 소비자는 타입을 믿고 `query.q.trim()` 을 쓰다가 흰 화면을 본다(실제로 그렇게 터졌다).
     *
     * 배열은 **선언해서 쓴다** — `?ids[]=1&ids[]=2` 나 같은 키를 두 번(`?ids=1&ids=2`).
     */
    result[cleanKey] = parseTypedValue(values[0] ?? "", valueType);
  });

  return result;
}

function selectDefaultedQuery<T extends object>(defaults: T, urlKeys: (keyof T)[] | undefined, rawQuery: UrlQueryRecord): Partial<T> {
  const selected: Partial<T> = {};
  const keys = new Set<keyof T>([...(Object.keys(defaults) as (keyof T)[]), ...(urlKeys ?? [])]);

  keys.forEach((key) => {
    const rawValue = rawQuery[String(key)];
    selected[key] = (rawValue === undefined ? defaults[key] : rawValue) as T[keyof T];
  });

  return selected;
}

function buildSearchParams<T extends object>(query: Partial<T>, encode: boolean, encodeKey: string): URLSearchParams {
  const params = new URLSearchParams();

  if (encode) {
    params.set(encodeKey, encodeObject(query as Record<string, unknown>));
    return params;
  }

  Object.entries(query).forEach(([key, value]) => {
    if (isEmptyValue(value)) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (!isEmptyValue(item)) params.append(`${key}[]`, String(item));
      });
      return;
    }

    params.set(key, String(value));
  });

  return params;
}

/**
 * **URL 쿼리스트링을 화면 상태처럼 쓴다.** 필터 값이 주소에 남으므로 새로고침·공유·즐겨찾기가
 * 그대로 복원된다.
 *
 * ```tsx
 * const [query, setQuery] = useUrlQuery({ defaults: { a: 10, b: 20 } });
 *
 * query.a;               // 10 — 문자열이 아니라 숫자로 복원된다
 * setQuery({ a: 20 });   // 주소창이 ?a=20&b=20 으로 바뀐다
 * ```
 *
 * ## URL 이 단일 출처다
 *
 * 상태를 따로 들지 않고 `useSearchParams` 에서 매번 파생시킨다. 그래서
 * **URL 로 되쓰는 `useEffect` 가 없고, 쓰기는 `setQuery` 를 부를 때만 일어난다.**
 * (원본은 상태 변경마다 URL 에 되쓰는 effect 를 돌렸는데, `setSearchParams` 의 identity 가
 * 매번 바뀌는 탓에 그 effect 가 자기 자신을 다시 트리거해 무한 반복이 났다.)
 *
 * ## 페이지가 이동하지 않는다
 *
 * `setQuery` 는 같은 경로의 쿼리만 갈아끼운다. 라우트 매칭 결과가 같으므로 컴포넌트는
 * 언마운트되지 않고, `replace` 기본값이 `true` 라 히스토리도 쌓이지 않는다. **주소창에 기재만 된다.**
 *
 * 다만 data router(`loader` 를 쓰는 라우트)에서는 로케이션이 바뀌면 loader 가 다시 돈다.
 * 필터를 loader 로 읽고 있다면 그건 의도한 동작일 것이고, 아니라면 해당 라우트에서
 * `shouldRevalidate` 를 조정한다.
 *
 * ## 반환값 identity
 *
 * `setQuery` 는 **항상 같은 함수**고, `query` 는 **URL 이 바뀔 때만 새 객체**가 된다.
 * `defaults` 를 인라인으로 넘겨도(`{ defaults: { a: 10 } }`) 매 렌더 새 객체가 만들어지지 않으므로,
 * 둘 다 `useEffect` 의존성에 그대로 넣어도 루프가 나지 않는다.
 *
 * @example 배열과 별칭 키
 * const [query, setQuery] = useUrlQuery({
 *   defaults: { page: 1, size: 20, keyword: "" },
 *   urlKeys: ["status"],                    // defaults 에 없지만 URL 에서 읽을 키
 *   queryTypes: { status: "number" },       // 기본값이 없어 복원 규칙을 직접 준다
 *   postParse: (q) => (q.keyword ? { page: 1 } : {})
 * });
 *
 * @example 쿼리를 감추기
 * const [query, setQuery] = useUrlQuery({
 *   defaults: { userId: 0, secretFlag: false },
 *   encode: true   // ?_q=eyJ1c2VySWQiOjB9...
 * });
 */
export function useUrlQuery<T extends object>(options: UseUrlQueryOptions<T>): [T, UrlQuerySetter<T>] {
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * 옵션과 setter 를 ref 로 붙잡는다.
   *
   * 소비자는 `defaults` 를 거의 항상 인라인으로 넘긴다. 그것을 의존성에 넣으면 매 렌더 새
   * 객체가 되어 반환값 identity 가 흔들리고, 소비자 쪽 `useEffect` 가 무한히 돈다.
   * **의존성은 `searchParams` 하나뿐이어야 한다.**
   */
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  const query = useMemo(() => {
    const { defaults, urlKeys, queryTypes, postParse, encodeKey = DEFAULT_ENCODE_KEY } = optionsRef.current;

    const raw = parseSearchParams(searchParams, encodeKey, queryTypes as Partial<Record<string, UrlQueryValueType>>, defaults as Record<string, unknown>);
    const selected = selectDefaultedQuery(defaults, urlKeys, raw);
    const patched = postParse ? postParse({ ...raw, ...selected } as Partial<T>) : {};

    return { ...selected, ...patched } as T;
  }, [searchParams]);

  const queryRef = useRef(query);
  queryRef.current = query;

  const setQuery = useCallback((patch: UrlQueryPatch<T>) => {
    const prev = queryRef.current;
    const nextPatch = typeof patch === "function" ? patch(prev) : patch;
    const next = { ...prev, ...nextPatch } as T;

    // 값이 그대로면 주소를 건드리지 않는다. 불필요한 history 조작을 막는다.
    if (shallowEqual(prev, next)) return;

    const { encode = false, encodeKey = DEFAULT_ENCODE_KEY, replace = true } = optionsRef.current;
    setSearchParamsRef.current(buildSearchParams(next, encode, encodeKey), { replace });
  }, []);

  return [query, setQuery];
}
