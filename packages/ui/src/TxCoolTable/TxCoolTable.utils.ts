// utils.ts

import React from "react";

/**
 * `lodash.orderBy(data, [key], [direction])` 의 대체 구현.
 *
 * lodash 정렬 규칙을 그대로 재현한다.
 * - 오름차순 기준 비교 후 방향을 곱한다.
 * - `null`/`undefined` 는 오름차순에서 항상 뒤로 간다. (따라서 내림차순에서는 앞으로 온다)
 * - `Array.prototype.sort` 는 ES2019 부터 안정 정렬이라 lodash 와 동일하게 동작한다.
 */
function compareAscending(a: unknown, b: unknown): number {
  if (a === b) return 0;

  const aNil = a === null || a === undefined;
  const bNil = b === null || b === undefined;

  if (aNil && bNil) return 0;
  if (aNil) return 1;
  if (bNil) return -1;

  return (a as number) < (b as number) ? -1 : 1;
}

export function orderByKey<T>(data: T[], key: string, direction: "asc" | "desc"): T[] {
  const sign = direction === "desc" ? -1 : 1;

  return [...data].sort((a, b) => compareAscending((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]) * sign);
}

export function safeRender(value: unknown): React.ReactNode {
  if (value instanceof Date) return value.toISOString();
  if (React.isValidElement(value)) return value;
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `[ ... ]`;
  if (typeof value === "object") return `{ ... }`;
  return value as React.ReactNode;
}

// ✅ blur 시 캐스팅만 해서 이벤트 전달
export function castValue(oldValue: unknown, newValue: string): string | number | boolean {
  if (oldValue == null) return newValue;
  switch (typeof oldValue) {
    case "number": {
      const n = Number(newValue);
      return isNaN(n) ? newValue : n;
    }
    case "boolean":
      return newValue.toLowerCase() === "true";
    case "string":
      return newValue;
    default:
      return newValue;
  }
}

export function setNestedValue(obj: Record<string, unknown>, path: string, changeValue: unknown): Record<string, unknown> {
  if (!obj || typeof path !== "string") return obj;

  const keys = path.split(".");
  const newObj: Record<string, unknown> = { ...obj };

  let acc: Record<string, unknown> = newObj;

  keys.forEach((key, idx) => {
    if (idx === keys.length - 1) {
      acc[key] = changeValue;
    } else {
      acc[key] = { ...((acc[key] as Record<string, unknown>) || {}) };
      acc = acc[key] as Record<string, unknown>;
    }
  });

  return newObj;
}

// ✅ unknown 기반 안전 접근
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof path !== "string") return undefined;

  const keys = path.split(".");
  let acc: unknown = obj;

  for (let i = 0; i < keys.length; i++) {
    if (acc == null || typeof acc !== "object") return undefined;
    acc = (acc as Record<string, unknown>)[keys[i]];
  }

  return acc;
}
