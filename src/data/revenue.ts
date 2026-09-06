import { RevenueAnalyticsTier } from './gymSubscription';

export interface RevenueRow {
  id: string;
  source: string;
  period: string;
  revenue: string;
  change: string;
  share: string;
  trend: 'up' | 'down' | 'flat';
}

const tier1Rows: RevenueRow[] = [
  {
    id: 't1-memberships',
    source: 'Memberships',
    period: 'This month',
    revenue: '$9.8K',
    change: '+2.1%',
    share: '79%',
    trend: 'up',
  },
  {
    id: 't1-retail',
    source: 'Retail',
    period: 'This month',
    revenue: '$1.6K',
    change: '+1.4%',
    share: '13%',
    trend: 'up',
  },
  {
    id: 't1-other',
    source: 'Other',
    period: 'This month',
    revenue: '$1.0K',
    change: '+0.8%',
    share: '8%',
    trend: 'up',
  },
  {
    id: 't1-total',
    source: 'Total',
    period: 'This month',
    revenue: '$12.4K',
    change: '+2.5%',
    share: '100%',
    trend: 'up',
  },
];

const tier2Rows: RevenueRow[] = [
  {
    id: 't2-memberships',
    source: 'Memberships',
    period: 'This month',
    revenue: '$36.4K',
    change: '+7.1%',
    share: '63%',
    trend: 'up',
  },
  {
    id: 't2-classes',
    source: 'Class Packs',
    period: 'This month',
    revenue: '$11.2K',
    change: '+5.8%',
    share: '19%',
    trend: 'up',
  },
  {
    id: 't2-pt',
    source: 'Personal Training',
    period: 'This month',
    revenue: '$7.8K',
    change: '+4.9%',
    share: '13%',
    trend: 'up',
  },
  {
    id: 't2-retail',
    source: 'Retail',
    period: 'This month',
    revenue: '$2.6K',
    change: '+2.2%',
    share: '5%',
    trend: 'up',
  },
  {
    id: 't2-total',
    source: 'Total',
    period: 'This month',
    revenue: '$58K',
    change: '+6.2%',
    share: '100%',
    trend: 'up',
  },
];

const tier3Rows: RevenueRow[] = [
  {
    id: 't3-memberships',
    source: 'Memberships',
    period: 'This month',
    revenue: '$78.2K',
    change: '+11.2%',
    share: '63%',
    trend: 'up',
  },
  {
    id: 't3-pt',
    source: 'Personal Training',
    period: 'This month',
    revenue: '$24.6K',
    change: '+8.4%',
    share: '20%',
    trend: 'up',
  },
  {
    id: 't3-classes',
    source: 'Class Packs',
    period: 'This month',
    revenue: '$12.8K',
    change: '+6.1%',
    share: '10%',
    trend: 'up',
  },
  {
    id: 't3-retail',
    source: 'Retail & Supplements',
    period: 'This month',
    revenue: '$5.9K',
    change: '+4.3%',
    share: '5%',
    trend: 'up',
  },
  {
    id: 't3-other',
    source: 'Other',
    period: 'This month',
    revenue: '$2.5K',
    change: '-1.2%',
    share: '2%',
    trend: 'down',
  },
  {
    id: 't3-total',
    source: 'Total',
    period: 'This month',
    revenue: '$124K',
    change: '+9.8%',
    share: '100%',
    trend: 'up',
  },
];

const tierRows: Record<RevenueAnalyticsTier, RevenueRow[]> = {
  1: tier1Rows,
  2: tier2Rows,
  3: tier3Rows,
};

export const getRevenueRowsForTier = (tier: RevenueAnalyticsTier) => tierRows[tier];

export const getRevenueSummaryForTier = (tier: RevenueAnalyticsTier) => {
  const rows = tierRows[tier];
  const totalRow = rows.find((row) => row.source === 'Total') ?? rows[rows.length - 1];
  return {
    totalRevenue: totalRow.revenue,
    totalChange: totalRow.change,
    rowCount: rows.length - 1,
  };
};
