import { createHttpClient, parseApiError } from "@txstack/axios";
import { TxAlert, TxButton } from "@txstack/ui";
import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page } from "../../components/Page";

const muted = "text-slate-600 dark:text-slate-300";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * **이 페이지 안에서만 도는 가짜 서버.** axios 의 `adapter` 자리에 끼워 진짜 네트워크 대신
 * 응답을 돌려준다 — 401 · 500 · 시간 초과를 버튼 하나로 일으켜 보려는 것이다.
 * 클라이언트 쪽 코드(토큰 · 401 처리 · 로그)는 진짜 서버를 부를 때와 똑같이 돈다.
 */
const fakeServer: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const respond = (status: number, data: unknown): AxiosResponse => {
    const response = { status, statusText: String(status), data, headers: {}, config, request: {} } as AxiosResponse;
    if (status < 400) return response;

    throw new AxiosError(`Request failed with status code ${status}`, status < 500 ? AxiosError.ERR_BAD_REQUEST : AxiosError.ERR_BAD_RESPONSE, config, {}, response);
  };

  if (config.url === "/slow") {
    await wait(config.timeout ?? 0);
    throw new AxiosError(`timeout of ${config.timeout}ms exceeded`, AxiosError.ECONNABORTED, config);
  }

  await wait(300);

  switch (config.url) {
    case "/me":
      return config.headers.Authorization ? respond(200, { body: { name: "김하늘", role: "admin" } }) : respond(401, { statusCode: 401, message: "로그인이 필요합니다" });
    case "/login":
      return respond(200, { body: { accessToken: "eyJhbGciOi…" } });
    default:
      return respond(500, { statusCode: 500, message: "서버에서 오류가 났습니다" });
  }
};

interface Line {
  id: number;
  tone: "req" | "res" | "err" | "app";
  text: string;
}

