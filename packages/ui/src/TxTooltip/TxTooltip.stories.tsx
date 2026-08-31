import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxTooltip } from "./TxTooltip";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const JSON_SAMPLE = {
  id: 8213,
  status: "FAILED",
  attempts: 3,
  url: "https://example.com/callbacks/deposit",
  lastError: "connect ETIMEDOUT"
};

const meta = {
  title: "Overlay/TxTooltip",
  component: TxTooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "올리면 뜨는 짧은 설명.",
          "",
          "```tsx",
          'import { TxTooltip } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxTooltip tip="삭제하면 되돌릴 수 없다">',
          '  <TxButton label="삭제" variant="danger" />',
          "</TxTooltip>;",
          "```",
          "",
          "**여는 길이 셋이다** — 마우스를 올리거나, 키보드로 포커스하거나, 터치로 길게 누른다.",
          "닫는 것은 벗어나기 · Escape · 바깥 누르기다.",
          "",
          "- `tip` 은 `ReactNode` 다. 표 안에서 JSON 을 펼쳐 보여 주는 자리가 그렇다",
          "- **툴팁 위로 마우스를 올려도 안 닫힌다.** 긴 내용을 읽거나 글자를 긁을 수 있다",
          "- **포커스로 열 때는 기다리지 않는다.** 키보드로 온 사람은 이미 그걸 보려고 온 것이다",
          "- `openDelay` · `closeDelay` 로 뜨고 닫히는 시간을 정한다",
          "",
          "**감싼 것이 이미 포커스를 받으면**(버튼 등) 감싸개는 탭 순서에 끼어들지 않고,",
          "설명(`aria-describedby`)도 그 버튼에 걸린다. **글자만 감쌌으면** 감싸개가 대신 받는다 —",
          "그러지 않으면 키보드만 쓰는 사람에게 이 툴팁은 존재하지 않는다.",
          "",
          "### 뜨는 층은 `TxPopup` 을 바탕으로 한다",
          "",
          "`TxPopup` 은 **앵커에 붙어 뜨는 층**을 맡는 내부 부품이다. `TxDropdown` · `TxCombobox` ·",
          "`TxDayPicker` · 메뉴 2종이 같은 것을 쓰므로, **아래 성질은 그 컴포넌트들과 똑같이 동작한다.**",
          "",
          "- **맨 위 층으로 나간다** — `document.body` 로 포털되어 `overflow: hidden` 이나",
          "  `transform` 을 가진 조상 안에 갇히지 않는다. 표 안이나 카드 안에서도 잘리지 않는다",
          "- **자리를 스스로 고른다** — 아래가 좁으면 위로 뒤집고, 화면 밖으로 나가지 않게 가둔다.",
          "  스크롤하거나 창 크기를 바꿔도 따라간다",
          "- **바깥을 누르면 닫힌다** — `pointerdown` 을 캡처 단계에서 듣기 때문에 중간에서",
          "  `stopPropagation` 한 코드가 있어도 막히지 않는다",
          "- **겹쳐 떠도 서로를 가리지 않는다** — 메뉴 안의 드롭다운에서 값을 골라도 메뉴는 열린 채고,",
          "  Escape 는 맨 위의 것부터 하나씩 걷는다",
          "- **Escape 로 닫힌다**",
          "- **쌓임 순서는 `--tx-popup-z` 하나로 정해진다.** 이 값을 바꾸면 위 컴포넌트가 모두 따라온다",
          "",
          "그래서 툴팁이 따로 정하는 것은 **여닫는 방식(hover · 포커스 · 길게 누르기)과 겉모습**뿐이다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  // 필수 prop 이 둘이라 meta 에서 기본값을 준다. 각 스토리가 render 로 덮어쓴다
  args: { tip: "설명", children: "글자" },
  argTypes: {
    tip: { control: "text" },
    openDelay: { control: "number" },
    closeDelay: { control: "number" },
    maxWidth: { control: "text" },
    maxHeight: { control: "text", description: "넘치면 툴팁 안에서 스크롤된다. 기본 `20rem`" },
    disabled: { control: "boolean" },
    children: { control: false },
    classNames: { control: false },
    className: { control: "text", description: "감싸개(`.tx-tooltip-anchor`)에 덧붙는다" }
  }
} satisfies Meta<typeof TxTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { tip: "삭제하면 되돌릴 수 없다", openDelay: 300, closeDelay: 100, maxWidth: "20rem", disabled: false },
  render: (args) => (
    <TxTooltip {...args}>
      <TxButton label="올려 보라" />
    </TxTooltip>
  )
};

/**
 * **키보드로 다뤄 보라.** Tab 으로 버튼에 오면 툴팁이 **기다리지 않고 바로** 뜬다.
 * Escape 로 치울 수 있고, Tab 으로 떠나면 닫힌다.
 *
 * 버튼을 감쌌으므로 **탭 정거장은 버튼 하나뿐**이고 설명도 그 버튼에 걸린다.
 */
export const Keyboard: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxButton label="앞의 버튼" variant="secondary" />
      <TxTooltip tip="되돌릴 수 없다. 먼저 백업을 받아 두라.">
        <TxButton label="삭제" variant="danger" />
      </TxTooltip>
      <TxButton label="뒤의 버튼" variant="secondary" />
    </TxFlex>
  )
};

/**
 * **글자만 감싸도 키보드로 볼 수 있다.** 감싼 것이 포커스를 못 받으면
 * 감싸개가 대신 탭 순서에 들어간다 — 원본에서는 이 경우 툴팁이 아예 존재하지 않았다.
 */
