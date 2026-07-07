# Razorpay Payment Gateway Integration Application (TypeScript)

A full-stack, production-ready secure payment application built in TypeScript using **React (Vite)**, **Node.js + Express**, **MongoDB (Mongoose)**, and **Tailwind CSS**.

---

## Technical Architecture

The application is structured into two main subprojects:

- **`/server`**: Node.js & Express REST API backend written in TypeScript, managing orders, verifying signatures with HMAC-SHA256, and storing payment transactions in MongoDB.
- **`/client`**: React & Vite single-page application styled using Tailwind CSS, featuring active form validations, a real-time ticket preview, full-screen load overlays, and dynamic Razorpay script loading.

---

## Features

- **End-to-End TypeScript**: Complete type safety on both backend database schemas/endpoints and frontend React forms/API calls.
- **Dynamic Script Loading**: Razorpay Checkout SDK is loaded dynamically on runtime demand.
- **Signature Integrity Check**: Implements HmacSHA256 local verification matching Razorpay's protocol to defend against client-side status tampering.
- **Dynamic Ticket Canvas**: A visual payment ticket on the UI that updates client information and amounts dynamically.
- **Micro-Animations**: Custom loader state, glassmorphic inputs, scale/fade entries, and confetti celebration effects.
- **Robust Error Boundary**: Global centralized Express error handler mapping HTTP states.

---

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally (default: `mongodb://localhost:27017`) or a MongoDB Atlas URI.
- A Razorpay Account (sign up at [razorpay.com](https://razorpay.com) and retrieve test API keys from **Settings > API Keys**).

---

### Step 1: Configure Backend Environment

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Copy the configuration template file `.env.example` into a new `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your actual Razorpay Key ID, Secret, and MongoDB connection details:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/payment-bypass
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   CLIENT_URL=http://localhost:5173
   ```

---

### Step 2: Install Dependencies

In the root of the project, execute the following commands to install dependencies:

```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

---

### Step 3: Run the Application

#### Development Mode (HMR Enabled)

Open two terminals and start each project:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
*App will start on [http://localhost:5000](http://localhost:5000)*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*App will start on [http://localhost:5173](http://localhost:5173)*

---

#### Production Mode (Built Assemblies)

Compile and launch compiled builds:

**Build and Start Backend:**
```bash
cd server
npm run build
npm start
```

**Build and Serve Frontend:**
```bash
cd client
npm run build
```

---

## API Documentation

### 1. Create Razorpay Order
- **Endpoint**: `POST /api/payment/create-order`
- **Payload**:
  ```json
  {
    "amount": 499.50,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "9876543210"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "order": {
      "id": "order_O1Z0jB5H6k124",
      "amount": 49950,
      "currency": "INR",
      "receipt": "rcpt_1688921..."
    },
    "key": "rzp_test_..."
  }
  ```

### 2. Verify Payment Signature
- **Endpoint**: `POST /api/payment/verify`
- **Payload**:
  ```json
  {
    "razorpay_order_id": "order_O1Z0jB5H6k124",
    "razorpay_payment_id": "pay_O1Z2uA8K3p748",
    "razorpay_signature": "63f8202d57c..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Payment verified and saved successfully",
    "payment": {
      "_id": "64aa123b0...",
      "orderId": "order_O1Z0jB5H6k124",
      "paymentId": "pay_O1Z2uA8K3p748",
      "signature": "63f8202d57c...",
      "amount": 499.50,
      "currency": "INR",
      "receipt": "rcpt_1688921...",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "9876543210",
      "status": "captured",
      "createdAt": "2026-07-03T11:45:00.000Z",
      "updatedAt": "2026-07-03T11:45:10.000Z"
    }
  }
  ```

### 3. Fetch Transaction Details
- **Endpoint**: `GET /api/payment/:id`
- **Parameters**: `id` can be either the MongoDB Object ID (`_id`) or the Razorpay Order ID (`orderId`).
- **Response**: Returns the JSON document of the payment record.

---

## Security Protocols Implemented
1. **Confidential Secret Preservation**: The Razorpay Key Secret is exclusively loaded on the environment and never output to API responses or the frontend.
2. **CORS Restrictions**: Express restricts origin endpoints to the designated `CLIENT_URL` configurations.
3. **Cryptographic Signature Comparison**: Compares the SHA256 HMAC hash constructed from the order ID and payment ID against Razorpay's digital signature using timing-safe buffer comparison.
4. **Data Sanitization**: Form data inputs are sanitized (trimming, format matching, low-case conversion) before MongoDB write actions or external gateway transmissions.
