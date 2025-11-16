// src/components/dashboard/admin/overview/QuickActionsCard.tsx
import { CheckCircle, Users, Flag, TrendingUp } from "lucide-react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";

interface QuickActionsCardProps {
  onTabChange: (tab: string) => void;
}

export function QuickActionsCard({ onTabChange }: QuickActionsCardProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-[#2B2B2B] mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => onTabChange("approvals")}
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Approve Listings</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => onTabChange("users")}
        >
          <Users className="w-5 h-5" />
          <span className="text-sm">Manage Users</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => onTabChange("reports")}
        >
          <Flag className="w-5 h-5" />
          <span className="text-sm">View Reports</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => onTabChange("analytics")}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm">Analytics</span>
        </Button>
      </div>
    </Card>
  );
}
