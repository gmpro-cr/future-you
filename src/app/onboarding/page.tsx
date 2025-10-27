'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { saveUserProfile, getUserProfile } from '@/lib/utils/userProfile';
import { createUserSession, isUserLoggedIn } from '@/lib/utils/auth';
import { DarkLayout } from '@/components/layouts/DarkLayout';

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
    country: '',
    profession: '',
  });

  // Check if user is already registered
  useEffect(() => {
    if (isUserLoggedIn()) {
      router.push('/personas');
      return;
    }

    // Load existing profile if any (for editing)
    const existingProfile = getUserProfile();
    if (existingProfile) {
      setFormData({
        name: existingProfile.name || '',
        birthdate: existingProfile.birthdate || '',
        country: existingProfile.country || '',
        profession: existingProfile.profession || '',
      });
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save user profile
    saveUserProfile(formData);

    // Create user session
    const userId = `user_${Date.now()}`; // Simple user ID generation
    createUserSession(userId, formData.name);

    // Redirect to personas page
    router.push('/personas');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isFormValid = formData.name && formData.birthdate && formData.country && formData.profession;

  return (
    <DarkLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4"
          >
            <User className="w-8 h-8 text-black" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Tell Us About Yourself</h1>
          <p className="text-white/70">
            Help us personalize your experience
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-black/60 rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
            </div>

            {/* Birthdate */}
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-white mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                id="birthdate"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent [color-scheme:dark]"
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-white mb-2">
                Country *
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent [&>option]:text-black [&>option]:bg-white"
              >
                <option value="">Select your country</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="IN">India</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="CN">China</option>
                <option value="BR">Brazil</option>
                <option value="MX">Mexico</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                <option value="NL">Netherlands</option>
                <option value="SE">Sweden</option>
                <option value="SG">Singapore</option>
                <option value="AE">United Arab Emirates</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Profession */}
            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-white mb-2">
                Profession *
              </label>
              <input
                type="text"
                id="profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                placeholder="e.g., Software Engineer, Teacher, Student"
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              type="submit"
              disabled={!isFormValid}
              className="w-full bg-white hover:bg-white/90 text-black flex items-center justify-center gap-2"
              size="lg"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-white/50 mt-6"
        >
          Your information is stored securely and never shared
        </motion.p>
        </motion.div>
      </div>
    </DarkLayout>
  );
}
