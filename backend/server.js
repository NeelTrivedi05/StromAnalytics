/**
 * StromAnalytics — backend/server.js v3.1
 * Yahoo Finance proxy + simulated data fallback
 * Port: 3001
 */
'use strict';

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/* ── Stock Universe ─────────────────────────────────────── */
const STOCKS = [
    { sym: 'RELIANCE',   yf: 'RELIANCE.NS',   base: 2850,  name: 'Reliance Industries',       sector: 'Energy'         },
    { sym: 'TCS',        yf: 'TCS.NS',         base: 3780,  name: 'Tata Consultancy Services', sector: 'IT'             },
    { sym: 'HDFCBANK',   yf: 'HDFCBANK.NS',    base: 1640,  name: 'HDFC Bank',                 sector: 'Finance'        },
    { sym: 'INFY',       yf: 'INFY.NS',        base: 1510,  name: 'Infosys',                   sector: 'IT'             },
    { sym: 'ICICIBANK',  yf: 'ICICIBANK.NS',   base: 1090,  name: 'ICICI Bank',                sector: 'Finance'        },
    { sym: 'HINDUNILVR', yf: 'HINDUNILVR.NS',  base: 2420,  name: 'Hindustan Unilever',        sector: 'FMCG'           },
    { sym: 'SBIN',       yf: 'SBIN.NS',        base: 780,   name: 'State Bank of India',       sector: 'Finance'        },
    { sym: 'BAJFINANCE', yf: 'BAJFINANCE.NS',  base: 7100,  name: 'Bajaj Finance',             sector: 'Finance'        },
    { sym: 'MARUTI',     yf: 'MARUTI.NS',      base: 11800, name: 'Maruti Suzuki',             sector: 'Auto'           },
    { sym: 'WIPRO',      yf: 'WIPRO.NS',       base: 480,   name: 'Wipro',                     sector: 'IT'             },
    { sym: 'ONGC',       yf: 'ONGC.NS',        base: 270,   name: 'Oil and Natural Gas Corp',  sector: 'Energy'         },
    { sym: 'TITAN',      yf: 'TITAN.NS',       base: 3400,  name: 'Titan Company',             sector: 'Consumer'       },
    { sym: 'AXISBANK',   yf: 'AXISBANK.NS',    base: 1060,  name: 'Axis Bank',                 sector: 'Finance'        },
    { sym: 'KOTAKBANK',  yf: 'KOTAKBANK.NS',   base: 1780,  name: 'Kotak Mahindra Bank',       sector: 'Finance'        },
    { sym: 'SUNPHARMA',  yf: 'SUNPHARMA.NS',   base: 1680,  name: 'Sun Pharmaceutical',        sector: 'Pharma'         },
    { sym: 'ADANIENT',   yf: 'ADANIENT.NS',    base: 2500,  name: 'Adani Enterprises',         sector: 'Conglomerate'   },
    { sym: 'ADANIPORTS', yf: 'ADANIPORTS.NS',  base: 1350,  name: 'Adani Ports & SEZ',         sector: 'Infrastructure' },
    { sym: 'ASIANPAINT', yf: 'ASIANPAINT.NS',  base: 2750,  name: 'Asian Paints',              sector: 'Consumer'       },
    { sym: 'BAJAJFINSV', yf: 'BAJAJFINSV.NS',  base: 1650,  name: 'Bajaj Finserv',             sector: 'Finance'        },
    { sym: 'BHARTIARTL', yf: 'BHARTIARTL.NS',  base: 1550,  name: 'Bharti Airtel',             sector: 'Telecom'        },
    { sym: 'BPCL',       yf: 'BPCL.NS',        base: 620,   name: 'Bharat Petroleum',          sector: 'Energy'         },
    { sym: 'CIPLA',      yf: 'CIPLA.NS',       base: 1490,  name: 'Cipla',                     sector: 'Pharma'         },
    { sym: 'COALINDIA',  yf: 'COALINDIA.NS',   base: 470,   name: 'Coal India',                sector: 'Mining'         },
    { sym: 'DIVISLAB',   yf: 'DIVISLAB.NS',    base: 3800,  name: "Divi's Laboratories",        sector: 'Pharma'         },
    { sym: 'DRREDDY',    yf: 'DRREDDY.NS',     base: 6200,  name: "Dr. Reddy's Laboratories",  sector: 'Pharma'         },
    { sym: 'EICHERMOT',  yf: 'EICHERMOT.NS',   base: 4400,  name: 'Eicher Motors',             sector: 'Auto'           },
    { sym: 'GRASIM',     yf: 'GRASIM.NS',      base: 2450,  name: 'Grasim Industries',         sector: 'Conglomerate'   },
    { sym: 'HCLTECH',    yf: 'HCLTECH.NS',     base: 1750,  name: 'HCL Technologies',          sector: 'IT'             },
    { sym: 'HEROMOTOCO', yf: 'HEROMOTOCO.NS',  base: 4800,  name: 'Hero MotoCorp',             sector: 'Auto'           },
    { sym: 'HINDALCO',   yf: 'HINDALCO.NS',    base: 680,   name: 'Hindalco Industries',       sector: 'Metals'         },
    { sym: 'ITC',        yf: 'ITC.NS',         base: 460,   name: 'ITC Limited',               sector: 'FMCG'           },
    { sym: 'JSWSTEEL',   yf: 'JSWSTEEL.NS',    base: 920,   name: 'JSW Steel',                 sector: 'Metals'         },
    { sym: 'LT',         yf: 'LT.NS',          base: 3600,  name: 'Larsen & Toubro',           sector: 'Infrastructure' },
    { sym: 'LTIM',       yf: 'LTIM.NS',        base: 5500,  name: 'LTIMindtree',               sector: 'IT'             },
    { sym: 'MM',         yf: 'M&M.NS',         base: 2900,  name: 'Mahindra & Mahindra',       sector: 'Auto'           },
    { sym: 'NESTLEIND',  yf: 'NESTLEIND.NS',   base: 22500, name: 'Nestle India',              sector: 'FMCG'           },
    { sym: 'NTPC',       yf: 'NTPC.NS',        base: 380,   name: 'NTPC Limited',              sector: 'Energy'         },
    { sym: 'POWERGRID',  yf: 'POWERGRID.NS',   base: 310,   name: 'Power Grid Corp',           sector: 'Energy'         },
    { sym: 'SBILIFE',    yf: 'SBILIFE.NS',     base: 1550,  name: 'SBI Life Insurance',        sector: 'Insurance'      },
    { sym: 'TATAMOTORS', yf: 'TATAMOTORS.NS',  base: 1000,  name: 'Tata Motors',               sector: 'Auto'           },
    { sym: 'TATASTEEL',  yf: 'TATASTEEL.NS',   base: 165,   name: 'Tata Steel',                sector: 'Metals'         },
    { sym: 'TECHM',      yf: 'TECHM.NS',       base: 1650,  name: 'Tech Mahindra',             sector: 'IT'             },
    { sym: 'ULTRACEMCO', yf: 'ULTRACEMCO.NS',  base: 10500, name: 'UltraTech Cement',          sector: 'Materials'      },
];

