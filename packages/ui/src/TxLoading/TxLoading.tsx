import type { TxLoadingProps } from ".";

export const TxLoading = ({ visible = true, text, className = "", fullScreen = false }: TxLoadingProps) => {
  // 표시 여부는 visible로만 결정한다. visible이 배열이면 "빈 배열 = 로딩 표시" 컨벤션을 유지한다.
  // (text 유무로 표시를 결정하면 로딩이 끝나도 text가 남아 오버레이가 안 꺼지는 버그가 있었다.)
  const isShow = visible === true || (Array.isArray(visible) && visible.length === 0);

  if (!isShow) return null;

  return !fullScreen ? (
    <div data-tag="TxLoading" className={`flex flex-col justify-center items-center ${className}`}>
      <Dots />
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">{text}</div>
    </div>
  ) : (
    <div data-tag="TxLoading" className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* 배경 오버레이만 따로 */}
      <div className="absolute inset-0 bg-black opacity-20 dark:bg-white" />
      {/* 컨텐츠 */}
      <Dots />
      <div className="mt-4 font-bold text-gray-600 dark:text-white">{text}</div>
    </div>
  );
};

const Dots = () => (
  <div className="z-50 flex space-x-2">
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="w-2 h-2 bg-gray-600 rounded-full dark:bg-gray-300 animate-bounce" style={{ animationDelay: `${i * 0.08}s` }} />
    ))}
  </div>
);
