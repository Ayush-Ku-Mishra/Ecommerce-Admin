import React, { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import axios from "axios";
import { toast } from "react-toastify";
import Logo from "../assets/PickoraLogo1.png";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import LoginComponent from "../pages/LoginComponent";
import RegisterComponent from "../pages/RegisterComponent";
import OtpVerification from "../pages/OtpVerification";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

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

        toast.success(response.data.message);
        setIsAuthenticated(true);
        setUser(response.data.user);
        navigate(redirectTo, { replace: true }); // <--- Redirect to wishlist or home
      } catch (error) {
        toast.error(error.response?.data?.message || "Login failed");
      }
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google/callback`;
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
