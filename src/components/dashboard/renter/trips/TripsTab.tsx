// FILE 1: src/components/dashboard/renter/trips/TripsTab.tsx (WITH REVIEW MODAL)
import { useState, useEffect, useCallback } from "react";
import { Loader2, Calendar } from "lucide-react";
import { Language, translations } from "../../../../lib/translations";
import { EmptyState } from "../../shared/components/EmptyState";
import { TripCard } from "./TripCard";
import { CancelDialog } from "./CancelDialog";
import { WriteReviewModal } from "../reviews/WriteReviewModal"; // ✅ Import review modal
import { useBookings } from "../../../../hooks/useBookings";
import api from "../../../../../api";
import type { BookingResponse } from "../../../../../api";
import { toast } from "sonner";

interface TripsTabProps {
  onNavigate: (page: string, id?: string) => void;
  language: Language;
}

export function TripsTab({ onNavigate, language }: TripsTabProps) {
  const t = translations[language];
  const {
    upcomingBookings,
    pastBookings,
    cancelledBookings,
    loading,
    cancelBooking,
    fetchBookings,
  } = useBookings();

  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [existingReviews, setExistingReviews] = useState<Set<number>>(
    new Set()
  );
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // ✅ NEW: Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] =
    useState<BookingResponse | null>(null);

  // ✅ Memoize the function to prevent infinite loops
  const checkExistingReviews = useCallback(async () => {
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
  }, []);

  // ✅ SINGLE effect on mount - fetch bookings and reviews ONCE
  useEffect(() => {
    fetchBookings();
    checkExistingReviews();
  }, []);

  // ✅ Optional: Refresh reviews when window gains focus (but with debounce)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleFocus = () => {
      // Debounce to prevent rapid calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        checkExistingReviews();
      }, 1000); // Wait 1 second before refreshing
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearTimeout(timeoutId);
    };
  }, [checkExistingReviews]);

  const handleCancelBooking = async () => {
    if (cancelBookingId) {
      await cancelBooking(cancelBookingId, "Cancelled by user");
      setCancelBookingId(null);
      // ✅ Refresh bookings after cancellation
      await fetchBookings();
    }
  };

  // ✅ NEW: Handle opening review modal
  const handleOpenReviewModal = (booking: BookingResponse) => {
    console.log("📝 Opening review modal for booking:", booking.bookingId);
    setSelectedBookingForReview(booking);
    setShowReviewModal(true);
  };

  // ✅ NEW: Handle review submission success
  const handleReviewSuccess = () => {
    toast.success("Review submitted successfully!");
    setShowReviewModal(false);
    setSelectedBookingForReview(null);
    // Refresh reviews to update the UI
    checkExistingReviews();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#00BFA6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Upcoming Trips */}
      <div>
        <h2
          className={`text-2xl font-semibold text-[#2B2B2B] mb-4 ${
            language === "ar" ? "text-right" : "text-left"
          }`}
        >
          {t.userDashboard.upcomingTrips}
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
            title={t.userDashboard.noUpcomingTrips}
            description={t.userDashboard.timeToExplore}
            actionLabel={t.userDashboard.startExploring}
            onAction={() => onNavigate("properties")}
          />
        )}
      </div>

      {/* Past Trips */}
      <div>
        <h2
          className={`text-2xl font-semibold text-[#2B2B2B] mb-4 ${
            language === "ar" ? "text-right" : "text-left"
          }`}
        >
          {t.userDashboard.pastTrips}
        </h2>
        {pastBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pastBookings.map((booking) => (
              <TripCard
                key={booking.bookingId}
                booking={booking}
                type="past"
                onNavigate={onNavigate}
                onWriteReview={handleOpenReviewModal} // ✅ Pass callback
                hasReview={existingReviews.has(booking.bookingId)}
                reviewsLoading={reviewsLoading}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            {t.userDashboard.noPastTrips}
          </div>
        )}
      </div>

      {/* Cancelled Trips */}
      <div>
        <h2
          className={`text-2xl font-semibold text-[#2B2B2B] mb-4 ${
            language === "ar" ? "text-right" : "text-left"
          }`}
        >
          {t.userDashboard.cancelledTrips}
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
          <div className="text-center py-8 text-gray-600">
            {t.userDashboard.noCancelledTrips}
          </div>
        )}
      </div>

      {/* Cancel Booking Dialog */}
      <CancelDialog
        open={cancelBookingId !== null}
        onClose={() => setCancelBookingId(null)}
        onConfirm={handleCancelBooking}
      />

      {/* ✅ NEW: Review Modal */}
      {showReviewModal && selectedBookingForReview && (
        <WriteReviewModal
          booking={selectedBookingForReview}
          existingReview={null}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBookingForReview(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
