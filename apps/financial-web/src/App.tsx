import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { ChatLayout, Root } from '@layouts'
import { ChatPage, DetailPage, HomePage, NewsPage, SignInPage, SignUpPage } from '@pages'
import { useAuthStore } from '@contexts'
import { CopilotKit } from '@copilotkit/react-core'

import './global.css'

const authLoader = () => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated

  if (isAuthenticated) return redirect('/')

  return null
}

const protectedLoader = () => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated

  if (!isAuthenticated) return redirect('/log-in')

  return null
}

const router = createBrowserRouter([
  {
    path: '/log-in',
    loader: authLoader,
    element: <SignInPage />,
  },
  {
    path: '/sign-up',
    loader: authLoader,
    element: <SignUpPage />,
  },
  {
    path: '/',
    loader: protectedLoader,
    element: <Root />,
    children: [
      {
        element: <HomePage />,
        index: true,
      },
      {
        path: 'news',
        element: <NewsPage />,
      },
      {
        path: 'detail/:ticket',
        element: <DetailPage />,
      },
    ],
  },
  {
    path: '/chat',
    loader: protectedLoader,
    element: <ChatLayout />,
    children: [
      {
        index: true,
        element: <ChatPage />,
      },
    ],
  },
])

function App() {
  const userInfo = useAuthStore((state) => state.user)

  return (
    <CopilotKit
      runtimeUrl={`${import.meta.env.VITE_BASE_URL}copilotkit`}
      agent="chat-with-memory-agent"
      showDevConsole={false}
      properties={{
        user_id: userInfo._id,
      }}
      headers={{
        Authorization: `Bearer ${userInfo.accessToken}`,
      }}
    >
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </CopilotKit>
  )
}

export default App
