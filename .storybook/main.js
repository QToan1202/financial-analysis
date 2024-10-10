/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../packages/*/src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
    '@chakra-ui/storybook-addon',
    {
      name: '@newhighsco/storybook-addon-svgr',
      options: {
        svgrOptions: {
          memo: true,
        },
      },
    },
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    builder: '@storybook/builder-vite', // 👈 The builder enabled here.
  },
  features: {
    emotionAlias: false,
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
}
export default config
