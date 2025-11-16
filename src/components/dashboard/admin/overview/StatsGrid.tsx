// src/components/dashboard/admin/overview/StatsGrid.tsx
import {
  Users,
  Home,
  CheckCircle,
  Calendar,
  DollarSign,
  UserX,
} from "lucide-react";
import { Card } from "../../../ui/card";
import type { DashboardStatsResponse } from "../../../../api";

interface StatsGridProps {
  stats: DashboardStatsResponse | null;
  formatCurrency: (amount: number) => string;
}

export function StatsGrid({ stats, formatCurrency }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-600">Total Users</h3>
          <Users className="w-5 h-5 text-[#00BFA6]" />
        </div>
        <p className="text-3xl font-semibold text-[#2B2B2B]">
          {stats?.totalUsers.toLocaleString() || 0}
        </p>
        <p className="text-sm text-gray-600 mt-1">Registered users</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-600">Total Properties</h3>
          <Home className="w-5 h-5 text-[#00BFA6]" />
        </div>
        <p className="text-3xl font-semibold text-[#2B2B2B]">
          {stats?.totalProperties || 0}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {stats?.activeProperties || 0} active
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-600">Pending Approvals</h3>
          <CheckCircle className="w-5 h-5 text-yellow-500" />
        </div>
        <p className="text-3xl font-semibold text-[#2B2B2B]">
          {stats?.pendingApprovalsCount || 0}
        </p>
        <p className="text-sm text-yellow-600 mt-1">Needs attention</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-600">Total Bookings</h3>
          <Calendar className="w-5 h-5 text-[#00BFA6]" />
        </div>
        <p className="text-3xl font-semibold text-[#2B2B2B]">
          {stats?.totalBookings || 0}
        </p>
        <p className="text-sm text-gray-600 mt-1">All time bookings</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-600">Total Revenue</h3>
          <DollarSign className="w-5 h-5 text-[#00BFA6]" />
        </div>
        <p className="text-3xl font-semibold text-[#2B2B2B]">
          {formatCurrency(stats?.totalRevenue || 0)}
        </p>
        <p className="text-sm text-gray-600 mt-1">Platform revenue</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-600">Banned Users</h3>
          <UserX className="w-5 h-5 text-red-500" />
        </div>
        <p className="text-3xl font-semibold text-[#2B2B2B]">
          {stats?.bannedUsersCount || 0}
        </p>
        <p className="text-sm text-gray-600 mt-1">Suspended accounts</p>
      </Card>
    </div>
  );
}
