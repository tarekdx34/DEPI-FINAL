// src/hooks/useBookings.ts
import { useState, useEffect } from 'react';
import api, { BookingResponse } from '../../api';
import { toast } from 'sonner';

export function useBookings(status?: string) {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [status]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getBookings(status);
      setBookings(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load bookings';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingBookings = async () => {
    try {
      const data = await api.getUpcomingBookings();
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load upcoming bookings';
      toast.error(errorMessage);
      throw err;
    }
  };

  const cancelBooking = async (bookingId: number, reason: string) => {
    try {
      await api.cancelBooking(bookingId, reason);
      toast.success('Booking cancelled successfully');
      await fetchBookings(); // Refresh bookings
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel booking';
      toast.error(errorMessage);
      throw err;
    }
  };

  const getBookingById = async (bookingId: number) => {
    try {
      const data = await api.getBooking(bookingId);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load booking details';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Filter bookings by status
  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && new Date(b.checkInDate) > new Date()
  );

  const pastBookings = bookings.filter(b => 
    (b.status === 'completed' || new Date(b.checkOutDate) < new Date())
  );

  const pendingBookings = bookings.filter(b => 
    b.status === 'pending'
  );

  const cancelledBookings = bookings.filter(b => 
    b.status === 'cancelled' || b.status === 'rejected'
  );

  return {
    bookings,
    upcomingBookings,
    pastBookings,
    pendingBookings,
    cancelledBookings,
    loading,
    error,
    fetchBookings,
    getUpcomingBookings,
    cancelBooking,
    getBookingById
  };
}