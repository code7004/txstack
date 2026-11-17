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
    <Page
      title="Dev Guide"
      lead="프로젝트를 굴리는 규칙입니다 — 실행 스크립트 이름, 커밋, 작업 공간, 코드, 그리고 요구사항 → 계획 → 구현 → 검증 → 보고로 이어지는 문서 프로세스와 그 양식. 새 프로젝트가 기존 프로젝트를 '참고' 하는 대신 이 패키지를 '따르게' 합니다."
    >
      <TxAlert variant="info">
        화면 부품을 고르는 규칙(결정표 · 토큰 · 쓰지 말 원시 요소)은 여기가 아니라 <Link to="/docs/ai-guide">AI Guide</Link>에 있습니다. Dev Guide는 UI를 무엇으로 짓든 모든 프로젝트에 붙입니다.
      </TxAlert>

      <Block title="Install">
        <p className={muted}>
          런타임 코드가 없는 마크다운 묶음입니다. 설치된 버전과 가이드가 늘 같습니다 — 지금 <code>{VERSION}</code>.
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
          저장소 루트에서 문서 폴더를 만들고 기본 양식을 놓습니다. <strong>이미 있는 파일은 덮어쓰지 않고</strong> 이름을 알려 줍니다 — 그 파일은 양식과 비교해 손으로 합칩니다.
        </p>
        <CodeBlock language="bash" title="폴더 · 기본 양식">
          {SETUP}
        </CodeBlock>
        <p className={muted}>
          <code>{"<…>"}</code> 자리를 채우고, <code>docs/rules/00_DEV_GUIDE_DIFF.md</code>에 따르는 판을 적습니다. 다르게 할 것이 생기면 그 파일에만 적습니다 — 규칙을 프로젝트 문서에 옮겨 적으면 그 순간 갈라집니다.
        </p>
        <CodeBlock language="bash" title="첫 작업">
          {FIRST_TASK}
        </CodeBlock>
      </Block>

      <Block title="Add it to CLAUDE.md">
        <p className={muted}>
          <code>CLAUDE.md</code>(Claude Code) · <code>AGENTS.md</code>(Codex) 맨 위에 둡니다. UI를 txstack으로 짓는다면 그 아래에 <Link to="/docs/ai-guide">AI Guide</Link>의 문단도 붙입니다 — 둘은 담는 것이 달라서 둘 다 둡니다.
        </p>
        <CodeBlock language="markdown" title="CLAUDE.md · AGENTS.md">
          {PARAGRAPH}
        </CodeBlock>
      </Block>

      <Block title="What's inside">
        <p className={muted}>
          사이트의 파일은 최신 <code>main</code> 기준입니다. AI에게는 설치된 쪽(<code>node_modules/@txstack/dev-guide/…</code>)을 읽게 하세요.
        </p>
        {SECTIONS.map((section) => (
          <div key={section.title} className="overflow-x-auto">
            <table className="site-stack-table w-full text-sm">
              <thead>
                <tr className="border-b text-start" style={border}>
                  <th className="w-56 py-2 pe-4 text-start font-semibold">{section.title}</th>
                  <th className="py-2 text-start font-semibold">무엇</th>
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
                    <td className="py-2" data-label="무엇">
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
          판을 올리면 AI가 읽는 규칙이 그 자리에서 바뀝니다. 그래서 올리는 것 자체를 작업 하나로 다룹니다 — <a href={`${BASE}dev-guide/CHANGELOG.md`}>CHANGELOG</a>를 읽고, <code>00_DEV_GUIDE_DIFF.md</code>와 비교해 받아들일 것과 예외를 정한 뒤 따르는
          판을 고칩니다. <strong>이미 복사한 양식은 저절로 바뀌지 않습니다.</strong>
        </p>
        <TxAlert variant="info">
          patch(<code>0.1.x</code>)는 문구만 바뀝니다. minor(<code>0.x.0</code>)는 규칙이 바뀌므로 위 절차를 밟습니다. 자세한 것은 <a href={`${BASE}dev-guide/README.md`}>README</a>의 「버전을 올릴 때」.
        </TxAlert>
      </Block>
    </Page>
  );
}
