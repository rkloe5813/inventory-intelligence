import { useState, useEffect } from 'react';

const fmt = (n) =>
  n != null
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : '—';

/**
 * Determine what deal badge the vehicle would receive at a given list price,
 * using the market price as the model baseline.
 *
 * Mirrors Deal Badge logic from the flywheel:
 *   GREAT  = list price ≤ (marketPrice × 0.97)  [rough approximation of "well below predicted"]
 *   GOOD   = list price ≤ (marketPrice × 1.03)
 *   FAIR   = list price ≤ (marketPrice × 1.25)
 *   NONE   = >25% above market (unreliable) or negative
 */
function predictBadge(listPrice, marketPrice) {
  if (!listPrice || !marketPrice || listPrice <= 0) return null;
  const ratio = listPrice / marketPrice;
  if (ratio <= 0.97) return 'GREAT';
  if (ratio <= 1.03) return 'GOOD';
  if (ratio <= 1.25) return 'FAIR';
  return 'NONE';
}

const BADGE_META = {
  GREAT: { label: 'GREAT Deal', sub: 'Well below market — maximum lead volume expected', resultClass: 'result-great' },
  GOOD:  { label: 'GOOD Deal',  sub: 'Competitively priced — healthy lead flow expected',  resultClass: 'result-good'  },
  FAIR:  { label: 'FAIR Deal',  sub: 'Above market — reduced lead volume likely',           resultClass: 'result-fair'  },
  NONE:  { label: 'No Badge',   sub: '>25% above market — badge suppressed',                resultClass: 'result-none'  },
};

const LIFT_COPY = {
  GREAT: '~2–3× more leads vs. FAIR pricing',
  GOOD:  '~1.5× more leads vs. FAIR pricing',
  FAIR:  'Baseline lead volume',
  NONE:  'Significantly below baseline',
};

