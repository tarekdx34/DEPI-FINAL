// src/components/dashboard/renter/dashboard/UpcomingBookingsSummary.tsx
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { ImageWithFallback } from "../../../figma/ImageWithFallback";
import { BookingResponse } from "../../../../../api";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";

interface UpcomingBookingsSummaryProps {
  bookings: BookingResponse[];
  onViewAll: () => void;
  onViewDetails: (bookingId: number) => void;
}

export function UpcomingBookingsSummary({ 
  bookings, 
  onViewAll,
  onViewDetails 
}: UpcomingBookingsSummaryProps) {
  const upcomingBookings = bookings.slice(0, 3);

  if (upcomingBookings.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2B2B2B]">Upcoming Trips</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onViewAll}
          className="text-[#00BFA6] hover:text-[#00A890]"
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-4">
        {upcomingBookings.map((booking) => (
          <div 
            key={booking.bookingId}
            className="flex gap-4 p-4 border rounded-lg hover:border-[#00BFA6] transition-colors cursor-pointer"
            onClick={() => onViewDetails(booking.bookingId)}
          >
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={booking.property.propertyId ? `/api/properties/${booking.property.propertyId}/cover` : ''}
                alt={booking.property.titleEn || booking.property.titleAr}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#2B2B2B] mb-1 truncate">
                {booking.property.titleEn || booking.property.titleAr}
              </h4>
              
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {booking.property.city}, {booking.property.governorate}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</span>
                </div>
                
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {booking.status === 'confirmed' ? 'Confirmed' : booking.status}
                </Badge>
              </div>

              <p className="text-sm font-semibold text-[#00BFA6] mt-2">
                {booking.totalPrice.toLocaleString()} EGP
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}