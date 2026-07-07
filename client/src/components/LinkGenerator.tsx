import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface LinkGeneratorProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const LinkGenerator: React.FC<LinkGeneratorProps> = ({ isLoading, setIsLoading }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    amount: '',
    tokenKey: '',
  });

  const [generatedLink, setGeneratedLink] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
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
      tempErrors.customerPhone = 'Phone must be 10-15 digits';
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/payment/encrypt', {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        amount: formData.amount,
        tokenKey: formData.tokenKey,
      });

      if (response.data.success) {
        const shareableUrl = `${window.location.origin}${import.meta.env.BASE_URL}?code=${response.data.code}`;
        setGeneratedLink(shareableUrl);
        toast.success('Prefill payment link generated!');
      } else {
        throw new Error(response.data.message || 'Encryption failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to encrypt details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="w-full max-w-md glass-panel rounded-2xl overflow-hidden shadow-2xl animate-scale-in glow-indigo p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1.5 flex items-center space-x-2">
          <span>🔗</span>
          <span>Link Generator</span>
        </h2>
        <p className="text-xs text-slate-400">
          Enter customer details to generate an encrypted checkout link. The link automatically pre-fills the checkout form when visited.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Customer Name
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm ${
              errors.customerName ? 'border-rose-500 focus:ring-rose-500' : ''
            }`}
          />
          {errors.customerName && <p className="mt-1 text-xs text-rose-400">{errors.customerName}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Customer Email
          </label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="john@example.com"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm ${
              errors.customerEmail ? 'border-rose-500 focus:ring-rose-500' : ''
            }`}
          />
          {errors.customerEmail && <p className="mt-1 text-xs text-rose-400">{errors.customerEmail}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Customer Phone
          </label>
          <input
            type="tel"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            placeholder="9876543210"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 rounded-lg glass-input text-sm ${
              errors.customerPhone ? 'border-rose-500 focus:ring-rose-500' : ''
            }`}
          />
          {errors.customerPhone && <p className="mt-1 text-xs text-rose-400">{errors.customerPhone}</p>}
        </div>

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
              placeholder="500"
              disabled={isLoading}
              min="1"
              step="any"
              className={`w-full pl-8 pr-4 py-2.5 rounded-lg glass-input text-sm ${
                errors.amount ? 'border-rose-500 focus:ring-rose-500' : ''
              }`}
            />
          </div>
          {errors.amount && <p className="mt-1 text-xs text-rose-400">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Token Key / Reference ID (Optional)
          </label>
          <input
            type="text"
            name="tokenKey"
            value={formData.tokenKey}
            onChange={handleChange}
            placeholder="e.g. INV-10024"
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] disabled:opacity-50 transition-all duration-150"
        >
          {isLoading ? 'Generating Link...' : 'Generate Prefill Link'}
        </button>
      </form>

      {generatedLink && (
        <div className="pt-4 border-t border-slate-800 space-y-2 animate-fade-in">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Generated Link
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              readOnly
              value={generatedLink}
              className="flex-1 px-3 py-2 rounded-lg glass-input text-xs font-mono select-all truncate bg-slate-900"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold active:scale-[0.97] transition-all duration-150"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
