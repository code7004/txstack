import { type DynamicModule, Module } from "@nestjs/common";
import type { Env } from "./env";
import { HealthController } from "./health.controller";
import { ENV } from "./tokens";

@Module({})
export class AppModule {
  /** 읽어 둔 환경 값을 주입할 수 있게 한다 — 컨트롤러 · 서비스는 process.env 를 직접 읽지 않는다 */
  static forRoot(env: Env): DynamicModule {
    return { module: AppModule, controllers: [HealthController], providers: [{ provide: ENV, useValue: env }] };
  }
}
