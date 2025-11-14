// src/components/dashboard/admin/overview/RecentActivityCard.tsx
import { UserCheck, Home, Calendar } from "lucide-react";
import { Card } from "../../../ui/card";
import type { DashboardStatsResponse } from "../../../../api";

interface RecentActivityCardProps {
  stats: DashboardStatsResponse | null;
}

export function RecentActivityCard({ stats }: RecentActivityCardProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-[#2B2B2B] mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {stats?.recentActivity && (
          <>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  {stats.recentActivity.recentRegistrations} new users
                  registered
                </p>
                <p className="text-xs text-gray-500">Recent period</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Home className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  {stats.recentActivity.recentPropertyListings} new properties
                  listed
                </p>
                <p className="text-xs text-gray-500">Recent period</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  {stats.recentActivity.recentBookings} bookings completed
                </p>
                <p className="text-xs text-gray-500">Recent period</p>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
