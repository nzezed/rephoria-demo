'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    plan: 'solo',
    numReps: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          // Handle validation errors
          const errorMessage = data.errors.map((err: any) => err.message).join(', ');
          setError(errorMessage);
        } else {
          setError(data.message || 'Signup failed');
        }
        return;
      }

      setSuccess('Signup successful! Redirecting to dashboard...');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Start Your Free Trial</h1>
          <p className="text-xl text-gray-300">
            Get started with Rephoria and transform your call center today.
          </p>
        </motion.div>

        <div className="bg-white/5 rounded-xl p-8">
          {/* Progress Steps */}
          <div className="flex justify-between mb-12">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#ff4f58]' : 'bg-white/10'}`}>
                1
              </div>
              <div className="ml-2">Account</div>
            </div>
            <div className="flex-1 h-1 mx-4 bg-white/10 my-auto" />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#ff4f58]' : 'bg-white/10'}`}>
                2
              </div>
              <div className="ml-2">Plan</div>
            </div>
            <div className="flex-1 h-1 mx-4 bg-white/10 my-auto" />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#ff4f58]' : 'bg-white/10'}`}>
                3
              </div>
              <div className="ml-2">Payment</div>
            </div>
          </div>

          {/* Step 1: Account Information */}
          {step === 1 && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f58]"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Work Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f58]"
                  required
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f58]"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f58]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#ff4f58] hover:bg-[#ff4f58]/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                Continue to Plan Selection <ArrowRight className="w-5 h-5" />
              </button>
            </motion.form>
          )}

          {/* Step 2: Plan Selection */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div 
                  className={`p-6 rounded-lg cursor-pointer transition-colors ${
                    formData.plan === 'solo' ? 'bg-[#ff4f58]/20 border-2 border-[#ff4f58]' : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => setFormData({ ...formData, plan: 'solo' })}
                >
                  <h3 className="text-xl font-semibold mb-4">Solo</h3>
                  <p className="text-3xl font-bold mb-4">$49<span className="text-lg text-gray-400">/mo/user</span></p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#ff4f58]" />
                      <span>1 Rep</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#ff4f58]" />
                      <span>Basic Analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#ff4f58]" />
                      <span>AI Follow-ups</span>
                    </li>
                  </ul>
                </div>
                <div 
                  className={`p-6 rounded-lg cursor-pointer transition-colors ${
                    formData.plan === 'scale' ? 'bg-[#ff4f58]/20 border-2 border-[#ff4f58]' : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => setFormData({ ...formData, plan: 'scale' })}
                >
                  <div className="bg-[#ff4f58] text-white px-3 py-1 rounded-full text-sm inline-block mb-4">
                    Popular
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Scale</h3>
                  <p className="text-3xl font-bold mb-4">$41<span className="text-lg text-gray-400">/mo/user</span></p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#ff4f58]" />
                      <span>2-8 Reps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#ff4f58]" />
                      <span>Advanced Analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#ff4f58]" />
                      <span>Script Omega</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#ff4f58]" />
                      <span>Team Leaderboards</span>
                    </li>
                  </ul>
                </div>
                <div 
                  className={`p-6 rounded-lg cursor-pointer transition-colors ${
                    formData.plan === 'enterprise' ? 'bg-[#ff4f58]/20 border-2 border-[#ff4f58]' : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => setFormData({ ...formData, plan: 'enterprise' })}
                >
                  <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
                  <p className="text-3xl font-bold mb-4">$30<span className="text-lg text-gray-400">/mo/user</span></p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#ff4f58]" />
                      <span>8+ Reps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#ff4f58]" />
                      <span>Custom Analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#ff4f58]" />
                      <span>Priority Support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#ff4f58]" />
                      <span>Custom Integrations</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <label htmlFor="numReps" className="block text-sm font-medium mb-2">
                  Number of Reps
                </label>
                <input
                  type="number"
                  id="numReps"
                  min={formData.plan === 'solo' ? 1 : formData.plan === 'scale' ? 2 : 8}
                  max={formData.plan === 'solo' ? 1 : formData.plan === 'scale' ? 8 : 100}
                  value={formData.numReps}
                  onChange={(e) => setFormData({ ...formData, numReps: parseInt(e.target.value) })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f58]"
                  required
                />
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-[#ff4f58] hover:bg-[#ff4f58]/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  Continue to Payment <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-white/5 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Plan</span>
                    <span className="font-semibold">{formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Reps</span>
                    <span className="font-semibold">{formData.numReps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per Rep</span>
                    <span className="font-semibold">
                      ${formData.plan === 'solo' ? 49 : formData.plan === 'scale' ? 41 : 30}/mo
                    </span>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>
                        ${formData.numReps * (formData.plan === 'solo' ? 49 : formData.plan === 'scale' ? 41 : 30)}/mo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Payment Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f58]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        placeholder="MM/YY"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f58]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        placeholder="123"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f58]"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  className="bg-[#ff4f58] hover:bg-[#ff4f58]/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="text-center mt-8 text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-[#ff4f58] hover:text-[#ff4f58]/90 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
} 