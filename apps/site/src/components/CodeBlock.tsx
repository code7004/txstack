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
}

export function CodeBlock({ children, language = "tsx", title, hideCopy = false }: CodeBlockProps) {
  const code = children.trim();

  return (
    <figure className="not-prose overflow-hidden rounded-lg border" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--site-code-bg)" }}>
      <figcaption className="flex items-center gap-2 border-b px-3 py-1.5" style={{ borderColor: "#1e2a36" }}>
        <span className="font-mono text-xs" style={{ color: "#6b7f8f" }}>
          {title ?? language}
        </span>

        {/* 복사는 우리 부품이 한다 — 클립보드·되돌리기·실패까지 이미 들어 있다 */}
        {!hideCopy && <TxCopyButton value={code} variant="ghost" className="ms-auto text-xs" />}
      </figcaption>

      <Highlight theme={theme} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} overflow-x-auto p-4 text-sm leading-relaxed`} style={style}>
            {tokens.map((line, index) => (
              <div key={index} {...getLineProps({ line })}>
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
