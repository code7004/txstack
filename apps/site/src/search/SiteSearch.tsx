import { TxButton, TxCombobox, TxModal } from "@txstack/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { currentIndex, loadIndex, search, type SearchEntry } from "./searchIndex";

const KIND: Record<SearchEntry["kind"], string> = { page: "페이지", section: "섹션", api: "API", component: "컴포넌트" };

/**
 * 결과 한 줄의 글자. **`TxCombobox` 의 후보는 글자 그 자체라** 위치를 글자에 담는다 —
 * "maskFields — axios › HttpClientOptions". 같은 글자가 둘이면 뒤에 번호를 붙여 가른다.
 */
function labelled(entries: SearchEntry[]) {
  const byLabel = new Map<string, SearchEntry>();

  for (const item of entries) {
    // 맨 위 묶음(Documents · API)은 아래 칸이 있으면 뺀다 — 목록 폭이 좁아 뒤가 잘린다
    const trail = item.trail.length > 1 ? item.trail.slice(1) : item.trail;
    const base = trail.length ? `${item.title} — ${trail.join(" › ")}` : `${item.title} — ${KIND[item.kind]}`;
    let label = base;
    for (let n = 2; byLabel.has(label); n++) label = `${base} (${n})`;
    byLabel.set(label, item);
  }

  return byLabel;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** 검색 칸. 고르면 그 페이지 · 섹션 · API 항목으로 간다 */
function SearchBox({ onDone, inputRef }: { onDone?: () => void; inputRef?: React.Ref<HTMLInputElement> }) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(currentIndex);
  const [value, setValue] = useState("");

  const byLabel = useMemo(() => labelled(entries), [entries]);
  const labels = useMemo(() => [...byLabel.keys()], [byLabel]);
  const toLabel = useMemo(() => new Map([...byLabel].map(([label, item]) => [item, label])), [byLabel]);

  // 처음 손을 대면 섹션까지 넣은 색인을 받는다
  const warm = () => void loadIndex().then(setEntries);

  const go = (label: string) => {
    const item = byLabel.get(label);
    if (!item) return;

    setValue("");
    onDone?.();
    navigate(item.to);
  };

  return (
    <TxCombobox
      ref={inputRef}
      data={labels}
      value={value}
      onChangeText={setValue}
      onPick={go}
      filter={(_, keyword) => search(keyword, 12, entries).map((item) => toLabel.get(item)!)}
      placeholder={`검색 (${isMac ? "⌘" : "Ctrl+"}K)`}
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
