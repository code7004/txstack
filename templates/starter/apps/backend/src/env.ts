import { existsSync } from "node:fs";

const ENVS = ["local", "dev", "live"] as const;
export type AppEnv = (typeof ENVS)[number];

export type Env = { appEnv: AppEnv; port: number };

/** 시작할 때 한 번 읽는다. 필수 값이 없거나 틀리면 바로 멈춘다 — 잘못된 설정으로 뜬 서버가 더 위험하다 */
export function loadEnv(): Env {
  if (existsSync(".env")) process.loadEnvFile(".env");

  const problems: string[] = [];
  const appEnv = process.env.APP_ENV as AppEnv;
  if (!ENVS.includes(appEnv)) problems.push(`APP_ENV 는 ${ENVS.join(" · ")} 중 하나다 (지금: ${process.env.APP_ENV ?? "없음"})`);
  const port = Number(process.env.PORT);
  if (!Number.isInteger(port) || port <= 0) problems.push(`PORT 가 숫자가 아니다 (지금: ${process.env.PORT ?? "없음"})`);

  if (problems.length) {
    console.error(["환경 변수가 맞지 않아 멈춘다 — apps/backend/.env.example 을 보라", ...problems.map((p) => `- ${p}`)].join("\n"));
    process.exit(1);
  }
  return { appEnv, port };
}
