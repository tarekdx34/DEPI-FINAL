// src/components/dashboard/owner/OwnerReviews.tsx - UPDATED
import { useState, useEffect } from "react";
import { MessageSquare, Loader2, Send } from "lucide-react";
import api from "../../../../api";
import type { ReviewResponse } from "../../../../api";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { EmptyState } from "../shared/components/EmptyState";
import { StarRating } from "../renter/reviews/StarRating";
import { toast } from "sonner";

interface OwnerReviewsProps {
  onNavigate: (page: string) => void;
}

export function OwnerReviews({ onNavigate }: OwnerReviewsProps) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      // Get all owner's properties
      const propertiesResponse = await api.getMyProperties({ page: 0, size: 100 });
      const properties = propertiesResponse.content;

      // Get reviews for each property
      const allReviews: ReviewResponse[] = [];
      for (const property of properties) {
        try {
          const propertyReviews = await api.getPropertyReviews(property.propertyId, {
            page: 0,
            size: 100,
          });
          allReviews.push(...propertyReviews.content);
        } catch (err) {
          console.error(`Failed to load reviews for property ${property.propertyId}:`, err);
        }
      }

      // Sort by date (newest first)
      allReviews.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setReviews(allReviews);
    } catch (error: any) {
      console.error("Failed to load reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (reviewId: number) => {
    if (!response.trim()) {
      toast.error("Please write a response");
      return;
    }

    try {
      setSubmitting(true);
      await api.respondToReview(reviewId, response);
      toast.success("Response submitted successfully");
      setRespondingTo(null);
      setResponse("");
      loadReviews();
    } catch (error: any) {
      console.error("Failed to respond:", error);
      toast.error("Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#00BFA6] animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No Reviews Yet"
        description="Reviews from your guests will appear here"
      />
    );
  }

  // Calculate statistics
  const unansweredReviews = reviews.filter((r) => !r.ownerResponse).length;
  const averageRating =
    reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Property Reviews</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage and respond to guest reviews
          </p>
        </div>
        <div className="flex gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#00BFA6]">
              {averageRating.toFixed(1)}
            </p>
            <p className="text-xs text-gray-600">Avg Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            <p className="text-xs text-gray-600">Total Reviews</p>
          </div>
          {unansweredReviews > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              {unansweredReviews} Unanswered
            </Badge>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.reviewId} className="overflow-hidden">
            <div className="p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {review.propertyTitle}
                    </h3>
                    {!review.ownerResponse && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Needs Response
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>
                      {review.reviewer.firstName} {review.reviewer.lastName}
                    </span>
                    {review.reviewer.verified && (
                      <Badge variant="outline" className="text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                    <span>•</span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.overallRating} readOnly size="default" />
                  <span className="font-semibold text-gray-900">
                    {review.overallRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {review.reviewTitle}
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{review.reviewText}</p>
              </div>

              {/* Detailed Ratings */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {[
                  { label: "Cleanliness", value: review.cleanlinessRating },
                  { label: "Accuracy", value: review.accuracyRating },
                  { label: "Communication", value: review.communicationRating },
                  { label: "Location", value: review.locationRating },
                  { label: "Value", value: review.valueRating },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">{label}</p>
                    <p className="font-semibold text-gray-900">{value.toFixed(1)}</p>
                  </div>
                ))}
              </div>

              {/* Pros & Cons */}
              {(review.pros || review.cons) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {review.pros && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        👍 Positive Feedback
                      </p>
                      <p className="text-sm text-gray-600">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        💡 Areas for Improvement
                      </p>
                      <p className="text-sm text-gray-600">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Owner Response Section */}
              {review.ownerResponse ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Your Response
                    {review.ownerResponseDate && ` • ${formatDate(review.ownerResponseDate)}`}
                  </p>
                  <p className="text-sm text-blue-800">{review.ownerResponse}</p>
                </div>
              ) : respondingTo === review.reviewId ? (
                <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Your Response
                    </label>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Thank the guest and address any concerns professionally..."
                      rows={3}
                      className="w-full"
                      disabled={submitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {response.length} characters
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(review.reviewId)}
                      disabled={submitting || !response.trim()}
                      className="bg-[#00BFA6] hover:bg-[#00A890]"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Response
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRespondingTo(null);
                        setResponse("");
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRespondingTo(review.reviewId)}
                  className="gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Respond to Review
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Tips Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          💡 Tips for Responding to Reviews
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Thank the guest for their feedback and their stay</li>
          <li>Address specific concerns or issues mentioned</li>
          <li>Keep responses professional and courteous</li>
          <li>Highlight improvements you've made based on feedback</li>
          <li>Invite guests to return for future stays</li>
        </ul>
      </Card>
    </div>
  );
}