const NIFTY_SYM = '^NSEI';

/* ── Simulated Data Generator ───────────────────────────── */
const simState = {};
STOCKS.forEach(s => { simState[s.sym] = { price: s.base, pct: (Math.random() - 0.5) * 4 }; });
let simNifty = { price: 22850, pct: (Math.random() - 0.5) * 1.5 };

function simulateQuotes() {
    const now = Date.now();
    const result = {};
    STOCKS.forEach(s => {
        const drift = (Math.random() - 0.5) * 0.006;
        simState[s.sym].price = Math.max(s.base * 0.5, simState[s.sym].price * (1 + drift));
        simState[s.sym].pct = (simState[s.sym].price - s.base) / s.base * 100;
        result[s.sym] = {
            symbol: s.sym, name: s.name, sector: s.sector,
            price: +simState[s.sym].price.toFixed(2),
            change: +(simState[s.sym].price * drift).toFixed(2),
            changePercent: +(simState[s.sym].pct).toFixed(2),
            high: +(simState[s.sym].price * 1.012).toFixed(2),
            low: +(simState[s.sym].price * 0.988).toFixed(2),
            volume: Math.round(Math.random() * 5e6 + 1e6),
            source: 'simulated',
        };
    });
    const nDrift = (Math.random() - 0.5) * 0.003;
    simNifty.price = Math.max(18000, simNifty.price * (1 + nDrift));
    simNifty.pct = (simNifty.price - 22850) / 22850 * 100;
    result['NIFTY50'] = {
        symbol: 'NIFTY50', name: 'NIFTY 50 Index',
        price: +simNifty.price.toFixed(2),
        change: +(simNifty.price * nDrift).toFixed(2),
        changePercent: +simNifty.pct.toFixed(2),
        high: +(simNifty.price * 1.008).toFixed(2),
        low: +(simNifty.price * 0.992).toFixed(2),
        volume: null,
        source: 'simulated',
    };
    return { quotes: result, timestamp: now };
}

/* ── Cache ──────────────────────────────────────────────── */
let cache = { data: null, ts: 0, fetching: false };
const CACHE_TTL = 8000; // 8s