/** 버튼을 누르면 요청이 나가고, 클라이언트에 넘긴 함수들이 언제 불리는지 아래에 쌓인다 */
function ClientDemo() {
  const [lines, setLines] = useState<Line[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const seq = useRef(0);

  const log = (tone: Line["tone"], text: string) => setLines((prev) => [...prev.slice(-19), { id: ++seq.current, tone, text }]);

  const api = useMemo(() => {
    const client = createHttpClient({
      baseURL: "/api",
      timeout: 1500,
      getToken: () => tokenRef.current,
      unwrap: (data) => (data as { body: unknown }).body,
      onRequest: ({ method, url, data }) => log("req", `→ ${method} ${url}${data ? ` ${JSON.stringify(data)}` : ""}`),
      onResponse: ({ status, url, durationMs }) => log("res", `← ${status} ${url} (${durationMs}ms)`),
      onUnauthorized: () => log("app", "onUnauthorized — 로그인 화면으로 보냅니다"),
      onError: (error) => log("err", `onError — ${parseApiError(error).statusCode} ${parseApiError(error).message}`)
    });
    client.setConfig({ adapter: fakeServer });
    return client;
    // 클라이언트는 한 번만 만든다. 토큰은 ref 로 그때그때 읽는다
  }, []);

  const run = async (call: () => Promise<unknown>) => {
    try {
      const body = await call();
      log("app", `결과 ${JSON.stringify(body)}`);
    } catch {
      // 오류는 onError 가 이미 남겼다
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <TxButton label="내 정보 (GET /me)" onClick={() => run(() => api.get("/me"))} />
        <TxButton
          label={token ? "로그아웃" : "로그인 (POST /login)"}
          variant="secondary"
          onClick={() =>
            token
              ? (setToken(null), log("app", "토큰을 지웠습니다"))
              : run(async () => {
                  const body = await api.post<{ accessToken: string }>("/login", { id: "sky", password: "1234" });
                  setToken(body.accessToken);
                  return body;
                })
          }
        />
        <TxButton label="서버 오류 (500)" variant="secondary" onClick={() => run(() => api.get("/broken"))} />
        <TxButton label="시간 초과" variant="secondary" onClick={() => run(() => api.get("/slow"))} />
      </div>

      <ol className="flex min-h-40 flex-col gap-0.5 rounded-lg p-3 font-mono text-xs" style={{ backgroundColor: "var(--site-code-bg)", color: "var(--site-code-text)" }}>
        {lines.length === 0 && <li className="opacity-60">버튼을 눌러 보세요. 요청과 응답, 앱에 넘긴 함수가 불리는 순서가 여기에 나타납니다.</li>}
        {lines.map((line) => (
          <li key={line.id} style={{ color: line.tone === "err" ? "#fca5a5" : line.tone === "app" ? "#5eead4" : undefined }}>
            {line.text}
          </li>
        ))}
      </ol>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        로그인하기 전에 &quot;내 정보&quot;를 누르면 401이 오고, 로그인한 뒤에는 토큰이 붙어 성공합니다. 로그인 요청의 <code>password</code>는 로그에서 가려집니다.
      </p>
    </div>
  );
}

export function GuideHttpClient() {
  return (
    <Page
      title="HTTP Client"
      lead={
        <>
          API를 부르는 클라이언트를 한 번 만들어 두고 앱 전체에서 씁니다. <code>@txstack/axios</code>를 사용합니다. 이 패키지는 React 없이도 동작합니다.
        </>
      }
    >
      <Block title="무엇을 대신해 주나요">
        <p className={muted}>
          API를 부를 때마다 토큰 붙이기, 401이 오면 로그아웃, 오류 메시지 꺼내기, 응답에서 실제 데이터 꺼내기를 반복하게 됩니다. 이 반복을 클라이언트 한 곳에 모읍니다. 다만{" "}
          <strong>토큰을 어디에 저장하는지, 401에 무엇을 할지는 서비스마다 다르므로</strong> 라이브러리가 정하지 않고 앱이 함수로 넘깁니다.
        </p>
      </Block>

      <Block title="직접 해 보기">
        <p className={muted}>이 예제는 페이지 안의 가짜 서버에 요청합니다. 클라이언트 설정은 아래 1단계 코드와 같습니다.</p>
        <Demo>
          <ClientDemo />
        </Demo>
      </Block>

      <Block title="1. 클라이언트 만들기">
        <CodeBlock title="src/lib/api.ts">{`import { createHttpClient } from "@txstack/axios";

export const api = createHttpClient({
  baseURL: "/api",
  timeout: 10_000,

  // 토큰을 어디에 두는지는 앱이 압니다
  getToken: () => localStorage.getItem("accessToken"),

  // 401이 오면 무엇을 할지도 앱이 정합니다
  onUnauthorized: () => logout(),
  onError: (error) => report(error),

  // 응답이 { body: ... } 형식이라면 실제 데이터만 꺼냅니다
  unwrap: (data) => (data as { body: unknown }).body
});`}</CodeBlock>
        <p className={muted}>
          <code>getToken</code>은 요청할 때마다 불려서 <code>Authorization: Bearer …</code> 헤더를 붙입니다. 헤더 이름과 <code>Bearer</code> 부분은 <code>authHeader</code>, <code>authScheme</code>로 바꿀 수 있습니다.
        </p>
      </Block>

      <Block title="2. 요청 보내기">
        <CodeBlock title="어디서든">{`const user = await api.get<User>("/users/1");
const list = await api.get<Page<User>>("/users", { page: 2 });   // 두 번째 인자는 쿼리
await api.post<User>("/users", { name: "kim" });
await api.delete("/users/1");`}</CodeBlock>
        <p className={muted}>
          결과는 <code>unwrap</code>을 거친 데이터입니다. 파일처럼 그대로 받아야 하는 응답은 <code>getBlob</code>, <code>getText</code>를 씁니다.
        </p>
      </Block>

      <Block title="3. 오류 보여 주기">
        <p className={muted}>
          서버마다 오류 응답 모양이 조금씩 다릅니다. <code>parseApiError</code>는 어떤 오류든 <code>{"{ statusCode, message }"}</code> 형태로 맞춰 주므로, 화면에서는 이것만 보여 주면 됩니다.
        </p>
        <CodeBlock title="src/MemberList.tsx">{`import { parseApiError } from "@txstack/axios";

try {
  setRows(await api.get("/members"));
} catch (error) {
  const { statusCode, message } = parseApiError(error);
  TxToast.show({ variant: "danger", title: \`불러오지 못했습니다 (\${statusCode})\`, message });
}`}</CodeBlock>
      </Block>

      <Block title="4. 로그 남기기">
        <p className={muted}>
          <code>onRequest</code>, <code>onResponse</code>에 함수를 넘기면 모든 요청과 응답이 그 함수로 갑니다. 콘솔 대신 모니터링 도구로 보낼 때 씁니다. <code>password</code>, <code>accessToken</code> 같은 값은 넘기기 전에 가려집니다.
        </p>
        <CodeBlock title="src/lib/api.ts">{`createHttpClient({
  baseURL: "/api",
  onRequest: ({ method, url }) => monitor.add(\`→ \${method} \${url}\`),
  onResponse: ({ status, durationMs }) => durationMs > 3000 && monitor.warn("느린 요청", status),
  maskFields: ["password", "accessToken", "cardNumber"]
});`}</CodeBlock>
        <TxAlert variant="warning" title="Content-Type을 고정하지 마세요">
          <code>headers</code>에 <code>Content-Type</code>을 지정해 두면 파일 업로드에서 필요한 값이 빠져 서버가 본문을 읽지 못합니다. 보내는 데이터에 맞게 axios가 정하도록 두세요.
        </TxAlert>
      </Block>

      <p className={muted}>
        이 클라이언트로 GitHub API를 부르는 예제는{" "}
        <Link to="/example" className="underline">
          Example
        </Link>
        에, 옵션 전체는{" "}
        <Link to="/api/axios" className="underline">
          API › axios
        </Link>
        에 있습니다.
      </p>
    </Page>
  );
}