export default function AcquisitionCalculator({ prefillVehicle, onBack }) {
  // If coming from inventory dashboard, pre-fill with vehicle's market price
  const [marketPrice, setMarketPrice]   = useState(prefillVehicle ? prefillVehicle.marketPrice : '');
  const [targetProfit, setTargetProfit] = useState('');
  const [reconCost, setReconCost]       = useState('');
  const [listPriceAdj, setListPriceAdj] = useState(0); // slider: % adjustment to max buy price as list price proxy

  // Derived values
  const mp  = parseFloat(String(marketPrice).replace(/,/g, '')) || 0;
  const tp  = parseFloat(String(targetProfit).replace(/,/g, '')) || 0;
  const rc  = parseFloat(String(reconCost).replace(/,/g, '')) || 0;

  // Max buy price = market price − target profit − recon cost
  const maxBuyPrice = mp > 0 ? Math.max(0, mp - tp - rc) : null;

  // Simulated list price: dealer adjusts via slider (±15% from max buy price + recon = their implied retail)
  // The slider lets them see "if I pay X, and price at Y, what badge do I get?"
  // We estimate their list price = maxBuyPrice + reconCost + targetProfit + adjustment
  const sliderDelta = maxBuyPrice != null ? Math.round((listPriceAdj / 100) * mp) : 0;
  const impliedListPrice = maxBuyPrice != null ? mp + sliderDelta : null;
  const badge = impliedListPrice != null ? predictBadge(impliedListPrice, mp) : null;
  const badgeMeta = badge ? BADGE_META[badge] : null;

  // Reset slider when vehicle changes
  useEffect(() => {
    setListPriceAdj(0);
    if (prefillVehicle) {
      setMarketPrice(prefillVehicle.marketPrice);
    }
  }, [prefillVehicle]);

  const hasResult = maxBuyPrice != null && mp > 0 && (tp > 0 || rc > 0);

  return (
    <>
      <div className="app-bar">
        <button className="app-bar-back" onClick={onBack}>←</button>
        <div>
          <h1>Acquisition Calculator</h1>
          {prefillVehicle && (
            <div className="app-bar-sub">
              {prefillVehicle.year} {prefillVehicle.make} {prefillVehicle.model} {prefillVehicle.trim}
            </div>
          )}
        </div>
      </div>

      <div className="scroll-area">

        {/* Step 1: Market price */}
        <div className="section-label">Step 1 — Cars.com Market Price</div>
        <div className="card">
          <div className="input-group">
            <div className="input-label">Predicted Market Price</div>
            <div className="input-prefix">
              <div className="input-prefix-symbol">$</div>
              <input
                className="input-field"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 28400"
                value={marketPrice}
                onChange={e => setMarketPrice(e.target.value)}
              />
            </div>
            {prefillVehicle && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Pre-filled from Cars.com market data for this VIN
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Subtract costs */}
        <div className="section-label">Step 2 — Your Costs & Profit Target</div>
        <div className="card">
          <div className="input-group">
            <div className="input-label">Target Profit</div>
            <div className="input-prefix">
              <div className="input-prefix-symbol">$</div>
              <input
                className="input-field"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 2500"
                value={targetProfit}
                onChange={e => setTargetProfit(e.target.value)}
              />
            </div>
          </div>
          <div className="input-group">
            <div className="input-label">Estimated Recon Cost</div>
            <div className="input-prefix">
              <div className="input-prefix-symbol">$</div>
              <input
                className="input-field"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 1200"
                value={reconCost}
                onChange={e => setReconCost(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Max buy price result */}
        {hasResult && (
          <>
            <div className="section-label">Step 3 — Max Acquisition Price</div>
            <div className="result-box result-brand">
              <div className="result-box-label">Your Max Buy Price</div>
              <div className="result-box-amount">{fmt(maxBuyPrice)}</div>
              <div className="result-box-sub">
                {fmt(mp)} market − {fmt(tp)} profit − {fmt(rc)} recon
              </div>
            </div>

            {/* Breakdown */}
            <div className="card">
              <div className="breakdown-row">
                <span className="breakdown-label">Cars.com Market Price</span>
                <span className="breakdown-value">{fmt(mp)}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">− Target Profit</span>
                <span className="breakdown-value negative">({fmt(tp)})</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">− Recon Estimate</span>
                <span className="breakdown-value negative">({fmt(rc)})</span>
              </div>
              <div className="breakdown-row total-row">
                <span className="breakdown-label">= Max Buy Price</span>
                <span className="breakdown-value">{fmt(maxBuyPrice)}</span>
              </div>
            </div>

            {/* Step 4: What-if list price slider */}
            <div className="section-label">Step 4 — What if I list at…</div>
            <div className="card">
              <div className="input-group" style={{ paddingBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div className="input-label">List Price Adjustment</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: listPriceAdj > 5 ? 'var(--badge-attention-text)' : 'var(--text)' }}>
                    {fmt(impliedListPrice)}
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                      ({listPriceAdj > 0 ? '+' : ''}{listPriceAdj}%)
                    </span>
                  </div>
                </div>
                <div className="slider-wrap">
                  <input
                    type="range"
                    className="slider"
                    min={-15}
                    max={20}
                    step={1}
                    value={listPriceAdj}
                    onChange={e => setListPriceAdj(Number(e.target.value))}
                  />
                  <div className="slider-labels">
                    <span>15% below market</span>
                    <span>Market</span>
                    <span>20% above</span>
                  </div>
                </div>
              </div>

              {/* Badge preview */}
              {badge && badgeMeta && (
                <div
                  className={`result-box ${badgeMeta.resultClass}`}
                  style={{ margin: '0 12px 12px', borderRadius: 'var(--radius-sm)' }}
                >
                  <div className="result-box-label">Predicted Deal Badge</div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{badgeMeta.label}</div>
                  <div className="result-box-sub">{badgeMeta.sub}</div>
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, opacity: 0.8 }}>
                    {LIFT_COPY[badge]}
                  </div>
                </div>
              )}
            </div>

            {/* Gross profit reminder */}
            <div className="card">
              <div className="card-row">
                <span className="card-row-label">If you pay max buy price and list at {fmt(impliedListPrice)}</span>
                <span className="card-row-value" style={{ color: tp > 0 ? 'var(--badge-benefit-text)' : 'var(--text)' }}>
                  {fmt(tp + sliderDelta)} gross
                </span>
              </div>
              <div className="card-row">
                <span className="card-row-label" style={{ fontSize: 12 }}>
                  Adjust your offer below max buy price to protect margin if market moves.
                </span>
              </div>
            </div>
          </>
        )}

        {!hasResult && mp > 0 && (
          <div style={{ padding: '24px 16px', color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
            Enter your target profit and recon cost to see your max buy price.
          </div>
        )}

        {!hasResult && mp === 0 && (
          <div style={{ padding: '24px 16px', color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
            Enter the Cars.com market price to get started.
          </div>
        )}

        <div className="spacer" />
      </div>
    </>
  );
}
