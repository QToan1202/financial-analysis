import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

import Button from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    backgroundColor: { control: 'color' },
    variant: {
      options: ['primary', 'outline', 'solid', 'ghost', 'link', 'unstyled'],
      control: { type: 'inline-radio' },
    },
  },
  args: { onClick: fn() },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
}
