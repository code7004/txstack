import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const ENCODED_QUERY_KEY = "encioesode";

type UrlQueryPrimitive = string | number | boolean;
type UrlQueryRecord = Record<string, unknown>;
type UrlQueryPatch<T extends object> = Partial<T> | ((prev: T) => Partial<T>);
type UrlQuerySetter<T extends object> = (patch: UrlQueryPatch<T>) => void;
type SearchParamSetter = ReturnType<typeof useSearchParams>[1];
type UrlQueryValueType = "string" | "number" | "boolean";

export interface UseUrlQueryOptions<T extends object> {
  defaults: Partial<T>;
  urlKeys?: (keyof T)[];
  queryTypes?: Partial<Record<keyof T, UrlQueryValueType>>;
  postParse?: (query: Partial<T>) => Partial<T>;
  /** @deprecated Use `postParse` instead. */
  afterParse?: (query: Partial<T>) => Partial<T>;
  encode?: boolean;
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

function decodeObject(value: string): UrlQueryRecord | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as unknown;

    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? (parsed as UrlQueryRecord) : null;
  } catch (error) {
    console.error("[useUrlQuery] encoded query decoding failed:", error);
    return null;
  }
}

function parseSearchParams(params: URLSearchParams, queryTypes?: Partial<Record<string, UrlQueryValueType>>, defaults?: Record<string, unknown>): UrlQueryRecord {
  const encoded = params.get(ENCODED_QUERY_KEY);
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

    const value = values[0] ?? "";
    result[cleanKey] = value.includes(",") ? value.split(",").map((item) => parseTypedValue(item.trim(), valueType)) : parseTypedValue(value, valueType);
  });

  return result;
}

function selectDefaultedQuery<T extends object>(defaults: Partial<T>, urlKeys: (keyof T)[] | undefined, rawQuery: UrlQueryRecord): Partial<T> {
  const selected: Partial<T> = {};
  const keys = new Set<keyof T>([...(Object.keys(defaults) as (keyof T)[]), ...(urlKeys ?? [])]);

  keys.forEach((key) => {
    const rawValue = rawQuery[String(key)];
    selected[key] = (rawValue === undefined ? defaults[key] : rawValue) as T[keyof T];
  });

  return selected;
}

function buildSearchParams<T extends object>(query: Partial<T>, encode: boolean): URLSearchParams {
  const params = new URLSearchParams();

  if (encode) {
    params.set(ENCODED_QUERY_KEY, encodeObject(query as Record<string, unknown>));
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

function writeQuery<T extends object>(query: Partial<T>, setSearchParams: SearchParamSetter, encode: boolean, replace: boolean) {
  setSearchParams(buildSearchParams(query, encode), { replace });
}

/**
 * URL query string을 filter state로 읽고, setter 호출 시 state와 URL을 함께 갱신한다.
 *
 * - `defaults`: URL에 값이 없을 때 사용할 기본 filter 값
 * - `urlKeys`: `defaults`에는 없지만 URL에서 추가로 읽을 key 목록
 * - `postParse`: URL/default 병합 이후 한 번 실행되는 후처리 함수. 반환값은 최종 state에 다시 병합된다.
 * - `encode`: true면 query 전체를 base64-url JSON 값으로 저장
 * - `replace`: true면 browser history를 추가하지 않고 현재 URL을 교체
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useUrlQuery<IUrlQuery>({
 *   defaults: {
 *     keyword: '',
 *     offset: 0,
 *     ...numberToStartEndDate(-365, 0),
 *     sortKey: DEFAULT_SORT.key,
 *     sortVal: DEFAULT_SORT.order,
 *   },
 *   urlKeys: ['userGrade'],
 *   postParse: (query) => numberToStartEndDate(query.periodNum, 0),
 * });
 *
 * setFilters({ keyword: 'alice', offset: 0 });
 * ```
 *
 * @example
 * ```tsx
 * const [filter, setFilter] = useUrlQuery<Omit<GetUsersQueryDto, 'partnerId'>>({
 *   defaults: { offset: 0, limit: ITEMSIZE, isActive: undefined },
 *   encode: true,
 *   replace: true,
 *   postParse: (query) => ({ ...query, offset: 0 }),
 * });
 * ```
 */
export function useUrlQuery<T extends object>({ defaults, urlKeys, queryTypes, postParse, afterParse, encode = false, replace = true }: UseUrlQueryOptions<T>): [T, UrlQuerySetter<T>] {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<T>(() => {
    const rawQuery = parseSearchParams(searchParams, queryTypes as Partial<Record<string, UrlQueryValueType>>, defaults as Record<string, unknown>);
    const selectedQuery = selectDefaultedQuery(defaults, urlKeys, rawQuery);
    const queryForPostParse = { ...rawQuery, ...selectedQuery } as Partial<T>;
    const parsePostProcess = postParse ?? afterParse;
    const parsedQuery = parsePostProcess ? parsePostProcess(queryForPostParse) : {};

    return { ...selectedQuery, ...parsedQuery } as T;
  });
  const stateRef = useRef<T>(state);

  const update = useCallback((patch: UrlQueryPatch<T>) => {
    const prev = stateRef.current;
    const nextPatch = typeof patch === "function" ? patch(prev) : patch;
    const next = { ...prev, ...nextPatch } as T;

    if (shallowEqual(prev, next)) return;

    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    writeQuery(state, setSearchParams, encode, replace);
  }, [encode, replace, setSearchParams, state]);

  return [state, update];
}

export function searchQuery(): UrlQueryRecord {
  return parseSearchParams(new URLSearchParams(window.location.search));
}

export function getUrlQuery<T extends object>(query: Partial<T>, encode = false): string {
  const params = buildSearchParams(query, encode);
  const queryString = params.toString();

  return queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
}

export function pushUrlQuery<T extends object>(query: Partial<T>, encode = false) {
  const nextUrl = getUrlQuery(query, encode);
  window.history.replaceState(null, "", nextUrl);
}

export function updateUrlQuery<T extends object>(query: Partial<T>, encode = false) {
  const current = searchQuery();
  const next = { ...current, ...query };

  Object.entries(next).forEach(([key, value]) => {
    if (isEmptyValue(value)) delete next[key];
  });

  pushUrlQuery(next as Partial<T>, encode);
}

export default useUrlQuery;
