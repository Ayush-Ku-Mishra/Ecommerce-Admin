import React, { useState, useEffect, useContext } from "react";
import TextField from "@mui/material/TextField";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { FaCloudUploadAlt } from "react-icons/fa";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { FormHelperText } from "@mui/material";

const defaultAvatar = "https://cdn-icons-png.flaticon.com/128/3135/3135715.png";

const ProfilePage = () => {
  const { user, isAuthenticated, authLoading, setUser } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/profile");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const localStorageKey = user ? `avatarUrl_${user.email}` : "avatarUrl_guest";

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || defaultAvatar);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  React.useEffect(() => {
    // Use user avatar from context first, then localStorage, then default
    if (user?.avatar) {
      setAvatar(user.avatar);
    } else {
      const storedAvatar = localStorage.getItem(localStorageKey);
      setAvatar(storedAvatar || defaultAvatar);
    }
  }, [localStorageKey, user?.avatar]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid jpg, png or webp file.");
      return;
    }

    // Validate file size (optional - e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size should be less than 5MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      console.log(
        "Uploading to:",
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/user-avtar`
      );

      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/user-avtar`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload response:", data);

      if (data.success) {
        // Backend returns avatar as array, take first element
        const newAvatarUrl = Array.isArray(data.avatar)
          ? data.avatar[0]
          : data.avatar;

        // Update avatar in state
        setAvatar(newAvatarUrl);

        // Update user context with new avatar
        setUser((prevUser) => ({
          ...prevUser,
          avatar: newAvatarUrl,
        }));

        // Update localStorage
        localStorage.setItem(localStorageKey, newAvatarUrl);

        // Update user info in localStorage
        const userInfo = localStorage.getItem("user-info");
        if (userInfo) {
          const parsedUserInfo = JSON.parse(userInfo);
          parsedUserInfo.avatar = newAvatarUrl;
          localStorage.setItem("user-info", JSON.stringify(parsedUserInfo));
        }

        toast.success("Profile picture updated successfully!");
      } else {
        toast.error(data.message || "Image upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      if (error.response?.status === 404) {
        toast.error(
          "Upload endpoint not found. Please check server configuration."
        );
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to upload image. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    setIsEditing(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/profile`,
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
        },
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setUser(data.user);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setPasswordLoading(true);

    try {
      const { data: resData } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/set-password`,
        {
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (resData.success) {
        toast.success("Password set successfully!");
        reset();
        setShowPasswords({
          newPassword: false,
          confirmPassword: false,
        });
        setPasswordDialogOpen(false);
      } else {
        toast.error(resData.message || "Failed to set password");
      }
    } catch (error) {
      console.error("Password set error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to set password. Please try again.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClosePasswordDialog = () => {
    reset();
    setShowPasswords({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
    setPasswordDialogOpen(false);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex gap-6 lg:ml-5 mt-2 max-w-[1000px] mx-auto mb-8">
      {/* Main Content */}
      <div className="flex-1 mt-2 relative">
        <Card className="shadow-lg relative">
          {/* Local Loader inside Personal Information Card */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              <CircularProgress color="primary" />
            </div>
          )}

          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <Typography
                variant="h5"
                className="font-bold text-gray-800 text-[8px]"
              >
                Admin Profile
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setPasswordDialogOpen(true)}
                size="small"
              >
                Change Password
              </Button>
            </div>

            <div className="mb-8">
              <label
                htmlFor="avatar-upload"
                className="relative w-28 h-28 block rounded-full overflow-hidden cursor-pointer"
              >
                {uploading ? (
                  <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center">
                    <CircularProgress color="inherit" size={24} />
                  </div>
                ) : (
                  <img
                    src={avatar}
                    alt="Account Avatar"
                    className="w-28 h-28 rounded-full object-cover"
                    onError={() => setAvatar(defaultAvatar)} // Fallback if image fails to load
                  />
                )}

                {/* Overlay on hover */}
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
                  <FaCloudUploadAlt className="text-white text-3xl" />
                </div>
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                id="avatar-upload"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploading}
              />
            </div>

            <Grid container spacing={3}>
              {/* Full Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  sx={{ width: "320px" }}
                  required
                  disabled={!isEditing}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <div style={{ width: "320px" }}>
                  <PhoneInput
                    defaultCountry="in"
                    value={profile.phone}
                    onChange={(value) =>
                      setProfile((prev) => ({ ...prev, phone: value }))
                    }
                    disabled
                    inputStyle={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      backgroundColor: !isEditing ? "#f5f5f5" : "white", // match MUI disabled
                      color: !isEditing ? "rgba(0,0,0,0.6)" : "inherit", // match disabled text color
                      fontSize: "14px",
                    }}
                    placeholder="Enter mobile number"
                  />
                  {!isEditing && (
                    <FormHelperText>
                      Phone number cannot be changed
                    </FormHelperText>
                  )}
                </div>
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email Address"
                  name="email"
                  value={profile.email}
                  type="email"
                  sx={{ width: "320px" }}
                  disabled
                  size="small"
                  variant="outlined"
                  helperText="Email cannot be changed"
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-5">
              {!isEditing ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEdit}
                  size="medium"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <form onSubmit={handleUpdate} className="contents">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      size="medium"
                    >
                      {loading ? "Updating..." : "Save Changes"}
                    </Button>
                  </form>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancel}
                    disabled={loading}
                    size="medium"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" className="font-semibold">
            Set Password
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit(handleSetPassword)}>
          <DialogContent>
            <div className="space-y-4 pt-2">
              {/* New Password */}
              <TextField
                label="New Password"
                type={showPasswords.newPassword ? "text" : "password"}
                fullWidth
                size="small"
                disabled={passwordLoading}
                error={!!errors.newPassword}
                helperText={
                  errors.newPassword?.message ||
                  "At least 6 chars, including uppercase, lowercase, number & special char"
                }
                {...register("newPassword", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  pattern: {
                    value: regex,
                    message:
                      "Must include uppercase, lowercase, number & special character",
                  },
                })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility("newPassword")}
                        edge="end"
                        size="small"
                      >
                        {showPasswords.newPassword ? (
                          <AiOutlineEyeInvisible />
                        ) : (
                          <AiOutlineEye />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Confirm New Password */}
              <TextField
                label="Confirm Password"
                type={showPasswords.confirmPassword ? "text" : "password"}
                fullWidth
                size="small"
                disabled={passwordLoading}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === newPassword || "Passwords do not match",
                })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          togglePasswordVisibility("confirmPassword")
                        }
                        edge="end"
                        size="small"
                      >
                        {showPasswords.confirmPassword ? (
                          <AiOutlineEyeInvisible />
                        ) : (
                          <AiOutlineEye />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </DialogContent>

          <DialogActions className="p-6 pt-2">
            <Button
              onClick={handleClosePasswordDialog}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Setting..." : "Set Password"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
