import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  encryptPayload,
  decryptPayload,
} from '../controllers/payment.controller.js';

const router = Router();

// Routes prefix is managed in server.ts (e.g., /api/payment)
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/encrypt', encryptPayload);
router.post('/decrypt', decryptPayload);
router.get('/:id', getPaymentDetails);

export default router;
