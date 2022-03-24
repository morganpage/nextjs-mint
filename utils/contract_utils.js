import { ethers } from 'ethers';
import MyToken from '../MyToken.json';

export async function mintOnContract() {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, MyToken.abi, signer);
    const address = await signer.getAddress();
    const tx = await contract.safeMint(address);
    console.log(tx);
    const result = await tx.wait();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

export async function totalMintedOnContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, MyToken.abi, provider);
  const total = await contract.totalMinted();
  console.log('total', total);
  return total;
}

export async function tokenURIOnContract(tokenId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, MyToken.abi, provider);
  const dataURI = await contract.tokenURI(tokenId);
  const json = Buffer.from(dataURI.substring(29), 'base64').toString();
  const result = JSON.parse(json);
  return result;
}