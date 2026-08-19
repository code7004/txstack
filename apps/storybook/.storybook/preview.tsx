import type { Decorator, Preview } from "@storybook/react-vite";
import { useEffect, type ReactNode } from "react";
import "../src/tailwind.css";

/**
 * 다크모드는 `<html class="dark">` 토글이므로, 스토리 캔버스(iframe)의 root 에 클래스를 건다.
 * 소비자가 실제로 하는 방식과 같아야 테마 검증이 의미를 갖는다.
 *
 * 데코레이터 함수 안에서 훅을 직접 부르면 react-hooks/rules-of-hooks 에 걸린다.
 * 실제 컴포넌트로 분리해야 React 가 훅 소유자를 식별할 수 있다.
 */
const ThemeCanvas = ({ theme, children }: { theme: "light" | "dark"; children: ReactNode }) => {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <div className="min-h-24 bg-white p-6 text-slate-900 dark:bg-slate-900 dark:text-slate-100">{children}</div>;
};

const withTheme: Decorator = (Story, context) => (
  <ThemeCanvas theme={context.globals.theme as "light" | "dark"}>
    <Story />
  </ThemeCanvas>
);

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: { storySort: { order: ["소개", "Form", "Data", "Overlay", "Layout", "*"] } }
  },
  globalTypes: {
    theme: {
      description: "라이트 / 다크",
      defaultValue: "light",
      toolbar: {
        title: "테마",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "라이트" },
          { value: "dark", icon: "moon", title: "다크" }
        ],
        dynamicTitle: true
      }
    }
  },
  decorators: [withTheme]
};

export default preview;
