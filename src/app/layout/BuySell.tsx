'use client'
import { useState, useEffect } from "react"
import { buyStock } from "../api/transactionAPI";
import { useSession } from "next-auth/react";

export function BuySell() {

    const {data: session} = useSession();

    const [ticker, setTicker] = useState<string>('NVDA');
    const [id, setID] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(0);

    const BuyStock = async () => {
        try {
            if (session) {
                await buyStock(session.user.email, ticker, "a fake date", 5);
                console.log("buy!")
            } else {
                console.log("no user")
            }
            
        } catch{(err) => {
            console.log(err);
        }}
    }

    // console.log(session)

    return <div className="flex flex-col gap-8 p-8  items-center ">
        <h1 className="text-6xl"> $ 95.25 </h1>
        {/* buy / sell col */}
        <div className="flex flex-row gap-4">
            <button type="button" className="text-gray-900 bg-[#F7BE38] hover:bg-[#F7BE38]/90 focus:ring-4 p-8 rounded-lg py-3 px-10 "> Buy</button>
            <button className="text-slate-50 bg-blue-500 hover:bg-[#F7BE38]/90 focus:ring-4 p-8 rounded-lg py-3 px-10 "> Sell </button>
        </div>
        
        {/* form to submit to buy/sell */}
        <div className="border-2 p-5 rounded-lg bg-slate-50 gap-2 flex flex-col">
            
        <form className="max-w-sm mx-auto">
            <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">How much ?</label>
            <input type="number" id="number-input" aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="500" required />
        </form>

        <div className="flex flex-row justify-between">
            <h1> BTC Price</h1>
            <h1> 1230</h1>
        </div>
        <div className="flex flex-row justify-between">
            <h1> Estimated Cost</h1>
            <h1> 1230</h1>
        </div>

        <button className="bg-slate-600  mt-5" onClick={BuyStock}> BUY/SELL BTC </button>
        </div>

        

    </div>

}