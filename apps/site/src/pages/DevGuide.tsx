import { TxAlert } from "@txstack/ui";
import { Link } from "react-router-dom";
import { CodeBlock } from "../components/CodeBlock";
import { Block, Page } from "../components/Page";
import LLMS from "../../../../packages/dev-guide/llms.txt?raw";
import PKG from "../../../../packages/dev-guide/package.json?raw";
import README from "../../../../packages/dev-guide/README.md?raw";

/**
 * `@txstack/dev-guide` 를 사람에게 소개한다. 파일 자체는 빌드가 `/dev-guide/…` 에 그대로 싣는다
 * (`vite.config.ts` 의 `devGuide()`).
 *
 * 설치 명령 · 붙이는 절차 · 붙일 문단 · 장 목록은 **패키지의 README · llms.txt 에서 그대로 꺼낸다** —
 * 이 화면에 따로 적으면 설치한 사람이 읽는 것과 사이트가 보여 주는 것이 갈린다.
 */

/** `needle` 을 담은 첫 코드 블록. 없으면 빌드가 실패한다 — README 가 바뀐 것을 조용히 넘기지 않게 */
function fence(needle: string) {
  const block = [...README.matchAll(/```\w*\n([\s\S]*?)\n```/g)].map((match) => match[1]).find((body) => body.includes(needle));
  if (!block) throw new Error(`packages/dev-guide/README.md 에 "${needle}" 를 담은 코드 블록이 없습니다`);
  return block;
}

const INSTALL = fence("pnpm add -D @txstack/dev-guide ");
const INSTALL_MONOREPO = fence("pnpm add -D -w @txstack/dev-guide");
const SETUP = fence("mkdir -p docs");
const FIRST_TASK = fence("docs/requirements/$n.md");
const PARAGRAPH = fence("## 개발 기준");

const VERSION = (JSON.parse(PKG) as { version: string }).version;

/** llms.txt 의 `## 묶음` 아래 `- [경로](경로): 설명` 줄들 */
const SECTIONS = LLMS.split(/^## /m)
  .slice(1)
  .map((chunk) => {
    const [title, ...lines] = chunk.split("\n");
    const items = lines.flatMap((line) => {
      const match = line.match(/^- \[([^\]]+)\]\(([^)]+)\): (.+)$/);
      return match ? [{ path: match[2], what: match[3] }] : [];
    });
    return { title: title.trim(), items };
  })
  .filter((section) => section.items.length > 0);

const BASE = import.meta.env.BASE_URL;
const muted = "text-slate-600 dark:text-slate-300";
const border = { borderColor: "var(--tx-color-border)" };

