"use client";

import { useForm, SubmitHandler, set } from "react-hook-form";
import { useLogin } from "@/hooks/login";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useState } from "react";

type FormValues = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const LoginForm  = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const { loginUser, loading, error, success } = useLogin();
  const [validationError, setValidationError] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const result = signInSchema.safeParse(data);

      if (!result.success) {
        setValidationError(true);
        setTimeout(() => {
          setValidationError(false);
        }
        , 3000);
        console.log("Validation error", result.error);
        return;
      }

      const response = await loginUser(data);

      if (response.success && response.data?.token) {
        localStorage.setItem("Authorization", response.data.token);
        console.log("Token set in local storage", response.data.token);
        reset();
        setTimeout(() => {

        router.push("/dashboard");
        }, 500);
      } else {
        console.log("Erorr in page.tsx", response.error);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="border border-red-500 flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 sm:p-10 rounded-3xl shadow--3xl w-full  max-w-md border border-gray-300 backdrop-blur-lg"
      >
        <h2 className="text-center font-bold text-3xl  mb-6 text-gray-900">
          Sign In{" "}
        </h2>

        {validationError && (
          <div className="text-md bg-red-100 text-red-600 rounded-lg  text-center p-3 mb-4">
            {"Wrong Sign In Schema"}
          </div>
        )}
        {error && (
          <div className="text-md bg-red-100 text-red-600 rounded-lg  text-center p-3 mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="text-md bg-green-100  text-green-600 rounded-lg  text-center p-3 mb-4  ">
            Login Successful
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 "
            >
              {" "}
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email", { required: "Email is required" })}
              className=" w-full  mt-2 p-3  border border-gray-300 rounded-xl bg-gray-50 "
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ">
                {errors.email?.message}
              </p>
            )}
          </div>

         

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 "
            >
              {" "}
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", { required: "Password is required" })}
              className=" w-full  mt-2 p-3  border border-gray-300 rounded-xl bg-gray-50 "
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ">
                {errors.password?.message}
              </p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 mt-6 py-3  text-white bg-gradient-to-r from-blue-500 to-purple-500 font-medium  hover:from-blue-600 hover:to-purple-600 rounded-xl  "
        >
          {loading && <Loader2 className="animate-spin w-5 h-5 " />}
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm ;
