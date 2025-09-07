import React, { useState, useContext } from "react";
import { MdEmail, MdArrowBack, MdKey } from "react-icons/md";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = ({ onBack }) => {
  const { isAuthenticated } = useContext(Context);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [forgotEmail, setForgotEmail] = useState("");

  const onForgotPasswordSubmit = async (data) => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/user/password/forgot",
        { email: data.email },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(`Password reset link sent to ${data.email}! 📧`);
      setForgotEmail(data.email);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link. Please try again.");
    }
  };

  const handleBackNavigation = () => {
    reset();
    if (onBack) onBack();
  };

  return (
    <div className="space-y-6">
      <button
        onClick={handleBackNavigation}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        type="button"
      >
        <MdArrowBack className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium">Back to Login</span>
      </button>

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <MdKey className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Reset Your Password</h3>
        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you a password reset link.
        </p>
        {forgotEmail && (
          <p className="text-sm text-green-600 mt-2">
            Reset link sent to: <span className="font-medium">{forgotEmail}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onForgotPasswordSubmit)} className="space-y-4" noValidate>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MdEmail className="h-5 w-5 text-gray-600" />
          </div>
          <input
            type="email"
            placeholder="Enter your email"
            {...register("email", { required: "Email is required" })}
            className={`w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
              errors.email ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
