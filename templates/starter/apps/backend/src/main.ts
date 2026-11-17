import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { loadEnv } from "./env";

// pnpm dev:backend · pnpm start:backend
async function bootstrap() {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule.forRoot(env));
  app.enableShutdownHooks();
  await app.listen(env.port);
  console.log(`backend — http://localhost:${env.port}/health (${env.appEnv})`);
}

void bootstrap();
