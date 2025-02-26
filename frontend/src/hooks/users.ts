import axios from "axios";
import { useState } from "react";


interface IAllUsers {
  success: boolean;
  error?: string;
  message?: string;
  data?: [
    {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      isAdmin: boolean;
    }
  ];
}

interface ICurrentUser {
  success: boolean;
  error?: string;
  message?: string;
  data?: {
    email: string;
    firstName: string;
    lastName: string;
    userId: string;
    balance: string;
  };
}
export const useUsers = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [allUsers, setAllUsers] = useState<IAllUsers["data"] | null>(null);
  const [currentUser, setCurrentUser] = useState<ICurrentUser["data"] | null>(
    null
  );

  const usersList = async (): Promise<void> => {
    try {
      const authToken = localStorage.getItem("Authorization");
      if (!authToken) {
        setSuccess(false);
        setError("Authorization token not found");
        return;
      }
      const axiosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/user/bulk`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setAllUsers(axiosResponse.data.data || []);
      setSuccess(true);
    } catch (err: any) {
      console.log("axiosError", err?.response?.error);
      setSuccess(false);
      setError(err?.response?.data?.error || "Backend error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async (): Promise<void> => {
    try {
      const authToken = localStorage.getItem("Authorization");
      if (!authToken) {
        setSuccess(false);
        setError("Authorization token not found");
        return;
      }
      const axiosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/account/balance`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const userResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/user/me`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const userBalance = axiosResponse.data.data.balance;
      const userData = userResponse.data.data;
      setCurrentUser({ ...userData, balance: userBalance } );

      // setCurrentUser(axiosResponse.data.data || []);
      setSuccess(true);
    } catch (err: any) {
      console.log("axiosError", err?.response?.data);
      setSuccess(false);
      setError(err?.response?.data?.error || "Something went wrong");
    }
  };

  return {
    usersList,
    loading,
    error,
    success,
    allUsers,
    fetchCurrentUser,
    currentUser,
  };
};
