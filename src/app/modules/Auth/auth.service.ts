import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import * as bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import crypto from "crypto";
import emailSender from "../../../helpars/emailSender/brevoMailSender";
import { AuthRepository } from "./auth.repository";

// ================= LOGIN =================

const loginUser = async (payload: {
  email: string;
  password: string;
  fcmToken?: string;
}) => {
  const userData = await AuthRepository.findUserByEmail(payload.email);

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with this email");
  }

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect!");
  }

  if (payload.fcmToken) {
    await AuthRepository.updateUserById(userData.id, {
      fcmToken: payload.fcmToken,
    });
  }

  const accessToken = jwtHelpers.createToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return { token: accessToken, role: userData.role };
};

// ================= PROFILE =================

const getMyProfile = async (userToken: string) => {
  const decodedToken = jwtHelpers.verifyToken(
    userToken,
    config.jwt.jwt_secret as string,
  );

  const userProfile = await AuthRepository.getUserProfileById(decodedToken.id);

  return userProfile;
};

// ================= CHANGE PASSWORD =================

const changePassword = async (
  userToken: string,
  newPassword: string,
  oldPassword: string,
) => {
  const decodedToken = jwtHelpers.verifyToken(
    userToken,
    config.jwt.jwt_secret as string,
  );

  const user = await AuthRepository.findUserById(decodedToken.id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await AuthRepository.updateUserById(user.id, {
    password: hashedPassword,
  });

  return { message: "Password changed successfully" };
};

// ================= FORGOT PASSWORD =================

const forgotPassword = async (payload: { email: string }) => {
  const user = await AuthRepository.findUserByEmail(payload.email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const otp = Number(crypto.randomInt(1000, 9999));
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const html = `
    <h2>Forgot Password OTP</h2>
    <p>Your OTP is:</p>
    <h1>${otp}</h1>
    <p>This OTP will expire in 10 minutes.</p>
  `;

  await emailSender(user.email, html, "Forgot Password OTP");

  await AuthRepository.updateUserById(user.id, {
    otp,
    expirationOtp: otpExpires,
  });

  return { message: "Reset password OTP sent successfully" };
};

// ================= RESEND OTP =================

const resendOtp = async (email: string) => {
  const user = await AuthRepository.findUserByEmail(email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const otp = Number(crypto.randomInt(1000, 9999));
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  const html = `
    <h2>Resend OTP</h2>
    <p>Your new OTP is:</p>
    <h1>${otp}</h1>
    <p>This OTP will expire in 5 minutes.</p>
  `;

  await emailSender(user.email, html, "Resend OTP");

  await AuthRepository.updateUserById(user.id, {
    otp,
    expirationOtp: otpExpires,
  });

  return { message: "OTP resent successfully" };
};

// ================= VERIFY OTP =================

const verifyForgotPasswordOtp = async (payload: {
  email: string;
  otp: number;
}) => {
  const user = await AuthRepository.findUserByEmail(payload.email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (
    user.otp !== payload.otp ||
    !user.expirationOtp ||
    user.expirationOtp < new Date()
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired OTP");
  }

  await AuthRepository.updateUserById(user.id, {
    otp: null,
    expirationOtp: null,
  });

  return { message: "OTP verification successful" };
};

// ================= RESET PASSWORD =================

const resetPassword = async (payload: { password: string; email: string }) => {
  const user = await AuthRepository.findUserByEmail(payload.email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);

  await AuthRepository.updateUserByEmail(payload.email, {
    password: hashedPassword,
    otp: null,
    expirationOtp: null,
  });

  return { message: "Password reset successfully" };
};

export const AuthServices = {
  loginUser,
  getMyProfile,
  changePassword,
  forgotPassword,
  resendOtp,
  verifyForgotPasswordOtp,
  resetPassword,
};
