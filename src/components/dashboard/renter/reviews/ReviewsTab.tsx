// src/components/dashboard/renter/reviews/ReviewsTab.tsx
import { Card } from "../../../ui/card";
import { EmptyState } from "../../shared/components/EmptyState";
import { MessageSquare, Star } from "lucide-react";

interface ReviewsTabProps {
  onNavigate: (page: string, id?: string) => void;
}

export function ReviewsTab({ onNavigate }: ReviewsTabProps) {
  // Placeholder - will be implemented with actual review data
  const reviews: any[] = [];

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Share your experiences after completing a trip"
        actionLabel="View Completed Trips"
        onAction={() => onNavigate('trips')}
      />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
        My Reviews
      </h2>
      
      <div className="space-y-4">
        {/* Reviews will be displayed here */}
      </div>
    </div>
  );
}