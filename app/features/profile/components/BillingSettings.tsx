'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/providers/UserProvider';
import { CreditCard, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { formatCardNumber, formatExpiryDate } from '@/lib/utils/payment';

const defaultForm = {
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardholderName: '',
  billingEmail: '',
  billingAddress: '',
  billingCity: '',
  billingState: '',
  billingZip: '',
  billingCountry: 'US',
};

export default function BillingSettings() {
  const { user, updatePaymentDetails, isLoading } = useUser();
  const [formData, setFormData] = useState(defaultForm);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.paymentMethod && user?.billingInfo) {
      const pm = user.paymentMethod;
      const bi = user.billingInfo;
      setFormData({
        cardNumber: formatCardNumber(pm.cardNumber),
        expiryDate: pm.expiryDate,
        cvv: pm.cvv,
        cardholderName: pm.cardholderName,
        billingEmail: bi.email,
        billingAddress: bi.address,
        billingCity: bi.city,
        billingState: bi.state,
        billingZip: bi.zip,
        billingCountry: bi.country,
      });
    } else {
      setFormData(defaultForm);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      setFormData(prev => ({ ...prev, [name]: formatCardNumber(value) }));
    } else if (name === 'expiryDate') {
      setFormData(prev => ({ ...prev, [name]: formatExpiryDate(value) }));
    } else if (name === 'cvv') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').substring(0, 4) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
    setSuccess(false);
  };

  const validate = () => {
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
      setError('Please enter a valid card number');
      return false;
    }
    if (!formData.expiryDate || formData.expiryDate.length !== 5) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      setError('Please enter a valid CVV');
      return false;
    }
    if (!formData.cardholderName.trim()) {
      setError('Please enter the cardholder name');
      return false;
    }
    if (!formData.billingEmail.trim() || !formData.billingEmail.includes('@')) {
      setError('Please enter a valid billing email');
      return false;
    }
    if (!formData.billingAddress.trim()) {
      setError('Please enter a billing address');
      return false;
    }
    if (!formData.billingCity.trim()) {
      setError('Please enter a city');
      return false;
    }
    if (!formData.billingZip.trim()) {
      setError('Please enter a ZIP code');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setSuccess(false);
    try {
      await updatePaymentDetails({
        paymentMethod: {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          cardholderName: formData.cardholderName,
        },
        billingInfo: {
          email: formData.billingEmail,
          address: formData.billingAddress,
          city: formData.billingCity,
          state: formData.billingState,
          zip: formData.billingZip,
          country: formData.billingCountry,
        },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save payment details');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Payment & Billing Address
        </h3>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Save your card and billing details here. They will be used when you subscribe to a plan.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Card Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Card Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Expiry (MM/YY)</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Cardholder Name</label>
              <input
                type="text"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Billing Address</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email</label>
              <input
                type="email"
                name="billingEmail"
                value={formData.billingEmail}
                onChange={handleChange}
                placeholder="billing@example.com"
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Address</label>
              <input
                type="text"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleChange}
                placeholder="123 Main St"
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">City</label>
                <input
                  type="text"
                  name="billingCity"
                  value={formData.billingCity}
                  onChange={handleChange}
                  placeholder="New York"
                  className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">State</label>
                <input
                  type="text"
                  name="billingState"
                  value={formData.billingState}
                  onChange={handleChange}
                  placeholder="NY"
                  className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="billingZip"
                  value={formData.billingZip}
                  onChange={handleChange}
                  placeholder="10001"
                  className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Country</label>
                <select
                  name="billingCountry"
                  value={formData.billingCountry}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-600 dark:text-green-400">Payment details saved!</p>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Your payment information is stored securely and used only when you subscribe to a plan.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Payment Details'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
