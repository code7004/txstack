import { Controller, Get, Inject } from "@nestjs/common";
import { ENV } from "./tokens";
import type { Env } from "./env";

@Controller("health")
export class HealthController {
  constructor(@Inject(ENV) private readonly env: Env) {}

  @Get()
  get() {
    return { status: "ok", env: this.env.appEnv };
  }
}
