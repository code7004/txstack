import { useEffect, useRef } from "react";
import { Highlight, type PrismTheme } from "prism-react-renderer";
import { TxCopyButton } from "@txstack/ui";

/**
 * **코드가 읽히는 것이 문서의 절반이다.** 색은 토큰에서 오지 않는다 — 코드 배색은 라이트·다크
 * 어느 쪽에서도 같은 어두운 판 위에서 읽히는 편이 눈이 덜 피곤하다(터미널이 그렇다).
 */
const theme: PrismTheme = {
  plain: { color: "var(--site-code-text)", backgroundColor: "var(--site-code-bg)" },
  styles: [
    { types: ["comment"], style: { color: "#6b7f8f", fontStyle: "italic" } },
    { types: ["string", "attr-value"], style: { color: "#9ae6b4" } },
    { types: ["keyword", "operator"], style: { color: "#7dd3fc" } },
    { types: ["function", "tag"], style: { color: "#5eead4" } },
    { types: ["attr-name", "property"], style: { color: "#fbcfe8" } },
    { types: ["number", "boolean"], style: { color: "#fdba74" } },
    { types: ["punctuation"], style: { color: "#8fa3b5" } }
  ]
};

export interface CodeBlockProps {
  children: string;
  language?: string;
  /** 위에 붙는 이름표 — 파일 이름이나 `sh` 같은 것. */
  title?: string;
  /** 복사 버튼을 없앤다. 짧은 한 줄에는 성가시다. */
  hideCopy?: boolean;
  /** 긴 파일은 이 높이에서 자르고 안에서 구르게 한다. 통째 소스가 페이지를 몇 화면씩 밀어내지 않게 */
  maxHeight?: string;
  /** 짚어 줄 줄(1부터). 바탕과 줄 앞 표식(▸)으로 보이고, 판 밖이면 판 안에서 그 줄까지 굴린다 */
  marked?: number[];
}

export function CodeBlock({ children, language = "tsx", title, hideCopy = false, maxHeight, marked }: CodeBlockProps) {
  const code = children.trim();
  const pre = useRef<HTMLPreElement>(null);
  const first = marked?.length ? Math.min(...marked) : undefined;

  // 짚은 줄이 판 밖이면 판 안에서만 굴려 보인다. 페이지는 움직이지 않는다(줄의 위치는 `relative` 인 pre 기준)
  useEffect(() => {
    const box = pre.current;
    const line = first && box?.querySelector<HTMLElement>("[data-marked]");
    if (!box || !line) return;
    if (line.offsetTop < box.scrollTop || line.offsetTop + line.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTo({ top: line.offsetTop - box.clientHeight / 3 });
    }
  }, [first]);

  return (
    <figure className="not-prose overflow-hidden rounded-lg border" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--site-code-bg)" }}>
      <figcaption className="flex items-center gap-2 border-b px-3 py-1.5" style={{ borderColor: "#1e2a36" }}>
        {/* 긴 파일 이름은 말줄임으로 — 복사 버튼을 밀어내지 않는다 */}
        <span className="min-w-0 truncate font-mono text-xs" style={{ color: "#6b7f8f" }} title={title ?? language}>
          {title ?? language}
        </span>

        {/* 복사는 우리 부품이 한다 — 클립보드·되돌리기·실패까지 이미 들어 있다 */}
        {/* 코드 판은 라이트에서도 어둡다. 버튼 글자를 판의 글자색에 맞춰야 라이트에서 묻히지 않는다 */}
        {!hideCopy && (
          <TxCopyButton value={code} variant="ghost" className="ms-auto shrink-0 text-xs" style={{ "--tx-button-fg": "var(--site-code-text)", "--tx-color-state": "#ffffff", "--tx-copy-button-min-width": "5rem" } as React.CSSProperties} />
        )}
      </figcaption>

      <Highlight theme={theme} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          // 좁은 화면에서는 글자를 한 단 줄인다 — 같은 줄이 덜 잘린다
          <pre ref={pre} className={`${className} relative overflow-auto p-4 text-xs leading-relaxed sm:text-sm`} style={{ ...style, maxHeight }}>
            {tokens.map((line, index) => (
              <div key={index} {...getLineProps({ line })} data-marked={marked?.includes(index + 1) || undefined}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </figure>
  );
}
