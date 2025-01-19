'use client'
import React, { useEffect, useState } from "react";
// import { DataGrid, Column, Paging } from "devextreme-react/data-grid";
import { getUserInfo } from "../api/userAPI";
import { getTransactionHistory } from "../api/transactionAPI";

const TransactionPage = () => {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const userId = "Bob"; // Replace with dynamic retrieval if necessary
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
      <div style={{ padding: "20px" }}>
        {userInfo && (
          <div>
            <h2>Account: {userInfo.name}</h2>
            <p>Current Funds: ${userInfo.current_funds}</p>
            <p>Portfolio Value: ${userInfo.portfolio_value}</p>
            <p>Current Streak: {userInfo.current_streak} days</p>
          </div>
        )}
  
        <h3>Transaction History</h3>
        {/* <DataGrid
          dataSource={transactions}
          showBorders={true}
          columnAutoWidth={true}
        >
          <Paging enabled={true} pageSize={5} />
          <Column dataField="type" caption="Type" />
          <Column dataField="ticker" caption="Ticker" />
          <Column dataField="date" caption="Date" dataType="date" />
          <Column dataField="prc" caption="Price" format="currency" />
          <Column dataField="quantity" caption="Quantity" />
        </DataGrid> */}
      </div>
    );
  };
  
  export default TransactionPage;