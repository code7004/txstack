import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";

export function ApiAxios() {
  return (
    <Page title="@txstack/axios" lead="정책을 주입받는 HTTP 클라이언트입니다. 토큰, 401 처리, 응답 형식은 라이브러리가 아니라 앱이 정합니다.">
      <Block title="Works without React">
        <p className="text-slate-600 dark:text-slate-300">
          네 패키지 중 이 패키지만 React에 의존하지 않습니다. <strong>Node 스크립트, 워커, 테스트에서도 같은 클라이언트를 쓸 수 있습니다.</strong> peer 의존성은 <code>axios</code> 하나입니다.
        </p>

        <CodeBlock title="import">{`import { createHttpClient, parseApiError } from "@txstack/axios";`}</CodeBlock>
      </Block>

      <Block title="Create a client">
        <CodeBlock title="lib/api.ts">{`export const api = createHttpClient({
  baseURL: "/api",
  timeout: 10_000,

  // 인증 — 토큰을 어디에 저장하는지는 앱이 압니다
  getToken: () => localStorage.getItem("access-token"),
  authHeader: "Authorization",   // 기본값
  authScheme: "Bearer",          // 기본값. 빈 문자열이면 토큰만 넣습니다

  // 401 응답을 받았을 때 할 일도 앱이 정합니다
  onUnauthorized: () => logout(),
  onError: (error) => report(error),

  // 응답 형식 풀기 — 응답이 { body: T } 형식이라면
  unwrap: (data) => (data as { body: unknown }).body,

  // 로그를 콘솔 대신 원하는 곳으로
  onRequest: (log) => trace("→", log.method, log.url),
  onResponse: (log) => trace("←", log.status, log.durationMs + "ms"),
  maskFields: ["password", "accessToken"]
});`}</CodeBlock>

        <TxAlert variant="warning" title="Content-Type을 고정하지 마세요">
          <code>headers</code>에 <code>Content-Type</code>을 고정해 두면 파일 업로드 요청에서 boundary가 빠져 서버가 본문을 읽지 못합니다. axios가 본문 종류를 보고 알아서 정하도록 두세요.
        </TxAlert>
      </Block>

      <Block title="Send requests">
        <CodeBlock title="요청">{`const user = await api.get<User>("/users/1");
const list = await api.get<Page<User>>("/users", { page: 2, size: 20 });   // 두 번째 인자는 query

await api.post<User>("/users", { name: "홍길동" });
await api.patch<User>("/users/1", { name: "김하늘" });

// DELETE는 query와 body를 함께 쓰는 API가 있어 옵션 객체로 받습니다
await api.delete<void>("/users/1", { params: { force: true } });

// unwrap을 거치지 않는 원본 응답 — 파일, CSV
const blob = await api.getBlob("/reports/2026.xlsx");
const csv = await api.getText("/reports/2026.csv");`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          이 클라이언트로 처리할 수 없는 요청은 <code>api.instance</code>로 내부 axios 인스턴스를 직접 쓰면 됩니다.
        </p>
      </Block>

      <Block title="One error shape">
        <CodeBlock title="parseApiError">{`try {
  await api.post("/users", body);
} catch (error) {
  const { statusCode, message } = parseApiError(error);
  // 네트워크 끊김, 시간 초과, 서버가 보낸 에러 본문 모두 같은 형태로 받습니다
  TxToast.show({ variant: "danger", title: message });
}`}</CodeBlock>

        <TxAlert variant="info" title="이 사이트에서 쓰고 있습니다">
          <strong>Example</strong>의 GitHub 검색이 이 클라이언트를 씁니다. 1분에 10번 넘게 검색하면 403 응답이 오는데, 이 응답도 <code>parseApiError</code>를 거쳐 한 줄 메시지로 표시됩니다.
        </TxAlert>
      </Block>

      <Block title="Other exports">
        <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
          <p>
            <code>attachInterceptors</code> — 이미 만들어 둔 axios 인스턴스에 같은 정책(인증, 401 처리, 로그)만 붙입니다.
          </p>
          <p>
            <code>isTokenExpired(expiresAt)</code> — <strong>만료 시각(밀리초 단위 타임스탬프)이 지났는지</strong> 확인합니다. JWT를 파싱하지 않으므로 토큰에서 만료 시각을 읽는 방법은 앱이 정합니다. 값이 없으면 만료된 것으로 봅니다.
          </p>
          <p>
            <code>removeUndefined</code> — 쿼리에서 값이 <code>undefined</code>이거나 공백뿐인 문자열인 필드를 제거합니다. <code>null</code>, <code>0</code>, <code>false</code>는 남깁니다.
          </p>
        </div>
      </Block>
    </Page>
  );
}
