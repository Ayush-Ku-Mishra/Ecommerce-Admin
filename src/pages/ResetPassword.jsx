import React, { useState } from "react";
import {
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdArrowBack,
} from "react-icons/md";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const newPasswordValue = watch("newPassword");
  const navigate = useNavigate();
  const { token } = useParams();

  const onSubmit = async (data) => {
    const { newPassword, confirmPassword } = data;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    try {
      await axios.put(
        `http://localhost:8000/api/v1/user/password/reset/${token}`,
        { password: newPassword, confirmPassword },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success("Password reset successful! Please login.");
      reset();
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset password failed");
    }
  };

  const handleBackNavigation = () => {
    reset();
    navigate("/login");
  };

  return (
    <div className="space-y-6">
      <button
        onClick={handleBackNavigation}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        type="button"
      >
        <MdArrowBack className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <MdLock className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Set New Password
        </h3>
        <p className="text-sm text-gray-600">
          Create a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* New Password */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MdLock className="h-5 w-5 text-gray-600" />
          </div>
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="enter new password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all duration-200 ${
              errors.newPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:ring-green-500"
            } focus:border-transparent`}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
            aria-label={showNewPassword ? "Hide password" : "Show password"}
          >
            {showNewPassword ? (
              <MdVisibilityOff className="h-5 w-5 text-gray-600" />
            ) : (
              <MdVisibility className="h-5 w-5 text-gray-600" />
            )}
          </button>
          {errors.newPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MdLock className="h-5 w-5 text-gray-600" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="confirm new password"
            {...register("confirmPassword", {
              required: "Please confirm your new password",
              validate: (value) =>
                value === newPasswordValue || "Passwords do not match",
            })}
            className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all duration-200 ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:ring-green-500"
            } focus:border-transparent`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <MdVisibilityOff className="h-5 w-5 text-gray-600" />
            ) : (
              <MdVisibility className="h-5 w-5 text-gray-600" />
            )}
          </button>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            !newPasswordValue || watch("confirmPassword") !== newPasswordValue
          }
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
            newPasswordValue && watch("confirmPassword") === newPasswordValue
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
