import type { BookingPayload, BookingResponse, PaymentOrderPayload, PaymentOrderResponse, PaymentVerifyPayload } from "@/types/booking";
import type { Property, PropertyPayload } from "@/types/property";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getAuthHeaders = (token?: string) => {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
};

export const propertyApi = {
  getProperties: (search = "") =>
    request<Property[]>(`/api/properties${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getPropertyById: (propertyId: string) => request<Property>(`/api/properties/${propertyId}`),
  createProperty: (payload: PropertyPayload, token: string) =>
    request<Property>("/api/properties", {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    }),
};

export const bookingApi = {
  createBooking: (payload: BookingPayload, token: string) =>
    request<BookingResponse>("/api/bookings", {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    }),
};

export const paymentApi = {
  createOrder: (payload: PaymentOrderPayload) =>
    request<PaymentOrderResponse | { message: string }>("/api/payments/order", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  verifyPayment: (payload: PaymentVerifyPayload) =>
    request<{ message: string }>("/api/payments/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
