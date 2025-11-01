// src/components/dashboard/renter/trips/TripsTab.tsx
import { useState, useEffect } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { ImageWithFallback } from "../../../figma/ImageWithFallback";
import { EmptyState } from "../../shared/components/EmptyState";
import { useBookings } from "../../../../hooks/useBookings";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Loader2,
  AlertCircle,
  Star,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { toast } from "sonner";

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
  // ✅ ADD: Debug logging
  useEffect(() => {
    console.log("📊 TripsTab Debug:");
    console.log("Upcoming bookings:", upcomingBookings);
    console.log("Past bookings:", pastBookings);
  }, [upcomingBookings, pastBookings]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    console.log("📊 TripsTab Debug:");
    console.log("Upcoming bookings:", upcomingBookings);
    console.log("Past bookings:", pastBookings);

    // ✅ ADD: Check first booking structure
    if (upcomingBookings.length > 0) {
      console.log("🔍 First booking structure:", upcomingBookings[0]);
      console.log("🔍 Property object:", upcomingBookings[0].property);
    }
  }, [upcomingBookings, pastBookings]);

  const handleCancelBooking = async () => {
    if (cancelBookingId) {
      try {
        await cancelBooking(cancelBookingId, "Cancelled by user");
        setCancelBookingId(null);
      } catch (err) {
        // Error handled by hook
      }
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
            {upcomingBookings.map((booking) => {
              const property = booking.property;

              if (!property || !property.propertyId) {
                console.warn(
                  "Booking missing property data:",
                  booking.bookingId
                );
                return null;
              }

              const propertyTitle =
                property.titleEn || property.titleAr || "Property";
              const propertyLocation = `${property.city || ""}, ${
                property.governorate || ""
              }`.trim();
              const propertyImage =
                property.coverImageUrl ||
                "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f"; // ✅ FIXED

              return (
                <Card key={booking.bookingId} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-4 p-6">
                    <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={propertyImage}
                        alt={propertyTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold text-[#2B2B2B] mb-1">
                          {propertyTitle}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{propertyLocation}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span>
                            {formatDate(booking.checkInDate)} -{" "}
                            {formatDate(booking.checkOutDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span>{booking.numberOfGuests} guests</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`gap-1 ${
                            booking.status === "confirmed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {booking.status === "confirmed"
                            ? "Confirmed"
                            : "Pending"}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>{booking.numberOfNights} nights</p>
                        <p className="mt-1">
                          Total:{" "}
                          <span className="font-semibold text-[#00BFA6]">
                            {booking.totalPrice.toLocaleString()} EGP
                          </span>
                        </p>
                        <p className="mt-1">
                          Confirmation:{" "}
                          <span className="font-semibold text-[#00BFA6]">
                            {booking.bookingReference}
                          </span>
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onNavigate(
                              "trip-details",
                              String(booking.bookingId)
                            )
                          }
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onNavigate(
                              "contact-host",
                              String(booking.owner?.userId || "")
                            )
                          }
                        >
                          Contact Host
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setCancelBookingId(booking.bookingId)}
                        >
                          Cancel Booking
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
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
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
          Past Trips
        </h2>

        {pastBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pastBookings.map((booking) => {
              const property = booking.property;

              if (!property || !property.propertyId) {
                return null;
              }

              const propertyTitle =
                property.titleEn || property.titleAr || "Property";
              const propertyLocation = `${property.city || ""}, ${
                property.governorate || ""
              }`.trim();
              const propertyImage =
                property.coverImageUrl ||
                "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f"; // ✅ FIXED

              return (
                <Card key={booking.bookingId} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-4 p-6">
                    <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={propertyImage}
                        alt={propertyTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold text-[#2B2B2B] mb-1">
                          {propertyTitle}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{propertyLocation}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span>
                            {formatDate(booking.checkInDate)} -{" "}
                            {formatDate(booking.checkOutDate)}
                          </span>
                        </div>
                        <Badge variant="outline" className="gap-1 bg-gray-100">
                          <Clock className="w-3 h-3" />
                          Completed
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>
                          Total Paid:{" "}
                          <span className="font-semibold">
                            {booking.totalPrice.toLocaleString()} EGP
                          </span>
                        </p>
                        <p className="mt-1">
                          Confirmation: {booking.bookingReference}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onNavigate(
                              "trip-details",
                              String(booking.bookingId)
                            )
                          }
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#00BFA6] hover:bg-[#00A890] gap-2"
                          onClick={() =>
                            onNavigate(
                              "write-review",
                              String(booking.bookingId)
                            )
                          }
                        >
                          <Star className="w-4 h-4" />
                          Write Review
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No past trips</p>
          </Card>
        )}
      </div>

      {/* ✅ ADD: Cancelled Trips Section */}
      <div>
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
          Cancelled Trips
        </h2>

        {cancelledBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {cancelledBookings.map((booking) => {
              const property = booking.property;

              if (!property || !property.propertyId) {
                return null;
              }

              const propertyTitle =
                property.titleEn || property.titleAr || "Property";
              const propertyLocation = `${property.city || ""}, ${
                property.governorate || ""
              }`.trim();
              const propertyImage =
                property.coverImageUrl ||
                "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f";

              // ✅ Format status text
              const statusText =
                booking.status === "cancelled_by_renter"
                  ? "Cancelled by You"
                  : booking.status === "cancelled_by_owner"
                  ? "Cancelled by Host"
                  : "Cancelled";

              return (
                <Card
                  key={booking.bookingId}
                  className="overflow-hidden opacity-75"
                >
                  <div className="flex flex-col md:flex-row gap-4 p-6">
                    <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden grayscale">
                      <ImageWithFallback
                        src={propertyImage}
                        alt={propertyTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold text-[#2B2B2B] mb-1">
                          {propertyTitle}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{propertyLocation}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span>
                            {formatDate(booking.checkInDate)} -{" "}
                            {formatDate(booking.checkOutDate)}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="gap-1 bg-red-50 text-red-700 border-red-200"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {statusText}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>
                          Original Price:{" "}
                          <span className="line-through">
                            {booking.totalPrice.toLocaleString()} EGP
                          </span>
                        </p>
                        {booking.refundAmount > 0 && (
                          <p className="mt-1 text-green-600">
                            Refunded:{" "}
                            <span className="font-semibold">
                              {booking.refundAmount.toLocaleString()} EGP
                            </span>
                          </p>
                        )}
                        <p className="mt-1">
                          Confirmation: {booking.bookingReference}
                        </p>
                        {booking.cancellationReason && (
                          <p className="mt-2 text-xs text-gray-500">
                            Reason: {booking.cancellationReason}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onNavigate(
                              "trip-details",
                              String(booking.bookingId)
                            )
                          }
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate("properties")}
                        >
                          Book Again
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No cancelled trips</p>
          </Card>
        )}
      </div>

      {/* Cancel Booking Dialog */}
      <AlertDialog
        open={cancelBookingId !== null}
        onOpenChange={() => setCancelBookingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Cancel Booking
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone and may be subject to cancellation fees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
