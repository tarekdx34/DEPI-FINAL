// src/components/dashboard/renter/reviews/ReviewsTab.tsx - WITH APPROVAL SYSTEM
import { useState, useEffect } from "react";
import { MessageSquare, Loader2, Star, TestTube, Clock, CheckCircle, XCircle } from "lucide-react";
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
}

// ✅ TEST MODE - Set to false in production
const TEST_MODE = true;

export function ReviewsTab({ onNavigate }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [eligibleBookings, setEligibleBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // ✅ STEP 1: Get all user's bookings
      console.log("📥 Fetching bookings...");
      const allBookings = await api.getBookings();
      console.log("✅ Bookings fetched:", allBookings.length);
      
      // ✅ STEP 2: Filter completed bookings
      let completedBookings: BookingResponse[];
      
      if (TEST_MODE) {
        // In TEST MODE: Include confirmed bookings for testing
        completedBookings = allBookings.filter(
          (b) => 
            b.status === "completed" || 
            b.status === "confirmed" || 
            new Date(b.checkOutDate) < new Date()
        );
        
        console.log(`🧪 Test Mode: ${completedBookings.length} booking(s) available for review`);
      } else {
        // Production mode: only completed with past check-out
        completedBookings = allBookings.filter(
          (b) => 
            b.status === "completed" && 
            new Date(b.checkOutDate) < new Date()
        );
        console.log(`✅ Production: ${completedBookings.length} completed booking(s)`);
      }

      // ✅ STEP 3: Check eligibility (skip API check in test mode)
      const eligibilityChecks = await Promise.all(
        completedBookings.map(async (booking) => {
          // In TEST MODE: Skip canReviewBooking API check
          if (TEST_MODE) {
            console.log(`🧪 Test Mode: Allowing booking ${booking.bookingId} for review`);
            return { booking, canReview: true };
          }
          
          // In Production: Check via API
          try {
            const canReview = await api.canReviewBooking(booking.bookingId);
            return { booking, canReview: canReview.canReview };
          } catch (error) {
            console.warn(`⚠️ canReviewBooking failed for ${booking.bookingId}:`, error);
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
          console.warn("⚠️ getMyReviews returned 500 (Backend not ready). Continuing without reviews.");
        } else if (error.status === 404) {
          console.log("ℹ️ getMyReviews endpoint not found. Continuing without reviews.");
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
    let booking = eligibleBookings.find(b => b.bookingId === review.bookingId);
    
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
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
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
  const approvedReviews = reviews.filter(r => r.isApproved);
  const pendingReviews = reviews.filter(r => !r.isApproved);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#00BFA6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-[#2B2B2B]">My Reviews</h2>
          {TEST_MODE && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
              <TestTube className="w-3 h-3" />
              Test Mode
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {eligibleBookings.length > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
              <MessageSquare className="w-3 h-3" />
              {eligibleBookings.length} pending review{eligibleBookings.length > 1 ? "s" : ""}
            </Badge>
          )}
          {pendingReviews.length > 0 && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1">
              <Clock className="w-3 h-3" />
              {pendingReviews.length} awaiting approval
            </Badge>
          )}
        </div>
      </div>

      {/* Test Mode Notice */}
      {TEST_MODE && (
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-start gap-3">
            <TestTube className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-1">
                🧪 Development Test Mode Active
              </h4>
              <p className="text-sm text-purple-700">
                All confirmed bookings are shown as eligible for review. 
                Set <code className="px-1.5 py-0.5 bg-purple-100 rounded font-mono text-xs">TEST_MODE = false</code> in 
                production.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Pending Reviews (Awaiting Approval) */}
      {pendingReviews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-[#2B2B2B]">
              Pending Approval ({pendingReviews.length})
            </h3>
          </div>
          <Card className="p-4 bg-orange-50 border-orange-200">
            <p className="text-sm text-orange-800">
              <strong>⏳ Under Review:</strong> These reviews are waiting for admin approval before being published.
              You can still edit or delete them.
            </p>
          </Card>
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <div key={review.reviewId} className="relative">
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-orange-500 text-white gap-1 shadow-md">
                    <Clock className="w-3 h-3" />
                    Pending
                  </Badge>
                </div>
                <ReviewCard
                  review={review}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                  isPending={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eligible Bookings - Write New Review */}
      {eligibleBookings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[#2B2B2B]">Write a Review</h3>
          <p className="text-sm text-gray-600">
            Share your experience to help other travelers and hosts
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
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          Test
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {booking.property.city}, {booking.property.governorate}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.checkInDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(booking.checkOutDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleWriteReview(booking)}
                    className="bg-[#00BFA6] hover:bg-[#00A890] gap-2 flex-shrink-0"
                  >
                    <Star className="w-4 h-4" />
                    Write Review
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
            <h3 className="text-lg font-semibold text-[#2B2B2B]">
              Published Reviews ({approvedReviews.length})
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
          title="No reviews yet"
          description={
            TEST_MODE 
              ? "Create a confirmed booking to test the review system"
              : "Share your experiences after completing a trip"
          }
          actionLabel="View Trips"
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