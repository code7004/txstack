// 타입만 확인한다. 런타임 확인은 check.mjs 가 한다 — 루트와 그룹 진입점마다 d.ts 가 실려 나가는가
import { checkForm, lastDays, maskPhone, toNumber, type CssRules, type FormError, type IsoWeek } from "@txstack/fns";
import { formatNumber } from "@txstack/fns/num";
import type { SetCookieOptions } from "@txstack/fns/browser/cookie";

export const n: number = toNumber("1", 0);
export const formatted: string = formatNumber(1);
export const range: [Date, Date] = lastDays(7);
export const week: IsoWeek | null = null;
export const error: FormError<{ name: string }> | null = checkForm({ name: "" });
export const masked: string = maskPhone("01012345678");
export const rules: CssRules = { color: "red" };
export const options: SetCookieOptions = { days: 1 };
