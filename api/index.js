'use strict';

const express = require('express');
const cors = require('cors');
const yf = require('yahoo-finance2').default;

const app = express();
app.use(cors());
app.use(express.json());

const STOCKS = [
  { sym: 'RELIANCE', yf: 'RELIANCE.NS', base: 2850, name: 'Reliance Industries', sector: 'Energy' },
  { sym: 'TCS', yf: 'TCS.NS', base: 3780, name: 'Tata Consultancy Services', sector: 'IT' },
  { sym: 'HDFCBANK', yf: 'HDFCBANK.NS', base: 1640, name: 'HDFC Bank', sector: 'Finance' },
  { sym: 'INFY', yf: 'INFY.NS', base: 1510, name: 'Infosys', sector: 'IT' },
  { sym: 'ICICIBANK', yf: 'ICICIBANK.NS', base: 1090, name: 'ICICI Bank', sector: 'Finance' },
  { sym: 'HINDUNILVR', yf: 'HINDUNILVR.NS', base: 2420, name: 'Hindustan Unilever', sector: 'FMCG' },
  { sym: 'SBIN', yf: 'SBIN.NS', base: 780, name: 'State Bank of India', sector: 'Finance' },
  { sym: 'BAJFINANCE', yf: 'BAJFINANCE.NS', base: 7100, name: 'Bajaj Finance', sector: 'Finance' },
  { sym: 'MARUTI', yf: 'MARUTI.NS', base: 11800, name: 'Maruti Suzuki', sector: 'Auto' },
  { sym: 'WIPRO', yf: 'WIPRO.NS', base: 480, name: 'Wipro', sector: 'IT' },
  { sym: 'ONGC', yf: 'ONGC.NS', base: 270, name: 'Oil and Natural Gas Corp', sector: 'Energy' },
  { sym: 'TITAN', yf: 'TITAN.NS', base: 3400, name: 'Titan Company', sector: 'Consumer' },
  { sym: 'AXISBANK', yf: 'AXISBANK.NS', base: 1060, name: 'Axis Bank', sector: 'Finance' },
  { sym: 'KOTAKBANK', yf: 'KOTAKBANK.NS', base: 1780, name: 'Kotak Mahindra Bank', sector: 'Finance' },
  { sym: 'SUNPHARMA', yf: 'SUNPHARMA.NS', base: 1680, name: 'Sun Pharmaceutical', sector: 'Pharma' },
  { sym: 'ADANIENT', yf: 'ADANIENT.NS', base: 2500, name: 'Adani Enterprises', sector: 'Conglomerate' },
  { sym: 'ADANIPORTS', yf: 'ADANIPORTS.NS', base: 1350, name: 'Adani Ports and SEZ', sector: 'Infrastructure' },
  { sym: 'ASIANPAINT', yf: 'ASIANPAINT.NS', base: 2750, name: 'Asian Paints', sector: 'Consumer' },
  { sym: 'BAJAJFINSV', yf: 'BAJAJFINSV.NS', base: 1650, name: 'Bajaj Finserv', sector: 'Finance' },
  { sym: 'BHARTIARTL', yf: 'BHARTIARTL.NS', base: 1550, name: 'Bharti Airtel', sector: 'Telecom' },
  { sym: 'BPCL', yf: 'BPCL.NS', base: 620, name: 'Bharat Petroleum', sector: 'Energy' },
  { sym: 'CIPLA', yf: 'CIPLA.NS', base: 1490, name: 'Cipla', sector: 'Pharma' },
  { sym: 'COALINDIA', yf: 'COALINDIA.NS', base: 470, name: 'Coal India', sector: 'Mining' },
  { sym: 'DIVISLAB', yf: 'DIVISLAB.NS', base: 3800, name: "Divi's Laboratories", sector: 'Pharma' },
  { sym: 'DRREDDY', yf: 'DRREDDY.NS', base: 6200, name: "Dr. Reddy's Laboratories", sector: 'Pharma' },
  { sym: 'EICHERMOT', yf: 'EICHERMOT.NS', base: 4400, name: 'Eicher Motors', sector: 'Auto' },
  { sym: 'GRASIM', yf: 'GRASIM.NS', base: 2450, name: 'Grasim Industries', sector: 'Conglomerate' },
  { sym: 'HCLTECH', yf: 'HCLTECH.NS', base: 1750, name: 'HCL Technologies', sector: 'IT' },
  { sym: 'HEROMOTOCO', yf: 'HEROMOTOCO.NS', base: 4800, name: 'Hero MotoCorp', sector: 'Auto' },
  { sym: 'HINDALCO', yf: 'HINDALCO.NS', base: 680, name: 'Hindalco Industries', sector: 'Metals' },
  { sym: 'ITC', yf: 'ITC.NS', base: 460, name: 'ITC Limited', sector: 'FMCG' },
  { sym: 'JSWSTEEL', yf: 'JSWSTEEL.NS', base: 920, name: 'JSW Steel', sector: 'Metals' },
  { sym: 'LT', yf: 'LT.NS', base: 3600, name: 'Larsen and Toubro', sector: 'Infrastructure' },
  { sym: 'LTIM', yf: 'LTIM.NS', base: 5500, name: 'LTIMindtree', sector: 'IT' },
  { sym: 'MM', yf: 'M&M.NS', base: 2900, name: 'Mahindra and Mahindra', sector: 'Auto' },
  { sym: 'NESTLEIND', yf: 'NESTLEIND.NS', base: 22500, name: 'Nestle India', sector: 'FMCG' },
  { sym: 'NTPC', yf: 'NTPC.NS', base: 380, name: 'NTPC Limited', sector: 'Energy' },
  { sym: 'POWERGRID', yf: 'POWERGRID.NS', base: 310, name: 'Power Grid Corp', sector: 'Energy' },
  { sym: 'SBILIFE', yf: 'SBILIFE.NS', base: 1550, name: 'SBI Life Insurance', sector: 'Insurance' },
  { sym: 'TATAMOTORS', yf: 'TATAMOTORS.NS', base: 1000, name: 'Tata Motors', sector: 'Auto' },
  { sym: 'TATASTEEL', yf: 'TATASTEEL.NS', base: 165, name: 'Tata Steel', sector: 'Metals' },
  { sym: 'TECHM', yf: 'TECHM.NS', base: 1650, name: 'Tech Mahindra', sector: 'IT' },
  { sym: 'ULTRACEMCO', yf: 'ULTRACEMCO.NS', base: 10500, name: 'UltraTech Cement', sector: 'Materials' }
];

