

import { useState } from "react";
import axios from "axios";

interface RegisterInputData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface RegisterResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: {
    token?: string;
  };
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  const registerUser = async (
    data: RegisterInputData
  ): Promise<RegisterResponse> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("hook data", data);
      const axiosResponse = await axios.post(
        process.env.NEXT_PUBLIC_API_URL!,
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
    registerUser,
    loading,
    error,
    success,
  };
};
