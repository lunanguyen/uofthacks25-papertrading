'use client'
import { useState } from "react";
import { PageHeader } from "./layout/PageHeader";

export default function Home() {
  return (
    <div className=" scroll-smooth grid bg-neutral-100 grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">

      <PageHeader />
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-5xl mt-16"> Welcome to the </h1>
        <h1 className="text-7xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500"> Future 
        <span className="text-6xl text-black"> of </span>
        Trading</h1>

        <h1> with <button className="underline decoration-solid">Paper Trading</button>, your parents won't disown you !</h1>
        <img src = "https://www.pngall.com/wp-content/uploads/8/Stock-Trading-PNG-High-Quality-Image.png" width="60%"
        className="mt-10"/>
      </div>
      
      {/* make two button to choose from real-time trading or time-skip */}
      <div className="flex flex-col gap-4 items-center">
      💼 Choose what portfolio you want to trade today !
        <div className="flex flex-row gap-4">
        <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800">
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-neutral-100 dark:bg-gfray-900 rounded-md group-hover:bg-opacity-0">
            Time Skip Trading
            </span>
        </button>
        <button className ="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800">
            <span className ="relative px-5 py-2.5 transition-all ease-in duration-75 bg-neutral-100 dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Real Time Trading
            </span>
        </button>
        </div>
      </div>
      
      
      
      
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          /> */}
        </a>
      </footer>
    </div>
  );
}
