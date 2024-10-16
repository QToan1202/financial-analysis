import type { Meta, StoryObj } from '@storybook/react'

import SignUp from './SignUp'

const meta: Meta<typeof SignUp> = {
  title: 'Pages/Sign Up',
  component: SignUp,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
}

export default meta
type Story = StoryObj<typeof SignUp>

export const Primary: Story = {
  args: {},
}
