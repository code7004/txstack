// tx-ui.utils.tsx
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ITxDropdownItem } from ".";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export function cm(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * `lodash.mergeWith` 의 테마 전용 대체 구현.
 *
 * 라이브러리 번들에 lodash 전체를 끌고 오지 않기 위해 직접 구현했다. 재현한 동작은 다음과 같다.
 * - plain object 는 재귀 병합한다.
 * - source 의 `undefined` 값은 base 를 덮어쓰지 않는다.
 * - 그 외 값(배열 포함)은 source 가 이긴다.
 * - 문자열 충돌은 `resolveString` 이 결정한다. (merge = cm 병합 / override = 교체)
 */
function mergeTheme<T>(base: T, custom: unknown, resolveString: (baseValue: string, customValue: string) => string): T {
  if (custom === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(custom)) return custom as T;

  const result: Record<string, unknown> = { ...base };

  for (const key of Object.keys(custom)) {
    const baseValue = (base as Record<string, unknown>)[key];
    const customValue = custom[key];

    if (customValue === undefined) continue;

    if (typeof baseValue === "string" && typeof customValue === "string") {
      result[key] = resolveString(baseValue, customValue);
      continue;
    }

    if (isPlainObject(baseValue) && isPlainObject(customValue)) {
      result[key] = mergeTheme(baseValue, customValue, resolveString);
      continue;
    }

    result[key] = customValue;
  }

  return result as T;
}

/**
 * 테마 병합 유틸
 * - merge: 합집합, 충돌 시 custom 우선, 문자열 className은 cm() 병합
 * - override: base 유지, custom 값만 덮어씀, 문자열 className은 교체
 */
export const themeMerge = <T>(base: T, custom?: DeepPartial<T>, policy: "merge" | "override" = "merge"): T => {
  if (!custom) return base;

  if (typeof custom === "string") {
    return base;
  }

  if (policy === "override") {
    return mergeTheme(base, custom, (_baseValue, customValue) => customValue);
  }

  return mergeTheme(base, custom, (baseValue, customValue) => cm(baseValue, customValue));
};

export function getItemKey(item: ITxDropdownItem) {
  const v = item.value;

  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
    return String(v);
  }

  return item.name;
}

export function getDisplayName(type: unknown): string | undefined {
  if (typeof type === "string") return undefined;
  if (typeof type === "function") return (type as { displayName?: string }).displayName;
  return undefined;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // ✅ 최신 브라우저 (HTTPS + user gesture 필요)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // ✅ fallback (구형 브라우저)
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // 화면 스크롤 영향 방지
    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);

    return success;
  } catch {
    return false;
  }
}
