import { useState } from "react";
import { TxCollapsible } from "../TxCollapsible";
import { cm } from "../tx-ui.utils";
import type { TxAccordionProps, TxAccordionValue } from "./TxAccordion.types";

/** 숫자 하나로 준 것도 받아 준다. 하나만 열 때 배열로 감싸게 하지 않는다. */
const toValue = (input: number | TxAccordionValue | undefined): TxAccordionValue => (input == null ? [] : Array.isArray(input) ? input : [input]);

/**
 * 여러 덩이를 이어 붙이고 **하나씩만 열리게** 한다.
 *
 * @example
 * ```tsx
 * <TxAccordion
 *   items={[
 *     { title: "배송은 얼마나 걸리나요?", content: "2~3일 안에 받습니다." },
 *     { title: "교환은 어떻게 하나요?", content: "수령 후 7일 이내에 신청합니다." }
 *   ]}
 * />
 * ```
 *
 * 덩이 하나하나는 **`TxCollapsible`** 이다 — 네이티브 `<details>` 라 접힌 글도 ⌘F 로 찾힌다.
 * 여기서 더하는 것은 **이어 붙인 겉모습과, 열린 것을 하나로 묶어 두는 일**뿐이다.
 *
 * 상자를 떨어뜨려 놓고 싶으면 `TxCollapsible` 을 그냥 여러 개 쓴다 — 이쪽은 **이어 붙은 목록**이다.
 *
 * `TxTabs` 와 형제다. 같은 정보를 **한 번에 하나만 보여 준다**는 점이 같고,
 * 탭은 자리를 나란히 두고 이쪽은 위아래로 편다.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxAccordion = ({ items, multiple = false, value, defaultValue, onChange, headingLevel, hideMarker = false, className, classNames, ...props }: TxAccordionProps) => {
  const controlled = value !== undefined;
  const [own, setOwn] = useState<TxAccordionValue>(() => toValue(defaultValue));

  const openList = controlled ? toValue(value) : own;

  const settle = (next: TxAccordionValue) => {
    if (!controlled) setOwn(next);
    onChange?.(next);
  };

  /**
   * 한 덩이가 여닫혔다는 소식.
   *
   * **하나만 열리는 모드에서는 여는 순간 나머지가 닫힌다** — 상태가 배열 하나뿐이라
   * 서로 어긋날 자리가 없다. 브라우저의 `<details name>` 에 맡기지 않는 이유가 이것이다.
   * 그쪽에 맡기면 여는 길이 둘이 되어(브라우저와 우리) 어느 쪽이 이겼는지 따라다녀야 한다.
   */
  const hdOpenChange = (index: number, open: boolean) => {
    if (!open) {
      settle(openList.filter((item) => item !== index));
      return;
    }

    settle(multiple ? [...openList, index] : [index]);
  };

  return (
    <div {...props} data-tag="TxAccordion" className={cm("tx-accordion", className)}>
      {items.map((item, index) => (
        <TxCollapsible
          key={index}
          className={cm("tx-accordion__item", classNames?.item)}
          classNames={{ summary: classNames?.summary, title: classNames?.title, marker: classNames?.marker, body: classNames?.body }}
          title={item.title}
          titleAs={headingLevel ? (`h${headingLevel}` as const) : undefined}
          disabled={item.disabled}
          hideMarker={hideMarker}
          open={openList.includes(index)}
          onOpenChange={(open) => hdOpenChange(index, open)}
        >
          {item.content}
        </TxCollapsible>
      ))}
    </div>
  );
};
