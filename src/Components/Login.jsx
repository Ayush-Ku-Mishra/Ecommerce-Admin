import React, { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import Logo from "../assets/PickoraLogo1.png";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import LoginComponent from "../pages/LoginComponent";
import RegisterComponent from "../pages/RegisterComponent";
import OtpVerification from "../pages/OtpVerification";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "../firebase";
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const Login = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();

  // Add login/register toggle state
  const [isLogin, setIsLogin] = useState(true);

  // Views: otp, forgotPassword, resetPassword
  const [currentView, setCurrentView] = useState("login");
  const [resetEmail, setResetEmail] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false); // loader state

  // We will store registration email/phone for OTP screen if needed.
  const [registerData, setRegisterData] = useState({ email: "", phone: "" });

  // Sync isLogin and currentView for login/register toggling
  useEffect(() => {
    if (isLogin && currentView !== "login") {
      setCurrentView("login");
    } else if (!isLogin && currentView !== "register") {
      setCurrentView("register");
    }
  }, [isLogin]);

  // Using react-hook-form for login and register forms
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Show password state for login and registration password fields
  const [showPassword, setShowPassword] = useState(false);

  // Determine where to redirect after login (Wishlist page or home)
  const redirectTo = location.state?.from?.pathname || "/";

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = async (data) => {
    if (currentView === "register") {
      setRegisterLoading(true); // show loader
      data.phone = data.phone.startsWith("+91")
        ? data.phone
        : `+91${data.phone}`;
      console.log("=== REGISTER DEBUG ===");
      console.log("VITE_BACKEND_URL:", import.meta.env.VITE_BACKEND_URL);
      console.log(
        "Full URL:",
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/register`
      );
      console.log("Data being sent:", data);
      console.log("====================");
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/register`,
          data,
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        toast.success(response.data.message);
        setRegisterData({
          email: data.email,
          phone: data.phone,
          verificationMethod: data.verificationMethod, // user’s actual choice
        });
        setCurrentView("otp");
      } catch (error) {
        toast.error(error.response?.data?.message || "Registration failed");
      } finally {
        setRegisterLoading(false); // hide loader after request
      }
      return;
    }

    if (currentView === "login") {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/login`,
          { email: data.email, password: data.password },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        toast.success(response.data.message);
        setIsAuthenticated(true);
        setUser(response.data.user);
        navigate(redirectTo, { replace: true }); // <--- Redirect to wishlist or home
      } catch (error) {
        toast.error(error.response?.data?.message || "Login failed");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setRegisterLoading(true);

    try {
      // Configure popup to avoid CORS issues
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");

      console.log("🚀 Starting Google Sign-In...");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google Sign-In Result:", user);

      // Prepare user data for backend
      const userData = {
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL || "",
        phone: user.phoneNumber || null,
        role: "user",
      };

      console.log("Sending user data to backend:", userData);
      console.log("=== GOOGLE SIGNIN DEBUG ===");
      console.log("VITE_BACKEND_URL:", import.meta.env.VITE_BACKEND_URL);
      console.log(
        "Full URL will be:",
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/authWithGoogle`
      );
      console.log("========================");

      // Send data to backend - always use authWithGoogle endpoint
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/authWithGoogle`,
        userData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log("Backend response:", response.data);

      // Handle successful authentication
      if (response.data.success) {
        // Store token if provided
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        toast.success(
          response.data.message || "Google authentication successful!"
        );

        // Update context
        setIsAuthenticated(true);
        setUser(response.data.user);

        // Navigate to intended page
        navigate(redirectTo, { replace: true });
      } else {
        throw new Error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);

      // Handle specific Firebase errors
      if (error.code) {
        const firebaseErrors = {
          "auth/popup-closed-by-user":
            "Sign-in was cancelled. Please try again.",
          "auth/popup-blocked":
            "Popup was blocked. Please allow popups for this site.",
          "auth/network-request-failed":
            "Network error. Please check your connection.",
          "auth/too-many-requests":
            "Too many attempts. Please try again later.",
          "auth/account-exists-with-different-credential":
            "An account already exists with this email using a different sign-in method.",
          "auth/cancelled-popup-request":
            "Another sign-in popup is already open.",
        };

        toast.error(
          firebaseErrors[error.code] || `Firebase error: ${error.message}`
        );
      }
      // Handle backend/network errors
      else if (error.response) {
        if (error.response.status === 500) {
          toast.error("Server error. Please try again in a moment.");
          console.error("Server Error Details:", error.response.data);
        } else if (error.response.status === 400) {
          toast.error(
            error.response.data.message || "Invalid request. Please try again."
          );
        } else if (error.response.status === 404) {
          toast.error("Service not found. Please contact support.");
        } else {
          toast.error(error.response.data.message || "Authentication failed.");
        }
      }
      // Handle network/timeout errors
      else if (error.code === "ECONNABORTED") {
        toast.error(
          "Request timed out. Please check your connection and try again."
        );
      } else if (error.message === "Network Error") {
        toast.error("Network error. Please check your connection.");
      }
      // Generic error
      else {
        toast.error("Google authentication failed. Please try again.");
        console.error("Unexpected error:", error);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  // Optional: Add a retry mechanism
  const handleGoogleSignInWithRetry = async (retryCount = 0) => {
    const maxRetries = 2;

    try {
      await handleGoogleSignIn();
    } catch (error) {
      if (retryCount < maxRetries && error.response?.status >= 500) {
        console.log(
          `Retrying Google auth (attempt ${retryCount + 1}/${maxRetries + 1})`
        );
        setTimeout(() => handleGoogleSignInWithRetry(retryCount + 1), 2000);
      } else {
        throw error;
      }
    }
  };

  const toggleLoginRegister = () => {
    setIsLogin(!isLogin);
    clearAllStates();
    reset(); // Clear react-hook-form fields on toggle
  };

  const handleForgotPasswordBack = () => {
    setCurrentView("login");
    setIsLogin(true);
  };

  const handleResetPasswordRequest = (email) => {
    setResetEmail(email);
    setCurrentView("resetPassword");
  };

  const handleResetPasswordBack = () => {
    setCurrentView("forgotPassword");
  };

  const handleResetPasswordSuccess = () => {
    setResetEmail("");
    setCurrentView("login");
    setIsLogin(true);
  };

  const clearAllStates = () => {
    reset();
    setShowPassword(false);
  };

  const renderHeader = () => {
    const titles = {
      login: "Welcome Back",
      register: "Create Account",
      otp: "Verify OTP",
      forgotPassword: "Forgot Password",
      resetPassword: "Reset Password",
    };
    return (
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-2">
          <img
            src="/PickoraFavicon.png"
            alt="Pickora Icon"
            className="w-10 h-10 sm:w-11 sm:h-11 md:w-11 md:h-11 rounded-full object-cover"
          />
        </div>
        <img
          src={Logo}
          alt="Pickora Logo"
          className="mx-auto h-10 sm:h-10 md:h-12"
        />
        {titles[currentView] && (
          <p className="text-gray-600 text-sm mt-2">{titles[currentView]}</p>
        )}
      </div>
    );
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
        <div className="p-10">
          {renderHeader()}
          {/* Loader only for register form */}
          {currentView === "register" && (
            <Backdrop
              sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={registerLoading}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          )}
          {currentView === "otp" && (
            <OtpVerification
              email={registerData.email}
              phone={registerData.phone}
              verificationMethod={registerData.verificationMethod}
              setCurrentView={setCurrentView}
              setIsLogin={setIsLogin}
              clearAllStates={clearAllStates}
            />
          )}
          {currentView === "forgotPassword" && (
            <ForgotPassword
              onBack={handleForgotPasswordBack}
              onResetPassword={handleResetPasswordRequest}
            />
          )}
          {currentView === "resetPassword" && (
            <ResetPassword
              email={resetEmail}
              onBack={handleResetPasswordBack}
              onSuccess={handleResetPasswordSuccess}
            />
          )}
          {["login", "register"].includes(currentView) &&
            (isLogin ? (
              <LoginComponent
                register={register}
                handleSubmit={handleSubmit(onSubmit)}
                errors={errors}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                setCurrentView={setCurrentView}
                handleGoogleSignIn={handleGoogleSignIn}
                toggleLoginRegister={toggleLoginRegister}
              />
            ) : (
              <RegisterComponent
                register={register}
                handleSubmit={handleSubmit(onSubmit)}
                errors={errors}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handleGoogleSignIn={handleGoogleSignIn}
                toggleLoginRegister={toggleLoginRegister}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
