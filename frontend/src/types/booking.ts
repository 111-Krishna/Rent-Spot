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
};

export type PaymentOrderPayload = {
  amount: number;
  bookingId: string;
};

export type PaymentOrderResponse = {
  id: string;
  amount: number;
  currency: string;
};

export type PaymentVerifyPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
};
