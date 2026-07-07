import { Schema, model, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  receipt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'created' | 'captured' | 'failed';
  tokenKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      default: '',
    },
    signature: {
      type: String,
      default: '',
    },
    tokenKey: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be greater than or equal to 0'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'INR',
    },
    receipt: {
      type: String,
      required: [true, 'Receipt identifier is required'],
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['created', 'captured', 'failed'],
      default: 'created',
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = model<IPayment>('Payment', PaymentSchema);
