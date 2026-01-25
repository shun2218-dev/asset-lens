import type { Preview } from '@storybook/nextjs-vite'
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story, context) => {
      // パラメータからセッション状態を取得し、グローバル変数にセット
      // parameters: { auth: { session: null } } のように指定可能
      // sessionが指定されていない場合はundefinedとなり、mock側のデフォルトが使われる
      if (typeof window !== "undefined") {
        (window as any).__STORYBOOK_SESSION__ = context.parameters?.auth?.session;
      }
      return Story();
    },
  ],
};

export default preview;