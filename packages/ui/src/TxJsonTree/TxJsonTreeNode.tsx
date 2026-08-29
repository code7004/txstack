import { createContext, useContext, useState, type SVGProps } from "react";
import { TxIconClose } from "../TxIcons";
import { cm } from "../tx-ui.utils";
import type { TxJsonPath } from "./TxJsonTree.types";
import { TxJsonTreeEditor } from "./TxJsonTreeEditor";
import { getJsonType, isBranch, pathKey } from "./TxJsonTree.utils";

/** 트리 전체가 함께 보는 것. 줄마다 열 개씩 내려보내지 않으려고 둔다. */
export interface TxJsonTreeContextValue {
  editable: boolean;
  locale: (text: string) => string;
  classNames?: { row?: string; key?: string; value?: string };

  isExpanded: (path: TxJsonPath, depth: number) => boolean;
  toggle: (path: TxJsonPath, depth: number) => void;
  /** 반짝일 차례. 바뀔 때마다 새 수가 와서 애니메이션이 다시 돈다. */
  flashOf: (path: TxJsonPath) => number | undefined;

  edit: (path: TxJsonPath, value: unknown) => void;
  add: (parentPath: TxJsonPath, key: string, value: unknown) => void;
  remove: (path: TxJsonPath) => void;
}

export const TxJsonTreeContext = createContext<TxJsonTreeContextValue | null>(null);

const useTree = () => {
  const value = useContext(TxJsonTreeContext);
  if (!value) throw new Error("TxJsonTree 안에서만 쓴다");
  return value;
};

/** 펼침 화살표. 아이콘 하나 때문에 공개 아이콘 목록을 늘리지 않는다. */
const Chevron = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m9 6l6 6l-6 6" />
  </svg>
);

export interface TxJsonTreeNodeProps {
  value: unknown;
  path: TxJsonPath;
  depth: number;
  /** 키나 인덱스. 루트에는 없다. */
  label?: string | number;
}

/**
 * **내부 전용.** 한 줄과 그 아래.
 *
 * 펼침·편집 상태를 스스로 갖지 않는다 — **펼침은 루트가 경로로 들고 있다.** 노드마다
 * `useState` 를 두면 배열에서 한 줄을 지웠을 때 상태가 엉뚱한 줄로 옮겨 간다.
 */
export function TxJsonTreeNode({ value, path, depth, label }: TxJsonTreeNodeProps) {
  const tree = useTree();
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  const type = getJsonType(value);
  const branch = isBranch(value);
  const expanded = branch && tree.isExpanded(path, depth);
  const flash = tree.flashOf(path);

  const entries: [string | number, unknown][] = Array.isArray(value) ? value.map((item, index) => [index, item]) : branch ? Object.entries(value as Record<string, unknown>) : [];

  const labelText = typeof label === "string" ? tree.locale(label) : label;
  /** 이 줄을 사람 말로 부르는 이름. 버튼 이름에 쓴다. */
  const name = label == null ? tree.locale("값") : String(labelText);

  return (
    <li className="tx-json-tree__item">
      <div className={cm("tx-json-tree__row", tree.classNames?.row)} data-type={type}>
        {/* 새 요소라서 애니메이션이 매번 처음부터 돈다. 같은 줄이 잇달아 바뀌어도 보인다 */}
        {flash !== undefined && <span key={flash} className="tx-json-tree__flash" aria-hidden />}

        {branch ? (
          <button type="button" className="tx-json-tree__toggle" aria-expanded={expanded} aria-label={`${name} ${tree.locale(expanded ? "접기" : "펼치기")}`} onClick={() => tree.toggle(path, depth)}>
            <Chevron />
          </button>
        ) : (
          <span className="tx-json-tree__toggle tx-json-tree__toggle--none" aria-hidden />
        )}

        {label != null && (
          <span className={cm("tx-json-tree__key", tree.classNames?.key)}>
            {labelText}
            <span aria-hidden>:</span>
          </span>
        )}

        {editing ? (
          <TxJsonTreeEditor
            initialValue={value}
            locale={tree.locale}
            onCancel={() => setEditing(false)}
            onSubmit={(_key, next) => {
              setEditing(false);
              tree.edit(path, next);
            }}
          />
        ) : (
          <>
            {branch ? (
              <span className={cm("tx-json-tree__brief", tree.classNames?.value)}>{Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}</span>
            ) : tree.editable ? (
              <button type="button" className={cm("tx-json-tree__value", tree.classNames?.value)} data-type={type} aria-label={`${name} ${tree.locale("고치기")}`} onClick={() => setEditing(true)}>
                {display(value, type)}
              </button>
            ) : (
              <span className={cm("tx-json-tree__value", tree.classNames?.value)} data-type={type}>
                {display(value, type)}
              </span>
            )}

            {/* 루트는 지울 수 없다 — 지우면 트리 자체가 없어진다 */}
            {tree.editable && path.length > 0 && (
              <button type="button" className="tx-json-tree__control tx-json-tree__control--remove" aria-label={`${name} ${tree.locale("지우기")}`} onClick={() => tree.remove(path)}>
                <TxIconClose />
              </button>
            )}
          </>
        )}
      </div>

      {branch && expanded && (
        <ul className="tx-json-tree__list">
          {entries.map(([entryKey, entryValue]) => (
            <TxJsonTreeNode key={pathKey([...path, entryKey])} value={entryValue} path={[...path, entryKey]} depth={depth + 1} label={entryKey} />
          ))}

          {tree.editable && (
            <li className="tx-json-tree__item">
              <div className="tx-json-tree__row">
                {adding ? (
                  <TxJsonTreeEditor
                    // 배열에는 키가 없다. 뒤에 붙는다
                    withKey={!Array.isArray(value)}
                    initialValue=""
                    locale={tree.locale}
                    onCancel={() => setAdding(false)}
                    onSubmit={(newKey, newValue) => {
                      setAdding(false);
                      tree.add(path, Array.isArray(value) ? String(entries.length) : newKey, newValue);
                    }}
                  />
                ) : (
                  <button type="button" className="tx-json-tree__control tx-json-tree__control--add" onClick={() => setAdding(true)}>
                    {`+ ${tree.locale("추가")}`}
                  </button>
                )}
              </div>
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

/**
 * 값을 화면에 보이는 글자로 만든다.
 *
 * **`0` · `false` · `""` · `null` 을 숨기지 않는다.** falsy 를 빠뜨리는 뷰어가 흔한데,
 * 그러면 "값이 없는 것" 과 "값이 0 인 것" 이 구분되지 않아 디버깅에 못 쓴다.
 */
function display(value: unknown, type: string) {
  if (type === "string") return `"${String(value)}"`;
  if (type === "null") return "null";

  return String(value);
}
