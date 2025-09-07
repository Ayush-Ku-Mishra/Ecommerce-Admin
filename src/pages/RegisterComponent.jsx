import React from "react";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { FcGoogle } from "react-icons/fc";

const RegisterComponent = ({
  register,
  handleSubmit,
  errors,
  showPassword,
  setShowPassword,
  handleGoogleSignIn,
  toggleLoginRegister,
}) => {
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MdPerson className="h-5 w-5 text-gray-600" />
          </div>
          <input
            type="text"
            placeholder="Enter your full name"
            {...register("name", { required: "Name is required" })}
            className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all duration-200 ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:ring-blue-500"
            } focus:border-transparent`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MdEmail className="h-5 w-5 text-gray-600" />
          </div>
          <input
            type="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
            className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all duration-200 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:ring-blue-500"
            } focus:border-transparent`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MdPhone className="h-5 w-5 text-gray-600" />
          </div>
          <input
            type="tel"
            placeholder="Enter your phone number"
            autoComplete="new-number"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Invalid phone number",
              },
            })}
            className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all duration-200 ${
              errors.phone
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:ring-blue-500"
            } focus:border-transparent`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MdLock className="h-5 w-5 text-gray-600" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="new-password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                message:
                  "Password must include uppercase, lowercase, number, and special character",
              },
            })}
            className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all duration-200 ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:ring-blue-500"
            } focus:border-transparent`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showPassword ? (
              <MdVisibilityOff className="h-5 w-5 text-gray-600" />
            ) : (
              <MdVisibility className="h-5 w-5 text-gray-600" />
            )}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Verification Method Radio Buttons */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Verify Account Via
          </label>
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                value="email"
                {...register("verificationMethod", {
                  required: "Select a verification method",
                })}
                defaultChecked
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700">Email OTP</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                value="phone"
                {...register("verificationMethod", {
                  required: "Select a verification method",
                })}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700">Phone OTP</span>
            </label>
          </div>
          {errors.verificationMethod && (
            <p className="text-red-500 text-xs mt-1">
              {errors.verificationMethod.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Create Account
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center py-6">
        <div className="border-t border-gray-300 flex-grow"></div>
        <span className="bg-transparent px-4 text-gray-600 text-sm font-medium">
          or
        </span>
        <div className="border-t border-gray-300 flex-grow"></div>
      </div>

      {/* Google Sign Up */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full bg-white border-2 border-blue-400 hover:border-blue-500 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <FcGoogle className="w-5 h-5" />
        <span className="text-blue-400">Sign Up With Google</span>
      </button>

      {/* Toggle Login */}
      <div className="text-center mt-6">
        <span className="text-gray-600">Already have an account? </span>
        <button
          type="button"
          onClick={toggleLoginRegister}
          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
        >
          Sign In
        </button>
      </div>
    </>
  );
};

export default RegisterComponent;
