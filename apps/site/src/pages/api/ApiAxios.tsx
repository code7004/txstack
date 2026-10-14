import { Link } from "react-router-dom";
import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import { RefLabel, RefTable, Signature } from "../../components/Reference";
import { TABLES, tableAnchor } from "./data";

const muted = "text-slate-600 dark:text-slate-300";

export function ApiAxios() {
  return (
    <Page
      title="@txstack/axios"
      lead={
        <>
          정책을 주입받는 HTTP 클라이언트입니다. 토큰, 401 처리, 응답 형식은 라이브러리가 아니라 앱이 정합니다. React 없이 동작하며, 사용법은{" "}
          <Link to="/docs/guide/http-client" className="underline">
            Guide › HTTP Client
          </Link>
          에 있습니다.
        </>
      }
    >
      <Block title="Install">
        <CodeBlock language="bash" title="sh">{`pnpm add @txstack/axios axios`}</CodeBlock>
        <RefTable head={["Entry", "Exports", "Peer", "Description"]} rows={TABLES.axios.installEntry.rows} anchor={tableAnchor(TABLES.axios.installEntry)} />
      </Block>

      <Block title="createHttpClient">
        <Signature>{`function createHttpClient(options: HttpClientOptions): HttpClient`}</Signature>
        <p className={muted}>
          클라이언트를 만듭니다. 모듈에서 한 번 만들어 export하고, 앱 전체에서 가져다 씁니다. <code>baseURL</code>이 없으면 오류를 던집니다.
        </p>
        <CodeBlock title="src/lib/api.ts">{`export const api = createHttpClient({
  baseURL: "/api",
  getToken: () => localStorage.getItem("accessToken"),
  onUnauthorized: () => logout(),
  unwrap: (data) => (data as { body: unknown }).body
});`}</CodeBlock>

        <RefLabel>HttpClientOptions</RefLabel>
        <RefTable rows={TABLES.axios.httpClientOptions.rows} anchor={tableAnchor(TABLES.axios.httpClientOptions)} />
        <TxAlert variant="warning" title="Content-Type을 고정하지 마세요">
          <code>headers</code>에 <code>Content-Type</code>을 넣으면 파일 업로드(<code>FormData</code>)에서 필요한 boundary 값이 빠져 서버가 본문을 읽지 못합니다. 보내는 데이터에 맞게 axios가 정하도록 두세요.
        </TxAlert>
      </Block>

      <Block title="HttpClient">
        <p className={muted}>
          <code>createHttpClient</code>가 돌려주는 객체입니다. 요청 메서드는 <code>unwrap</code>을 거친 데이터를 돌려줍니다.
        </p>
        <RefTable head={["Member", "Signature", "Returns", "Description"]} rows={TABLES.axios.httpClientMembers.rows} anchor={tableAnchor(TABLES.axios.httpClientMembers)} />
        <p className={muted}>
          모든 요청 메서드의 마지막 인자 <code>config</code>는 axios의 <code>AxiosRequestConfig</code>입니다. 요청 하나에만 다른 <code>timeout</code>이나 헤더를 줄 때 씁니다.
        </p>
      </Block>

      <Block title="parseApiError">
        <Signature>{`function parseApiError(error: unknown): IApiError`}</Signature>
        <p className={muted}>
          어떤 오류든 <code>IApiError</code> 한 가지 모양으로 맞춰 줍니다. 화면에서는 이것의 <code>statusCode</code>와 <code>message</code>만 보여 주면 됩니다.
        </p>
        <RefTable head={["Input", "statusCode", "message", "Note"]} rows={TABLES.axios.parseApiErrorCases.rows} anchor={tableAnchor(TABLES.axios.parseApiErrorCases)} />
        <RefLabel>IApiError</RefLabel>
        <RefTable rows={TABLES.axios.iapierror.rows} anchor={tableAnchor(TABLES.axios.iapierror)} />
      </Block>

      <Block title="removeUndefined">
        <Signature>{`function removeUndefined<T extends object>(params?: T): Partial<T>`}</Signature>
        <p className={muted}>
          쿼리 객체에서 <code>undefined</code>와 공백뿐인 문자열을 뺍니다. <code>null</code>, <code>0</code>, <code>false</code>는 남깁니다. 비어 있는 검색 조건을 요청에서 빼고 싶을 때 씁니다.
        </p>
        <CodeBlock title="example">{`removeUndefined({ q: "  ", page: 1, sort: undefined, active: false });
// → { page: 1, active: false }`}</CodeBlock>
      </Block>

      <Block title="isTokenExpired">
        <Signature>{`function isTokenExpired(expiresAt: number | undefined): boolean`}</Signature>
        <p className={muted}>
          만료 시각(밀리초 단위 epoch)이 지났는지 알려 줍니다. 값이 없으면 만료된 것으로 봅니다. <code>getToken</code>에서 토큰을 새로 받을지 정할 때 씁니다.
        </p>
      </Block>

      <Block title="attachInterceptors">
        <Signature>{`function attachInterceptors(instance: AxiosInstance, options: HttpClientOptions): void`}</Signature>
        <p className={muted}>
          이미 있는 axios 인스턴스에 이 패키지의 정책(인증, 401 처리, 로그)만 붙입니다. 기존 코드를 <code>createHttpClient</code>로 한 번에 바꾸기 어려울 때 씁니다. <code>baseURL</code>, <code>unwrap</code> 등 클라이언트 생성에 쓰이는 옵션은
          무시됩니다.
        </p>
      </Block>

      <Block title="Types">
        <RefLabel>RequestLog — onRequest가 받는 값</RefLabel>
        <RefTable rows={TABLES.axios.requestlog.rows} anchor={tableAnchor(TABLES.axios.requestlog)} />
        <RefLabel>ResponseLog — onResponse가 받는 값</RefLabel>
        <RefTable rows={TABLES.axios.responselog.rows} anchor={tableAnchor(TABLES.axios.responselog)} />
        <RefLabel>DeleteOptions — delete의 두 번째 인자</RefLabel>
        <RefTable rows={TABLES.axios.deleteoptions.rows} anchor={tableAnchor(TABLES.axios.deleteoptions)} />
      </Block>

      <Block title="Singleton (@txstack/axios/singleton)">
        <Signature>{`function initHttpClient(options: HttpClientOptions): HttpClient
function getHttpClient(): HttpClient
function resetHttpClient(): void`}</Signature>
        <p className={muted}>
          앱 전역에 클라이언트 하나를 두는 방식입니다. <code>initHttpClient</code>는 부를 때마다 새로 만들어 교체하고, <code>getHttpClient</code>는 만들기 전에 부르면 오류를 던집니다. <code>resetHttpClient</code>는 테스트에서 상태를 비울 때 씁니다.
        </p>
        <TxAlert variant="info" title="새 코드에서는 createHttpClient를 쓰세요">
          모듈에서 만든 클라이언트를 export하면 같은 효과를 전역 상태 없이 얻을 수 있습니다. 이 진입점은 <code>initAxios</code>/<code>getAxios</code> 같은 기존 패턴을 옮기는 동안 쓰도록 남겨 둔 것입니다.
        </TxAlert>
      </Block>
    </Page>
  );
}
