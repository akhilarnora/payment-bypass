import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { SuccessView } from '../components/SuccessView.js';
import { FailureView } from '../components/FailureView.js';
import { Loader } from '../components/Loader.js';
import { Layout } from '../components/Layout.js';
import { API_BASE_URL } from '../config.js';
import type { PaymentFormData, PaymentDetails, CreateOrderResponse, VerifyResponse } from '../types.js';

type AppState = 'FORM' | 'LOADING' | 'SUCCESS' | 'FAILURE';

export const CheckoutPage: React.FC = () => {
  const [state, setState] = useState<AppState>('FORM');
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [decryptedOrderId, setDecryptedOrderId] = useState<string>('');

  const location = useLocation();
  const navigate = useNavigate();

  // Helper to dynamically inject the Razorpay SDK Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSubmit = async (formData: PaymentFormData) => {
    setState('LOADING');
    setLoadingMessage('Initializing secure gateway connection...');

    try {
      // 1. Create order on the Express Backend
      const orderRequest = {
        amount: Number(formData.amount),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        tokenKey: formData.tokenKey,
      };

      const orderResponse = await axios.post<CreateOrderResponse>(
        `${API_BASE_URL}/create-order`,
        orderRequest
      );

      const { order, key } = orderResponse.data;

      // 2. Load the Razorpay SDK script
      setLoadingMessage('Loading secure checkout module...');
      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded) {
        toast.error('Failed to load Razorpay payment SDK. Check your internet connection.');
        setErrorMessage('Failed to load Razorpay checkout script.');
        setState('FAILURE');
        return;
      }

      // 3. Configure Razorpay checkout options
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: 'ozyqr Payments',
        description: 'Secure Checkout Payment Portal',
        image: '', // Beautiful placeholder logo
        order_id: order.id,
        handler: async (response: any) => {
          setState('LOADING');
          setLoadingMessage('Verifying payment signature and finalizing transaction...');

          try {
            // Send transaction tokens to verification endpoint
            const verificationPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const verifyResponse = await axios.post<VerifyResponse>(
              `${API_BASE_URL}/verify`,
              verificationPayload
            );

            if (response && response.razorpay_order_id) {
              setPaymentDetails(verifyResponse?.data?.payment || null);
              toast.success('Payment completed!');
              setState('LOADING');
              setLoadingMessage('Redirecting to merchant...');

              // Construct a form to perform a POST redirect to the merchant target URL
              const redirectUrl = 'https://ozyqr.com/payment-process';
              const form = document.createElement('form');
              form.method = 'POST';
              form.action = redirectUrl;

              const addHiddenField = (name: string, value: string) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                form.appendChild(input);
              };

              // 1. Add Razorpay response fields
              addHiddenField('razorpay_order_id', response.razorpay_order_id);
              addHiddenField('razorpay_payment_id', response.razorpay_payment_id || '');
              addHiddenField('razorpay_signature', response.razorpay_signature || '');

              // Add original merchant order_id from decrypt payload if present
              if (decryptedOrderId) {
                addHiddenField('order_id', decryptedOrderId);
              }

              // 2. Add verification response metadata
              addHiddenField('success', String(verifyResponse?.data?.success || false));
              addHiddenField('message', verifyResponse?.data?.message || '');

              // 3. Add individual payment details if present
              if (verifyResponse?.data?.payment) {
                const payment = verifyResponse.data.payment;
                addHiddenField('payment', JSON.stringify(payment));
                Object.entries(payment).forEach(([key, val]) => {
                  if (val !== undefined && val !== null) {
                    addHiddenField(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
                  }
                });
              }

              // 4. Add the full raw response as 'response' and 'payload' string fields
              if (verifyResponse?.data) {
                addHiddenField('response', JSON.stringify(verifyResponse.data));
                addHiddenField('payload', JSON.stringify(verifyResponse.data));
              }

              // Log details to console for easy debugging

              console.groupEnd();

              document.body.appendChild(form);

              // Delay redirect by 3 seconds to allow DevTools to load and display the verification response.
              setTimeout(() => {
                form.submit();
              }, 3000);
            } else {
              throw new Error('Invalid Razorpay response received.');
            }
          } catch (verifyError: any) {
            console.error('Verification Error:', verifyError);
            const errText =
              verifyError.response?.data?.message ||
              verifyError.message ||
              'Failed to verify signature.';
            toast.error(errText);
            setErrorMessage(errText);
            setState('FAILURE');
          }
        },
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone,
        },
        notes: {
          address: 'ozyqr Corporate Office',
        },
        theme: {
          color: '#4f46e5', // Indigo 600
        },
        modal: {
          ondismiss: () => {
            toast.dismiss();
            toast('Payment session closed by user.', { icon: 'ℹ️' });
            setState('FORM');
          },
        },
      };

      // 4. Open Razorpay Checkout modal
      toast.dismiss();
      setState('FORM'); // Keep form visible beneath, but loader is gone.
      const razorpayInstance = new (window as any).Razorpay(options);

      // Handle opening failures
      razorpayInstance.on('payment.failed', (response: any) => {
        console.error('Payment failure event:', response.error);
        toast.error(response.error.description || 'Payment transaction failed.');
        setErrorMessage(response.error.description || 'Transaction execution failed.');
        setState('FAILURE');
      });

      razorpayInstance.open();
    } catch (orderError: any) {
      console.error('Order Creation Error:', orderError);
      const errText =
        orderError.response?.data?.message ||
        orderError.message ||
        'Failed to connect to the payment server.';
      toast.error(errText);
      setErrorMessage(errText);
      setState('FAILURE');
    }
  };

  // Check URL query parameters on mount to support encrypted pre-fill links & auto checkouts
  useEffect(() => {
    const handleUrlPrefill = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      if (code) {
        setState('LOADING');
        setLoadingMessage('Decrypting secure checkout prefill code...');
        try {
          const response = await axios.post(API_BASE_URL + `/decrypt`, { code });
          if (response.data.success && response.data.data) {
            const data = response.data.data;
            console.log("data", data);

            if (data.order_id) {
              setDecryptedOrderId(data.order_id);
            }
            toast.success('Customer details pre-filled successfully!');

            // Auto open the Razorpay payment gateway immediately
            await handlePaymentSubmit(data);
          } else {
            setState('FORM');
          }
        } catch (err: any) {
          console.error('Decryption load failure:', err);
          toast.error('The payment link is invalid or has expired.');
          setState('FORM');
        }
      }
    };
    handleUrlPrefill();
  }, []);

  const handleReset = () => {
    setPaymentDetails(null);
    setErrorMessage('');
    setState('FORM');
  };

  const hasCode = new URLSearchParams(location.search).has('code');

  return (
    <Layout>
      {state === 'LOADING' && <Loader message={loadingMessage} />}

      {(state === 'FORM' || state === 'LOADING') && (
        !hasCode ? (
          <div className="w-full max-w-md glass-panel rounded-2xl p-8 text-center animate-scale-in glow-indigo">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400 text-xl mx-auto mb-4">
              🔗
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Payment Gateway</h3>
            <p className="text-xs text-slate-400 mb-6">
              This is a secure direct checkout portal. To make a payment, please use a shareable prefilled payment link.
            </p>
            <button
              onClick={() => {
                navigate('/generate');
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
            >
              Go to Link Generator
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md glass-panel rounded-2xl p-8 text-center animate-scale-in glow-indigo">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400 text-xl mx-auto mb-4 animate-pulse">
              🔒
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Checkout Session</h3>
            <p className="text-xs text-slate-400">
              Connecting to Razorpay gateway. Please complete the transaction in the popup window.
            </p>
          </div>
        )
      )}

      {state === 'SUCCESS' && paymentDetails && (
        <SuccessView payment={paymentDetails} onReset={handleReset} />
      )}

      {state === 'FAILURE' && (
        <FailureView errorMessage={errorMessage} onRetry={handleReset} />
      )}
    </Layout>
  );
};

export default CheckoutPage;