export function DevGuide() {
  return (
    <Page title="Dev Guide" lead="프로젝트에서 공통으로 사용할 개발 규칙과 문서 템플릿을 제공합니다. 스크립트 이름과 코드 · 커밋 규칙을 정리하고, 요구사항부터 계획 · 구현 · 검증 · 보고까지 일관된 절차로 관리할 수 있습니다.">
      <TxAlert variant="info">
        Dev Guide는 프로젝트의 개발 규칙과 작업 절차를 다룹니다. <code>@txstack/ui</code>의 컴포넌트를 선택하고 사용하는 방법은 <Link to="/docs/ai-guide">AI Guide</Link>에서 확인할 수 있습니다.
      </TxAlert>

      <Block title="Install">
        <p className={muted}>
          마크다운 문서와 템플릿으로 구성된 개발용 패키지입니다. 런타임 코드는 없으며, 설치한 버전의 규칙과 양식을 확인할 수 있습니다. 이 사이트가 보여 주는 버전은 <code>{VERSION}</code>(<code>main</code> 기준)입니다.
        </p>
        <CodeBlock language="bash" title="일반 저장소">
          {INSTALL}
        </CodeBlock>
        <CodeBlock language="bash" title="pnpm 모노레포 — 루트에 한 번">
          {INSTALL_MONOREPO}
        </CodeBlock>
      </Block>

      <Block title="Set up a project">
        <p className={muted}>
          저장소 루트에서 아래 명령을 실행하면 문서 폴더와 기본 파일을 만듭니다. <strong>기존 파일은 덮어쓰지 않으므로</strong>, 출력된 경로를 확인하고 템플릿에서 필요한 내용을 반영하세요.
        </p>
        <CodeBlock language="bash" title="폴더 · 기본 양식">
          {SETUP}
        </CodeBlock>
        <p className={muted}>
          <code>{"<…>"}</code> 표시를 프로젝트에 맞게 바꾸고, <code>docs/rules/00_DEV_GUIDE_DIFF.md</code>에 적용 버전을 기록하세요. 공통 규칙과 다르게 적용할 내용이 생기면 같은 문서에 예외와 이유를 추가합니다 — 규칙을 프로젝트 문서에 복사하면
          패키지를 업데이트해도 반영되지 않습니다.
        </p>
        <CodeBlock language="bash" title="첫 작업">
          {FIRST_TASK}
        </CodeBlock>
      </Block>

      <Block title="AI tool instructions">
        <p className={muted}>
          Claude Code는 <code>CLAUDE.md</code>, Codex는 <code>AGENTS.md</code>에서 프로젝트 지침을 확인합니다. 아래 문단을 맨 위에 추가해 설치된 Dev Guide를 참조하도록 안내하세요. <code>@txstack/ui</code>를 사용한다면{" "}
          <Link to="/docs/ai-guide">AI Guide</Link>의 UI 사용 지침도 함께 추가할 수 있습니다.
        </p>
        <CodeBlock language="markdown" title="CLAUDE.md · AGENTS.md">
          {PARAGRAPH}
        </CodeBlock>
      </Block>

      <Block title="What's inside">
        <p className={muted}>
          아래 문서는 사이트에 배포된 <code>main</code> 기준입니다. AI 도구에는 프로젝트에 설치된 <code>node_modules/@txstack/dev-guide/…</code> 경로의 문서를 참조하도록 안내하세요.
        </p>
        {SECTIONS.map((section) => (
          <div key={section.title} className="overflow-x-auto">
            <table className="site-stack-table w-full text-sm">
              <thead>
                <tr className="border-b text-start" style={border}>
                  <th className="w-56 py-2 pe-4 text-start font-semibold">{section.title}</th>
                  <th className="py-2 text-start font-semibold">내용</th>
                </tr>
              </thead>
              <tbody className={muted}>
                {section.items.map((item) => (
                  <tr key={item.path} className="border-b align-top" style={border}>
                    <td className="py-2 pe-4 font-mono text-xs whitespace-nowrap">
                      <a href={`${BASE}dev-guide/${item.path}`} className="underline">
                        {item.path}
                      </a>
                    </td>
                    <td className="py-2" data-label="내용">
                      {item.what}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </Block>

      <Block title="Upgrading">
        <p className={muted}>
          규칙이 바뀌는 버전으로 업데이트할 때는 <a href={`${BASE}dev-guide/CHANGELOG.md`}>CHANGELOG</a>와 프로젝트별 예외(<code>00_DEV_GUIDE_DIFF.md</code>)를 비교해 영향을 확인하세요. 적용할 변경과 예외를 정한 뒤 적용 버전을 기록합니다.
          <strong>프로젝트에 복사한 템플릿은 자동으로 바뀌지 않으므로</strong> 필요한 내용을 별도로 반영해야 합니다.
        </p>
        <TxAlert variant="info">
          patch(<code>0.1.x</code>)는 문구만 바뀌어 별도 검토가 필요 없습니다. minor(<code>0.x.0</code>)는 규칙이 바뀌므로 영향을 검토한 뒤 적용합니다. 자세한 절차는 <a href={`${BASE}dev-guide/README.md`}>README</a>의 「Update」에 있습니다.
        </TxAlert>
      </Block>
    </Page>
  );
}
