import type { BookingPayload, BookingResponse, PopulatedBooking, CheckoutSessionPayload, CheckoutSessionResponse } from "@/types/booking";
import type { Property, PropertyPayload } from "@/types/property";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getAuthHeaders = (token?: string) => {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const isFormData = options?.body instanceof FormData;
  const { headers: optionHeaders, ...restOptions } = options || {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(optionHeaders || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
};

export const authApi = {
  getCurrentUser: (token: string) =>
    request<{ user: any }>("/api/auth/me", {
      headers: getAuthHeaders(token),
    }),
  syncClerkUser: (token: string) =>
    request<{ message: string; user: any }>("/api/auth/sync", {
      method: "POST",
      headers: getAuthHeaders(token),
    }),
};

export const propertyApi = {
  getProperties: (search = "") =>
    request<Property[]>(`/api/properties${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getPropertyById: (propertyId: string) => request<Property>(`/api/properties/${propertyId}`),
  createProperty: (payload: PropertyPayload, token: string) => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("price", String(payload.price));
    formData.append("location", payload.location);
    formData.append("houseType", payload.houseType);
    payload.images?.forEach((image) => formData.append("images", image));

    return request<Property>("/api/properties", {
      method: "POST",
      headers: getAuthHeaders(token),
      body: formData,
    });
  },
};

export const bookingApi = {
  createBooking: (payload: BookingPayload, token: string) =>
    request<BookingResponse>("/api/bookings", {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    }),
  getUserBookings: (token: string) =>
    request<PopulatedBooking[]>("/api/bookings/my-bookings", {
      headers: getAuthHeaders(token),
    }),
};

export const paymentApi = {
  createCheckoutSession: (payload: CheckoutSessionPayload, token: string) =>
    request<CheckoutSessionResponse | { message: string }>("/api/payments/create-checkout-session", {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    }),
  getSessionStatus: (sessionId: string) =>
    request<{ status: string; bookingId: string }>(`/api/payments/session-status?session_id=${sessionId}`),
};


export type SupportContext = {
  userRole?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  budget?: string;
  listingName?: string;
  listingPrice?: string;
  amenities?: string;
  houseRules?: string;
  cancellation?: string;
  conversationGoal?: string;
  bookingId?: string;
  listingId?: string;
};

export type SupportMessage = {
  role: "user" | "assistant";
  text: string;
};

export type SupportChatPayload = SupportContext & {
  message: string;
};

export type SupportChatResponse = {
  reply: string;
  systemPrompt?: string;
  toolCalls?: Array<{ tool: string; result: unknown }>;
};

export const supportApi = {
  chat: (payload: SupportChatPayload) =>
    request<SupportChatResponse>("/api/support/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
