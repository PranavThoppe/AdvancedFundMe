'use client'
import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { parseEther, formatEther } from 'viem'
import { sepolia } from 'wagmi/chains'

const FUNDME_ADDRESS = process.env.NEXT_PUBLIC_FUNDME_ADDRESS as `0x${string}`

const ABI = [
  { "type":"function","name":"donate","stateMutability":"payable","inputs":[],"outputs":[] },
  { "type":"function","name":"contractBalance","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}] },
  { "type":"function","name":"contributions","stateMutability":"view","inputs":[{"name":"","type":"address"}],"outputs":[{"type":"uint256"}] },
  { "type":"function","name":"owner","stateMutability":"view","inputs":[],"outputs":[{"type":"address"}] },
  { "type":"function","name":"withdraw","stateMutability":"nonpayable","inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}],"outputs":[] }
] as const

export default function Page() {
  const { address, isConnected, chainId } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const wrongChain = isConnected && chainId !== sepolia.id

  const { data: contractBal } = useReadContract({
    address: FUNDME_ADDRESS, 
    abi: ABI, 
    functionName: 'contractBalance', 
    chainId: sepolia.id
  })
  
  const { data: myContribution } = useReadContract({
    address: FUNDME_ADDRESS, 
    abi: ABI, 
    functionName: 'contributions',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    chainId: sepolia.id, 
    query: { enabled: Boolean(address) }
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash })

  const [amount, setAmount] = useState('0.01')
  const [to, setTo] = useState<`0x${string}` | ''>('')
  const [withdrawAmt, setWithdrawAmt] = useState('0')

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Fund Me</h1>

      {!isConnected ? (
        <button 
          onClick={() => connect({ connector: injected() })} 
          className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-gray-700">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button 
            onClick={() => disconnect()} 
            className="px-3 py-1 rounded border hover:bg-gray-50"
          >
            Disconnect
          </button>
        </div>
      )}

      {wrongChain && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-600 text-sm">⚠️ Please switch to Sepolia network</p>
        </div>
      )}

      <div className="rounded border p-4 space-y-2 bg-gray-50">
        <div className="text-sm">
          <span className="text-gray-600">Contract:</span>{' '}
          <span className="font-mono text-xs">{FUNDME_ADDRESS}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-600">Balance:</span>{' '}
          <span className="font-semibold">
            {contractBal ? `${formatEther(contractBal as bigint)} ETH` : '...'}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-gray-600">Your contribution:</span>{' '}
          <span className="font-semibold">
            {myContribution ? `${formatEther(myContribution as bigint)} ETH` : '0 ETH'}
          </span>
        </div>
      </div>

      <div className="rounded border p-4 space-y-3">
        <h2 className="font-medium">Donate</h2>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Amount (ETH)</label>
          <input 
            type="number"
            step="0.001"
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black" 
          />
        </div>
        <button
          onClick={() => writeContract({ 
            address: FUNDME_ADDRESS, 
            abi: ABI, 
            functionName: 'donate', 
            value: parseEther(amount || '0'), 
            chainId: sepolia.id 
          })}
          disabled={!isConnected || wrongChain || isPending || isMining}
          className="w-full px-4 py-2 rounded bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
        >
          {isPending || isMining ? 'Processing...' : 'Send ETH'}
        </button>
        {hash && (
          <div className="text-xs break-all bg-gray-50 p-2 rounded">
            <span className="text-gray-600">Transaction:</span> {hash}
          </div>
        )}
        {isSuccess && (
          <div className="text-green-600 text-sm bg-green-50 p-2 rounded">
            ✓ Transaction confirmed!
          </div>
        )}
      </div>

      <div className="rounded border p-4 space-y-3 bg-gray-50">
        <h2 className="font-medium">Owner Withdraw</h2>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Recipient Address</label>
          <input 
            value={to} 
            onChange={e => setTo(e.target.value as `0x${string}`)} 
            placeholder="0x..." 
            className="w-full border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black" 
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Amount (ETH)</label>
          <input 
            type="number"
            step="0.001"
            value={withdrawAmt} 
            onChange={e => setWithdrawAmt(e.target.value)} 
            placeholder="0.0" 
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black" 
          />
        </div>
        <button
          onClick={() => {
            if (!to) return
            writeContract({ 
              address: FUNDME_ADDRESS, 
              abi: ABI, 
              functionName: 'withdraw', 
              args: [to as `0x${string}`, parseEther(withdrawAmt || '0')], 
              chainId: sepolia.id 
            })
          }}
          disabled={!isConnected || wrongChain || !to || isPending || isMining}
          className="w-full px-4 py-2 rounded bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
        >
          {isPending || isMining ? 'Processing...' : 'Withdraw'}
        </button>
      </div>
    </main>
  )
}