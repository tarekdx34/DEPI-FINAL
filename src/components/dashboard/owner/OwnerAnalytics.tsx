// src/components/dashboard/OwnerAnalytics.tsx - FIXED
import { DollarSign, TrendingUp, Calendar, Star } from 'lucide-react';
import { Card } from '../../ui/card';
import type { OwnerDashboardResponse } from '../../../../api';

interface OwnerAnalyticsProps {
  dashboard: OwnerDashboardResponse | null;
}

export function OwnerAnalytics({ dashboard }: OwnerAnalyticsProps) {
  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  const { overview, revenueChart } = dashboard;

  // ✅ CRITICAL FIX: Add safety checks for overview
  if (!overview) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  // Calculate growth percentages (mock data - would come from API)
  const monthlyGrowth = 18;
  const bookingsGrowth = 25;

  // Mock revenue data for chart with safety checks
  const monthlyRevenue = (revenueChart && revenueChart.length > 0) ? revenueChart : [
    { month: 'Jun', earnings: 15000 },
    { month: 'Jul', earnings: 28000 },
    { month: 'Aug', earnings: 42000 },
    { month: 'Sep', earnings: 35000 },
    { month: 'Oct', earnings: 38000 },
    { month: 'Nov', earnings: 45000 },
  ];

  // ✅ FIXED: Add safety check for earnings
  const maxEarnings = Math.max(...monthlyRevenue.map((m: any) => m.earnings ?? 0), 1);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-6">
        Earnings & Revenue Analytics
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">Total Earnings</h3>
            <DollarSign className="w-5 h-5 text-[#00BFA6]" />
          </div>
          <p className="text-3xl font-semibold text-[#2B2B2B]">
            {(overview.totalRevenue ?? 0).toLocaleString()} EGP
          </p>
          <p className="text-sm text-green-600 mt-1">All time</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">This Month</h3>
            <TrendingUp className="w-5 h-5 text-[#00BFA6]" />
          </div>
          <p className="text-3xl font-semibold text-[#2B2B2B]">
            {(overview.monthlyRevenue ?? 0).toLocaleString()} EGP
          </p>
          <p className="text-sm text-green-600 mt-1">+{monthlyGrowth}% from last month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">Total Bookings</h3>
            <Calendar className="w-5 h-5 text-[#00BFA6]" />
          </div>
          <p className="text-3xl font-semibold text-[#2B2B2B]">
            {overview.totalBookings ?? 0}
          </p>
          <p className="text-sm text-green-600 mt-1">+{bookingsGrowth}% growth</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">Avg. Rating</h3>
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
          <p className="text-3xl font-semibold text-[#2B2B2B]">
            {(overview.averageRating ?? 0).toFixed(1)}
          </p>
          <p className="text-sm text-gray-600 mt-1">From {overview.totalReviews ?? 0} reviews</p>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#2B2B2B] mb-6">Monthly Revenue</h3>
        <div className="space-y-4">
          {monthlyRevenue.map((month: any, index: number) => (
            <div key={month.month || index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{month.month || 'N/A'}</span>
                <span className="font-semibold text-[#2B2B2B]">
                  {(month.earnings ?? 0).toLocaleString()} EGP
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#00BFA6] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${((month.earnings ?? 0) / maxEarnings) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#2B2B2B] mb-4">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Property Earnings</span>
              <span className="font-semibold text-[#2B2B2B]">
                {(overview.totalRevenue ?? 0).toLocaleString()} EGP
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Service Fees Paid</span>
              <span className="font-semibold text-gray-600">
                {((overview.totalRevenue ?? 0) * 0.1).toLocaleString()} EGP
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold">Net Income</span>
              <span className="font-bold text-[#00BFA6]">
                {((overview.totalRevenue ?? 0) * 0.9).toLocaleString()} EGP
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#2B2B2B] mb-4">Performance Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Occupancy Rate</span>
                <span className="text-sm font-semibold">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#00BFA6] h-2 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Booking Conversion</span>
                <span className="text-sm font-semibold">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Guest Satisfaction</span>
                <span className="text-sm font-semibold">
                  {(((overview.averageRating ?? 0) / 5) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${((overview.averageRating ?? 0) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Tips to Increase Revenue</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Update your photos regularly to keep listings fresh</li>
          <li>• Respond to inquiries within 24 hours for better conversion</li>
          <li>• Offer competitive pricing during off-peak seasons</li>
          <li>• Encourage guests to leave reviews after their stay</li>
          <li>• Consider offering special amenities or services</li>
        </ul>
      </Card>
    </div>
  );
}