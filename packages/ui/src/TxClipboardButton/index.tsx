import { copyToClipboard } from "../tx-ui.utils";

export default function TxClipboardButton({ text }: { text: string }) {
  return <div onClick={() => void copyToClipboard(text)}>📋</div>;
}
