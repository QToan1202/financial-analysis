import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { Root } from '@layouts'
import { ChatPage, DetailPage, HomePage, NewsPage, SignInPage, SignUpPage } from '@pages'

const router = createBrowserRouter([
  {
    path: '/log-in',
    element: <SignInPage />,
  },
  {
    path: '/sign-un',
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
  return <RouterProvider router={router} />
}

export default App
