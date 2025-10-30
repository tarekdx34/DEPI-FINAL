// Path: src/components/dashboard/owner/OwnerReviews.tsx

import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import api from "../../../../api";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { EmptyState } from "../shared/components/EmptyState";

interface Review {
  reviewId: number;
  propertyTitle: string;
  reviewer: {
    firstName: string;
    lastName: string;
  };
  overallRating: number;
  reviewText: string;
  createdAt: string;
  ownerResponse?: string;
}

interface OwnerReviewsProps {
  onNavigate: (page: string) => void;
}

export function OwnerReviews({ onNavigate }: OwnerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // TODO: Add API endpoint for owner's property reviews
      // const data = await api.getOwnerReviews();
      setReviews([]);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (reviewId: number) => {
    if (!response.trim()) return;

    try {
      await api.respondToReview(reviewId, response);
      setRespondingTo(null);
      setResponse("");
      loadReviews();
    } catch (error) {
      console.error("Failed to respond:", error);
    }
  };

  if (loading) return <div>Loading reviews...</div>;

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No Reviews Yet"
        description="Reviews from your guests will appear here"
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.reviewId}
            className="border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {review.propertyTitle}
                </h3>
                <p className="text-sm text-gray-600">
                  {review.reviewer.firstName} {review.reviewer.lastName}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.overallRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-gray-700 mb-4">{review.reviewText}</p>

            {review.ownerResponse ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Your Response:
                </p>
                <p className="text-sm text-blue-800">{review.ownerResponse}</p>
              </div>
            ) : respondingTo === review.reviewId ? (
              <div className="space-y-3">
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write your response..."
                  rows={3}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRespond(review.reviewId)}
                    className="bg-[#00BFA6] hover:bg-[#00A890]"
                  >
                    Send Response
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRespondingTo(null);
                      setResponse("");
                    }}
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
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Respond
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}