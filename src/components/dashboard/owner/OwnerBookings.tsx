// src/components/dashboard/OwnerBookings.tsx
import { useState } from 'react';
import { Calendar, Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import api, { BookingResponse } from '../../../../api';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';

interface OwnerBookingsProps {
  bookings: BookingResponse[];
  onBookingUpdated: () => void;
}

export function OwnerBookings({ bookings, onBookingUpdated }: OwnerBookingsProps) {
  const [actionBookingId, setActionBookingId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'confirm' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmResponse, setConfirmResponse] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleConfirmBooking = async () => {
    if (!actionBookingId) return;

    try {
      setProcessing(true);
      await api.confirmBooking(
        actionBookingId,
        confirmResponse || 'Thank you for booking! Looking forward to hosting you.'
      );
      toast.success('Booking confirmed successfully');
      setActionBookingId(null);
      setActionType(null);
      setConfirmResponse('');
      onBookingUpdated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!actionBookingId || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      await api.rejectBooking(actionBookingId, rejectionReason);
      toast.success('Booking rejected');
      setActionBookingId(null);
      setActionType(null);
      setRejectionReason('');
      onBookingUpdated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject booking');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">Bookings Management</h2>
        <Card className="p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">No bookings yet</h3>
          <p className="text-gray-600">Your property bookings will appear here</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-[#2B2B2B]">Bookings Management</h2>
        <div className="flex gap-2 text-sm">
          <Badge variant="outline" className="bg-yellow-50">
            {bookings.filter((b) => b.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            {bookings.filter((b) => b.status === 'confirmed').length} Confirmed
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
                    {booking.bookingReference}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{booking.property.titleEn}</p>
                      <p className="text-xs text-gray-600">
                        {booking.property.city}, {booking.property.governorate}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {booking.renter.firstName} {booking.renter.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{booking.renter.phoneNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                  <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                  <TableCell>{booking.numberOfNights}</TableCell>
                  <TableCell className="font-semibold">
                    {booking.totalPrice.toLocaleString()} EGP
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setActionBookingId(booking.bookingId);
                              setActionType('confirm');
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
                              setActionType('reject');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          toast.info('View details functionality coming soon');
                        }}
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
        open={actionType === 'confirm' && !!actionBookingId}
        onOpenChange={() => {
          setActionBookingId(null);
          setActionType(null);
          setConfirmResponse('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm this booking? The guest will be notified.
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
              {processing ? 'Confirming...' : 'Confirm Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Booking Dialog */}
      <AlertDialog
        open={actionType === 'reject' && !!actionBookingId}
        onOpenChange={() => {
          setActionBookingId(null);
          setActionType(null);
          setRejectionReason('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this booking. The guest will be notified.
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
              {processing ? 'Rejecting...' : 'Reject Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}