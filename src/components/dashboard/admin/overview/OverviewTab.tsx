// src/components/dashboard/admin/overview/OverviewTab.tsx
import { StatsGrid } from "./StatsGrid";
import { RecentActivityCard } from "./RecentActivityCard";
import { QuickActionsCard } from "./QuickActionsCard";
import type { DashboardStatsResponse } from "../../../../api";

interface OverviewTabProps {
  stats: DashboardStatsResponse | null;
  formatCurrency: (amount: number) => string;
  onTabChange: (tab: string) => void;
}

export function OverviewTab({
  stats,
  formatCurrency,
  onTabChange,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} formatCurrency={formatCurrency} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityCard stats={stats} />
        <QuickActionsCard onTabChange={onTabChange} />
      </div>
    </div>
  );
}
