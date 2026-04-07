"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from "@solana/web3.js"
import { api } from "@/lib/api-client"

const endpoint = clusterApiUrl("devnet")

interface WalletContextType {
  connected: boolean
  walletAddress: string | null
  solBalance: number | null
  connecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  linkWalletToAccount: (userId: string) => Promise<void>
}

const WalletContext = createContext<WalletContextType | null>(null)

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [connecting, setConnecting] = useState(false)

  const getPhantom = () => {
    if (typeof window === "undefined") return null
    const win = window as any
    // Phantom injects window.phantom.solana or window.solana
    return win.phantom?.solana ?? win.solana ?? null
  }

  // Restore connection on page load if already connected
  useEffect(() => {
    const init = async () => {
      const phantom = getPhantom()
      if (!phantom?.isPhantom) return

      // Try silent reconnect first (only if user previously connected)
      try {
        const resp = await phantom.connect({ onlyIfTrusted: true })
        if (resp?.publicKey) {
          const addr = resp.publicKey.toString()
          setWalletAddress(addr)
          setConnected(true)
          fetchBalance(addr)
        }
      } catch {
        // Not previously connected — that's fine, don't show error
      }

      // Also check if already connected via isConnected flag
      if (phantom.isConnected && phantom.publicKey) {
        const addr = phantom.publicKey.toString()
        setWalletAddress(addr)
        setConnected(true)
        fetchBalance(addr)
      }

      phantom.on?.("accountChanged", (pubkey: PublicKey | null) => {
        if (pubkey) {
          const addr = pubkey.toString()
          setWalletAddress(addr)
          setConnected(true)
          fetchBalance(addr)
        } else {
          setConnected(false)
          setWalletAddress(null)
          setSolBalance(null)
        }
      })

      phantom.on?.("disconnect", () => {
        setConnected(false)
        setWalletAddress(null)
        setSolBalance(null)
      })
    }

    // Try immediately and after 800ms for slow Phantom injection
    init()
    const timer = setTimeout(init, 800)
    return () => clearTimeout(timer)
  }, [])

  const fetchBalance = async (address: string) => {
    try {
      const connection = new Connection(endpoint)
      const pubkey = new PublicKey(address)
      const lamports = await connection.getBalance(pubkey)
      setSolBalance(lamports / LAMPORTS_PER_SOL)
    } catch {
      setSolBalance(0)
    }
  }

  const connectWallet = async () => {
    const phantom = getPhantom()
    if (!phantom?.isPhantom) {
      window.open("https://phantom.app", "_blank")
      return
    }
    setConnecting(true)
    try {
      const resp = await phantom.connect()
      const addr = resp.publicKey.toString()
      setWalletAddress(addr)
      setConnected(true)
      fetchBalance(addr)
    } catch (err) {
      console.error("Wallet connect error:", err)
    } finally {
      setConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    const phantom = getPhantom()
    try { await phantom?.disconnect() } catch {}
    setConnected(false)
    setWalletAddress(null)
    setSolBalance(null)
  }

  const linkWalletToAccount = async (userId: string) => {
    const phantom = getPhantom()
    if (!phantom || !walletAddress) return
    try {
      const message = `Link wallet to 7/12 Property Platform\nUser: ${userId}\nTimestamp: ${Date.now()}`
      const encodedMessage = new TextEncoder().encode(message)
      const { signature } = await phantom.signMessage(encodedMessage, "utf8")
      const signatureHex = Buffer.from(signature).toString("hex")
      await api.auth.linkWallet(userId, walletAddress, signatureHex, message)
    } catch (err) {
      console.error("Wallet link error:", err)
    }
  }

  return (
    <WalletContext.Provider value={{
      connected, walletAddress, solBalance, connecting,
      connectWallet, disconnectWallet, linkWalletToAccount,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function usePhantomWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("usePhantomWallet must be used within SolanaWalletProvider")
  return ctx
}
