import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../components/CodeBlock";
import { Block, Page } from "../components/Page";

const REPO = "https://github.com/code7004/txstack";

/** 무엇을 들고 어디로 가는가. **창구는 저장소 하나다** — 흩어지면 답이 흩어진다 */
const CHANNELS = [
  { title: "버그", what: "부품이 문서대로 동작하지 않는다", href: `${REPO}/issues/new?labels=bug`, action: "이슈 열기" },
  { title: "제안", what: "이런 부품 · 이런 prop · 이런 토큰이 있으면 좋겠다", href: `${REPO}/issues/new?labels=enhancement`, action: "이슈 열기" },
  { title: "질문", what: "쓰는 법을 모르겠다 · 이 경우엔 어떻게 하나", href: `${REPO}/issues`, action: "이슈 둘러보기" }
];

export function Contact() {
  return (
    <Page title="Contact" lead="질문 · 제안 · 버그는 전부 GitHub 저장소의 이슈로 받는다. 다른 사람이 같은 것을 찾을 때 답이 그 자리에 남는다.">
      <div className="grid gap-3 sm:grid-cols-3">
        {CHANNELS.map((item) => (
          <a key={item.title} href={item.href} target="_blank" rel="noreferrer" className="site-card flex flex-col gap-2 rounded-lg border p-4">
            <span className="flex items-baseline">
              <span className="font-semibold">{item.title}</span>
              <span aria-hidden className="site-card__arrow ms-auto">
                ↗
              </span>
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-300">{item.what}</span>
            <span className="mt-auto pt-2 text-xs font-semibold text-[color:var(--tx-color-primary-strong)]">{item.action}</span>
          </a>
        ))}
      </div>

      <Block title="버그를 알릴 때">
        <p className="text-slate-600 dark:text-slate-300">
          아래 셋이 있으면 대부분 바로 재현된다. <strong>가장 빠른 것은 최소 재현 코드</strong>다 — 화면 전체보다 부품 하나가 낫다.
        </p>
        <CodeBlock language="markdown" title="이슈 본문">{`## 무엇이
TxForm.Input 에 error 를 주면 메시지는 뜨는데 칸 테두리가 안 바뀐다

## 재현
<TxForm.Input caption="메일" error="형식이 아니다" />

## 환경
@txstack/ui 0.1.0 · react 19.2 · Chrome 141 · Tailwind 4 와 함께`}</CodeBlock>
      </Block>

      <TxAlert variant="info" title="보안 문제는 공개 이슈로 올리지 않는다">
        악용될 수 있는 결함이라면 저장소의 <strong>Security › Report a vulnerability</strong> 로 비공개로 알린다.
      </TxAlert>
    </Page>
  );
}
