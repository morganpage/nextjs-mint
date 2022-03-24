import { useState, useEffect } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { mintOnContract, totalMintedOnContract, tokenURIOnContract } from '../utils/contract_utils';

export default function Home() {
  const [install, setInstall] = useState(false)
  const [network, setNetwork] = useState(false)//False if wrong network
  const [account, setAccount] = useState(null)
  const [mintDisabled, setMintDisabled] = useState(false)
  const [totalMinted, setTotalMinted] = useState(0)
  const [tokenData, setTokenData] = useState([]);

  useEffect(async () => {
    setInstall(!window.ethereum)
    if (window.ethereum) {
      const networkVersion = await window.ethereum.request({ method: 'net_version' })
      console.log(networkVersion)
      setNetwork(networkVersion == process.env.NEXT_PUBLIC_NET_VERSION)
      window.ethereum.on('chainChanged', (networkVersion) => {
        console.log("chainChanged", networkVersion)
        let nv10 = parseInt(networkVersion);
        setNetwork(nv10 == process.env.NEXT_PUBLIC_NET_VERSION)
      })
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log("accountsChanged", accounts, window.ethereum.selectedAddress)
        setAccount(window.ethereum.selectedAddress)
      })

      setAccount(window.ethereum.selectedAddress)
    }
  }, []);

  useEffect(async () => {
    if (account && network) {
      await refresh();
    }
  }, [account, network])

  const refresh = async () => {
    console.log("Getting token info from contract")
    let total = await totalMintedOnContract()
    let totalDec = parseInt(total._hex);
    setTotalMinted(totalDec)
    let tokens = [];
    for (let i = 0; i < totalDec; i++) {
      let token = await tokenURIOnContract(i)
      tokens.push(token)
    }
    setTokenData(tokens);
  }

  const mint = async () => {
    console.log("minting")
    setMintDisabled(true)
    let result = await mintOnContract()
    refresh()
    setMintDisabled(false)
  }

  if (install) return <h2>Install MetaMask</h2>
  if (!network) return <h2>Wrong Network</h2>
  if (!account) return <><h2>Connect Your Wallet</h2><button onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}>CONNECT</button></>


  return (
    <div className={styles.container}>
      <Head>
        <title>Our Mint Site</title>
        <meta name="description" content="Our Mint Site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>Minting NOW!!!</h1>
        <h2>Total Minted: {totalMinted}</h2>
        <button disabled={mintDisabled} onClick={() => mint()}>MINT</button>
      </div>
      <ul>
        {tokenData.map((token, index) => <li key={index}>{token.name}</li>)}
      </ul>

    </div>
  )
}
