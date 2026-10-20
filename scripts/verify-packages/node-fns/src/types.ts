// 타입만 확인한다. 런타임 확인은 check.mjs 가 한다 — 진입점마다 d.ts 가 실려 나가는가
import * as num from "@txstack/fns/num";
import { lastDays, type IsoWeek } from "@txstack/fns/date";
import { check, type FormError } from "@txstack/fns/form";
import * as phone from "@txstack/fns/phone-kr";
import type { CssRules } from "@txstack/fns/browser/css";

export const n: number = num.toNumber("1", 0);
export const range: [Date, Date] = lastDays(7);
export const week: IsoWeek | null = null;
export const error: FormError<{ name: string }> | null = check({ name: "" });
export const masked: string = phone.mask("01012345678");
export const rules: CssRules = { color: "red" };
