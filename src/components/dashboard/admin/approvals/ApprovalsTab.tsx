// src/components/dashboard/admin/approvals/ApprovalsTab.tsx
import { CheckCircle } from "lucide-react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { PendingPropertyCard } from "./PendingPropertyCard";
import type {
  PendingPropertyResponse,
  DashboardStatsResponse,
} from "../../../../api";

interface ApprovalsTabProps {
  pendingListings: PendingPropertyResponse[];
  stats: DashboardStatsResponse | null;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  onApprove: (id: number, title: string) => void;
  onReject: (id: number, title: string) => void;
  onRefresh: () => void;
}

export function ApprovalsTab({
  pendingListings,
  stats,
  formatCurrency,
  formatDate,
  onApprove,
  onReject,
  onRefresh,
}: ApprovalsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#2B2B2B]">
          Pending Approvals ({pendingListings.length})
        </h2>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {pendingListings.length === 0 && stats?.pendingApprovalsCount > 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Debug:</strong> Stats show {stats.pendingApprovalsCount}{" "}
            pending, but filtering found 0. The backend might be returning wrong
            status values. Check console for property statuses.
          </p>
        </Card>
      )}

      {pendingListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingListings.map((listing) => (
            <PendingPropertyCard
              key={listing.propertyId}
              listing={listing}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
            All caught up!
          </h3>
          <p className="text-gray-600">No pending listings to review</p>
        </Card>
      )}
    </div>
  );
}
