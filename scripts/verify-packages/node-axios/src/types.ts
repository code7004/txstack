// 타입만 확인한다. 런타임 확인은 check.mjs 가 한다
import { createHttpClient, parseApiError, type HttpClientOptions, type RequestLog } from "@txstack/axios";
import { getHttpClient, initHttpClient } from "@txstack/axios/singleton";

const options: HttpClientOptions = { baseURL: "/api", maskFields: ["password"], onRequest: (log: RequestLog) => void log.url };
export const client = createHttpClient(options);
export const message: string = parseApiError(new Error("x")).message;
initHttpClient(options);
export const shared = getHttpClient();
