export interface PaymentFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: string;
  tokenKey?: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order: RazorpayOrder;
  key: string;
}

export interface PaymentDetails {
  _id: string;
  orderId: string;
  paymentId: string;
  signature: string;
  amount: number;
  currency: string;
  receipt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'created' | 'captured' | 'failed';
  tokenKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyResponse {
  success: boolean;
  message: string;
  payment: PaymentDetails;
}
