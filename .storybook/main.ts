import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/features/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/layouts/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/nextjs-vite",
  "staticDirs": [
    "../public"
  ],
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(config, {
      define: {
        'process.env.RESEND_API_KEY': JSON.stringify('re_123'),
        'process.env.BETTER_AUTH_URL': JSON.stringify('http://localhost:3000'),
        'process.env.STORYBOOK': JSON.stringify('true'),
      },
    });
  },
};
export default config;