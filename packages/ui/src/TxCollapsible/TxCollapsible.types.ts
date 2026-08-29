import type { DetailsHTMLAttributes, ReactNode } from "react";

export interface TxCollapsibleProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title" | "onToggle" | "open"> {
  /** 늘 보이는 줄. 이것을 눌러 접고 편다. */
  title: ReactNode;

  /**
   * 펼쳐져 있는가. **주면 controlled** 다 — 값의 주인이 소비자가 된다.
   *
   * 이 prop 을 주고도 `onOpenChange` 를 받아 값을 안 바꾸면 열리지 않는다.
   */
  open?: boolean;

  /** 처음에 펼쳐진 채로 시작한다. `open` 을 주면 무시된다. */
  defaultOpen?: boolean;

  /** 접히거나 펼쳐질 때. */
  onOpenChange?: (open: boolean) => void;

  /** 눌러도 열리지 않는다. 이미 열려 있었다면 그대로 열려 있다. */
  disabled?: boolean;

  /** 오른쪽 화살표를 없앤다. 직접 그릴 때 쓴다. */
  hideMarker?: boolean;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { summary?: string; title?: string; marker?: string; body?: string };

  children?: ReactNode;
}
