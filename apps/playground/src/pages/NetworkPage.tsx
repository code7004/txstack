import { parseApiError, removeUndefined } from "@txstack/network";
import { TxButton, TxCard, TxFlex } from "@txstack/ui";
import { useState } from "react";
import { api, authLog, setToken, type IDemoUser } from "../api";
import { StateBox } from "./StateBox";

export const NetworkPage = () => {
  const [result, _result] = useState<unknown>(null);
  const [error, _error] = useState<unknown>(null);
  const [hasToken, _hasToken] = useState(true);
  const [loading, _loading] = useState(false);

  async function run(label: string, fn: () => Promise<unknown>) {
    _loading(true);
    _error(null);
    try {
      _result({ label, data: await fn() });
    } catch (e) {
      _result(null);
      _error({ label, parsed: parseApiError(e) });
    } finally {
      _loading(false);
    }
  }

  function toggleToken() {
    const next = !hasToken;
    _hasToken(next);
    setToken(next ? "demo-token" : null);
  }

  return (
    <TxFlex className="flex-col gap-4">
      <TxCard caption="실제 서버 없이 axios adapter 를 목으로 갈아끼운 상태다">
        <TxCard.Content className="text-sm text-slate-600 dark:text-slate-300">
          <code>createHttpClient</code> 에 주입한 옵션(<code>getToken</code> / <code>onUnauthorized</code> / <code>unwrap</code>)이 실제로 동작하는지 확인하는 화면이다. 브라우저 콘솔에 <code>debug: true</code> 로그도 함께 찍힌다.
        </TxCard.Content>
      </TxCard>

      <TxCard caption="요청">
        <TxCard.Content className="flex flex-wrap gap-2">
          <TxButton label="GET /users (봉투 해제)" disabled={loading} onClick={() => run("GET /users", () => api.get<{ users: IDemoUser[]; authorization: string | null }>("/users"))} />
          <TxButton label="GET /export (getText — 봉투 우회)" variant="secondary" disabled={loading} onClick={() => run("GET /export", () => api.getText("/export"))} />
          <TxButton label="401 유발" variant="danger" disabled={loading} onClick={() => run("GET /unauthorized", () => api.get("/unauthorized"))} />
          <TxButton label="404 유발" variant="danger" disabled={loading} onClick={() => run("GET /missing", () => api.get("/missing"))} />
          <TxButton label={hasToken ? "토큰 제거" : "토큰 설정"} variant="ghost" onClick={toggleToken} />
        </TxCard.Content>
      </TxCard>

      <TxCard caption="확인 포인트">
        <TxCard.Content>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <b>봉투 해제</b> — 목 서버는 <code>{`{ success, body }`}</code> 로 감싸 보내는데 <code>/users</code> 결과에는 <code>body</code> 안쪽만 온다.
            </li>
            <li>
              <b>토큰 주입</b> — 응답의 <code>authorization</code> 필드가 서버가 실제로 받은 헤더다. 토큰을 제거하고 다시 호출하면 <code>null</code> 이 된다.
            </li>
            <li>
              <b>401 처리</b> — <code>onUnauthorized</code> 가 불린 기록이 아래 로그에 쌓인다. 앱의 로그아웃 정책을 여기에 연결한다.
            </li>
            <li>
              <b>getText</b> — 봉투를 거치지 않고 원본 응답을 그대로 준다. 파일 다운로드용 <code>getBlob</code> 도 같다.
            </li>
          </ul>
        </TxCard.Content>
      </TxCard>

      <StateBox caption="응답 / 에러" value={{ loading, hasToken, result, error, authLog, removeUndefinedExample: removeUndefined({ a: 1, b: undefined, c: "  " }) }} />
    </TxFlex>
  );
};
