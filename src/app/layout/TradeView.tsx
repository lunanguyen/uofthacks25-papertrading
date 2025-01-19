'use client'
import { useState, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fakeD = [1, 22, 5, 6, 5]
interface stock {
    data: number,
    hours: number,
}
export function TradeView() {

    const numOpts = ["1H", "24H", "1W", "1M", "3M", "1Y","5Y"]
    const [hours, setHrs] = useState("")
    const [stockData, setStockData] = useState<stock[] | null>(null);
    const [domain, setDomain] = useState(10)
    
    useEffect(() => {
        const stockData = async () => {
            const data = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=60min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`)
            // assume no error handling ?
            const resp = await data.json();
            console.log(resp);
            if (resp) {

                const timeSeries = resp["Time Series (60min)"];

                // Create an array of Stock objects
                const stockData: stock[] = [];

                // Iterate through the time series and extract close prices and hours
                for (const [timestamp, values] of Object.entries(timeSeries)) {
                    const closePrice = parseFloat(values["4. close"]); // Extract and convert close price
                    const hour = new Date(timestamp).getHours(); // Extract hour from timestamp

                    stockData.push({ data: closePrice, hours: hour }); // Push data and hour into the array
                    console.log(stockData); 
                    setStockData(stockData);
                    setDomain(stockData[0].data);
                }
            } else {
                console.log("cant fetch")
            }
        };
        stockData();
    }, []);

    
    

    return <div className="px-10 border-2 py-20 rounded-lg bg-slate-50">
        <div className="flex flex-row gap-4">
                {numOpts.map((_, index) => (
                    <button key={index} onClick={()=>{setHrs(numOpts[index])}}
                    className="rounded-full px-8 py-2 dark:bg-blue-300 dark:hover:bg-blue-500 focus:bg-black focus:text-slate-50" >
                       {numOpts[index]}
                    </button>
                ))}    
        </div>

        <div className="border-2 p-16 mt-5">
        <AreaChart width={730} height={250} data={stockData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="hours" />
            <YAxis domain={[domain - 10, domain + 10]} />

            <Tooltip />
            <Area type="monotone" dataKey= "data"stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
        </div>
    </div>
}

