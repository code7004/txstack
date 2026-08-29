import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cm } from "../tx-ui.utils";
import type { TxJsonPath, TxJsonTreeProps } from "./TxJsonTree.types";
import { TxJsonTreeContext, TxJsonTreeNode, type TxJsonTreeContextValue } from "./TxJsonTreeNode";
import { diffPaths, getIn, pathKey, removeIn, setIn } from "./TxJsonTree.utils";

/** 반짝임이 남아 있는 시간. CSS 의 `--tx-json-tree-flash-duration` 과 맞춘다. */
const FLASH_MS = 1200;

/**
 * 임의의 객체를 접을 수 있는 트리로 그린다. **보기 · 고치기 · 변화 지켜보기** 셋을 한다.
 *
 * @example
 * ```tsx
 * // 보기 전용
 * <TxJsonTree data={response} />
 *
 * // 고치기 — 값의 주인은 소비자다. 바뀐 것이 반영된 새 객체가 통째로 온다
 * const [data, setData] = useState(SAMPLE);
 * <TxJsonTree data={data} onChange={setData} />
 *
 * // 지켜보기 — data 가 밖에서 바뀌면 바뀐 줄이 잠깐 반짝인다
 * <TxJsonTree data={live} watch />
 * ```
 *
 * **`0` · `false` · `""` · `null` 을 숨기지 않는다.** falsy 를 빠뜨리면 "값이 없는 것" 과
 * "값이 0 인 것" 이 구분되지 않아 디버깅에 못 쓴다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-json-tree { --tx-json-tree-indent: 1.5rem }`.
 *
 * 명세: `docs/001_ui.md`
 */
export function TxJsonTree({ data, onChange, watch = false, defaultExpandedDepth = Number.POSITIVE_INFINITY, locale = (text) => text, className, classNames, ...props }: TxJsonTreeProps) {
  /** 기본값(깊이)에서 벗어난 줄만 담는다. 대개 비어 있다. */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const [flashes, setFlashes] = useState<Record<string, number>>({});
  const tickRef = useRef(0);
  const prevDataRef = useRef(data);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /**
   * `data` 가 바뀌면 이전 것과 견주어 **달라진 줄만** 반짝이게 한다.
   *
   * 렌더 중에 견주지 않고 효과에서 한다 — 비교는 값이 실제로 바뀐 때만 하면 되고,
   * 큰 객체에서 렌더마다 훑으면 비싸다.
   */
  useEffect(() => {
    const prev = prevDataRef.current;
    prevDataRef.current = data;

    if (!watch || Object.is(prev, data)) return;

    const changed = diffPaths(prev, data);
    if (changed.length === 0) return;

    tickRef.current += 1;
    const tick = tickRef.current;
    setFlashes(Object.fromEntries(changed.map((path) => [pathKey(path), tick])));

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFlashes({}), FLASH_MS);
  }, [data, watch]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const isExpanded = useCallback((path: TxJsonPath, depth: number) => overrides[pathKey(path)] ?? depth < defaultExpandedDepth, [overrides, defaultExpandedDepth]);

  const context = useMemo<TxJsonTreeContextValue>(
    () => ({
      editable: onChange != null,
      locale,
      classNames,
      isExpanded,

      toggle: (path, depth) => setOverrides((current) => ({ ...current, [pathKey(path)]: !isExpanded(path, depth) })),
      flashOf: (path) => flashes[pathKey(path)],

      edit: (path, next) => onChange?.(setIn(data, path, next), { kind: "edit", path, prev: getIn(data, path), next }),

      add: (parentPath, key, next) => {
        const path = [...parentPath, Array.isArray(getIn(data, parentPath)) ? Number(key) : key];
        onChange?.(setIn(data, path, next), { kind: "add", path, next });
      },

      remove: (path) => onChange?.(removeIn(data, path), { kind: "remove", path, prev: getIn(data, path) })
    }),
    [data, onChange, locale, classNames, isExpanded, flashes]
  );

  return (
    <div {...props} data-tag="TxJsonTree" className={cm("tx-json-tree", className)}>
      <TxJsonTreeContext.Provider value={context}>
        <ul className="tx-json-tree__list">
          <TxJsonTreeNode value={data} path={[]} depth={0} />
        </ul>
      </TxJsonTreeContext.Provider>
    </div>
  );
}
