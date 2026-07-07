import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;

if (!keyId || !keySecret) {
  console.error('CRITICAL: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET (RAZORPAY_SECRET) is missing from environment configuration.');
}

export const razorpayInstance = new Razorpay({
  key_id: keyId || '',
  key_secret: keySecret || '',
});
