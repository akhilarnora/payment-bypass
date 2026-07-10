import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay.js';
import { Payment } from '../models/Payment.js';
import { AppError } from '../middleware/error.middleware.js';

// Helper to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper to validate phone format
const isValidPhone = (phone: string): boolean => {
  // Simple validation for phone numbers (at least 10 digits, optional leading +)
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Create a new Razorpay order and save a corresponding pending payment record in DB
 * POST /api/payment/create-order
 */
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, customerName, customerEmail, customerPhone, tokenKey, order_id, orderId } = req.body;

    // 1. Validation
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return next(new AppError('Amount must be a positive number greater than 0', 400));
    }
    if (!customerName || customerName.trim().length === 0) {
      return next(new AppError('Customer name is required', 400));
    }
    if (!customerEmail || !isValidEmail(customerEmail)) {
      return next(new AppError('A valid email address is required', 400));
    }
    if (!customerPhone || !isValidPhone(customerPhone)) {
      return next(new AppError('A valid phone number (10-15 digits) is required', 400));
    }

    // 2. Setup Razorpay order parameters
    // Razorpay expects amount in the smallest currency sub-unit (paise for INR)
    const amountInPaise = Math.round(Number(amount) * 100);
    const receiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
    });

    if (!razorpayOrder) {
      return next(new AppError('Failed to generate order from Razorpay', 500));
    }

    // 3. Save initial payment tracking record to MongoDB
    const payment = new Payment({
      orderId: razorpayOrder.id,
      amount: Number(amount),
      currency: 'INR',
      receipt: razorpayOrder.receipt || receiptId,
      customerName,
      customerEmail,
      customerPhone,
      status: 'created',
      tokenKey: tokenKey || '',
      order_id: (order_id || orderId || '').toString().trim(),
    });

    await payment.save();

    // 4. Return order metadata and public Key ID (never leak client secret)
    res.status(201).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
      key: process.env.RAZORPAY_KEY_ID || '',
      order_id: payment.order_id || '',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay signature and update payment record state in DB
 * POST /api/payment/verify
 */
export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return next(
        new AppError('Missing payment verification metadata (payment_id, order_id, signature)', 400)
      );
    }

    // 1. Verify the signature locally using crypto and Razorpay secret
    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;
    if (!secret) {
      return next(new AppError('Razorpay secret is not configured on the server', 500));
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    // Find the original payment record
    const paymentRecord = await Payment.findOne({ orderId: razorpay_order_id });

    if (!isSignatureValid) {
      // If payment failed validation, update local DB record to failed
      if (paymentRecord) {
        paymentRecord.status = 'failed';
        paymentRecord.paymentId = razorpay_payment_id;
        paymentRecord.signature = razorpay_signature;
        await paymentRecord.save();
      }
      return next(new AppError('Payment signature verification failed. Possible fraud.', 400));
    }

    if (!paymentRecord) {
      return next(
        new AppError('Payment order not found in database, but signature is valid', 404)
      );
    }

    // 2. Signature is valid, transition status and capture details
    paymentRecord.status = 'captured';
    paymentRecord.paymentId = razorpay_payment_id;
    paymentRecord.signature = razorpay_signature;
    await paymentRecord.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and saved successfully',
      payment: paymentRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch detailed payment records by database _id or orderId
 * GET /api/payment/:id
 */
export const getPaymentDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Payment ID is required', 400));
    }

    // Determine query key: matches mongoose objectId structure or defaults to orderId check
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { orderId: id };

    const payment = await Payment.findOne(query);

    if (!payment) {
      return next(new AppError('Payment transaction not found', 404));
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// --- Cryptographic Prefill Link Helpers ---

// Derive a secure 32-byte key from the configured Razorpay Secret
const getEncryptionKey = (): Buffer => {
  const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || 'fallback_static_secret_32_bytes_long_key_secret';
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Encrypt details into a URL-safe Base64 Token
 */
const encryptData = (text: string): string => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Format token as iv_hex:encrypted_hex and translate to URL-safe Base64
  const payload = `${iv.toString('hex')}:${encrypted}`;
  return Buffer.from(payload).toString('base64url');
};

/**
 * Decrypt URL-safe Base64 Token back into plain text
 */
const decryptData = (token: string): string => {
  const key = getEncryptionKey();
  const rawPayload = Buffer.from(token, 'base64url').toString('utf8');
  
  const [ivHex, encryptedHex] = rawPayload.split(':');
  if (!ivHex || !encryptedHex) {
    throw new AppError('Invalid or corrupted encryption token format', 400);
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Encrypt customer details and return a shareable token code
 * POST /api/payment/encrypt
 */
export const encryptPayload = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerName, customerEmail, customerPhone, amount, tokenKey, order_id, orderId } = req.body;

    // Simple validations
    if (!customerName || !customerEmail || !customerPhone || !amount) {
      return next(new AppError('All billing fields (Name, Email, Phone, Amount) are required to generate a link', 400));
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return next(new AppError('Amount must be a positive number', 400));
    }

    const payloadObj = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      amount: String(amount),
      tokenKey: tokenKey ? String(tokenKey).trim() : '',
      order_id: (order_id || orderId || '').toString().trim(),
    };

    const tokenCode = encryptData(JSON.stringify(payloadObj));

    res.status(200).json({
      success: true,
      code: tokenCode,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Decrypt a token code back into billing details
 * POST /api/payment/decrypt
 */
export const decryptPayload = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      return next(new AppError('Encryption token code is required', 400));
    }

    const decryptedText = decryptData(code);
    const billingDetails = JSON.parse(decryptedText);

    res.status(200).json({
      success: true,
      data: billingDetails,
    });
  } catch (error) {
    // If decryption fails, JSON.parse will fail or decipher will fail
    next(new AppError('Failed to decrypt token code. It may be invalid or expired.', 400));
  }
};
