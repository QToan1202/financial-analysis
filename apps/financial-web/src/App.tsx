import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { Root } from '@layouts'
import { ChatPage, DetailPage, HomePage, NewsPage, SignInPage, SignUpPage } from '@pages'
import { useAuthStore } from '@contexts'

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
