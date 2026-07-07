import React, { useState, useEffect } from 'react';
import type { PaymentFormData } from '../types.js';

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  isLoading: boolean;
  prefilledData?: PaymentFormData | null;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, isLoading, prefilledData }) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    customerName: 'Akhil',
    customerEmail: 'akhilmohan2424@gmail.com',
    customerPhone: '7907160645',
    amount: '1',
    tokenKey: '',
  });

  useEffect(() => {
    if (prefilledData) {
      setFormData(prefilledData);
    }
  }, [prefilledData]);

  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});

  const validate = (): boolean => {
    const tempErrors: Partial<Record<keyof PaymentFormData, string>> = {};
    let isValid = true;

    if (!formData.customerName.trim()) {
      tempErrors.customerName = 'Name is required';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customerEmail.trim()) {
      tempErrors.customerEmail = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.customerEmail)) {
      tempErrors.customerEmail = 'Invalid email format';
      isValid = false;
    }

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!formData.customerPhone.trim()) {
      tempErrors.customerPhone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.customerPhone.replace(/[\s-]/g, ''))) {
      tempErrors.customerPhone = 'Phone must be between 10-15 digits';
      isValid = false;
    }

    if (!formData.amount) {
      tempErrors.amount = 'Amount is required';
      isValid = false;
    } else {
      const amtNum = Number(formData.amount);
      if (isNaN(amtNum) || amtNum <= 0) {
        tempErrors.amount = 'Amount must be greater than 0';
        isValid = false;
      }
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user begins typing
    if (errors[name as keyof PaymentFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-md glass-panel rounded-2xl overflow-hidden shadow-2xl animate-scale-in glow-indigo">
      {/* Dynamic Ticket Preview Header */}
      <div className="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white relative">
        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚡</span>
            <span className="font-bold tracking-wider text-sm">PAYMENT TICKET</span>
          </div>
          <div className="h-6 w-10 bg-white/10 rounded-md border border-white/20 flex items-center justify-center text-[10px] font-mono">
            SECURE
          </div>
        </div>

        <div className="mb-4">
          <span className="text-xs text-indigo-200 block uppercase tracking-wider">Amount to Pay</span>
          <span className="text-3xl font-extrabold tracking-tight">
            ₹{formData.amount ? Number(formData.amount).toLocaleString('en-IN') : '0.00'}
          </span>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] text-indigo-200 block uppercase tracking-wider">Customer Name</span>
            <span className="text-sm font-medium tracking-wide uppercase truncate max-w-[240px] block">
              {formData.customerName.trim() || 'John Doe'}
            </span>
          </div>
          <span className="text-xs font-mono text-indigo-200">Razorpay Pay</span>
        </div>
      </div>

      {/* Input Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Name input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm ${errors.customerName ? 'border-rose-500 focus:ring-rose-500' : ''
              }`}
          />
          {errors.customerName && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{errors.customerName}</p>
          )}
        </div>

        {/* Email input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="e.g. john@example.com"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm ${errors.customerEmail ? 'border-rose-500 focus:ring-rose-500' : ''
              }`}
          />
          {errors.customerEmail && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{errors.customerEmail}</p>
          )}
        </div>

        {/* Phone input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm ${errors.customerPhone ? 'border-rose-500 focus:ring-rose-500' : ''
              }`}
          />
          {errors.customerPhone && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{errors.customerPhone}</p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Amount (INR)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g. 500"
              disabled={isLoading}
              min="1"
              step="any"
              className={`w-full pl-8 pr-4 py-2.5 rounded-lg glass-input text-sm ${errors.amount ? 'border-rose-500 focus:ring-rose-500' : ''
                }`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{errors.amount}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-150"
        >
          {isLoading ? 'Processing Order...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};
