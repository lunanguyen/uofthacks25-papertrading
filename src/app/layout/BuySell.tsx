'use client'
import { useState, useEffect } from "react"
import { buyStock,sellStock } from "../api/transactionAPI";
import { useSession } from "next-auth/react";

export function BuySell() {
    const price = 50;
    const {data: session} = useSession();

    const [option, setOption] = useState("Buy");

    const [ticker, setTicker] = useState<string>('NVDA');
    const [id, setID] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [quantity, setQuantity] = useState<number>();

    const BuySellStock = async () => {
        console.log("BuyStock button clicked!");
        try {
            if (option ==                                   "Buy") {
                const data = await buyStock("Bob", 'NVDA', '2023-01-03', 5);
                console.log(data)
                console.log("buy!")

            } else if (option == "Sell") {
                const data = await sellStock("Bob", 'NVDA', '2023-01-03', 5);
                console.log(data)
                console.log("sell!")

            }
            setOption("Transaction Complete!");
        } catch{(err) => {
            console.log(err);
        }}
    }

    const SellStock = async () => {
        console.log("BuyStock button clicked!");
        try {
            const data = await sellStock("Bob", ticker, "2020-12-10", 5);
            console.log(data)
            console.log("sell!")
            
        } catch{(err) => {
            console.log(err);
        }}
    }

    console.log(session)

    return <div className="flex flex-col gap-8 p-8  items-center ">
        <h1 className="text-xl"> Ticker: IBM</h1>
        <h1 className="text-6xl"> $ {price}</h1>
        {/* buy / sell col */}
        <div className="flex flex-row gap-4">
            <div className="flex items-center px-8 border border-gray-200 rounded dark:border-gray-700" >
            <input onClick = {() => {setOption("Buy")}} checked id="bordered-radio-2" type="radio" value="" name="bordered-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 px-8  dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label  className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Buy</label>
        </div>

        <div className="flex items-center px-8 border border-gray-200 rounded dark:border-gray-700" >
            <input onClick = {() => {setOption("Sell")}} checked id="bordered-radio-2" type="radio" value="" name="bordered-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 px-8  dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label  className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Sell</label>
        </div>
            {/* <button type="button" className="text-gray-900 bg-[#F7BE38] hover:bg-[#F7BE38]/90 focus:ring-4 p-8 rounded-lg py-3 px-10 data-[state=active]:text-white "> Buy</button>
            <button className="text-slate-50 bg-blue-500 hover:bg-[#F7BE38]/90 focus:ring-4 p-8 rounded-lg py-3 px-10 "> Sell </button> */}
        </div>


   
    

        
        {/* form to submit to buy/sell */}
        <div className="border-2 p-5 rounded-lg bg-slate-50 gap-2 flex flex-col max-w-sm ">
            
        <form className="max-w-sm mx-auto ">
            <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">How much ?</label>
            <input type="number" id="number-input" onChange={(e) => {setQuantity(Number(e.target.value))}} value={quantity}
            aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="500" required />
        </form>

        <div className="flex flex-row justify-between">
            <h1> BTC Price</h1>
            <h1> {price}</h1>
        </div>
        <div className="flex flex-row justify-between">
            <h1> Estimated Cost</h1>
            <h1> {quantity * price} </h1>
        </div>

        <button type="button" onClick={BuySellStock} className="text-gray-900 bg-[#F7BE38] hover:bg-[#F7BE38]/90 focus:ring-4 focus:outline-none items-center  focus:ring-[#F7BE38]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#F7BE38]/50 me-2 mb-2">
        <svg className="w-4 h-4 me-2 -ms-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="paypal" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M111.4 295.9c-3.5 19.2-17.4 108.7-21.5 134-.3 1.8-1 2.5-3 2.5H12.3c-7.6 0-13.1-6.6-12.1-13.9L58.8 46.6c1.5-9.6 10.1-16.9 20-16.9 152.3 0 165.1-3.7 204 11.4 60.1 23.3 65.6 79.5 44 140.3-21.5 62.6-72.5 89.5-140.1 90.3-43.4 .7-69.5-7-75.3 24.2zM357.1 152c-1.8-1.3-2.5-1.8-3 1.3-2 11.4-5.1 22.5-8.8 33.6-39.9 113.8-150.5 103.9-204.5 103.9-6.1 0-10.1 3.3-10.9 9.4-22.6 140.4-27.1 169.7-27.1 169.7-1 7.1 3.5 12.9 10.6 12.9h63.5c8.6 0 15.7-6.3 17.4-14.9 .7-5.4-1.1 6.1 14.4-91.3 4.6-22 14.3-19.7 29.3-19.7 71 0 126.4-28.8 142.9-112.3 6.5-34.8 4.6-71.4-23.8-92.6z"></path></svg>
           <h1>{option}</h1>
        </button>
        </div>

        

    </div>

}