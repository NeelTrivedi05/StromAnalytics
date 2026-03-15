import React, { useEffect, useRef } from 'react';
import './style.css';
import { initApp } from './engine.js';

export default function App() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    // Run the full terminal engine after React has mounted the DOM
    initApp();
  }, []);

  return (
    <>
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <header className="topbar">
        <div className="tb-left">
          <div className="logo">
            <span className="logo-mark">▪</span>
            <span className="logo-name">STROM<em>ANALYTICS</em></span>
          </div>
          <div className="tb-clock-wrap">
            <span className="tb-time" id="tbClock">--:--:--</span>
            <span className="tb-date" id="tbDate">--- -- --- ----</span>
          </div>
          <div className="tb-status">
            <span className="live-dot"></span>
            <span className="live-label">LIVE</span>
          </div>
        </div>
        <div className="tb-center">
          <div className="search-wrap" id="searchWrap">
            <svg className="search-icon" viewBox="0 0 16 16" fill="none" width="14" height="14">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input className="search-input" id="searchInput" type="text" placeholder="Search stocks — symbol or name…" autoComplete="off" spellCheck="false" />
            <kbd className="search-kbd">⌘K</kbd>
            <div className="search-dropdown" id="searchDropdown"></div>
          </div>
        </div>
        <div className="tb-right">
          <button className="tb-btn tb-btn--ai" id="aiNarratorBtn">
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M11 3l1 1M5 3l-1 1M8 1v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            AI Narrator
          </button>
          <button className="tb-btn" id="windowsMenuBtn">
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
              <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            Windows
          </button>
          <button className="tb-btn" id="settingsBtn">
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
              <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Settings
          </button>
          <button className="tb-btn tb-btn--alert" id="alertBtn">
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
              <path d="M8 1a5 5 0 00-5 5v3l-1.5 2h13L13 9V6a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Alerts
            <span className="alert-count" id="alertCount">0</span>
          </button>
        </div>
      </header>

      {/* ── Ticker Strip ─────────────────────────────────────── */}
      <div className="ticker-strip">
        <div className="ticker-track" id="tickerTrack"></div>
      </div>

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="desktop" id="desktop">

        {/* Window: Order Flow Delta */}
        <div className="window" id="win-orderflow" data-window="orderflow">
          <div className="window-chrome">
            <div className="traffic-lights">
              <button className="tl tl-close" data-action="close"></button>
              <button className="tl tl-min" data-action="minimize"></button>
              <button className="tl tl-max" data-action="maximize"></button>
            </div>
            <span className="window-title">ORDER FLOW DELTA</span>
            <div className="window-meta">
              <span className="wm-val" id="ofLive">+0.0</span>
              <span className="live-dot"></span>
            </div>
          </div>
          <div className="window-body">
            <canvas id="chartOrderflow"></canvas>
            <div className="chart-tooltip" id="tooltipOrderflow"></div>
            <div className="chart-crosshair" id="crosshairOrderflow"></div>
          </div>
          <div className="ghost-msg" id="ghost-orderflow"></div>
          <div className="win-resize-handle" data-win="win-orderflow"></div>
        </div>

        {/* Window: Sentimental Signal */}
        <div className="window" id="win-sentimental" data-window="sentimental">
          <div className="window-chrome">
            <div className="traffic-lights">
              <button className="tl tl-close" data-action="close"></button>
              <button className="tl tl-min" data-action="minimize"></button>
              <button className="tl tl-max" data-action="maximize"></button>
            </div>
            <span className="window-title">SENTIMENTAL SIGNAL</span>
            <div className="window-meta">
              <span className="wm-val" id="sentScore">+0.00</span>
              <span className="live-dot"></span>
            </div>
          </div>
          <div className="window-body window-body--sent">
            <div className="sent-score-big" id="sentBigScore">+0.00</div>
            <div className="sent-label" id="sentimentRegime">NEUTRAL</div>
            <div className="sent-bar-row">
              <span className="sent-bar-lbl">FEAR</span>
              <div className="sent-bar-track">
                <div className="sent-bar-neg" id="sentimentBarNeg"></div>
                <div className="sent-bar-pos" id="sentimentBarPos"></div>
              </div>
              <span className="sent-bar-lbl">GREED</span>
            </div>
          </div>
          <div className="win-resize-handle" data-win="win-sentimental"></div>
        </div>

        {/* Window: Primary Chart */}
        <div className="window" id="win-vix" data-window="vix">
          <div className="window-chrome">
            <div className="traffic-lights">
              <button className="tl tl-close" data-action="close"></button>
              <button className="tl tl-min" data-action="minimize"></button>
              <button className="tl tl-max" data-action="maximize"></button>
            </div>
            <span className="window-title">PRIMARY CHART — <span id="primaryChartSym">AAPL</span></span>
            <div className="window-meta">
              <span className="live-dot"></span>
            </div>
          </div>
          <div className="window-body" style={{position:'relative',padding:0}}>
            <div style={{flex:1,minHeight:0,position:'relative'}}>
              <div id="primaryChartContainer" className="primary-chart-container"></div>
            </div>
            <div className="primary-stats-bar" id="primaryStatsBar">
              <div className="pstat"><span className="pstat-lbl">PRICE</span><span className="pstat-val" id="primaryPrice">--</span></div>
              <div className="pstat"><span className="pstat-lbl">CHANGE</span><span className="pstat-val pos" id="primaryChange">--</span></div>
              <div className="pstat"><span className="pstat-lbl">HIGH</span><span className="pstat-val" id="primaryHigh">--</span></div>
              <div className="pstat"><span className="pstat-lbl">LOW</span><span className="pstat-val neg" id="primaryLow">--</span></div>
              <div className="primary-sma-badge" id="primarySmaBadge"></div>
            </div>
            <div className="primary-zscore-row">
              <span className="pz-label">Z-SCORE</span>
              <span className="pz-val" id="primaryZscoreVal">--</span>
              <div className="pz-track"><div className="pz-fill" id="primaryZscoreFill"></div></div>
            </div>
          </div>
          <div className="ghost-msg" id="ghost-vix"></div>
          <div className="win-resize-handle" data-win="win-vix"></div>
        </div>

        {/* Window: Instrumental Signal */}
        <div className="window" id="win-instrumental" data-window="instrumental">
          <div className="window-chrome">
            <div className="traffic-lights">
              <button className="tl tl-close" data-action="close"></button>
              <button className="tl tl-min" data-action="minimize"></button>
              <button className="tl tl-max" data-action="maximize"></button>
            </div>
            <span className="window-title">INSTRUMENTAL SIGNAL</span>
            <div className="window-meta">
              <div className="instr-tabs">
                <button className="instr-tab active" id="instrTabSignal">Signal</button>
              </div>
              <span className="live-dot"></span>
            </div>
          </div>
          <div className="window-body window-body--flush">
            {/* Tab: Signal */}
            <div className="instr-panel" id="instrPanelSignal">
              <div className="instr-body">
                <div className="instr-header">
                  <div className="instr-nifty-label">NIFTY 50</div>
                  <div className="instr-nifty-price" id="instrNiftyPrice">&#8377;--,---</div>
                  <div className="instr-nifty-delta pos" id="instrNiftyDelta">+0.00%</div>
                </div>
                <div className="instr-divider"></div>
                <div className="instr-stocks-list" id="instrStocksList"></div>
              </div>
            </div>
          </div>
          <div className="win-resize-handle" data-win="win-instrumental"></div>
        </div>

        {/* Window: Index */}
        <div className="window" id="win-index" data-window="index">
          <div className="window-chrome">
            <div className="traffic-lights">
              <button className="tl tl-close" data-action="close"></button>
              <button className="tl tl-min" data-action="minimize"></button>
              <button className="tl tl-max" data-action="maximize"></button>
            </div>
            <span className="window-title">INDEX</span>
            <div className="window-meta"><span className="live-dot"></span></div>
          </div>
          <div className="window-body window-body--index">
            <div className="index-head">
              <div className="index-kicker">INSTRUMENT</div>
              <div className="index-sym" id="indexSym">---</div>
              <div className="index-name" id="indexName">---</div>
            </div>
            <div className="index-price" id="indexPrice">&#8377;--,---</div>
            <div className="index-delta" id="indexDelta">+0.00%</div>
            <div className="index-change" id="indexChange">+&#8377;0.00</div>
            <div className="index-meta-row">
              <div className="index-meta-item"><span className="idx-lbl">HIGH</span><span className="idx-val" id="indexHigh">---</span></div>
              <div className="index-meta-item"><span className="idx-lbl">LOW</span><span className="idx-val" id="indexLow">---</span></div>
            </div>
            <div className="index-badge" id="indexBadge">TOP GAINER</div>
          </div>
          <div className="win-resize-handle" data-win="win-index"></div>
        </div>

        {/* Window: Live Chart (candlestick) */}
        <div className="window" id="win-livechart" data-window="livechart">
          <div className="window-chrome">
            <div className="traffic-lights">
              <button className="tl tl-close" data-action="close"></button>
              <button className="tl tl-min" data-action="minimize"></button>
              <button className="tl tl-max" data-action="maximize"></button>
            </div>
            <span className="window-title">LIVE CHART — <span id="liveChartSym">---</span></span>
            <div className="window-meta">
              <span className="live-dot"></span>
            </div>
          </div>
          <div className="window-body" style={{padding: '8px', position: 'relative'}}>
            <canvas id="chartLive"></canvas>
            <div className="chart-crosshair" id="crosshairLive"></div>
            <div className="candle-tooltip" id="candleTooltip"></div>
          </div>
          <div className="win-resize-handle" data-win="win-livechart"></div>
        </div>

        {/* Window: Signal Log */}
        <div className="window" id="win-signallog" data-window="signallog">
          <div className="window-chrome">
            <div className="traffic-lights">
              <button className="tl tl-close" data-action="close"></button>
              <button className="tl tl-min" data-action="minimize"></button>
              <button className="tl tl-max" data-action="maximize"></button>
            </div>
            <span className="window-title">SIGNAL LOG</span>
            <div className="window-meta">
              <span className="wm-count" id="sigCount">0 entries</span>
              <span className="live-dot"></span>
            </div>
          </div>
          <div className="window-body window-body--flush">
            <div className="signal-log" id="signalLog"></div>
          </div>
          <div className="win-resize-handle" data-win="win-signallog"></div>
        </div>

        {/* Window: Anomaly Log — Whisper Feed */}
        <div className="window" id="win-anomalylog" data-window="anomalylog">
          <div className="window-chrome">
            <div className="traffic-lights">
              <button className="tl tl-close" data-action="close"></button>
              <button className="tl tl-min" data-action="minimize"></button>
              <button className="tl tl-max" data-action="maximize"></button>
            </div>
            <span className="window-title">ANOMALY LOG</span>
            <div className="window-meta">
              <span className="wm-badge wm-badge--red" id="anomalyAlertsCount">ALERTS: 0</span>
              <span className="live-dot"></span>
            </div>
          </div>
          <div className="window-body window-body--flush">
            <div className="whisper-feed" id="anomalyLog">
              <div className="fp-empty">No anomalies detected…</div>
            </div>
          </div>
          <div className="win-resize-handle" data-win="win-anomalylog"></div>
        </div>

        {/* Window: Heat Map */}
        <div className="window" id="win-heatmap" data-window="heatmap">
          <div className="window-chrome">
            <div className="traffic-lights">
              <button className="tl tl-close" data-action="close"></button>
              <button className="tl tl-min" data-action="minimize"></button>
              <button className="tl tl-max" data-action="maximize"></button>
            </div>
            <span className="window-title">HEAT MAP</span>
            <div className="window-meta">
              <span className="wm-badge">NSE TOP 35</span>
            </div>
          </div>
          <div className="window-body window-body--flush">
            <div className="heatmap-grid" id="heatmapGrid"></div>
          </div>
          <div className="win-resize-handle" data-win="win-heatmap"></div>
        </div>

      </div>{/* /desktop */}

      {/* ── Stock Detail Modal ─────────────────────────────── */}
      <div className="stock-modal-overlay" id="stockModalOverlay">
        <div className="stock-modal" id="stockModal">
          <div className="stock-modal-header">
            <div className="stock-modal-title-group">
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <button className="stock-modal-back" id="stockModalBack">
                  <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                    <path d="M9 1L3 7l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="stock-modal-sym" id="modalSym">---</span>
              </div>
              <span className="stock-modal-name" id="modalName">---</span>
            </div>
            <div className="stock-modal-actions">
              <span className="stock-modal-sector" id="modalSector">---</span>
              <button className="stock-modal-close" id="stockModalClose">
                <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="stock-modal-price-row">
            <span className="stock-modal-price" id="modalPrice">&#8377;--,---</span>
            <span className="stock-modal-delta" id="modalDelta">---%</span>
            <span className="stock-modal-change" id="modalChange">---</span>
          </div>
          <div className="stock-modal-period-row">
            <button className="smp-tab active" data-speriod="1D">1D</button>
            <button className="smp-tab" data-speriod="1W">1W</button>
            <button className="smp-tab" data-speriod="1M">1M</button>
            <button className="smp-tab" data-speriod="1Y">1Y</button>
          </div>
          <div className="stock-modal-chart-wrap">
            <canvas id="modalChart"></canvas>
          </div>
          <div className="stock-modal-stats">
            <div className="stat-card"><span className="stat-label">Open</span><span className="stat-val" id="modalOpen">---</span></div>
            <div className="stat-card"><span className="stat-label">Day High</span><span className="stat-val" id="modalHigh">---</span></div>
            <div className="stat-card"><span className="stat-label">Day Low</span><span className="stat-val" id="modalLow">---</span></div>
            <div className="stat-card"><span className="stat-label">Volume</span><span className="stat-val" id="modalVolume">---</span></div>
            <div className="stat-card"><span className="stat-label">Prev Close</span><span className="stat-val" id="modalPrevClose">---</span></div>
            <div className="stat-card"><span className="stat-label">Source</span><span className="stat-val" id="modalSource">---</span></div>
          </div>
          <div className="stock-modal-footer">
            <span className="stock-modal-updated" id="modalUpdated">Last updated: ---</span>
          </div>
        </div>
      </div>

      {/* ── Windows Menu Panel ─────────────────────────────── */}
      <div className="floating-panel" id="windowsMenu">
        <div className="fp-header">
          <span className="fp-title">Windows</span>
          <button className="fp-close" id="windowsMenuClose">
            <svg viewBox="0 0 14 14" fill="none" width="10" height="10">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="fp-body" id="windowsMenuBody"></div>
      </div>

      {/* ── Settings Panel ─────────────────────────────────── */}
      <div className="floating-panel" id="settingsPanel">
        <div className="fp-header">
          <span className="fp-title">Settings</span>
          <button className="fp-close" id="settingsPanelClose">
            <svg viewBox="0 0 14 14" fill="none" width="10" height="10">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="fp-body">
          <div className="setting-row">
            <span className="setting-label">Theme</span>
            <div className="theme-switcher">
              <button className="theme-opt active" id="themeDark">Dark</button>
              <button className="theme-opt" id="themeLight">Light</button>
            </div>
          </div>
          <div className="setting-row">
            <span className="setting-label">Layout</span>
            <button className="setting-action" id="resetLayoutBtn">Reset Layout</button>
          </div>
          <div className="setting-row">
            <span className="setting-label">Data Source</span>
            <span className="setting-info" id="dataSourceInfo">Connecting...</span>
          </div>
        </div>
      </div>

      {/* ── Alerts Panel ───────────────────────────────────── */}
      <div className="alerts-panel" id="alertsPanel">
        <div className="fp-header">
          <span className="fp-title">Anomaly Alerts</span>
          <button className="fp-close" id="alertsPanelClose">
            <svg viewBox="0 0 14 14" fill="none" width="10" height="10">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="fp-body" id="alertsPanelBody">
          <div className="fp-empty">No alerts yet — monitoring streams…</div>
        </div>
      </div>

      {/* ── AI Market Narrator Panel ──────────────────────── */}
      <div className="ai-narrator-panel" id="aiNarratorPanel">
        <div className="ai-panel-chrome">
          <div className="ai-panel-title-row">
            <div className="ai-panel-icon">AI</div>
            <span className="ai-panel-title">AI Market Narrator</span>
            <div className="ai-panel-controls">
              <button className="ai-ctrl-btn" id="aiMinBtn" title="Minimize">—</button>
              <button className="ai-ctrl-btn" id="aiMaxBtn" title="Maximize">⤢</button>
              <button className="ai-ctrl-btn ai-ctrl-close" id="aiCloseBtn" title="Close">×</button>
            </div>
          </div>
          <div className="ai-panel-live-row">
            <span className="live-dot"></span>
            <span className="ai-live-label">Live narrative · updates every 5s</span>
          </div>
        </div>
        <div className="ai-panel-body" id="aiNarratorBody">
          <div className="ai-narrative-text" id="aiNarrativeText">
            Initialising market intelligence…
          </div>
          <div className="ai-narrative-stream" id="aiNarrativeStream"></div>
        </div>
        <div className="ai-panel-footer">
          <span className="ai-disclaimer">AI can make mistakes. The predicted news may not be 100% accurate.</span>
        </div>
        <div className="ai-resize-handle" id="aiResizeHandle"></div>
      </div>

      {/* ── Boot Overlay ───────────────────────────────────── */}
      <div className="boot-screen" id="bootScreen">
        <div className="boot-inner">
          <div className="boot-logo">STROM<span>ANALYTICS</span></div>
          <div className="boot-caption">TERMINAL v3.1 · MARKET OPERATIONS</div>
          <div className="boot-bar-wrap">
            <div className="boot-bar" id="bootBar"></div>
          </div>
          <div className="boot-log" id="bootLog"></div>
        </div>
      </div>
    </>
  );
}
