import React, { useState } from "react";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import Logo from "../assets/PickoraLogo1.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in clicked");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/premium-photo/white-minimal-geometry-background_231311-1693.jpg')",
      }}
    >
      <div className="w-full max-w-sm bg-transparent rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          {/* Logo Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-2">
              <img
                src="/PickoraFavicon.png"
                alt="Image 1"
                className="w-10 h-10 sm:w-11 sm:h-11 md:w-11 md:h-11 rounded-full object-cover"
              />
            </div>
            <img
              src={Logo}
              alt="ECOMMERCE Logo"
              className="mx-auto h-10 sm:h-10 md:h-12"
            />
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MdEmail className="h-5 w-5 text-gray-600" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MdLock className="h-5 w-5 text-gray-600" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="enter your password"
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <MdVisibilityOff className="h-5 w-5 text-gray-600 hover:text-gray-600" />
                ) : (
                  <MdVisibility className="h-5 w-5 text-gray-600 hover:text-gray-600" />
                )}
              </button>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors duration-200"
              >
                FORGOT PASSWORD
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-4">
              <div className="border-t border-gray-300 flex-grow"></div>
              <span className="bg-transparent px-4 text-gray-600 text-sm font-medium">
                or
              </span>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white border-2 border-blue-400 hover:border-blue-500 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <FcGoogle className="w-5 h-5" />
              <span className="text-blue-400">Sign In With Google</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600">Don't have an account? </span>
            <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
