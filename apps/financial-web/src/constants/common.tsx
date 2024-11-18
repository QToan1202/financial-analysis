import { Letter, Market, Screener, Watchlist } from '@assets'

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
