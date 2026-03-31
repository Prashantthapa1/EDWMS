"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FormCard from "@/components/ui/form-card";
import FormInput from "@/components/ui/form-input";
import SubmitButton from "@/components/ui/submit-button";
import AnimatedCheckbox from "@/components/ui/checkbox";

export default function LoginForm({ onSubmit, loading }) {
  const router = useRouter();
  const [remember, setRemember] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <FormCard title="Login">
      <form onSubmit={handleSubmit}>
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
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="flex justify-between items-center text-sm">
          <AnimatedCheckbox
            label="Remember me"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />

          <span className="text-blue-500 cursor-pointer hover:underline">
            Forgot password?
          </span>
        </div>

        <SubmitButton loading={loading}>Sign In</SubmitButton>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?
          <span 
            className="text-blue-500 ml-1 cursor-pointer hover:underline"
            onClick={() => router.push('/auth/register')}
          >
            Sign up
          </span>
        </p>
      </form>
    </FormCard>
  );
}