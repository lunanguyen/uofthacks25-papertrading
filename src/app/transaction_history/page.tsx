'use client'
import React, { useEffect, useState } from "react";
// import { DataGrid, Column, Paging } from "devextreme-react/data-grid";
import { getUserInfo } from "../api/userAPI";
import { getTransactionHistory } from "../api/transactionAPI";
import { PageHeader } from "../layout/PageHeader";
import { SessionProvider } from "next-auth/react"

const TransactionPage = () => {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
      
    useEffect(() => {
      const fetchData = async () => {
        try {
            const userId = "gusteven3737@gmail.com"; // Replace with dynamic retrieval if necessary
            const user = await getUserInfo(userId);
          
            // Extract necessary variables from the user info
            const {
                name,
                current_funds,
                portfolio_value,
                current_streak,
            } = user;
  
            // Update state with user information
            setUserInfo({
                name,
                current_funds: current_funds.toFixed(2),
                portfolio_value: portfolio_value.toFixed(2),
                current_streak,
            });
  
            // Get transaction history and update state
            const transactionHistory = await getTransactionHistory(userId);
            setTransactions(transactionHistory);
            console.log(transactions);
            console.log(userInfo);
        } catch (err: any) {
          console.error("Error fetching data:", err);
          setError("Failed to load data. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, []);
  
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
  
    return (
      <div className="flex flex-col items-center m-16 p-8 border-2 rounded-xl  bg-slate-50">
        {userInfo && (
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-4xl">Account: {userInfo.name} </h2>
            <div className="flex flex-row gap-16 justify-between">
              <p className="text-slate-400">Current Funds: <span className="text-slate-900">  ${userInfo.current_funds}</span></p>
              <p className="text-slate-400">Portfolio Value: <span className="text-slate-900">  ${userInfo.portfolio_value} </span></p>
            </div>
            
            <p>Current Streak: {userInfo.current_streak} days</p>
          </div>
        )}
  
        <h3 className="text-4xl mt-16">Transaction History </h3>

        <div className="flex flex-col rounded-xl">
          <div className="flex flex-row gap-4 m-4 p-8 justify-between">
            <div> Type</div>
            <div className="px-4  ml-8  rounded-xl ">Ticker</div>
            <div className="ml-4   rounded-xl px-16"> Price</div>
            <div className=" ml-8    rounded-xl "> Qty.</div>
             <div className="px-4 ml-8  rounded-xl  px-8"> Date</div>
          </div>
          {transactions.map((transaction, index) => {
            return <div key="index" >
    
              <div className="flex flex-row gap-4 m-4 justify-between bg-slate-100 px-16 py-8">
            <div> {transaction.type}</div>
            <div className="px-4  ml-8 "> {transaction.ticker}</div>
            <div className="px-4 ml-4 px-16"> {transaction.prc}</div>
            <div className="px-4 ml-8   px-16"> {transaction.quantity}</div>
            <div className="px-4 ml-8 px-8"> {transaction.date}</div>
          </div>

            </div>
          })} 
        </div>
      </div>
    );
  };
  
  export default TransactionPage;