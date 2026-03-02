// src/services/authService.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL_TWO;

export const requestOtp = async (email) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/auth/request-otp`,
      { email }
    );
    return res.data;
    console.log(res.data);
  } catch (err) {
    throw err.response?.data || { message: "OTP sending failed" };
  }
};

// 📌 Verify OTP (PUBLIC)
export const verifyOtpService = async (otp, email) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/auth/verify-otp`,
      { otp, email }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Invalid OTP" };
  }
};




export const createRequestOtp = async (name, email, role) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/request-otp/create`, {
      name,
      email,
      role,
    });
    return res.data;
    console.log(res.data);
  } catch (err) {
    throw err.response?.data || { message: "OTP sending failed" };
  }
};


export const createVerifyOtpService = async (otp, email,name,role) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/verify-otp/create`, { otp, email,name,role });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Invalid OTP" };
  }
};
