import { ArrowLeft, Doc, Home, Letter, Market, News, Screener, Watchlist } from '@assets'

export const TRENDING_INDEXES = ['NVDA', 'TSLA', 'AAPL', 'INDO']

export const NAV_ITEM = [
  {
    id: '1',
    title: 'Stock Screener',
    icon: <Screener />,
  },
  {
    id: '2',
    title: 'Watchlist',
    icon: <Watchlist />,
  },
  {
    id: '3',
    title: 'Market Movers',
    icon: <Market />,
  },
  {
    id: '4',
    title: 'Market Newsletter',
    icon: <Letter />,
  },
]

export const DRAWER_ITEM = [
  {
    title: 'Home',
    href: '/',
    icon: <Home />,
  },
  {
    title: 'News',
    href: '/news',
    icon: <News />,
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: <Doc />,
  },
  {
    title: 'Collapse',
    href: '#',
    icon: <ArrowLeft />,
  },
]
