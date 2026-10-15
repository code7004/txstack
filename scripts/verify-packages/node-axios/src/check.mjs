// React 없이 Node 에서 돈다. 네트워크 대신 adapter 로 답한다
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createHttpClient, parseApiError } from "@txstack/axios";
import { getHttpClient, initHttpClient, resetHttpClient } from "@txstack/axios/singleton";

assert.equal(existsSync("node_modules/react"), false, "react 가 설치되어 있으면 안 된다");

const logs = [];
const client = createHttpClient({
  baseURL: "https://api.example.com",
  getToken: () => "token-1",
  unwrap: (data) => data.body,
  onRequest: (log) => logs.push(log)
});
client.setConfig({
  adapter: async (config) => {
    if (config.url === "/fail") {
      const error = Object.assign(new Error("Request failed with status code 400"), { isAxiosError: true, config, response: { status: 400, data: { statusCode: 400, message: "잘못된 요청" }, headers: {}, config } });
      throw error;
    }
    return { data: { body: { auth: config.headers.Authorization } }, status: 200, statusText: "OK", headers: {}, config };
  }
});

const ok = await client.post("/login?token=t", { password: "pw" });
assert.equal(ok.auth, "Bearer token-1");
assert.deepEqual(logs[0].data, { password: "******" });
assert.equal(logs[0].url, "/login?token=******");

await assert.rejects(client.get("/fail"), (error) => parseApiError(error).message === "잘못된 요청");

initHttpClient({ baseURL: "https://api.example.com" });
assert.ok(getHttpClient());
resetHttpClient();

console.log("node-axios: ok");
