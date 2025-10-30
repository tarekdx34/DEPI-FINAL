// src/components/dashboard/renter/DashboardOverview.tsx
import { StatsCards } from "./dashboard/StatsCards";
import { UpcomingBookingsSummary } from "./dashboard/UpcomingBookingsSummary";
import { RecentActivity } from "./dashboard/RecentActivity";
import { EmptyState } from "../shared/components/EmptyState";
import { useDashboardStats } from "../../../hooks/useDashboardStats";
import { useBookings } from "../../../hooks/useBookings";
import { Calendar, Loader2 } from "lucide-react";

interface DashboardOverviewProps {
  onNavigate: (page: string, id?: string) => void;
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const { stats, recentActivity, loading: statsLoading } = useDashboardStats();
  const { upcomingBookings, loading: bookingsLoading } = useBookings();

  const loading = statsLoading || bookingsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#00BFA6] animate-spin" />
      </div>
    );
  }

  // Show empty state if no activity
  if (stats.totalTrips === 0 && stats.totalFavorites === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Welcome to Your Dashboard"
        description="Start your journey by exploring available properties and making your first booking!"
        actionLabel="Browse Properties"
        onAction={() => onNavigate('properties')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsCards stats={stats} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings - 2/3 width */}
        <div className="lg:col-span-2">
          {upcomingBookings.length > 0 ? (
            <UpcomingBookingsSummary
              bookings={upcomingBookings}
              onViewAll={() => onNavigate('trips')}
              onViewDetails={(id) => onNavigate('trip-details', String(id))}
            />
          ) : (
            <EmptyState
              icon={Calendar}
              title="No upcoming trips"
              description="Time to plan your next adventure!"
              actionLabel="Browse Properties"
              onAction={() => onNavigate('properties')}
            />
          )}
        </div>

        {/* Recent Activity - 1/3 width */}
        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}