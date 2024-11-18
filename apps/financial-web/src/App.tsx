import { Center } from '@chakra-ui/react'
import { CopilotChat } from '@copilotkit/react-ui'

// import { HomePage } from '@pages'

import './App.css'

function App() {
  return (
    <Center flexDirection="column">
      {/* <HomePage /> */}
      <CopilotChat
        instructions={
          'You are assisting the user as best as you can. Answer in the best way possible given the data you have.'
        }
        labels={{
          title: 'Your Assistant',
          initial: 'Hi! 👋 How can I assist you today?',
        }}
      />
    </Center>
  )
}

export default App
