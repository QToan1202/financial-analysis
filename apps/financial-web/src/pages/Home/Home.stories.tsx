import type { Meta, StoryObj } from '@storybook/react'

import Home from './Home'

const meta: Meta<typeof Home> = {
  title: 'Pages/Home',
  component: Home,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
}

export default meta
type Story = StoryObj<typeof Home>

export const Primary: Story = {
  args: {},
}
