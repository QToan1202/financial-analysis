import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { Root } from '@layouts'
import { ChatPage, DetailPage, HomePage, NewsPage, SignInPage, SignUpPage } from '@pages'

const router = createBrowserRouter([
  {
    path: '/log-in',
    element: <SignInPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    path: '/',
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
      {
        path: 'chat',
        element: <ChatPage />,
      },
    ],
  },
])

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  )
}

export default App
