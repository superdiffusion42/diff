import Head from 'next/head'
import Image from 'next/image';
import { useState } from 'react'
import { api } from '../utils/api'

export default function Home() {
  const [img, setImg] = useState<string>();
  const [prompt, setPrompt] = useState('Super mario bros flirting with Yoshi');

  const [inProgress, setInProgress] = useState<boolean>(false)

  const resStart = api.start.useQuery(
    { text: prompt }, 
    { enabled: inProgress }
  );
  const resCheck = api.check.useQuery(
    { callID: resStart.data?.callID! },
    { 
      enabled: !!resStart.data?.callID && inProgress, 
      refetchInterval: 5000,
      onSuccess: (r) => {
        if (r?.modelOutputs && r?.modelOutputs.length > 0) {
          setImg("data:image/jpg;base64," + r.modelOutputs[0]?.image_base64);
          setInProgress(false);
        }
      }
    },
  );

  return (
    <>
      <Head>
        <title>SuperDiffusion</title>
        <meta name="description" content="A super Stable Diffusion app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col gap-4 min-h-[100vh] w-full bg-slate-800 text-white px-[15%] py-8">
        <h2 className="text-xl w-full text-center py-10">Super Diffusion</h2>

        <div className="flex flex-col gap-3 w-full">
          <input 
            className='h-12 rounded-md w-full px-4 text-slate-800' 
            placeholder='Enter your prompt'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button 
            className='rounded-md w-1/3 bg-blue-600 py-3 hover:bg-blue-400'
            onClick={() => setInProgress(true)}
          >Abracadabra</button>
        </div>

        <div className={`flex justify-center w-full mt-16 py-16 border-2 border-white`}>
          <Image 
            src={img ? img : '/webcolours-unknown.png'}
            alt='SD image'
            width={500}
            height={500}
          />
        </div>

      </main>
    </>
  )
}
