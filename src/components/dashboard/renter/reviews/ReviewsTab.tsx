// src/components/dashboard/renter/reviews/ReviewsTab.tsx - WITH APPROVAL SYSTEM
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Loader2,
  Star,
  TestTube,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Language, translations } from "../../../../lib/translations";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { EmptyState } from "../../shared/components/EmptyState";
import { ReviewCard } from "./ReviewCard";
import { WriteReviewModal } from "./WriteReviewModal";
import api from "../../../../../api";
import type { ReviewResponse, BookingResponse } from "../../../../../api";
import { toast } from "sonner";

interface ReviewsTabProps {
  onNavigate: (page: string, id?: string) => void;
  language: Language;
}

// ✅ TEST MODE - Set to false in production
const TEST_MODE = true;

export function ReviewsTab({ onNavigate, language }: ReviewsTabProps) {
  const t = translations[language];
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [eligibleBookings, setEligibleBookings] = useState<BookingResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(
    null
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const allBookings = await api.getBookings();

      let completedBookings: BookingResponse[];

      if (TEST_MODE) {
        // In TEST MODE: Include confirmed bookings for testing
        completedBookings = allBookings.filter(
          (b) =>
            b.status === "completed" ||
            b.status === "confirmed" ||
            new Date(b.checkOutDate) < new Date()
        );
      } else {
        // Production mode: only completed with past check-out
        completedBookings = allBookings.filter(
          (b) =>
            b.status === "completed" && new Date(b.checkOutDate) < new Date()
        );
        console.log(
          `✅ Production: ${completedBookings.length} completed booking(s)`
        );
      }

      // ✅ STEP 3: Check eligibility (skip API check in test mode)
      const eligibilityChecks = await Promise.all(
        completedBookings.map(async (booking) => {
          // In TEST MODE: Skip canReviewBooking API check
          if (TEST_MODE) {
            console.log(
              `🧪 Test Mode: Allowing booking ${booking.bookingId} for review`
            );
            return { booking, canReview: true };
          }

          // In Production: Check via API
          try {
            const canReview = await api.canReviewBooking(booking.bookingId);
            return { booking, canReview: canReview.canReview };
          } catch (error) {
            console.warn(
              `⚠️ canReviewBooking failed for ${booking.bookingId}:`,
              error
            );
            return { booking, canReview: false };
          }
        })
      );

      // Bookings that can be reviewed
      const pendingReviews = eligibilityChecks
        .filter(({ canReview }) => canReview)
        .map(({ booking }) => booking);

      console.log(`✅ ${pendingReviews.length} booking(s) eligible for review`);
      setEligibleBookings(pendingReviews);

      // ✅ STEP 4: Get user's reviews (handle errors gracefully)
      let userReviews: ReviewResponse[] = [];
      try {
        console.log("📥 Fetching reviews...");
        const reviewsData = await api.getMyReviews({ page: 0, size: 100 });
        userReviews = reviewsData.content || [];
        console.log(`✅ ${userReviews.length} review(s) fetched`);
      } catch (error: any) {
        // ⚠️ Handle API errors gracefully
        if (error.status === 500) {
          console.warn(
            "⚠️ getMyReviews returned 500 (Backend not ready). Continuing without reviews."
          );
        } else if (error.status === 404) {
          console.log(
            "ℹ️ getMyReviews endpoint not found. Continuing without reviews."
          );
        } else {
          console.error("❌ Error fetching reviews:", error);
        }
        // Don't show error toast - just continue without reviews
      }

      setReviews(userReviews);
      console.log("✅ Data loading complete");
    } catch (error: any) {
      console.error("❌ Failed to load reviews data:", error);
      toast.error("Failed to load reviews. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setEditingReview(null);
    setShowWriteReview(true);
  };

  const handleEditReview = (review: ReviewResponse) => {
    // ⚠️ Only allow editing if not approved yet
    if (review.isApproved) {
      toast.error("Cannot edit approved reviews. Please contact support.");
      return;
    }

    // Try to find the booking from eligible bookings
    let booking = eligibleBookings.find(
      (b) => b.bookingId === review.bookingId
    );

    // If not found, create a minimal booking object from review data
    if (!booking) {
      booking = {
        bookingId: review.bookingId,
        bookingReference: `REV-${review.reviewId}`,
        property: review.property,
        checkInDate: new Date().toISOString(),
        checkOutDate: new Date().toISOString(),
        numberOfGuests: 1,
        numberOfNights: 1,
        totalPrice: 0,
        status: "completed",
      } as BookingResponse;
    }

    setSelectedBooking(booking);
    setEditingReview(review);
    setShowWriteReview(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this review? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.deleteReview(reviewId);
      toast.success("Review deleted successfully");
      loadData();
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      toast.error(error.message || "Failed to delete review");
    }
  };

  const handleReviewSuccess = () => {
    toast.success(
      editingReview
        ? "Review updated successfully. Awaiting admin approval."
        : "Review submitted successfully! It will appear after admin approval."
    );
    setShowWriteReview(false);
    setSelectedBooking(null);
    setEditingReview(null);
    loadData();
  };

  // ✅ Separate reviews by approval status
  const approvedReviews = reviews.filter((r) => r.isApproved);
  const pendingReviews = reviews.filter((r) => !r.isApproved);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#00BFA6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {" "}
      {/* Header */}
      {eligibleBookings.length > 0 && (
        <div className="space-y-3">
          <h3
            className={`text-lg font-semibold text-[#2B2B2B] ${
              language === "ar" ? "text-right" : "text-left"
            }`}
          >
            {t.userDashboard.writeAReview}
          </h3>
          <p
            className={`text-sm text-gray-600 ${
              language === "ar" ? "text-right" : "text-left"
            }`}
          >
            {t.userDashboard.helpOthers}
          </p>
          <div className="space-y-3">
            {eligibleBookings.map((booking) => (
              <Card key={booking.bookingId} className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img
                    src={booking.property.coverImage}
                    alt={booking.property.titleEn}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#2B2B2B] truncate">
                        {booking.property.titleEn}
                      </h4>
                      {TEST_MODE && booking.status === "confirmed" && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                        >
                          Test
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {booking.property.city}, {booking.property.governorate}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.checkInDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}{" "}
                      -{" "}
                      {new Date(booking.checkOutDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleWriteReview(booking)}
                    className="bg-[#00BFA6] hover:bg-[#00A890] gap-2 flex-shrink-0"
                  >
                    <Star className="w-4 h-4" />
                    {t.userDashboard.writeReview}iew
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      {/* Approved Reviews */}
      {approvedReviews.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3
              className={`text-lg font-semibold text-[#2B2B2B] ${
                language === "ar" ? "text-right" : "text-left"
              }`}
            >
              {t.userDashboard.publishedReviews} ({approvedReviews.length})
            </h3>
          </div>
          <div className="space-y-4">
            {approvedReviews.map((review) => (
              <ReviewCard
                key={review.reviewId}
                review={review}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                isPending={false}
              />
            ))}
          </div>
        </div>
      ) : !eligibleBookings.length && !pendingReviews.length ? (
        <EmptyState
          icon={MessageSquare}
          title={t.userDashboard.noReviews}
          description={t.userDashboard.shareExperiences}
          actionLabel={t.userDashboard.viewTrips}
          onAction={() => onNavigate("trips")}
        />
      ) : null}
      {/* Write Review Modal */}
      {showWriteReview && selectedBooking && (
        <WriteReviewModal
          booking={selectedBooking}
          existingReview={editingReview}
          onClose={() => {
            setShowWriteReview(false);
            setSelectedBooking(null);
            setEditingReview(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