async function refreshCache() {
    if (cache.fetching) return;
    cache.fetching = true;
    try {
        let yf;
        try { yf = require('yahoo-finance2').default; } catch { throw new Error('yahoo-finance2 not available'); }

        const allSyms = [...STOCKS.map(s => s.yf), NIFTY_SYM];
        const results = await Promise.allSettled(
            allSyms.map(sym =>
                yf.quote(sym).catch(() => null)
            )
        );

        const quotes = {};
        results.forEach((r, i) => {
            const sym = allSyms[i];
            const q = r.status === 'fulfilled' ? r.value : null;
            if (!q || !q.regularMarketPrice) return;
            const isNifty = sym === NIFTY_SYM;
            const stockDef = STOCKS.find(s => s.yf === sym);
            const key = isNifty ? 'NIFTY50' : stockDef?.sym;
            if (!key) return;
            quotes[key] = {
                symbol: key,
                name: isNifty ? 'NIFTY 50 Index' : stockDef?.name,
                sector: stockDef?.sector,
                price: q.regularMarketPrice,
                change: q.regularMarketChange,
                changePercent: q.regularMarketChangePercent,
                high: q.regularMarketDayHigh,
                low: q.regularMarketDayLow,
                volume: q.regularMarketVolume,
                fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: q.fiftyTwoWeekLow,
                marketCap: q.marketCap,
                pe: q.trailingPE,
                source: 'yahoo',
            };
        });

        if (Object.keys(quotes).length >= 5) {
            cache.data = { quotes, timestamp: Date.now() };
            cache.ts = Date.now();
            console.log(`[API] Fetched ${Object.keys(quotes).length} quotes from Yahoo Finance`);
        } else {
            throw new Error('Insufficient quotes from Yahoo Finance');
        }
    } catch (err) {
        console.log(`[API] Yahoo Finance fetch failed (${err.message}), using simulated data`);
        cache.data = simulateQuotes();
        cache.ts = Date.now();
    } finally {
        cache.fetching = false;
    }
}

// Always refresh simulated data so price moves
setInterval(() => {
    if (!cache.data || cache.data.quotes?.NIFTY50?.source === 'simulated') {
        cache.data = simulateQuotes();
        cache.ts = Date.now();
    }
}, 1000);

// Try to refresh real quotes every 8s
setInterval(refreshCache, CACHE_TTL);
refreshCache(); // initial fetch on startup

/* ── Routes ─────────────────────────────────────────────── */
app.get('/api/quotes', (req, res) => {
    if (!cache.data) {
        cache.data = simulateQuotes();
        cache.ts = Date.now();
    }
    res.json(cache.data);
});

// Single stock detail — supports any NSE symbol
app.get('/api/stock/:sym', async (req, res) => {
    const sym = req.params.sym.toUpperCase();

    // First check cached data
    if (cache.data?.quotes?.[sym]) {
        return res.json({ quote: cache.data.quotes[sym], source: cache.data.quotes[sym].source });
    }

    // Try Yahoo Finance for unknown symbols
    try {
        let yf;
        try { yf = require('yahoo-finance2').default; } catch { throw new Error('yahoo-finance2 not available'); }

        const yfSym = sym.endsWith('.NS') ? sym : `${sym}.NS`;
        const q = await yf.quote(yfSym);
        if (!q || !q.regularMarketPrice) throw new Error('No data');

        const stockDef = STOCKS.find(s => s.sym === sym);
        const result = {
            symbol: sym,
            name: q.longName || q.shortName || stockDef?.name || sym,
            sector: q.sector || stockDef?.sector || 'N/A',
            price: q.regularMarketPrice,
            change: q.regularMarketChange,
            changePercent: q.regularMarketChangePercent,
            high: q.regularMarketDayHigh,
            low: q.regularMarketDayLow,
            volume: q.regularMarketVolume,
            fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: q.fiftyTwoWeekLow,
            marketCap: q.marketCap,
            pe: q.trailingPE,
            source: 'yahoo',
        };
        res.json({ quote: result });
    } catch (err) {
        // Fallback to simulated
        const stockDef = STOCKS.find(s => s.sym === sym);
        if (stockDef) {
            const sim = cache.data?.quotes?.[sym] || {
                symbol: sym, name: stockDef.name, sector: stockDef.sector,
                price: stockDef.base, change: 0, changePercent: 0,
                high: stockDef.base * 1.02, low: stockDef.base * 0.98,
                volume: Math.round(Math.random() * 3e6), source: 'simulated'
            };
            res.json({ quote: sim });
        } else {
            res.status(404).json({ error: `Symbol ${sym} not found` });
        }
    }
});

app.get('/api/search', (req, res) => {
    const q = (req.query.q || '').trim().toUpperCase();
    if (!q || q.length < 1) return res.json([]);
    const results = STOCKS
        .filter(s => s.sym.includes(q) || s.name.toUpperCase().includes(q) || s.sector.toUpperCase().includes(q))
        .slice(0, 10)
        .map(s => ({
            sym: s.sym, name: s.name, sector: s.sector,
            ...(cache.data?.quotes?.[s.sym] || {}),
        }));
    res.json(results);
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        terminal: 'StromAnalytics v3.0',
        cacheAge: Date.now() - cache.ts,
        quoteCount: cache.data ? Object.keys(cache.data.quotes || {}).length : 0,
        source: cache.data?.quotes?.NIFTY50?.source || 'none',
        timestamp: new Date().toISOString(),
    });
});

// Production: serve built frontend
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🔵 StromAnalytics API → http://localhost:${PORT}/api/quotes`);
    console.log(`   Initializing Yahoo Finance data...`);
});