const NIFTY_SYM = '^NSEI';
const CACHE_TTL = 8000;

const simState = {};
for (const stock of STOCKS) {
  simState[stock.sym] = { price: stock.base, pct: (Math.random() - 0.5) * 4 };
}
let simNifty = { price: 22850, pct: (Math.random() - 0.5) * 1.5 };

function simulateQuotes() {
  const now = Date.now();
  const quotes = {};

  for (const stock of STOCKS) {
    const drift = (Math.random() - 0.5) * 0.006;
    const nextPrice = Math.max(stock.base * 0.5, simState[stock.sym].price * (1 + drift));
    simState[stock.sym].price = nextPrice;
    simState[stock.sym].pct = ((nextPrice - stock.base) / stock.base) * 100;

    quotes[stock.sym] = {
      symbol: stock.sym,
      name: stock.name,
      sector: stock.sector,
      price: +nextPrice.toFixed(2),
      change: +(nextPrice * drift).toFixed(2),
      changePercent: +simState[stock.sym].pct.toFixed(2),
      high: +(nextPrice * 1.012).toFixed(2),
      low: +(nextPrice * 0.988).toFixed(2),
      volume: Math.round(Math.random() * 5000000 + 1000000),
      source: 'simulated'
    };
  }

  const nDrift = (Math.random() - 0.5) * 0.003;
  simNifty.price = Math.max(18000, simNifty.price * (1 + nDrift));
  simNifty.pct = ((simNifty.price - 22850) / 22850) * 100;

  quotes.NIFTY50 = {
    symbol: 'NIFTY50',
    name: 'NIFTY 50 Index',
    price: +simNifty.price.toFixed(2),
    change: +(simNifty.price * nDrift).toFixed(2),
    changePercent: +simNifty.pct.toFixed(2),
    high: +(simNifty.price * 1.008).toFixed(2),
    low: +(simNifty.price * 0.992).toFixed(2),
    volume: null,
    source: 'simulated'
  };

  return { quotes, timestamp: now };
}

let cache = {
  data: null,
  ts: 0,
  fetching: false,
  lastError: null
};

function mapYahooQuote(symbol, quoteData) {
  const isNifty = symbol === NIFTY_SYM;
  const stockDef = STOCKS.find((s) => s.yf === symbol);
  const key = isNifty ? 'NIFTY50' : stockDef && stockDef.sym;
  if (!key || !quoteData || !quoteData.regularMarketPrice) {
    return null;
  }

  return {
    key,
    value: {
      symbol: key,
      name: isNifty ? 'NIFTY 50 Index' : stockDef.name,
      sector: stockDef && stockDef.sector,
      price: quoteData.regularMarketPrice,
      change: quoteData.regularMarketChange,
      changePercent: quoteData.regularMarketChangePercent,
      high: quoteData.regularMarketDayHigh,
      low: quoteData.regularMarketDayLow,
      volume: quoteData.regularMarketVolume,
      fiftyTwoWeekHigh: quoteData.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quoteData.fiftyTwoWeekLow,
      marketCap: quoteData.marketCap,
      pe: quoteData.trailingPE,
      source: 'yahoo'
    }
  };
}

