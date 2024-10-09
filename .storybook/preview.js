import theme from '../packages/ui/src/theme'

/** @type { import('@storybook/react').Preview } */
const preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    chakra: {
      theme,
    },
  },
}

export default preview
