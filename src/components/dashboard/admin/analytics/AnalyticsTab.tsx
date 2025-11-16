// src/components/dashboard/admin/analytics/AnalyticsTab.tsx
import { TrendingUp } from "lucide-react";
import { Card } from "../../../ui/card";
import { AnalyticsOverview } from "./AnalyticsOverview";
import { TopLocationsTable } from "./TopLocationsTable";
import { PlatformPerformance } from "./PlatformPerformance";
import type { PlatformAnalyticsResponse } from "../../../../api";

interface AnalyticsTabProps {
  analytics: PlatformAnalyticsResponse | null;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export function AnalyticsTab({
  analytics,
  formatCurrency,
  formatDate,
}: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#2B2B2B]">
        Analytics & Insights
      </h2>

      {analytics ? (
        <>
          <AnalyticsOverview
            analytics={analytics}
            formatCurrency={formatCurrency}
          />
          <TopLocationsTable
            locations={analytics.topLocations}
            formatCurrency={formatCurrency}
          />
          <PlatformPerformance
            analytics={analytics}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </>
      ) : (
        <Card className="p-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-600">Analytics data is not available</p>
        </Card>
      )}
    </div>
  );
}
