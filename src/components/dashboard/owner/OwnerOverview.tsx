// src/components/dashboard/owner/OwnerOverview.tsx - ULTIMATE FIX
import { Home, Calendar, DollarSign, Star, TrendingUp, MapPin, Bed, Users } from 'lucide-react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import type { OwnerDashboardResponse } from '../../../../api';

interface OwnerOverviewProps {
  dashboard: OwnerDashboardResponse | null;
  properties?: any[];
}

export function OwnerOverview({ dashboard, properties = [] }: OwnerOverviewProps) {
  
  // ✅ FIX: Calculate all stats from properties array
  const calculateStats = () => {
    const activeProps = properties.filter(p => 
      (p.status === 'active' || p.approvalStatus === 'active')
    );
    const pendingProps = properties.filter(p => 
      (p.status === 'pending_approval' || p.approvalStatus === 'pending_approval')
    );

    return {
      totalProperties: properties.length,
      activeProperties: activeProps.length,
      pendingApprovalProperties: pendingProps.length,
      averageRating: activeProps.reduce((sum, p) => sum + (p.averageRating || 0), 0) / (activeProps.length || 1),
      totalReviews: activeProps.reduce((sum, p) => sum + (p.totalReviews || 0), 0),
      totalViews: activeProps.reduce((sum, p) => sum + (p.viewCount || 0), 0),
    };
  };

  const localStats = calculateStats();
  
  // ✅ Use dashboard data if available, otherwise use calculated stats
  const overview = dashboard?.overview || {
    totalProperties: localStats.totalProperties,
    activeProperties: localStats.activeProperties,
    pendingApprovalProperties: localStats.pendingApprovalProperties,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    pendingBookings: 0,
    upcomingBookings: 0,
    averageRating: localStats.averageRating,
    totalReviews: localStats.totalReviews,
  };

  const bestPerformingProperty = dashboard?.bestPerformingProperty;
  const upcomingBookings = dashboard?.upcomingBookings || [];
  const recentReviews = dashboard?.recentReviews || [];

  // ✅ Get best property from local data if no dashboard data
  const getBestProperty = () => {
    if (bestPerformingProperty) return bestPerformingProperty;
    if (properties.length === 0) return null;

    // Find property with highest views or bookings
    return properties.reduce((best, current) => {
      const bestScore = (best.viewCount || 0) + (best.bookingConfirmedCount || 0) * 10;
      const currentScore = (current.viewCount || 0) + (current.bookingConfirmedCount || 0) * 10;
      return currentScore > bestScore ? current : best;
    }, properties[0]);
  };

  const topProperty = getBestProperty();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-[#00BFA6]" />
          </div>
          <p className="text-3xl font-semibold text-[#2B2B2B]">
            {(overview.totalRevenue ?? 0).toLocaleString()} EGP
          </p>
          <p className="text-sm text-green-600 mt-1">
            +{(overview.monthlyRevenue ?? 0).toLocaleString()} this month
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">Properties</h3>
            <Home className="w-5 h-5 text-[#00BFA6]" />
          </div>
          <p className="text-3xl font-semibold text-[#2B2B2B]">
            {overview.totalProperties ?? 0}
          </p>
          <div className="flex gap-2 mt-1 text-sm">
            <span className="text-green-600">{overview.activeProperties ?? 0} active</span>
            {(overview.pendingApprovalProperties ?? 0) > 0 && (
              <span className="text-yellow-600">
                {overview.pendingApprovalProperties} pending
              </span>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">Bookings</h3>
            <Calendar className="w-5 h-5 text-[#00BFA6]" />
          </div>
          <p className="text-3xl font-semibold text-[#2B2B2B]">
            {overview.totalBookings ?? 0}
          </p>
          <div className="flex gap-2 mt-1 text-sm">
            {(overview.pendingBookings ?? 0) > 0 && (
              <span className="text-yellow-600">{overview.pendingBookings} pending</span>
            )}
            {(overview.upcomingBookings ?? 0) > 0 && (
              <span className="text-blue-600">{overview.upcomingBookings} upcoming</span>
            )}
            {overview.totalBookings === 0 && (
              <span className="text-gray-500">No bookings yet</span>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">Average Rating</h3>
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
          <p className="text-3xl font-semibold text-[#2B2B2B]">
            {(overview.averageRating ?? 0).toFixed(1)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            From {overview.totalReviews ?? 0} reviews
          </p>
        </Card>
      </div>

      {/* Best/Top Performing Property */}
      {topProperty && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#00BFA6]" />
            <h3 className="text-lg font-semibold text-[#2B2B2B]">
              {bestPerformingProperty ? 'Best Performing Property' : 'Top Property'}
            </h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Property Image */}
            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {(topProperty.propertyImage || topProperty.coverImage || topProperty.images?.[0]) ? (
                <img
                  src={topProperty.propertyImage || topProperty.coverImage || 
                       (typeof topProperty.images?.[0] === 'string' ? topProperty.images[0] : topProperty.images?.[0]?.imageUrl)}
                  alt={topProperty.propertyTitle || topProperty.titleEn || topProperty.titleAr}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="flex-1">
              <h4 className="font-semibold text-[#2B2B2B] mb-1">
                {topProperty.propertyTitle || topProperty.titleEn || topProperty.titleAr}
              </h4>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{topProperty.city || 'N/A'}, {topProperty.governorate || 'N/A'}</span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {topProperty.performanceReason || 'Most viewed and booked property'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Revenue</p>
                  <p className="font-semibold text-[#2B2B2B]">
                    {(topProperty.totalRevenue || 0).toLocaleString()} EGP
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Bookings</p>
                  <p className="font-semibold text-[#2B2B2B]">
                    {topProperty.totalBookings || topProperty.bookingConfirmedCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Rating</p>
                  <p className="font-semibold text-[#2B2B2B]">
                    {(topProperty.averageRating || 0).toFixed(1)} ⭐
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Views</p>
                  <p className="font-semibold text-[#2B2B2B]">
                    {topProperty.totalViews || topProperty.viewCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Properties Preview (if no top property) */}
      {!topProperty && properties.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#2B2B2B] mb-4">Your Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {properties.slice(0, 4).map((property: any) => (
              <div key={property.propertyId} className="bg-gray-50 rounded-lg p-3">
                <div className="aspect-video bg-gray-200 rounded-md mb-2 overflow-hidden">
                  {(property.coverImage || property.images?.[0]) ? (
                    <img
                      src={property.coverImage || (typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.imageUrl)}
                      alt={property.titleEn || property.titleAr}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="font-medium text-sm text-[#2B2B2B] truncate mb-1">
                  {property.titleEn || property.titleAr}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{property.city}</span>
                  <Badge className={
                    (property.status === 'active' || property.approvalStatus === 'active')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }>
                    {property.status || property.approvalStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#2B2B2B] mb-4">
            Upcoming Bookings
          </h3>
          {upcomingBookings && upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.slice(0, 5).map((booking: any) => (
                <div
                  key={booking.bookingId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-[#2B2B2B] text-sm">
                      {booking.property?.titleEn ?? 'Property'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {booking.renter?.firstName ?? ''} {booking.renter?.lastName ?? ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'} -{' '}
                      {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {booking.status ?? 'pending'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No upcoming bookings</p>
            </div>
          )}
        </Card>

        {/* Recent Reviews */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#2B2B2B] mb-4">
            Recent Reviews
          </h3>
          {recentReviews && recentReviews.length > 0 ? (
            <div className="space-y-3">
              {recentReviews.slice(0, 5).map((review: any) => (
                <div key={review.reviewId} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-[#2B2B2B] text-sm">
                      {review.propertyTitle ?? 'Property'}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">
                        {review.overallRating ?? 0}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {review.reviewText ?? 'No review text'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    by {review.reviewer?.firstName ?? 'Anonymous'} •{' '}
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No reviews yet</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}