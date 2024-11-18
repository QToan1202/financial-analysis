export interface Gainer {
  symbol: string
  name: string
  change: number
  price: number
  changesPercentage: number
}

export interface Publisher {
  name: string
  homepage_url: string
  logo_url: string
  favicon_url: string
}

export interface Insight {
  ticker: string
  sentiment: string
  sentiment_reasoning: string
}

export interface News {
  id: string
  publisher: Publisher
  title: string
  author: string
  published_utc: string
  article_url: string
  tickers: string[]
  image_url: string
  description: string
  keywords: string[]
  insights: Array<Insight>
}

export interface TickerNewsResponse {
  results: Array<News>
  status: string
  request_id: string
  count: number
  next_url: string
}

export interface Stock {
  symbol: string
  price: number
  beta: number
  volAvg: number
  mktCap: number
  lastDiv: number
  range: string
  changes: number
  companyName: string
  currency: string
  cik: string
  isin: string
  cusip: string
  exchange: string
  exchangeShortName: string
  industry: string
  website: string
  description: string
  ceo: string
  sector: string
  country: string
  fullTimeEmployees: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  dcfDiff: number
  dcf: number
  image: string
  ipoDate: string
  defaultImage: boolean
  isEtf: boolean
  isActivelyTrading: boolean
  isAdr: boolean
  isFund: boolean
}

export interface StockPrice {
  date: string
  open: number
  low: number
  high: number
  close: number
  volume: number
}
