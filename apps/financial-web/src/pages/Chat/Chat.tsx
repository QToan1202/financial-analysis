import { Box } from '@chakra-ui/react'
import { CopilotChat } from '@copilotkit/react-ui'

import '@copilotkit/react-ui/styles.css'

const Chat = () => (
  <Box>
    <CopilotChat
      instructions={
        'You are assisting the user as best as you can. Answer in the best way possible given the data you have.'
      }
      labels={{
        title: 'Your Assistant',
        initial: 'Hi! 👋 How can I assist you today?',
      }}
    />
  </Box>
)

export default Chat
