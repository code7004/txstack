import type { HTMLAttributes, ReactNode } from "react";

/** 한 파일이 지금 어디까지 왔나. */
export type TxUploadStatus = "ready" | "uploading" | "done" | "failed" | "canceled";

export interface TxUploadItem {
  /** 이 줄을 가리키는 값. 같은 파일을 두 번 골라도 서로 다르다. */
  id: string;
  file: File;
  status: TxUploadStatus;
  /** 0~100. 올리는 쪽이 알려 준 만큼만 움직인다. */
  progress: number;
  /** 실패했을 때의 까닭. */
  error?: string;
}

/** 올리는 동안 바깥에 건네는 것. */
export interface TxUploaderContext {
  /** 진행률을 알린다. 0~100. */
  onProgress: (percent: number) => void;
  /** 취소되면 끊긴다. `fetch` 나 `axios` 에 그대로 넘긴다. */
  signal: AbortSignal;
}

/**
 * 파일 하나를 실제로 올리는 일.
 *
 * **이 패키지는 어디로 어떻게 보내는지 모른다** — 주소도 헤더도 응답 봉투도 앱의 것이다.
 * 성공하면 그냥 끝나고, 실패하면 던진다.
 */
export type TxUploader = (file: File, context: TxUploaderContext) => Promise<unknown>;

export interface TxFileUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** 파일 하나를 올리는 일. **안 주면 고르기만 하고 올리지 않는다.** */
  uploader?: TxUploader;

  /** 받을 종류. `<input accept>` 그대로다 — `"image/*"` · `".csv,.xlsx"`. */
  accept?: string;

  /** 여럿 고를 수 있다. 기본 `true`. */
  multiple?: boolean;

  /** 한 파일의 최대 바이트. 넘으면 고르는 순간 실패로 표시한다. */
  maxSize?: number;

  /** 한 번에 올릴 최대 개수. 넘게 고르면 앞에서부터 받는다. */
  maxFiles?: number;

  /** 잠근다. */
  disabled?: boolean;

  /** 목록이 바뀔 때마다. */
  onChange?: (items: TxUploadItem[]) => void;

  /** 고르는 자리에 보일 글자. 기본은 정해진 안내다. */
  children?: ReactNode;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { dropzone?: string; list?: string; item?: string };
}
