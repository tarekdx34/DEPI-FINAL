// src/components/dashboard/OwnerBookings.tsx - FIXED
import { useState } from "react";
import { Calendar, Check, X, Eye, XCircle } from "lucide-react";
import { toast } from "sonner";
import api, { BookingResponse } from "../../../../api";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";

interface OwnerBookingsProps {
  bookings: BookingResponse[];
  onBookingUpdated: () => void;
}

export function OwnerBookings({
  bookings,
  onBookingUpdated,
}: OwnerBookingsProps) {
  const [actionBookingId, setActionBookingId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<
    "confirm" | "reject" | "details" | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmResponse, setConfirmResponse] = useState("");
  const [processing, setProcessing] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null);

  const handleConfirmBooking = async () => {
    if (!actionBookingId) return;

    try {
      setProcessing(true);
      await api.confirmBooking(
        actionBookingId,
        confirmResponse ||
          "Thank you for booking! Looking forward to hosting you."
      );
      toast.success("Booking confirmed successfully");
      setActionBookingId(null);
      setActionType(null);
      setConfirmResponse("");
      onBookingUpdated();
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm booking");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!actionBookingId || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setProcessing(true);
      await api.rejectBooking(actionBookingId, rejectionReason);
      toast.success("Booking rejected");
      setActionBookingId(null);
      setActionType(null);
      setRejectionReason("");
      onBookingUpdated();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject booking");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      completed: "bg-blue-100 text-blue-700 border-blue-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      colors[status.toLowerCase()] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ✅ Helper to safely get property title
  const getPropertyTitle = (booking: BookingResponse) => {
    return (
      booking.property?.titleEn ||
      booking.property?.titleAr ||
      "Untitled Property"
    );
  };

  // ✅ Helper to safely get property location
  const getPropertyLocation = (booking: BookingResponse) => {
    const city = booking.property?.city || "Unknown";
    const governorate = booking.property?.governorate || "";
    return governorate ? `${city}, ${governorate}` : city;
  };

  // ✅ Helper to safely get guest name
  const getGuestName = (booking: BookingResponse) => {
    if (!booking.renter) return "Unknown Guest";
    const firstName = booking.renter.firstName || "";
    const lastName = booking.renter.lastName || "";
    return `${firstName} ${lastName}`.trim() || "Unknown Guest";
  };

  // ✅ Helper to safely get guest phone
  const getGuestPhone = (booking: BookingResponse) => {
    return booking.renter?.phoneNumber || "N/A";
  };

  // ✅ Handle view details
  const handleViewDetails = (booking: BookingResponse) => {
    console.log("📋 Opening booking details:", booking);
    setSelectedBooking(booking);
    setActionType("details");
  };

  // ✅ Format date with fallback
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
          Bookings Management
        </h2>
        <Card className="p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-600">
            Your property bookings will appear here
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-[#2B2B2B]">
          Bookings Management
        </h2>
        <div className="flex gap-2 text-sm">
          <Badge variant="outline" className="bg-yellow-50">
            {bookings.filter((b) => b.status === "pending").length} Pending
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            {bookings.filter((b) => b.status === "confirmed").length} Confirmed
          </Badge>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Ref</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Nights</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.bookingId}>
                  <TableCell className="font-medium">
                    {booking.bookingReference || `#${booking.bookingId}`}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {getPropertyTitle(booking)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {getPropertyLocation(booking)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{getGuestName(booking)}</p>
                      <p className="text-xs text-gray-600">
                        {getGuestPhone(booking)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                  <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                  <TableCell>{booking.numberOfNights || 0}</TableCell>
                  <TableCell className="font-semibold">
                    {(booking.totalPrice || 0).toLocaleString()} EGP
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(booking.status)}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setActionBookingId(booking.bookingId);
                              setActionType("confirm");
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setActionBookingId(booking.bookingId);
                              setActionType("reject");
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Confirm Booking Dialog */}
      <AlertDialog
        open={actionType === "confirm" && !!actionBookingId}
        onOpenChange={() => {
          setActionBookingId(null);
          setActionType(null);
          setConfirmResponse("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm this booking? The guest will be
              notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="confirmResponse">Message to Guest (Optional)</Label>
            <Textarea
              id="confirmResponse"
              value={confirmResponse}
              onChange={(e) => setConfirmResponse(e.target.value)}
              placeholder="Thank you for booking! Looking forward to hosting you."
              rows={3}
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBooking}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? "Confirming..." : "Confirm Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Booking Dialog */}
      <AlertDialog
        open={actionType === "reject" && !!actionBookingId}
        onOpenChange={() => {
          setActionBookingId(null);
          setActionType(null);
          setRejectionReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this booking. The guest will
              be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="rejectionReason">Rejection Reason *</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Property not available on these dates"
              rows={3}
              className="mt-1"
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectBooking}
              disabled={processing || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? "Rejecting..." : "Reject Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Booking Details Dialog */}
      <AlertDialog
        open={actionType === "details" && !!selectedBooking}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBooking(null);
            setActionType(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-3xl w-full max-h-[85vh] overflow-hidden p-0">
          {/* Header with Close Button */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <AlertDialogTitle className="text-xl font-semibold">
              Booking Details
            </AlertDialogTitle>
            <button
              onClick={() => {
                setSelectedBooking(null);
                setActionType(null);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-120px)] px-6 py-4">
            {selectedBooking && (
              <div className="space-y-6">
                {/* Booking Reference */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Booking Reference</p>
                    <p className="text-lg font-semibold">
                      {selectedBooking.bookingReference ||
                        `#${selectedBooking.bookingId}`}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedBooking.status)}
                  >
                    {selectedBooking.status}
                  </Badge>
                </div>

                {/* Property Details */}
                <div>
                  <h3 className="font-semibold text-[#2B2B2B] mb-3">
                    Property
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="font-medium">
                      {getPropertyTitle(selectedBooking)}
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 {getPropertyLocation(selectedBooking)}
                    </p>
                    <p className="text-sm text-gray-600">
                      🏠 {selectedBooking.property?.propertyType || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Guest Information */}
                <div>
                  <h3 className="font-semibold text-[#2B2B2B] mb-3">
                    Guest Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="font-medium">
                      {getGuestName(selectedBooking)}
                    </p>
                    <p className="text-sm text-gray-600">
                      📞 {getGuestPhone(selectedBooking)}
                    </p>
                    {selectedBooking.renter?.email && (
                      <p className="text-sm text-gray-600">
                        ✉️ {selectedBooking.renter.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="font-semibold text-[#2B2B2B] mb-3">
                    Booking Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Check-in</p>
                      <p className="font-medium">
                        {formatDate(selectedBooking.checkInDate)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Check-out</p>
                      <p className="font-medium">
                        {formatDate(selectedBooking.checkOutDate)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Number of Nights
                      </p>
                      <p className="font-medium">
                        {selectedBooking.numberOfNights || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Number of Guests
                      </p>
                      <p className="font-medium">
                        {selectedBooking.numberOfGuests || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="font-semibold text-[#2B2B2B] mb-3">
                    Payment Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>
                        {(
                          (selectedBooking.totalPrice || 0) -
                          (selectedBooking.platformFee || 0)
                        ).toLocaleString()}{" "}
                        EGP
                      </span>
                    </div>
                    {selectedBooking.platformFee &&
                      selectedBooking.platformFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Platform Fee</span>
                          <span>
                            {selectedBooking.platformFee.toLocaleString()} EGP
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                      <span>Total Amount</span>
                      <span className="text-[#00BFA6]">
                        {(selectedBooking.totalPrice || 0).toLocaleString()} EGP
                      </span>
                    </div>
                    {selectedBooking.paymentStatus && (
                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600">Payment Status</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedBooking.paymentStatus}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div>
                    <h3 className="font-semibold text-[#2B2B2B] mb-3">
                      Special Requests
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        {selectedBooking.specialRequests}
                      </p>
                    </div>
                  </div>
                )}

                {/* Owner Response (if confirmed) */}
                {selectedBooking.ownerResponse && (
                  <div>
                    <h3 className="font-semibold text-[#2B2B2B] mb-3">
                      Your Response
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        {selectedBooking.ownerResponse}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rejection Reason (if rejected) */}
                {selectedBooking.rejectionReason && (
                  <div>
                    <h3 className="font-semibold text-[#2B2B2B] mb-3">
                      Rejection Reason
                    </h3>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        {selectedBooking.rejectionReason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Booking Timeline */}
                <div>
                  <h3 className="font-semibold text-[#2B2B2B] mb-3">
                    Timeline
                  </h3>
                  <div className="space-y-2 text-sm">
                    {selectedBooking.createdAt && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        <span>
                          Created: {formatDateTime(selectedBooking.createdAt)}
                        </span>
                      </div>
                    )}
                    {selectedBooking.confirmedAt && (
                      <div className="flex items-center gap-2 text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>
                          Confirmed:{" "}
                          {formatDateTime(selectedBooking.confirmedAt)}
                        </span>
                      </div>
                    )}
                    {selectedBooking.cancelledAt && (
                      <div className="flex items-center gap-2 text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span>
                          Cancelled:{" "}
                          {formatDateTime(selectedBooking.cancelledAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Actions */}
          {selectedBooking?.status === "pending" && (
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setActionBookingId(selectedBooking.bookingId);
                  setActionType("reject");
                  setSelectedBooking(null);
                }}
                className="bg-red-50 text-red-700 hover:bg-red-100"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => {
                  setActionBookingId(selectedBooking.bookingId);
                  setActionType("confirm");
                  setSelectedBooking(null);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
