import { Link } from "react-router-dom";
import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import { RefLabel, RefTable, Signature } from "../../components/Reference";

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
        <RefTable
          head={["Entry", "Exports", "Peer", "Description"]}
          rows={[
            ["@txstack/axios", "createHttpClient · parseApiError · removeUndefined · isTokenExpired · attachInterceptors", "axios >=1.6", "기본 진입점"],
            ["@txstack/axios/singleton", "initHttpClient · getHttpClient · resetHttpClient", "axios >=1.6", "전역 클라이언트가 필요한 기존 코드를 옮길 때만 씁니다"]
          ]}
        />
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
        <RefTable
          rows={[
            ["baseURL", "string", "필수", '요청 주소의 앞부분. 예: "/api", "https://api.example.com"'],
            ["timeout", "number", "0 (제한 없음)", "응답을 기다리는 최대 시간(ms). 넘으면 요청이 실패합니다"],
            ["headers", "Record<string, string>", "—", "모든 요청에 붙일 헤더. Content-Type은 넣지 마세요(아래 참고)"],
            ["withCredentials", "boolean", "false", "다른 도메인 요청에 쿠키를 함께 보낼지. 쿠키 인증을 쓸 때만 켭니다"],
            ["getToken", "() => string | null | undefined | Promise<…>", "—", "요청마다 불려 인증 헤더를 만듭니다. 값이 없으면 헤더를 붙이지 않습니다"],
            ["authHeader", "string", '"Authorization"', "인증 헤더 이름"],
            ["authScheme", "string", '"Bearer"', "토큰 앞에 붙는 말. 빈 문자열이면 토큰만 넣습니다"],
            ["onUnauthorized", "(error: AxiosError) => void", "—", "401 응답을 받으면 불립니다. 로그아웃 같은 처리를 여기서 합니다"],
            ["onError", "(error: AxiosError) => void", "—", "모든 오류 응답에서 불립니다(401 포함, onUnauthorized 다음)"],
            ["unwrap", "(data: unknown) => unknown", "res.data 그대로", "응답에서 실제 데이터를 꺼냅니다. 응답이 { body: T } 형식이면 data => data.body"],
            ["onRequest", "(log: RequestLog) => void", "—", "요청이 나가기 직전에 불립니다. 로그를 모니터링 도구로 보낼 때 씁니다"],
            ["onResponse", "(log: ResponseLog) => void", "—", "응답을 받으면 불립니다. durationMs로 느린 요청을 찾을 수 있습니다"],
            ["maskFields", "string[]", "password, privateKey, token, accessToken, refreshToken", "로그에서 값을 가릴 필드 이름. onRequest · onResponse에 넘기기 전에 가립니다"],
            ["debug", "boolean", "false", "켜면 요청 · 응답 · 오류를 콘솔에 출력합니다. onRequest · onResponse를 직접 넘기면 그쪽이 우선합니다"]
          ]}
        />
        <TxAlert variant="warning" title="Content-Type을 고정하지 마세요">
          <code>headers</code>에 <code>Content-Type</code>을 넣으면 파일 업로드(<code>FormData</code>)에서 필요한 boundary 값이 빠져 서버가 본문을 읽지 못합니다. 보내는 데이터에 맞게 axios가 정하도록 두세요.
        </TxAlert>
      </Block>

      <Block title="HttpClient">
        <p className={muted}>
          <code>createHttpClient</code>가 돌려주는 객체입니다. 요청 메서드는 <code>unwrap</code>을 거친 데이터를 돌려줍니다.
        </p>
        <RefTable
          head={["Member", "Signature", "Returns", "Description"]}
          rows={[
            ["get", "get<T>(url, params?, config?)", "Promise<T>", "두 번째 인자가 쿼리 문자열이 됩니다"],
            ["post", "post<T>(url, body?, config?)", "Promise<T>", "객체는 JSON으로, FormData는 multipart로 보냅니다"],
            ["put", "put<T>(url, body?, config?)", "Promise<T>", ""],
            ["patch", "patch<T>(url, body?, config?)", "Promise<T>", ""],
            ["delete", "delete<T>(url, options?: DeleteOptions, config?)", "Promise<T>", "쿼리(params)와 본문(body)을 함께 보낼 수 있습니다"],
            ["getBlob", "getBlob(url, config?)", "Promise<Blob>", "unwrap을 거치지 않은 원본. 파일 내려받기에 씁니다. 브라우저와 Node 모두 Blob을 돌려줍니다"],
            ["getText", "getText(url, config?)", "Promise<string>", "unwrap을 거치지 않은 원본 텍스트. CSV 등에 씁니다"],
            ["setBaseURL", "setBaseURL(baseURL)", "void", "앱이 시작된 뒤에 서버 주소가 정해질 때 바꿉니다"],
            ["setConfig", "setConfig(config: Partial<AxiosRequestConfig>)", "void", "내부 axios 인스턴스의 기본 설정에 덮어씁니다"],
            ["instance", "AxiosInstance", "—", "내부 axios 인스턴스. 이 클라이언트로 처리할 수 없는 요청에 직접 씁니다"]
          ]}
        />
        <p className={muted}>
          모든 요청 메서드의 마지막 인자 <code>config</code>는 axios의 <code>AxiosRequestConfig</code>입니다. 요청 하나에만 다른 <code>timeout</code>이나 헤더를 줄 때 씁니다.
        </p>
      </Block>

      <Block title="parseApiError">
        <Signature>{`function parseApiError(error: unknown): IApiError`}</Signature>
        <p className={muted}>
          어떤 오류든 <code>IApiError</code> 한 가지 모양으로 맞춰 줍니다. 화면에서는 이것의 <code>statusCode</code>와 <code>message</code>만 보여 주면 됩니다.
        </p>
        <RefTable
          head={["Input", "statusCode", "message", "Note"]}
          rows={[
            ["응답 본문이 있는 axios 오류", "본문의 statusCode → HTTP 상태 → 500", '본문의 message, 없으면 "Request failed"', "error · path · timestamp도 본문에서 옮깁니다"],
            ["본문이 없는 axios 오류", "HTTP 상태, 없으면 500", "axios 오류 메시지", "시간 초과 · 네트워크 오류가 여기에 해당합니다"],
            ["일반 Error", "500", "error.message", ""],
            ["그 밖의 값", "500", '"Unknown error"', ""]
          ]}
        />
        <RefLabel>IApiError</RefLabel>
        <RefTable
          rows={[
            ["statusCode", "number", "—", "HTTP 상태 코드 또는 서버가 보낸 코드"],
            ["message", "string", "—", "사용자에게 보여 줄 메시지"],
            ["error", "string?", "—", "서버가 보낸 오류 이름"],
            ["path", "string?", "—", "오류가 난 요청 경로"],
            ["timestamp", "string?", "—", "서버가 기록한 시각"]
          ]}
        />
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
        <RefTable
          rows={[
            ["method", "string", "—", "대문자 HTTP 메서드"],
            ["url", "string", "—", "요청 경로"],
            ["params", "unknown", "—", "쿼리. maskFields가 가려진 값입니다"],
            ["data", "unknown", "—", "본문. maskFields가 가려진 값입니다"]
          ]}
        />
        <RefLabel>ResponseLog — onResponse가 받는 값</RefLabel>
        <RefTable
          rows={[
            ["status", "number", "—", "HTTP 상태 코드"],
            ["method", "string", "—", "대문자 HTTP 메서드"],
            ["url", "string", "—", "요청 경로"],
            ["data", "unknown", "—", "응답 본문. maskFields가 가려진 값입니다"],
            ["durationMs", "number", "—", "요청부터 응답까지 걸린 시간"]
          ]}
        />
        <RefLabel>DeleteOptions — delete의 두 번째 인자</RefLabel>
        <RefTable
          rows={[
            ["params", "unknown", "—", "쿼리 문자열"],
            ["body", "unknown", "—", "요청 본문"]
          ]}
        />
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
