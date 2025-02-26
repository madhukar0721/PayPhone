"use client";

import { useState, useEffect, use } from "react";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/useUsers";



const Dashboard = () => {
  const router = useRouter();
  const {
    usersList,
    loading,
    error,
    success,
    currentUser,
    allUsers,
    fetchCurrentUser,
  } = useUsers();

  useEffect(() => {
    usersList();
    fetchCurrentUser();
  }, []);


  useEffect(() => {

    if (error) {
      console.log("Error in dashboard", error);
      router.push("/login");
    }
  }
  , [error]);

  const handleSendMoney = (recipientId: string) => {
    console.log(`Sending money to user ID: ${recipientId}`);
    // Implement send money logic
  };


  

  return (
    <>


      {success   && (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center py-12 px-6">
          <div className="w-full max-w-2xl bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700">
            <h1 className="text-3xl font-bold text-center mb-6">
              💰 Dashboard
            </h1>

            {currentUser ? (
              <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 flex justify-between items-center">
                
                  <p className="text-xl text-white  font-semibold"> Hi {currentUser.firstName} 👋</p>
                  <p className="text-lg text-gray-400">
                    Balance:{" "}
                    <span className="text-green-400 font-bold">
                    ₹{currentUser.balance}
                    </span>
                  </p>
                
               
              </div>
            ) : (
              <p className="text-center text-gray-400">Loading user info...</p>
            )}

            <h2 className="text-2xl font-bold mt-8">📜 Users List</h2>

            {loading ? (
              <div className="flex justify-center mt-6">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {allUsers?.map((user) => (
                  <li
                    key={user._id}
                    className="bg-gray-800 p-5 rounded-lg flex justify-between items-center border border-gray-700 hover:scale-105 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-medium">{user.firstName}</p>
                     
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={() => handleSendMoney(user._id)}
                      className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg flex items-center gap-2 text-white"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
