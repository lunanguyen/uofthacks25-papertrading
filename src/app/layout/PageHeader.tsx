"use client"
import React, { useState } from 'react';
import Link from '../../../node_modules/next/link';
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useAppSelector, useAppDispatch, useAppStore } from '../lib/hooks'

export function PageHeader() {

    // const dispatch = useDispatch();
    // const id = useSelector((state: RootState) => state.id.id);

    const handleLogin = async () => {
        await signIn("google");
        try {
            // dispatch(setId(session.user.email))
            console.log("done")
        } catch{(err) => {
            console.log(err);
        }}
    }
    const {data: session} = useSession();

    return <div className="flex flex-row items-center  sticky top-4">

        <div className="flex flex-row m-8 gap-80 justify-between border-blue border-2 rounded-3xl bg:blur-sm  backdrop-blur-sm"> 
            
            <button className="p-4 ml-4"><Link href="/"><img src = "pp.svg" width="50%"/></Link></button>

                <div className="flex flex-row gap-8 p-4 mr-4">
                    {session ? <button className="hover:text-gray-500"><Link href="/dashboard">Dashboard</Link> </button> : null}
                    <button className="hover:text-gray-500"><Link href="/transaction_history">History</Link></button>
                    <button className="hover:text-gray-500">Order</button>

                </div>
            </div>
            {/* {id ? <div>{id}</div> : null} */}
            {session ? <div className='flex flex-row gap-4'>
                <h1>{session.user.name}</h1>
                <button onClick={() => signOut()}> Sign Out </button>
                </div>
            :
            <button type="button" onClick={handleLogin} className="text-white bg-black mt-2 transition ease-in hover:bg-[#1da1f2]/90 focus:ring-4 focus:outline-none focus:ring-[#1da1f2]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#1da1f2]/55 me-2 mb-2" >
            <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 17">
            <path fill-rule="evenodd" d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z" clip-rule="evenodd"/>
            </svg>
            Log In
        </button>}
        </div>
}