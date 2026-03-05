import { useState } from 'react';
import { mockInventory, deriveRecommendation } from '../data/mockInventory';

const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// Fuse semantic color mapping for AT Risk tiers
const RISK_CLASS = {
  'Performing': 'risk-Performing',
  'Trending':   'risk-Trending',
  'Steady':     'risk-Steady',
  'Concerning': 'risk-Concerning',
  'At Risk':    'risk-AtRisk',
};

// Fuse semantic color mapping for LQS grades
const LQS_STYLE = {
  GREAT: { background: 'var(--badge-benefit-bg)',   color: 'var(--badge-benefit-text)' },
  GOOD:  { background: 'var(--purple-10)',           color: 'var(--purple-80)' },
  FAIR:  { background: 'var(--badge-attention-bg)',  color: 'var(--badge-attention-text)' },
  POOR:  { background: 'var(--badge-critical-bg)',   color: 'var(--badge-critical-text)' },
};

// Recommendation action → Fuse semantic colors
const REC_STYLE = {
  'Consider Wholesale': { bg: 'var(--badge-critical-bg)',   color: 'var(--badge-critical-text)' },
  'Price Down':         { bg: 'var(--badge-attention-bg)',  color: 'var(--badge-attention-text)' },
  'Improve Listing':    { bg: 'var(--badge-attention-bg)',  color: 'var(--badge-attention-text)' },
  'Hold Price':         { bg: 'var(--badge-benefit-bg)',    color: 'var(--badge-benefit-text)' },
  'Monitor':            { bg: 'var(--badge-default-bg)',    color: 'var(--badge-default-text)' },
};

const FILTER_OPTIONS = ['All', 'At Risk', 'Concerning', 'FAIR Badge', 'Zero Leads'];

export default function InventoryDashboard({ onSelectVehicle }) {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = mockInventory.filter((v) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'At Risk') return v.atRiskTier === 'At Risk';
    if (activeTab === 'Concerning') return v.atRiskTier === 'Concerning';
    if (activeTab === 'FAIR Badge') return v.badge === 'FAIR';
    if (activeTab === 'Zero Leads') return v.leads === 0;
    return true;
  });

  const atRiskCount   = mockInventory.filter(v => v.atRiskTier === 'At Risk').length;
  const fairCount     = mockInventory.filter(v => v.badge === 'FAIR').length;
  const zeroLeadCount = mockInventory.filter(v => v.leads === 0).length;

  return (
    <>
      <div className="app-bar">
        <h1>Inventory Intelligence</h1>
        <span className="app-bar-sub">Demo Dealer · 8 listings</span>
      </div>

      {/* Summary stats strip */}
      <div className="spacer" />
      <div className="stats-strip">
        <div className="stat-item">
          <div className="stat-number">{mockInventory.length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-item">
          <div className={`stat-number ${atRiskCount > 0 ? 'danger' : ''}`}>{atRiskCount}</div>
          <div className="stat-label">At Risk</div>
        </div>
        <div className="stat-item">
          <div className={`stat-number ${fairCount > 0 ? 'warn' : ''}`}>{fairCount}</div>
          <div className="stat-label">FAIR</div>
        </div>
        <div className="stat-item">
          <div className={`stat-number ${zeroLeadCount > 0 ? 'warn' : ''}`}>{zeroLeadCount}</div>
          <div className="stat-label">0 Leads</div>
        </div>
      </div>

      {/* Filter tabs — horizontally scrollable */}
      <div style={{ overflowX: 'auto', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 52, zIndex: 90 }}>
        <div style={{ display: 'flex', minWidth: 'max-content', padding: '0 12px' }}>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`tab ${activeTab === opt ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap', padding: '10px 14px' }}
              onClick={() => setActiveTab(opt)}
            >
              {opt}
              {opt === 'At Risk' && atRiskCount > 0 && (
                <span style={{
                  marginLeft: 6,
                  background: 'var(--badge-critical-bg)',
                  color: 'var(--badge-critical-text)',
                  borderRadius: '99px',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                }}>
                  {atRiskCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-area">
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <p>No listings match this filter.</p>
          </div>
        )}
        <div className="inventory-list">
          {filtered.map(vehicle => (
            <VehicleCard key={vehicle.vin} vehicle={vehicle} onSelect={onSelectVehicle} />
          ))}
        </div>
      </div>
    </>
  );
}

function VehicleCard({ vehicle, onSelect }) {
  const rec = deriveRecommendation(vehicle);
  const recStyle = REC_STYLE[rec.action] || REC_STYLE['Monitor'];
  const priceVsMarket = vehicle.listPrice - vehicle.marketPrice;
  const priceLabel = priceVsMarket > 0
    ? `${fmt(priceVsMarket)} above market`
    : priceVsMarket < 0
    ? `${fmt(Math.abs(priceVsMarket))} below market`
    : 'At market';

  return (
    <div className="vehicle-card" onClick={() => onSelect(vehicle)}>

      {/* Header: year/make/model + deal badge */}
      <div className="vehicle-card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div className="vehicle-card-title">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </div>
          <span className={`badge badge-${vehicle.badge}`}>
            {vehicle.badge === 'NONE' ? 'No Badge' : vehicle.badge}
          </span>
        </div>
        <div className="vehicle-card-sub">{vehicle.trim} · {vehicle.mileage.toLocaleString()} mi · {vehicle.color}</div>
      </div>

      {/* Signal chips using Fuse semantic colors */}
      <div className="vehicle-card-signals">
        <span className={`signal-chip ${RISK_CLASS[vehicle.atRiskTier] || 'risk-Steady'}`}>
          {vehicle.atRiskTier}
        </span>
        <span className="signal-chip">
          Scarcity {vehicle.scarcityScore}
        </span>
        <span className="signal-chip" style={LQS_STYLE[vehicle.lqsGrade] || LQS_STYLE.GOOD}>
          LQS {vehicle.lqsGrade}
        </span>
        <span className="signal-chip">
          {vehicle.leads} {vehicle.leads === 1 ? 'lead' : 'leads'}
        </span>
      </div>

      {/* Footer: price + recommended action */}
      <div className="vehicle-card-footer">
        <div>
          <div className="vehicle-card-price">{fmt(vehicle.listPrice)}</div>
          <div
            className="vehicle-card-days"
            style={{ color: priceVsMarket > 2500 ? 'var(--badge-critical-text)' : 'var(--text-muted)' }}
          >
            {priceLabel}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            className="action-pill"
            style={{ background: recStyle.bg, color: recStyle.color }}
          >
            {rec.action}
          </div>
          <div className="vehicle-card-days" style={{ marginTop: 4 }}>{vehicle.daysLive}d on lot</div>
        </div>
      </div>

    </div>
  );
}
