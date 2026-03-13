export interface Booking {
  id: string;
  clientName: string;
  serviceName: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'confirmed' | 'pending' | 'cancelled';
  price?: number;
  notes?: string;
}

export interface DayBookings {
  date: string; // YYYY-MM-DD
  bookings: Booking[];
}
