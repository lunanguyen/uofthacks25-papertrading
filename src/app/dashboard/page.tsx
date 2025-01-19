'use client'
import { SessionProvider } from "next-auth/react"
import { PageHeader } from "../layout/PageHeader";
import { BuySell } from "../layout/BuySell";
import { TradeView } from "../layout/TradeView";

export default function Dashboard() {
    
    return <div className="bg-white dark:bg-gray-900 bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern.svg')] dark:bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern-dark.svg')]
    scroll-smooth grid bg-neutral-100 grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <SessionProvider>
        <PageHeader />
        <div className="flex flex-row gap-16 justify-between items-center mt-16">
            <BuySell />
            <TradeView/>
        </div>

        </SessionProvider>

    </div>;
}
