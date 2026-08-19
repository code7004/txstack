import React, { useEffect, useMemo, useState, type PropsWithChildren, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { TxCardTheme, type ITxCardProps } from ".";
import { cm, getDisplayName, themeMerge } from "../tx-ui.utils";

const TxCardRoot = ({ className = "flex flex-col", theme, caption, header, footer, link, useFold = false, isFold = false, children, onClick, isLoading = false }: ITxCardProps) => {
  const stableTheme = useMemo(() => themeMerge(TxCardTheme, theme, "override"), [theme]);

  const [folded, _folded] = useState(isFold);

  // ✅ children 중 Header/Footer/나머지 분리
  const captions: ReactNode[] = [];
  const headers: ReactNode[] = [];
  const footers: ReactNode[] = [];
  const rest: ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const name = getDisplayName(child.type) ?? "";

      if (name === "TxCardCaption") captions.push(child);
      else if (name === "TxCardHeader") headers.push(child);
      else if (name === "TxCardFooter") footers.push(child);
      else rest.push(child);
    } else {
      rest.push(child);
    }
  });

  // ✅ Content 존재 여부 체크
  let hasContent = false;

  React.Children.forEach(rest, (child) => {
    if (React.isValidElement(child)) {
      const name = getDisplayName(child.type);
      if (name === "TxCardContent") {
        hasContent = true;
      }
    }
  });

  // ✅ Content 없으면 한번만 감싸기
  const wrappedChildren = hasContent ? rest : <Content className={stableTheme.content}>{rest}</Content>;

  // ✅ 혼용 경고
  // if (hasContent) {
  //   React.Children.forEach(rest, child => {
  //     if (!React.isValidElement(child) || (child.type as any).displayName !== "TxCardContent") {
  //       console.warn("⚠️ [TxCard] TxCard.Content와 일반 children을 섞어쓰면 레이아웃이 예기치 않게 동작할 수 있습니다.");
  //     }
  //   });
  // }

  // ✅ 로딩 상태 계산
  const isShowLoading = isLoading === true || (Array.isArray(isLoading) && isLoading.length === 0);

  useEffect(() => {
    _folded(isFold);
  }, [isFold]);

  return (
    <div data-tag="TxCardRoot" className={cm(stableTheme.base, onClick && "cursor-pointer", className)} onClick={onClick}>
      {caption ? <Caption children={caption} className={stableTheme.caption} /> : captions}

      {(link || useFold) && (
        <div className={stableTheme.floating}>
          {link && (
            <Link to={link} className={stableTheme.floatingLink}>
              더보기
            </Link>
          )}
          {useFold && (
            <button className={stableTheme.floatingButton} onClick={() => _folded((prev) => !prev)}>
              {folded ? "펼치기 🔽" : "접기 🔼"}
            </button>
          )}
        </div>
      )}

      {/* ✅ Header는 항상 상단 */}
      {header ? <Header children={header} className={stableTheme.header} /> : headers}

      {/* ✅ Content or 나머지 children */}
      {!folded &&
        (isShowLoading ? (
          <Content className={cm(stableTheme.contentLoading, stableTheme.content)}>
            <span className="invisible">로딩 중</span>
            <div className={stableTheme.loadingBG} />
          </Content>
        ) : (
          wrappedChildren
        ))}

      {/* ✅ Footer는 항상 하단 */}
      {!folded ? footer ? <Footer children={footer} className={stableTheme.footer} /> : footers : <></>}
    </div>
  );
};

const Caption = ({ className, children, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
  <div data-tag="TxCardCaption" className={className} {...props}>
    {children}
  </div>
);

const Header = ({ className, children, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
  <div data-tag="TxCardHeader" className={className} {...props}>
    {children}
  </div>
);

const Content = ({ className, children, onClick, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
  <div data-tag="TxCardContent" className={cm(className, onClick && "cursor-pointer")} onClick={onClick} {...props}>
    {children}
  </div>
);

const Footer = ({ className, children, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
  <div data-tag="TxCardFooter" className={className} {...props}>
    {children}
  </div>
);

Caption.displayName = "TxCardCaption";
Header.displayName = "TxCardHeader";
Content.displayName = "TxCardContent";
Footer.displayName = "TxCardFooter";

export const TxCard = Object.assign(TxCardRoot, { Caption, Header, Content, Footer });