async function refreshCache(force) {
  if (!force && cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  if (cache.fetching) {
    return cache.data || simulateQuotes();
  }

  cache.fetching = true;
  try {
    const allSymbols = STOCKS.map((s) => s.yf).concat(NIFTY_SYM);
    const results = await Promise.allSettled(allSymbols.map((symbol) => yf.quote(symbol).catch(() => null)));
    const quotes = {};

    for (let i = 0; i < results.length; i += 1) {
      const result = results[i];
      const quoteData = result.status === 'fulfilled' ? result.value : null;
      const mapped = mapYahooQuote(allSymbols[i], quoteData);
      if (mapped) {
        quotes[mapped.key] = mapped.value;
      }
    }

    if (Object.keys(quotes).length >= 5) {
      cache.data = { quotes, timestamp: Date.now() };
      cache.ts = Date.now();
      cache.lastError = null;
    } else {
      throw new Error('Insufficient quotes from Yahoo Finance');
    }
  } catch (error) {
    cache.data = simulateQuotes();
    cache.ts = Date.now();
    cache.lastError = error.message;
  } finally {
    cache.fetching = false;
  }

  return cache.data;
}

app.get('/api/quotes', async (req, res) => {
  const data = await refreshCache(false);
  res.json(data);
});

app.get('/api/stock/:sym', async (req, res) => {
  const sym = String(req.params.sym || '').toUpperCase();

  const data = await refreshCache(false);
  if (data && data.quotes && data.quotes[sym]) {
    return res.json({ quote: data.quotes[sym], source: data.quotes[sym].source });
  }

  try {
    const yfSym = sym.endsWith('.NS') ? sym : `${sym}.NS`;
    const quoteData = await yf.quote(yfSym);
    if (!quoteData || !quoteData.regularMarketPrice) {
      throw new Error('No data');
    }

    const stockDef = STOCKS.find((s) => s.sym === sym);
    const result = {
      symbol: sym,
      name: quoteData.longName || quoteData.shortName || (stockDef && stockDef.name) || sym,
      sector: quoteData.sector || (stockDef && stockDef.sector) || 'N/A',
      price: quoteData.regularMarketPrice,
      change: quoteData.regularMarketChange,
      changePercent: quoteData.regularMarketChangePercent,
      high: quoteData.regularMarketDayHigh,
      low: quoteData.regularMarketDayLow,
      volume: quoteData.regularMarketVolume,
      fiftyTwoWeekHigh: quoteData.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quoteData.fiftyTwoWeekLow,
      marketCap: quoteData.marketCap,
      pe: quoteData.trailingPE,
      source: 'yahoo'
    };

    return res.json({ quote: result });
  } catch (error) {
    const stockDef = STOCKS.find((s) => s.sym === sym);
    if (!stockDef) {
      return res.status(404).json({ error: `Symbol ${sym} not found` });
    }

    const sim = (data && data.quotes && data.quotes[sym]) || {
      symbol: sym,
      name: stockDef.name,
      sector: stockDef.sector,
      price: stockDef.base,
      change: 0,
      changePercent: 0,
      high: stockDef.base * 1.02,
      low: stockDef.base * 0.98,
      volume: Math.round(Math.random() * 3000000),
      source: 'simulated'
    };

    return res.json({ quote: sim });
  }
});

app.get('/api/search', async (req, res) => {
  const q = String(req.query.q || '').trim().toUpperCase();
  if (!q) {
    return res.json([]);
  }

  const data = await refreshCache(false);
  const results = STOCKS
    .filter((stock) => stock.sym.includes(q) || stock.name.toUpperCase().includes(q) || stock.sector.toUpperCase().includes(q))
    .slice(0, 10)
    .map((stock) => Object.assign({ sym: stock.sym, name: stock.name, sector: stock.sector }, data && data.quotes && data.quotes[stock.sym] ? data.quotes[stock.sym] : {}));

  return res.json(results);
});

app.get('/api/status', async (req, res) => {
  await refreshCache(false);
  res.json({
    status: 'online',
    terminal: 'StromAnalytics v3.0',
    cacheAge: Date.now() - cache.ts,
    quoteCount: cache.data ? Object.keys(cache.data.quotes || {}).length : 0,
    source: cache.data && cache.data.quotes && cache.data.quotes.NIFTY50 ? cache.data.quotes.NIFTY50.source : 'none',
    upstreamError: cache.lastError,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
