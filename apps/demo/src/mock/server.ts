import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { handleAccounts } from "./accounts";
import { handleLogs } from "./logs";

/**
 * 외부 서버 없이 앱을 돌리는 가짜 서버입니다. axios 의 `adapter` 자리에 끼워서,
 * 화면과 API 함수는 진짜 서버일 때와 똑같이 동작합니다.
 *
 * 응답은 `{ body: ... }`, 오류는 `{ statusCode, message }` 형식으로 돌려줍니다.
 * 실제 서버의 형식이 다르면 lib/api.ts 의 `unwrap` 만 맞추면 됩니다.
 */

interface Respond {
  ok: (body: unknown) => AxiosResponse;
  fail: (status: number, message: string) => AxiosError;
}

/** 맡는 주소면 응답을 돌려주고(실패는 `throw fail(...)`), 아니면 `undefined` */
export type MockHandler = (config: InternalAxiosRequestConfig, respond: Respond) => AxiosResponse | undefined;

const HANDLERS: MockHandler[] = [handleAccounts, handleLogs];

/** 진짜 네트워크처럼 조금 기다렸다가 답합니다 */
const LATENCY = 300;

export const mockAdapter: AxiosAdapter = async (config) => {
  await new Promise((resolve) => setTimeout(resolve, LATENCY));

  const respond: Respond = {
    ok: (body) => ({ status: 200, statusText: "OK", data: { body }, headers: {}, config, request: {} }) as AxiosResponse,
    fail: (status, message) => {
      const response = { status, statusText: String(status), data: { statusCode: status, message }, headers: {}, config, request: {} } as AxiosResponse;
      return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, {}, response);
    }
  };

  for (const handle of HANDLERS) {
    const response = handle(config, respond);
    if (response) return response;
  }

  throw respond.fail(404, `없는 주소입니다: ${config.method?.toUpperCase()} ${config.url}`);
};
