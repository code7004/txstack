import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../components/CodeBlock";
import { Block, Page } from "../components/Page";
import RULES from "../../../../docs/013_ai_guide.md?raw";

/**
 * AI 코딩 도구가 읽을 가이드를 사람에게 소개하고 내려받게 한다. 파일 자체는 빌드가 만든다
 * (`vite.config.ts` 의 `aiGuide()` → `scripts/ai-guide.mjs`).
 *
 * 붙여 넣을 문단과 eslint 설정은 **규칙 원본(`docs/013_ai_guide.md`)에서 그대로 꺼낸다** —
 * 이 화면에 따로 적으면 AI 가 읽는 것과 사람이 복사하는 것이 갈린다.
 */

/** `### 제목` 아래 첫 코드 블록. 없으면 빌드가 실패한다 — 원본의 제목이 바뀐 것을 조용히 넘기지 않게 */
function fenceAfter(markdown: string, heading: string) {
  const start = markdown.indexOf(`\n### ${heading}`);
  const block = start < 0 ? null : markdown.slice(start).match(/\n```\w*\n([\s\S]*?)\n```/);
  if (!block) throw new Error(`docs/013_ai_guide.md 에 "### ${heading}" 아래 코드 블록이 없습니다`);
  return block[1];
}

const RULE_PARAGRAPH = fenceAfter(RULES, "`CLAUDE.md` · `AGENTS.md` 에 붙일 문단");
const ESLINT = fenceAfter(RULES, "eslint — 대체품이 있는 원시 요소에 경고");

const BASE = import.meta.env.BASE_URL;

const FILES = [
  { file: "llms.txt", href: `${BASE}llms.txt`, installed: "ai/llms.txt", what: "목차. 핵심 원칙과 부품마다 한 줄 — 처음 읽힐 파일" },
  { file: "llms-full.txt", href: `${BASE}llms-full.txt`, installed: "ai/llms-full.txt", what: "규칙과 다섯 패키지 문서 전부를 한 파일로" },
  { file: "rules.md", href: `${BASE}ai/rules.md`, installed: "ai/rules.md", what: "규칙만 — 결정표 · 쓰지 말 원시 요소 · 토큰 · 부품이 못 하는 것" }
];

const RULE_SECTIONS = [
  { title: "결정표", what: "만들려는 것(펼침 · 상자 · 칩 · 아이콘 버튼 · GNB · 화면 껍데기 · 스켈레톤 · 빈 상태 …)마다 쓸 부품" },
  { title: "직접 만들지 말 원시 요소", what: "<button> · <details> · 손으로 짠 모달 · 토스트 · 드롭다운 · 카드와 그 이유" },
  { title: "커스터마이징", what: "부품 CSS 를 덮지 않고 --tx-* 토큰으로. Tailwind 앱의 @layer 순서" },
  { title: "부품이 못 하는 것", what: "예: TxCard 는 카드 전체를 링크로 만들지 않는다 — 이런 자리만 앱에서 만들고 기록한다" },
  { title: "시작 묶음", what: "CLAUDE.md · AGENTS.md 에 붙일 문단, eslint react/forbid-elements 설정" }
];

const muted = "text-slate-600 dark:text-slate-300";

export function AiGuide() {
  return (
    <Page title="AI Guide" lead="Claude Code · Codex 같은 AI 코딩 도구가 화면을 짤 때 txstack 부품을 먼저 쓰게 하는 가이드입니다. 손으로 버튼 · 펼침 · 카드 · GNB를 다시 만드는 대신 결정표에서 부품을 고르게 합니다.">
      <Block title="Files">
        <p className={muted}>
          문서에서 빌드할 때마다 새로 만듭니다. <code>@txstack/ui</code>를 설치하면 <strong>같은 버전의 가이드가 패키지 안에 함께</strong> 들어옵니다 — AI에게는 설치된 쪽을 읽게 하는 것이 좋습니다. 이 사이트의 파일은 최신 <code>main</code>{" "}
          기준입니다.
        </p>
        <div className="overflow-x-auto">
          <table className="site-stack-table w-full text-sm">
            <thead>
              <tr className="border-b text-start" style={{ borderColor: "var(--tx-color-border)" }}>
                <th className="py-2 pe-4 text-start font-semibold">파일</th>
                <th className="py-2 pe-4 text-start font-semibold">무엇</th>
                <th className="py-2 pe-4 text-start font-semibold">설치된 자리</th>
                <th className="py-2 text-start font-semibold">받기</th>
              </tr>
            </thead>
            <tbody className={muted}>
              {FILES.map((item) => (
                <tr key={item.file} className="border-b align-top" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="py-2 pe-4 font-mono text-xs whitespace-nowrap">
                    <a href={item.href} className="underline">
                      {item.file}
                    </a>
                  </td>
                  <td className="py-2 pe-4">{item.what}</td>
                  <td className="py-2 pe-4 font-mono text-xs" data-label="설치된 자리">
                    node_modules/@txstack/ui/{item.installed}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    <a href={item.href} download={item.file} className="underline">
                      내려받기
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          부품 문서 한 장씩은 <code>ai/docs/001_ui/NNN_TxName.md</code>에 있고, <code>llms.txt</code>의 링크가 그 자리를 가리킵니다.
        </p>
      </Block>

      <Block title="What the rules say">
        <ul className={`list-disc space-y-1 ps-5 ${muted}`}>
          {RULE_SECTIONS.map((item) => (
            <li key={item.title}>
              <strong className="text-[color:var(--tx-color-text)]">{item.title}</strong> — {item.what}
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Add it to your project">
        <p className={muted}>
          프로젝트의 <code>CLAUDE.md</code>(Claude Code) 또는 <code>AGENTS.md</code>(Codex)에 이 문단을 붙입니다. 경로가 설치된 패키지를 가리키므로 txstack을 올리면 가이드도 그 버전이 됩니다. 가이드를 프로젝트에 복사해 두지 마세요 — 복사본은 버전이
          어긋납니다.
        </p>
        <CodeBlock language="markdown" title="CLAUDE.md · AGENTS.md">
          {RULE_PARAGRAPH}
        </CodeBlock>
        <p className={muted}>대체품이 있는 원시 요소에는 eslint가 경고하게 합니다. 오류가 아니라 경고입니다 — 부품이 정말 못 하는 자리는 그 줄에서 끄고 이유를 적습니다.</p>
        <CodeBlock language="js" title="eslint.config.js">
          {ESLINT}
        </CodeBlock>
        <TxAlert variant="info">
          eslint 예외는 <code>{"// eslint-disable-next-line react/forbid-elements -- txstack-gap: <이유>"}</code>처럼 남깁니다. <code>txstack-gap:</code>으로 찾아 모으면 txstack에 더할 후보가 됩니다.
        </TxAlert>
      </Block>
    </Page>
  );
}
