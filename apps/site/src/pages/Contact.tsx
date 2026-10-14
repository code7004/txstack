import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../components/CodeBlock";
import { Block, Page } from "../components/Page";

const REPO = "https://github.com/code7004/txstack";

/** 무엇을 들고 어디로 가는가. **창구는 저장소 하나다** — 흩어지면 답이 흩어진다 */
const CHANNELS = [
  { title: "Bug", what: "컴포넌트가 문서대로 동작하지 않을 때", href: `${REPO}/issues/new?labels=bug`, action: "이슈 열기" },
  { title: "Feature request", what: "필요한 컴포넌트, prop, 토큰이 있을 때", href: `${REPO}/issues/new?labels=enhancement`, action: "이슈 열기" },
  { title: "Question", what: "사용법이나 특정 상황의 해결 방법이 궁금할 때", href: `${REPO}/issues`, action: "이슈 둘러보기" }
];

export function Contact() {
  return (
    <Page title="Contact" lead="질문, 제안, 버그 제보는 모두 GitHub 저장소의 이슈로 받습니다. 이슈로 남기면 같은 문제를 겪는 다른 사람도 답을 찾을 수 있습니다.">
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

      <Block title="Reporting a bug">
        <p className="text-slate-600 dark:text-slate-300">
          아래 세 가지를 적어 주시면 대부분 바로 재현할 수 있습니다. <strong>가장 도움이 되는 것은 최소 재현 코드</strong>입니다. 화면 전체보다 문제가 되는 컴포넌트 하나로 줄인 코드가 좋습니다.
        </p>
        <CodeBlock language="markdown" title="이슈 본문">{`## 문제
TxForm.Input에 error를 넘기면 메시지는 나오지만 입력 칸 테두리가 바뀌지 않습니다

## 재현
<TxForm.Input caption="메일" error="메일 형식이 아닙니다" />

## 환경
@txstack/ui 0.1.0 · react 19.2 · Chrome 141 · Tailwind 4 함께 사용`}</CodeBlock>
      </Block>

      <TxAlert variant="info" title="보안 문제는 공개 이슈로 올리지 마세요">
        악용될 수 있는 결함이라면 저장소의 <strong>Security › Report a vulnerability</strong>에서 비공개로 알려 주세요.
      </TxAlert>
    </Page>
  );
}
