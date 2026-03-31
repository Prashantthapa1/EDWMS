"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FormCard from "@/components/ui/form-card";
import FormInput from "@/components/ui/form-input";
import SubmitButton from "@/components/ui/submit-button";
import AnimatedCheckbox from "@/components/ui/checkbox";

export default function RegisterForm({ onSubmit, loading }) {
  const router = useRouter();
  const [terms, setTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!terms) {
      setError('You must agree to the terms');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (onSubmit) {
      // Send only necessary fields to backend
      const { confirmPassword, ...userData } = formData;
      onSubmit(userData);
    }
  };

  return (
    <FormCard title="Create Account">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <FormInput
          label="Full Name"
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Password"
          type="password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <AnimatedCheckbox
            label="I agree to the terms"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
          />
        </div>

        <SubmitButton loading={loading}>Create Account</SubmitButton>

        <p className="text-center text-sm text-gray-600">
          Already have an account?
          <span 
            className="text-blue-500 ml-1 cursor-pointer hover:underline"
            onClick={() => router.push('/auth/login')}
          >
            Login
          </span>
        </p>
      </form>
    </FormCard>
  );
}