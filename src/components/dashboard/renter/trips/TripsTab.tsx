// FILE 1: src/components/dashboard/renter/trips/TripsTab.tsx (~100 lines)
import { useState, useEffect } from "react";
import { Loader2, Calendar } from "lucide-react";
import { EmptyState } from "../../shared/components/EmptyState";
import { TripCard } from "./TripCard";
import { CancelDialog } from "./CancelDialog";
import { useBookings } from "../../../../hooks/useBookings";
import api from "../../../../../api";

interface TripsTabProps {
  onNavigate: (page: string, id?: string) => void;
}

export function TripsTab({ onNavigate }: TripsTabProps) {
  const {
    upcomingBookings,
    pastBookings,
    cancelledBookings,
    loading,
    cancelBooking,
    fetchBookings,
  } = useBookings();
  
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [existingReviews, setExistingReviews] = useState<Set<number>>(new Set());
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
    checkExistingReviews();
  }, []);

  useEffect(() => {
    checkExistingReviews();
  }, [pastBookings]);

  useEffect(() => {
    const handleFocus = () => checkExistingReviews();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const checkExistingReviews = async () => {
    try {
      setReviewsLoading(true);
      const myReviews = await api.getMyReviews({ page: 0, size: 100 });
      const reviewedBookingIds = new Set(
        myReviews.content
          .filter((review) => review.isApproved)
          .map((review) => review.bookingId)
      );
      setExistingReviews(reviewedBookingIds);
    } catch (error) {
      console.warn("⚠️ Could not fetch reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (cancelBookingId) {
      await cancelBooking(cancelBookingId, "Cancelled by user");
      setCancelBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#00BFA6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upcoming Trips */}
      <div>
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
          Upcoming Trips
        </h2>
        {upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {upcomingBookings.map((booking) => (
              <TripCard
                key={booking.bookingId}
                booking={booking}
                type="upcoming"
                onNavigate={onNavigate}
                onCancel={setCancelBookingId}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No upcoming trips"
            description="Time to dust off your bags and start planning your next adventure!"
            actionLabel="Start Exploring"
            onAction={() => onNavigate("properties")}
          />
        )}
      </div>

      {/* Past Trips */}
      <div>
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">Past Trips</h2>
        {pastBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pastBookings.map((booking) => (
              <TripCard
                key={booking.bookingId}
                booking={booking}
                type="past"
                onNavigate={onNavigate}
                hasReview={existingReviews.has(booking.bookingId)}
                reviewsLoading={reviewsLoading}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">No past trips</div>
        )}
      </div>

      {/* Cancelled Trips */}
      <div>
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
          Cancelled Trips
        </h2>
        {cancelledBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {cancelledBookings.map((booking) => (
              <TripCard
                key={booking.bookingId}
                booking={booking}
                type="cancelled"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">No cancelled trips</div>
        )}
      </div>

      <CancelDialog
        open={cancelBookingId !== null}
        onClose={() => setCancelBookingId(null)}
        onConfirm={handleCancelBooking}
      />
    </div>
  );
}