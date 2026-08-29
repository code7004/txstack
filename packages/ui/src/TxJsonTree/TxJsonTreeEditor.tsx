import { useState, type KeyboardEvent } from "react";
import type { TxJsonType } from "./TxJsonTree.types";
import { emptyOf, getJsonType } from "./TxJsonTree.utils";

const TYPES: TxJsonType[] = ["string", "number", "boolean", "null", "object", "array"];

export interface TxJsonTreeEditorProps {
  /** 키 칸을 함께 받는다. 객체에 새 줄을 넣을 때만 참이다. */
  withKey?: boolean;
  initialKey?: string;
  initialValue: unknown;

  onSubmit: (key: string, value: unknown) => void;
  onCancel: () => void;
  locale: (text: string) => string;
}

/** 입력한 글자를 고른 타입의 값으로 읽는다. */
function toValue(type: TxJsonType, raw: string): unknown {
  switch (type) {
    case "string":
      return raw;
    case "number": {
      const parsed = Number(raw);
      // 숫자로 못 읽으면 0 이 아니라 그대로 둔다 — 빈 칸을 0 으로 바꿔 놓으면 놀란다
      return Number.isFinite(parsed) && raw.trim() !== "" ? parsed : 0;
    }
    case "boolean":
      return raw === "true";
    default:
      return emptyOf(type);
  }
}

/** 값을 편집 칸에 넣을 글자로 편다. */
function toRaw(value: unknown): string {
  const type = getJsonType(value);
  if (type === "string") return String(value);
  if (type === "number" || type === "boolean") return String(value);

  return "";
}

/**
 * **내부 전용.** 한 줄을 고치거나 새로 넣는 칸.
 *
 * 타입과 값을 함께 받는다. **타입 칸은 지금 타입에서 시작하므로 그냥 값만 고치면
 * 원래 타입이 지켜지고**, 필요할 때만 타입을 바꾼다. `null` 을 다른 값으로 바꿀 길도
 * 이것으로 생긴다 — 원본은 `null` 자리에 문자열밖에 넣을 수 없었다.
 */
export function TxJsonTreeEditor({ withKey = false, initialKey = "", initialValue, onSubmit, onCancel, locale }: TxJsonTreeEditorProps) {
  const [key, setKey] = useState(initialKey);
  const [type, setType] = useState<TxJsonType>(() => getJsonType(initialValue));
  const [raw, setRaw] = useState(() => toRaw(initialValue));

  const submit = () => {
    if (withKey && key.trim() === "") return;
    onSubmit(key.trim(), toValue(type, raw));
  };

  const hdKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
      return;
    }

    if (event.key === "Escape") {
      // 트리 바깥의 층(모달 등)까지 닫히지 않게 여기서 멈춘다
      event.preventDefault();
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    // 칸 전체가 Enter·Escape 를 함께 받는다. 안의 input·select 에서 올라온다
    <span className="tx-json-tree__editor" onKeyDown={hdKeyDown}>
      {withKey && <input className="tx-json-tree__input" value={key} onChange={(event) => setKey(event.target.value)} aria-label={locale("키")} placeholder={locale("키")} autoFocus />}

      <select className="tx-json-tree__select" value={type} onChange={(event) => setType(event.target.value as TxJsonType)} aria-label={locale("타입")}>
        {TYPES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {type === "boolean" && (
        <select className="tx-json-tree__select" value={raw === "true" ? "true" : "false"} onChange={(event) => setRaw(event.target.value)} aria-label={locale("값")}>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      )}

      {(type === "string" || type === "number") && (
        <input
          className="tx-json-tree__input"
          type={type === "number" ? "number" : "text"}
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          aria-label={locale("값")}
          // 키 칸이 있으면 그쪽이 먼저다
          autoFocus={!withKey}
        />
      )}

      <button type="button" className="tx-json-tree__control" onClick={submit}>
        {locale("저장")}
      </button>
      <button type="button" className="tx-json-tree__control" onClick={onCancel}>
        {locale("취소")}
      </button>
    </span>
  );
}
