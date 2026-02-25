export type BookingPayload = {
  propertyId: string;
  startDate: string;
  endDate: string;
};

export type BookingResponse = {
  _id: string;
  status: string;
  property: string;
  user: string;
  startDate: string;
  endDate: string;
  priceTotal?: number;
  stripeSessionId?: string;
  paidAt?: string;
};

export type PopulatedBooking = Omit<BookingResponse, "property"> & {
  property: {
    _id: string;
    title: string;
    price: number;
    location?: string;
    images?: string[];
  } | null;
  createdAt?: string;
};

export type CheckoutSessionPayload = {
  bookingId: string;
  propertyId: string;
  amount: number;
  propertyTitle: string;
};

export type CheckoutSessionResponse = {
  url: string;
};
