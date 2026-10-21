/** `ai-guide.mjs` 의 타입 — `apps/site/vite.config.ts` 와 테스트가 TypeScript 에서 부른다 */

export interface AiGuideOptions {
  /** 저장소 루트. 기본은 이 스크립트의 부모 폴더 */
  root?: string;
  /** `package` — 전부 한 폴더 아래. `site` — `llms*.txt` 는 루트, 나머지는 `ai/` 아래 */
  layout?: "package" | "site";
}

export interface DocInfo {
  title: string;
  summary: string;
  entry: string | undefined;
  exports: string | undefined;
}

export function describeDoc(markdown: string): DocInfo;
export function buildAiGuide(options?: AiGuideOptions): Map<string, string>;
export function writeAiGuide(outDir: string, options?: AiGuideOptions): Map<string, string>;
