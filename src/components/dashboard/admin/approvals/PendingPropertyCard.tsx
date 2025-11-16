// src/components/dashboard/admin/approvals/PendingPropertyCard.tsx
import { CheckCircle, MapPin, Eye } from "lucide-react";
import { Card } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import type { PendingPropertyResponse } from "../../../../api";

interface PendingPropertyCardProps {
  listing: PendingPropertyResponse;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  onApprove: (id: number, title: string) => void;
  onReject: (id: number, title: string) => void;
}

export function PendingPropertyCard({
  listing,
  formatCurrency,
  formatDate,
  onApprove,
  onReject,
}: PendingPropertyCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-[#2B2B2B] mb-1">
              {listing.titleEn}
            </h3>
            <p className="text-sm text-gray-600">
              by {listing.ownerName} ({listing.ownerEmail})
            </p>
          </div>
          <Badge variant="outline" className="bg-yellow-50">
            Pending
          </Badge>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {listing.city}, {listing.governorate}
            </span>
            <span className="font-semibold">
              {formatCurrency(listing.pricePerNight)}/night
            </span>
          </div>
          <div className="flex gap-3 text-sm text-gray-600">
            <span>{listing.bedrooms} beds</span>
            <span>{listing.bathrooms} baths</span>
            <span>{listing.propertyType}</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {listing.descriptionEn}
          </p>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Submitted {formatDate(listing.createdAt)}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => onApprove(listing.propertyId, listing.titleEn)}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
            onClick={() => onReject(listing.propertyId, listing.titleEn)}
          >
            Reject
          </Button>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
