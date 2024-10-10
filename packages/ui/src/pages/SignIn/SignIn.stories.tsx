import type { Meta, StoryObj } from '@storybook/react'

import SignIn from './SignIn'

const meta: Meta<typeof SignIn> = {
  title: 'Pages/Sign In',
  component: SignIn,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
}

export default meta
type Story = StoryObj<typeof SignIn>

export const Primary: Story = {
  args: {},
}
