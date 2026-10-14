import { TxButton, TxCombobox, TxModal, type TxComboboxOption } from "@txstack/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { revealAnchor } from "../lib/reveal";
import { currentIndex, loadIndex, search, type SearchEntry } from "./searchIndex";

/** 결과 한 줄. 이름 · 위치(흐리게) · 설명(둘째 줄)을 `TxCombobox` 가 그린다. `entry` 는 고른 뒤 갈 곳을 찾는 데 쓴다 */
interface ResultOption extends TxComboboxOption {
  entry: SearchEntry;
}

const KIND: Record<SearchEntry["kind"], string> = { page: "페이지", section: "섹션", api: "API", component: "컴포넌트" };

/** 맨 위 묶음(Documents · API)은 아래 칸이 있으면 뺀다 — 흐린 글자 칸이 좁다 */
const where = (item: SearchEntry) => (item.trail.length > 1 ? item.trail.slice(1) : item.trail).join(" › ") || KIND[item.kind];

const toOption = (entry: SearchEntry, index: number): ResultOption => ({ value: `${index}:${entry.to}`, label: entry.title, hint: where(entry), description: entry.summary, entry });

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** 검색 칸. 고르면 그 페이지 · 섹션 · API 항목으로 간다 */
function SearchBox({ onDone, inputRef }: { onDone?: () => void; inputRef?: React.Ref<HTMLInputElement> }) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(currentIndex);
  const [value, setValue] = useState("");

  // 후보는 객체다 — 글자가 같은 결과(여러 장의 "Try it")도 value 로 갈린다
  const options = useMemo(() => entries.map(toOption), [entries]);
  const optionOf = useMemo(() => new Map(options.map((option) => [option.entry, option])), [options]);

  // 처음 손을 대면 섹션까지 넣은 색인을 받는다
  const warm = () => void loadIndex().then(setEntries);

  const go = (_: string, option: ResultOption) => {
    setValue("");
    onDone?.();
    navigate(option.entry.to);

    // 지금 주소와 같아도 그 자리로 가서 밝힌다. 페이지만 고른 결과(앵커 없음)는 맨 위에서 시작한다
    const [, anchor] = option.entry.to.split("#");
    if (anchor) revealAnchor(decodeURIComponent(anchor));
  };

  return (
    <TxCombobox
      ref={inputRef}
      data={options}
      value={value}
      onChangeText={setValue}
      onPick={go}
      filter={(_, keyword) => search(keyword, 12, entries).map((item) => optionOf.get(item)!)}
      placeholder={onDone ? "페이지 · 컴포넌트 · API 검색" : `검색 (${isMac ? "⌘" : "Ctrl+"}K)`}
      aria-label="사이트 검색"
      onFocus={warm}
      maxHeight="24rem"
      className="w-full"
      classNames={{ list: "min-w-80" }}
    />
  );
}

/**
 * 머리 줄의 검색. 넓으면 칸이 그 자리에 서고, 좁으면 돋보기를 눌러 창으로 연다.
 * `⌘K` · `Ctrl+K` 는 어느 쪽이든 연다.
 */
export function SiteSearch({ narrow }: { narrow: boolean }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);

  /**
   * 창이 열리면 검색 칸으로 간다. `TxModal` 은 열릴 때 포커스를 닫기 버튼에 두므로 `autoFocus` 로는
   * 안 된다 — 창이 자기 포커스를 잡은 뒤에 옮긴다.
   */
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => modalInputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;

      event.preventDefault();
      if (narrow) setOpen(true);
      else inputRef.current?.focus();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [narrow]);

  if (!narrow) {
    return (
      <div className="w-72">
        <SearchBox inputRef={inputRef} />
      </div>
    );
  }

  return (
    <>
      <TxButton label="⌕" aria-label="검색" variant="ghost" onClick={() => setOpen(true)} />
      <TxModal open={open} onClose={() => setOpen(false)} title="검색">
        <div className="min-h-72">
          <SearchBox inputRef={modalInputRef} onDone={() => setOpen(false)} />
        </div>
      </TxModal>
    </>
  );
}
