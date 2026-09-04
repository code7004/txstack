import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxJsonTree } from "./TxJsonTree";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const SAMPLE = {
  id: 1024,
  name: "홍길동",
  active: true,
  score: 0,
  nickname: "",
  deletedAt: null,
  tags: ["신규", "VIP"],
  profile: { email: "hong@example.com", address: { city: "서울", zip: "04524" } }
};

const meta = {
  title: "Data/TxJsonTree",
  component: TxJsonTree,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "임의의 객체를 접을 수 있는 트리로 그린다. **보기 · 고치기 · 변화 지켜보기** 셋을 한다.",
          "",
          "```tsx",
          'import { TxJsonTree } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "// 보기 전용",
          "<TxJsonTree data={response} />;",
          "",
          "// 고치기 — 바뀐 것이 반영된 새 객체가 통째로 온다",
          "const [data, setData] = useState(SAMPLE);",
          "<TxJsonTree data={data} onChange={setData} />;",
          "",
          "// 지켜보기 — data 가 밖에서 바뀌면 바뀐 줄이 잠깐 반짝인다",
          "<TxJsonTree data={live} watch />;",
          "```",
          "",
          '### `0` · `false` · `""` · `null` 을 숨기지 않는다',
          "",
          "falsy 를 빠뜨리는 뷰어가 흔한데, 그러면 **값이 없는 것과 값이 `0` 인 것이 구분되지 않아**",
          '정작 디버깅에 못 쓴다. 문자열에는 따옴표를 씌워서 `"1"` 과 `1` 이 화면에서도 다르게 보인다.',
          "",
          "### 고치는 일은 라이브러리가 맡는다",
          "",
          "`onChange` 는 **바뀐 것이 반영된 새 객체 전체**를 준다. 원본은 건드리지 않고 지나온 길만",
          "복사하므로 `setData` 에 그대로 연결하면 되고, 경로를 타고 들어가 불변으로 갱신하는 코드를",
          "쓸 일이 없다. 무엇이 어떻게 바뀌었는지는 둘째 인자로 함께 온다.",
          "",
          "**`onChange` 를 주지 않으면 읽기 전용이다** — 고치기·지우기·추가 버튼이 아예 없다.",
          "",
          "### 키보드로 전부 닿는다",
          "",
          '`role="tree"` 를 **쓰지 않는다.** 그 역할은 화살표 이동과 roving tabindex 까지 갖춘',
          "위젯을 뜻하는데, 이름만 달고 규약이 없으면 스크린리더 사용자에게 거짓이 된다.",
          "대신 중첩 목록과 진짜 펼침 버튼으로 짜서 **Tab 만으로 전부 닿는다.**",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { data: SAMPLE },
  argTypes: {
    data: { control: "object" },
    onChange: { control: false },
    watch: { control: "boolean" },
    defaultExpandedDepth: { control: { type: "number", min: 0, max: 6 } },
    locale: { control: false },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-json-tree` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxJsonTree>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {};

/**
 * 읽기 전용. **`score: 0` · `nickname: ""` · `deletedAt: null` 이 그대로 보인다.**
 *
 * 고치기·지우기·추가 버튼이 아예 없다 — `onChange` 를 주지 않았기 때문이다.
 */
export const ReadOnly: Story = {
  parameters: noControls,
  render: () => <TxJsonTree data={SAMPLE} />
};

/**
 * **값을 누르면 고칠 수 있다.** 타입 칸은 지금 타입에서 시작하므로 값만 바꾸면
 * 원래 타입이 지켜지고, 필요할 때만 타입을 바꾼다 — `deletedAt: null` 을 숫자로
 * 채워 보라.
 *
 * 오른쪽에 실제 객체가 함께 보인다. `onChange` 가 준 것을 그대로 그린 것이다.
 */
export const Editable: Story = {
  parameters: noControls,
  render: function EditableStory() {
    const [data, setData] = useState<unknown>(SAMPLE);
    const [log, setLog] = useState<string[]>([]);

    return (
      <div className="flex flex-wrap gap-6">
        <TxJsonTree
          data={data}
          onChange={(next, change) => {
            setData(next);
            // add 에는 이전 값이, remove 에는 다음 값이 없다
            const detail = change.kind === "add" ? JSON.stringify(change.next) : change.kind === "remove" ? JSON.stringify(change.prev) : `${JSON.stringify(change.prev)} → ${JSON.stringify(change.next)}`;

            setLog((current) => [`${change.kind} ${change.path.join(".") || "(뿌리)"}: ${detail}`, ...current].slice(0, 6));
          }}
        />

        <div className="flex flex-col gap-2">
          <pre className="max-h-72 overflow-auto rounded border p-3 text-xs">{JSON.stringify(data, null, 2)}</pre>

          <ul className="text-xs text-slate-500 dark:text-slate-400">
            {log.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
};

/**
 * **`watch` 는 `data` 가 밖에서 바뀔 때 그 줄만 반짝인다.**
 *
 * 아래는 0.9 초마다 응답이 새로 오는 상황을 흉내 낸 것이다. 큰 객체에서 **무엇이
 * 움직였는지**가 눈에 든다 — 이전 값과 견주어 달라진 자리만 짚기 때문이다.
 * 바뀌지 않은 줄은 조용하다.
 */
export const Watch: Story = {
  parameters: noControls,
  render: function WatchStory() {
    const [live, setLive] = useState({
      job: { id: "job-8213", status: "pending", retries: 0 },
      queue: { waiting: 12, running: 3 },
      updatedAt: "12:00:00",
      workers: ["w-1", "w-2"]
    });
    const [running, setRunning] = useState(true);
    const tick = useRef(0);

    useEffect(() => {
      if (!running) return;

      const timer = setInterval(() => {
        tick.current += 1;
        const step = tick.current;

        setLive((current) => ({
          ...current,
          job: { ...current.job, status: step % 4 === 0 ? "done" : "pending", retries: step % 3 === 0 ? current.job.retries + 1 : current.job.retries },
          queue: { waiting: Math.max(0, current.queue.waiting - (step % 2)), running: (step % 5) + 1 },
          updatedAt: `12:00:${String(step % 60).padStart(2, "0")}`,
          workers: step % 6 === 0 ? [...current.workers, `w-${current.workers.length + 1}`] : current.workers
        }));
      }, 900);

      return () => clearInterval(timer);
    }, [running]);

    return (
      <div className="flex flex-col gap-3">
        <TxFlex>
          <TxButton label={running ? "멈추기" : "다시 흘리기"} variant="secondary" onClick={() => setRunning((on) => !on)} />
        </TxFlex>

        <TxJsonTree data={live} watch />
      </div>
    );
  }
};

/** 보면서 고치는 것도 된다. 내가 고친 줄도 반짝여서 무엇이 들어갔는지 확인된다. */
export const WatchAndEdit: Story = {
  parameters: noControls,
  render: function WatchAndEditStory() {
    const [data, setData] = useState<unknown>({ threshold: 10, enabled: true, label: "기본" });

    return <TxJsonTree data={data} watch onChange={setData} />;
  }
};

/**
 * 큰 응답은 `defaultExpandedDepth` 로 접은 채 시작한다. 필요한 가지만 열어 본다.
 *
 * `0` 이면 맨 윗줄만 보인다.
 */
export const Deep: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxJsonTree data={SAMPLE} defaultExpandedDepth={1} />
      <TxJsonTree data={SAMPLE} defaultExpandedDepth={0} />
    </TxFlex>
  )
};

/** 중첩이 깊어도 왼쪽 선이 어느 줄이 어느 가지에 속하는지 이어 준다. */
export const Nested: Story = {
  parameters: noControls,
  render: () => <TxJsonTree data={{ level1: { level2: { level3: { value: "깊은 곳", list: [1, 2, [3, 4]] } } } }} />
};

/** 빈 객체·빈 배열도 형태를 잃지 않는다. 안에 든 수를 함께 보여 준다. */
export const Empty: Story = {
  parameters: noControls,
  render: () => <TxJsonTree data={{ emptyObject: {}, emptyArray: [], zero: 0, no: false, blank: "", nothing: null }} />
};

/** `locale` 은 **키만** 옮긴다. 값은 데이터라 건드리지 않는다. */
export const Locale: Story = {
  parameters: noControls,
  render: () => {
    const KO: Record<string, string> = { id: "번호", name: "이름", active: "사용", score: "점수", tags: "꼬리표", profile: "프로필" };
    return <TxJsonTree data={SAMPLE} locale={(key) => KO[key] ?? key} />;
  }
};

/** 겉모습은 CSS 변수로 바꾼다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxJsonTree data={{ id: 1, name: "홍길동", tags: ["a", "b"] }} />
      <TxJsonTree data={{ id: 1, name: "홍길동", tags: ["a", "b"] }} style={vars({ "--tx-json-tree-indent": "2rem", "--tx-json-tree-font-size": "1rem", "--tx-json-tree-number-color": "var(--tx-color-danger)" })} />
    </TxFlex>
  )
};