export const TextTrigger: Story = {
  parameters: noControls,
  render: () => (
    <p className="text-sm">
      결제는{" "}
      <TxTooltip tip={"영업일 기준 2~3일이 걸린다.\n주말과 공휴일은 빠진다."}>
        <span className="underline decoration-dotted">정산 주기</span>
      </TxTooltip>{" "}
      에 따라 처리된다.
    </p>
  )
};

/**
 * **툴팁 위로 마우스를 올려도 안 닫힌다.** 앱은 표의 셀에 이 모양으로 JSON 을 띄운다 —
 * 내용이 길면 툴팁 안에서 스크롤되고, 글자를 긁어 복사할 수도 있다.
 *
 * 원본은 닫는 지연이 없어 트리거와 툴팁 사이를 지나는 순간 사라졌다.
 */
export const RichContent: Story = {
  parameters: noControls,
  render: () => (
    <TxTooltip
      maxWidth="28rem"
      tip={
        <pre className="m-0 font-mono text-xs leading-relaxed">
          {Object.entries(JSON_SAMPLE)
            .map(([key, value]) => `${key}: ${String(value)}`)
            .join("\n")}
        </pre>
      }
    >
      <span className="cursor-default font-mono text-sm">{"{ … }"}</span>
    </TxTooltip>
  )
};

/**
 * **내용이 길면 툴팁 안에서 스크롤된다.** 기본 높이는 `20rem` 이고 `maxHeight` 로 바꾼다.
 *
 * 툴팁 위로 마우스를 올려도 닫히지 않으므로 **끝까지 읽고 긁어 복사할 수 있다.**
 * 올린 채로 휠을 굴려 보라.
 */
export const Scrollable: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxTooltip
        tip={
          <ol className="m-0 flex list-decimal flex-col gap-1 pl-5">
            {Array.from({ length: 30 }, (_, index) => (
              <li key={index}>{index + 1}번째 줄 — 안에서 스크롤된다</li>
            ))}
          </ol>
        }
      >
        <TxButton label="긴 내용 (기본 20rem)" variant="secondary" />
      </TxTooltip>

      <TxTooltip
        maxHeight="8rem"
        tip={
          <ol className="m-0 flex list-decimal flex-col gap-1 pl-5">
            {Array.from({ length: 30 }, (_, index) => (
              <li key={index}>{index + 1}번째 줄</li>
            ))}
          </ol>
        }
      >
        <TxButton label="maxHeight 8rem" variant="secondary" />
      </TxTooltip>
    </TxFlex>
  )
};

/**
 * **페이지를 굴려도 툴팁이 트리거를 따라간다.** 창 크기를 바꿔도 마찬가지다 —
 * `TxPopup` 이 스크롤을 캡처 단계에서 듣기 때문에 조상 어디가 움직여도 따라온다.
 *
 * 가운데 버튼에 올린 채로 페이지를 굴려 보라.
 */
export const FollowsScroll: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="h-64 rounded border border-dashed p-3 text-xs text-slate-500 dark:text-slate-400">위쪽 여백 — 아래 버튼이 화면 가운데 오도록 굴려 보라</div>

      <TxTooltip tip="굴려도 버튼을 따라온다">
        <TxButton label="여기에 올린 채로 스크롤" />
      </TxTooltip>

      <div className="h-96 rounded border border-dashed p-3 text-xs text-slate-500 dark:text-slate-400">아래쪽 여백</div>
    </div>
  )
};

/** 뜨고 닫히는 시간. `openDelay: 0` 은 올리자마자 뜬다. */
export const Delay: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      {[0, 300, 1000].map((delay) => (
        <TxTooltip key={delay} tip={`openDelay: ${delay}ms`} openDelay={delay}>
          <TxButton label={`${delay}ms`} variant="secondary" />
        </TxTooltip>
      ))}
    </TxFlex>
  )
};

/** 화면 끝에서는 **잘리지 않게 자리를 옮긴다.** `TxPopup` 이 뒤집고 가둔다. */
export const Edges: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex h-64 flex-col justify-between">
      <div className="flex justify-between">
        <TxTooltip tip="왼쪽 위 — 아래로 뜬다">
          <TxButton label="왼쪽 위" variant="secondary" />
        </TxTooltip>
        <TxTooltip tip="오른쪽 위 — 화면 밖으로 안 나간다">
          <TxButton label="오른쪽 위" variant="secondary" />
        </TxTooltip>
      </div>
      <div className="flex justify-between">
        <TxTooltip tip="왼쪽 아래 — 위로 뒤집힌다">
          <TxButton label="왼쪽 아래" variant="secondary" />
        </TxTooltip>
        <TxTooltip tip="오른쪽 아래 — 위로 뒤집히고 안으로 가둔다">
          <TxButton label="오른쪽 아래" variant="secondary" />
        </TxTooltip>
      </div>
    </div>
  )
};

/** `disabled` 는 툴팁만 끈다. 감싼 내용은 그대로 나온다. */
export const Disabled: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxTooltip tip="이건 뜬다">
        <TxButton label="켜짐" variant="secondary" />
      </TxTooltip>
      <TxTooltip tip="이건 안 뜬다" disabled>
        <TxButton label="꺼짐" variant="secondary" />
      </TxTooltip>
    </TxFlex>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxTooltip tip="기본">
        <TxButton label="기본" variant="secondary" />
      </TxTooltip>
      <TxTooltip tip="넉넉한 여백과 큰 글자" style={vars({ "--tx-tooltip-padding": "0.75rem 1rem", "--tx-tooltip-font-size": "1rem", "--tx-tooltip-radius": "0.75rem" })}>
        <TxButton label="토큰" variant="secondary" />
      </TxTooltip>
    </TxFlex>
  )
};
