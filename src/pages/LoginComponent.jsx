import React from "react";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";


const LoginComponent = ({
  register,
  handleSubmit,
  errors,
  showPassword,
  setShowPassword,
  setCurrentView,
  handleGoogleSignIn,
  toggleLoginRegister,
}) => {
  
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MdEmail className="h-5 w-5 text-gray-600" />
          </div>
          <input
            type="email"
            placeholder="enter your email"
            {...register("email", { required: "Email is required" })}
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

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MdLock className="h-5 w-5 text-gray-600" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="enter your password"
            autoComplete="new-password"
            {...register("password", { required: "Password is required" })}
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

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Sign In
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setCurrentView("forgotPassword")}
          className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors duration-200 hover:underline"
        >
          FORGOT PASSWORD
        </button>
      </div>

      <div className="relative flex items-center justify-center py-6">
        <div className="border-t border-gray-300 flex-grow"></div>
        <span className="bg-transparent px-4 text-gray-600 text-sm font-medium">
          or
        </span>
        <div className="border-t border-gray-300 flex-grow"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full bg-white border-2 border-blue-400 hover:border-blue-500 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <FcGoogle className="w-5 h-5" />
        <span className="text-blue-400">Sign In With Google</span>
      </button>

      <div className="text-center mt-6">
        <span className="text-gray-600">Don't have an account? </span>
        <button
          type="button"
          onClick={toggleLoginRegister}
          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
        >
          Register
        </button>
      </div>
    </>
  );
};

export default LoginComponent;
