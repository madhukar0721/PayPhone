


import { useState } from "react";
import axios from "axios";

interface LoginInputData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: {
    token?: string;
  };
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  const loginUser = async (
    data: LoginInputData
  ): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("hook data", data);
      const axiosResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/user/signin`,
        data
      );

      setSuccess(true);
      return axiosResponse.data;

    } catch (err: any) {
      console.log("axiosError", err?.response?.data);
      setSuccess(false);
      setError(err?.response?.data?.error || "Something went wrong");
      return {
        success: false,
        error: err?.response?.data?.error || "Something went wrong",
      };
    } finally {
      setLoading(false);
    }
   
  };

  return {
    loginUser,
    loading,
    error,
    success,
  };
};
