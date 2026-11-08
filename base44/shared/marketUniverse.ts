// The assets the market bot looks at beyond a user's own watchlist.
//
// Broad, liquid names across three classes so a strong setup anywhere gets
// scored instead of only what the user happened to add. The user's watchlist is
// always scanned first, then this list, up to the scan cap in runMarketBot.

export const UNIVERSE = [
  // Mega and large-cap stocks
  { symbol: 'AAPL', asset_class: 'stock' },
  { symbol: 'MSFT', asset_class: 'stock' },
  { symbol: 'NVDA', asset_class: 'stock' },
  { symbol: 'AMZN', asset_class: 'stock' },
  { symbol: 'GOOGL', asset_class: 'stock' },
  { symbol: 'META', asset_class: 'stock' },
  { symbol: 'AVGO', asset_class: 'stock' },
  { symbol: 'NFLX', asset_class: 'stock' },
  // Higher-beta growth
  { symbol: 'TSLA', asset_class: 'stock' },
  { symbol: 'AMD', asset_class: 'stock' },
  { symbol: 'PLTR', asset_class: 'stock' },
  { symbol: 'COIN', asset_class: 'stock' },
  { symbol: 'SHOP', asset_class: 'stock' },
  { symbol: 'SOFI', asset_class: 'stock' },
  { symbol: 'UBER', asset_class: 'stock' },
  { symbol: 'CRM', asset_class: 'stock' },

  // Broad and sector ETFs
  { symbol: 'SPY', asset_class: 'etf' },
  { symbol: 'QQQ', asset_class: 'etf' },
  { symbol: 'IWM', asset_class: 'etf' },
  { symbol: 'DIA', asset_class: 'etf' },
  { symbol: 'XLK', asset_class: 'etf' },
  { symbol: 'XLE', asset_class: 'etf' },
  { symbol: 'XLF', asset_class: 'etf' },
  { symbol: 'GLD', asset_class: 'etf' },

  // Crypto, USD pairs on Kraken
  { symbol: 'BTC', asset_class: 'crypto' },
  { symbol: 'ETH', asset_class: 'crypto' },
  { symbol: 'SOL', asset_class: 'crypto' },
  { symbol: 'XRP', asset_class: 'crypto' },
  { symbol: 'ADA', asset_class: 'crypto' },
  { symbol: 'DOGE', asset_class: 'crypto' },
  { symbol: 'AVAX', asset_class: 'crypto' },
  { symbol: 'LINK', asset_class: 'crypto' },
  { symbol: 'DOT', asset_class: 'crypto' },
  { symbol: 'LTC', asset_class: 'crypto' },
];