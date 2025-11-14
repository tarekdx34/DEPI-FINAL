// src/components/dashboard/renter/DashboardOverview.tsx - FINAL FIXED
import { useState, useEffect } from "react";
import { StatsCards } from "./dashboard/StatsCards";
import { UpcomingBookingsSummary } from "./dashboard/UpcomingBookingsSummary";
import { RecentActivity } from "./dashboard/RecentActivity";
import { EmptyState } from "../shared/components/EmptyState";
import { useFavorites } from "../../../contexts/FavoritesContext";
import { Calendar, Loader2 } from "lucide-react";
import api from "../../../../api";

interface DashboardOverviewProps {
  onNavigate: (page: string, id?: string) => void;
}

// ✅ Complete DashboardStats type matching StatsCards requirements
interface DashboardStats {
  totalTrips: number;
  upcomingTrips: number;
  totalFavorites: number;
  reviewsGiven: number;
  completedTrips: number;
  cancelledTrips: number;
  totalSpent: number;
  pendingReviews: number;
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const { favorites, refreshFavorites } = useFavorites();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    upcomingTrips: 0,
    totalFavorites: 0,
    reviewsGiven: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    totalSpent: 0,
    pendingReviews: 0,
  });
  
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Initial load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // ✅ Update favorites count when changed
  useEffect(() => {
    console.log('✅ Favorites count updated:', favorites.length);
    setStats(prev => ({
      ...prev,
      totalFavorites: favorites.length,
    }));
    updateRecentActivity();
  }, [favorites.length]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      await refreshFavorites();

      const allBookings = await api.getBookings().catch(() => []);
      const upcomingData = await api.getUpcomingBookings().catch(() => []);

      // ✅ Calculate all required stats
      const completedCount = allBookings?.filter((b: any) => b.status === 'completed').length || 0;
      const cancelledCount = allBookings?.filter((b: any) => b.status === 'cancelled').length || 0;
      const totalSpentAmount = allBookings?.reduce((sum: number, b: any) => 
        sum + (b.totalPrice || 0), 0) || 0;

      setStats({
        totalTrips: allBookings?.length || 0,
        upcomingTrips: upcomingData?.length || 0,
        totalFavorites: favorites.length,
        reviewsGiven: 0,
        completedTrips: completedCount,
        cancelledTrips: cancelledCount,
        totalSpent: totalSpentAmount,
        pendingReviews: 0,
      });

      setUpcomingBookings(upcomingData || []);
      updateRecentActivity(allBookings);
      
    } catch (error) {
      console.error('❌ Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRecentActivity = (bookings?: any[]) => {
    const activities: any[] = [];

    if (bookings && bookings.length > 0) {
      bookings.slice(0, 3).forEach((booking: any) => {
        activities.push({
          id: booking.bookingId,
          type: 'booking',
          title: booking.property?.titleEn || 'Property',
          subtitle: `Booked for ${booking.numberOfNights || 0} nights`,
          timestamp: '1h ago',
        });
      });
    }

    if (favorites.length > 0) {
      favorites.slice(0, 2).forEach((fav: any) => {
        activities.push({
          id: fav.favoriteId,
          type: 'favorite',
          title: fav.property?.titleEn || 'Property',
          subtitle: 'Added to favorites',
          timestamp: '2h ago',
        });
      });
    }

    setRecentActivity(activities.slice(0, 5));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#00BFA6] animate-spin" />
      </div>
    );
  }

  if (stats.totalTrips === 0 && stats.totalFavorites === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Welcome to Your Dashboard"
        description="Start your journey by exploring available properties!"
        actionLabel="Browse Properties"
        onAction={() => onNavigate("properties")}
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
              onViewAll={() => onNavigate("user-dashboard?tab=trips")}
              onViewDetails={(id) => onNavigate("trip-details", String(id))}
            />
          ) : (
            <EmptyState
              icon={Calendar}
              title="No upcoming trips"
              description="Time to plan your next adventure!"
              actionLabel="Browse Properties"
              onAction={() => onNavigate("properties")}
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