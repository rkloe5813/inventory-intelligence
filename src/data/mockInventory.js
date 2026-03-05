/**
 * Mock inventory data for the Inventory Intelligence prototype.
 * Represents a dealer's active used inventory with combined intelligence signals.
 *
 * Fields per vehicle:
 *   - vin, year, make, model, trim, mileage, color
 *   - daysLive       — days on the dealer's lot
 *   - listPrice      — current asking price
 *   - marketPrice    — Cars.com predicted median market price (Deal Badge baseline)
 *   - badge          — GREAT / GOOD / FAIR / NONE
 *   - atRiskTier     — Performing / Trending / Steady / Concerning / At Risk
 *   - scarcityScore  — 0–100 (higher = scarcer in local market)
 *   - lqsGrade       — GREAT / GOOD / FAIR / POOR (Listing Quality Score)
 *   - srpViews       — SRP impressions (13-month rolling)
 *   - vdpViews       — VDP impressions (13-month rolling)
 *   - leads          — total leads (13-month rolling)
 *   - recommendedAction — derived signal for display
 */
export const mockInventory = [
  {
    vin: '1HGBH41JXMN109186',
    year: 2022,
    make: 'Honda',
    model: 'CR-V',
    trim: 'EX-L',
    mileage: 28400,
    color: 'Lunar Silver',
    daysLive: 47,
    listPrice: 32900,
    marketPrice: 30200,
    badge: 'FAIR',
    atRiskTier: 'Concerning',
    scarcityScore: 38,
    lqsGrade: 'GOOD',
    srpViews: 412,
    vdpViews: 28,
    leads: 1,
  },
  {
    vin: '2T1BURHE0JC043821',
    year: 2021,
    make: 'Toyota',
    model: 'Camry',
    trim: 'SE',
    mileage: 34100,
    color: 'Midnight Black',
    daysLive: 12,
    listPrice: 26400,
    marketPrice: 27100,
    badge: 'GREAT',
    atRiskTier: 'Performing',
    scarcityScore: 72,
    lqsGrade: 'GREAT',
    srpViews: 289,
    vdpViews: 41,
    leads: 4,
  },
  {
    vin: '3GNAXKEV0LS512938',
    year: 2020,
    make: 'Chevrolet',
    model: 'Equinox',
    trim: 'LT',
    mileage: 51200,
    color: 'Summit White',
    daysLive: 63,
    listPrice: 21500,
    marketPrice: 22800,
    badge: 'GOOD',
    atRiskTier: 'At Risk',
    scarcityScore: 24,
    lqsGrade: 'FAIR',
    srpViews: 187,
    vdpViews: 9,
    leads: 0,
  },
  {
    vin: '5YJSA1E26MF123456',
    year: 2021,
    make: 'Tesla',
    model: 'Model S',
    trim: 'Long Range',
    mileage: 19800,
    color: 'Pearl White',
    daysLive: 8,
    listPrice: 68900,
    marketPrice: 66400,
    badge: 'GOOD',
    atRiskTier: 'Trending',
    scarcityScore: 88,
    lqsGrade: 'GREAT',
    srpViews: 521,
    vdpViews: 74,
    leads: 6,
  },
  {
    vin: '1FTFW1ET0DKF12345',
    year: 2023,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT',
    mileage: 14200,
    color: 'Rapid Red',
    daysLive: 22,
    listPrice: 41200,
    marketPrice: 40800,
    badge: 'GOOD',
    atRiskTier: 'Steady',
    scarcityScore: 61,
    lqsGrade: 'GOOD',
    srpViews: 634,
    vdpViews: 88,
    leads: 5,
  },
  {
    vin: '1C4RJFBG7LC123789',
    year: 2020,
    make: 'Jeep',
    model: 'Grand Cherokee',
    trim: 'Limited',
    mileage: 44800,
    color: 'Granite Crystal',
    daysLive: 38,
    listPrice: 34100,
    marketPrice: 31600,
    badge: 'FAIR',
    atRiskTier: 'Concerning',
    scarcityScore: 41,
    lqsGrade: 'GOOD',
    srpViews: 301,
    vdpViews: 19,
    leads: 1,
  },
  {
    vin: '19UUB3F53LA003456',
    year: 2020,
    make: 'Acura',
    model: 'TLX',
    trim: 'A-Spec',
    mileage: 29300,
    color: 'Majestic Black',
    daysLive: 55,
    listPrice: 27900,
    marketPrice: 28400,
    badge: 'GOOD',
    atRiskTier: 'At Risk',
    scarcityScore: 19,
    lqsGrade: 'POOR',
    srpViews: 94,
    vdpViews: 5,
    leads: 0,
  },
  {
    vin: 'WBAJA7C57JG123321',
    year: 2018,
    make: 'BMW',
    model: '5 Series',
    trim: '530i',
    mileage: 62400,
    color: 'Alpine White',
    daysLive: 71,
    listPrice: 29500,
    marketPrice: 27100,
    badge: 'FAIR',
    atRiskTier: 'At Risk',
    scarcityScore: 33,
    lqsGrade: 'FAIR',
    srpViews: 218,
    vdpViews: 14,
    leads: 1,
  },
];

/**
 * Derive a recommended action from the combined signals.
 * This mirrors the "models talking to each other" concept from the flywheel.
 */
export function deriveRecommendation(vehicle) {
  const { badge, atRiskTier, scarcityScore, lqsGrade, daysLive } = vehicle;
  const priceGap = vehicle.marketPrice - vehicle.listPrice; // positive = underpriced vs market

  if (atRiskTier === 'At Risk' && badge === 'FAIR') {
    if (scarcityScore < 30) return { action: 'Consider Wholesale', color: '#DC2626', priority: 'high' };
    return { action: 'Price Down', color: '#DC2626', priority: 'high' };
  }
  if (badge === 'FAIR' && daysLive > 30) {
    return { action: 'Price Down', color: '#F59E0B', priority: 'medium' };
  }
  if (lqsGrade === 'POOR' || lqsGrade === 'FAIR') {
    return { action: 'Improve Listing', color: '#F59E0B', priority: 'medium' };
  }
  if (badge === 'GREAT' && scarcityScore > 65 && atRiskTier === 'Performing') {
    return { action: 'Hold Price', color: '#16A34A', priority: 'low' };
  }
  if (atRiskTier === 'Trending' || atRiskTier === 'Performing') {
    return { action: 'Hold Price', color: '#16A34A', priority: 'low' };
  }
  return { action: 'Monitor', color: '#6B7280', priority: 'low' };
}
