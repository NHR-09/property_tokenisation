const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    let errMsg = res.statusText
    try { const e = await res.json(); errMsg = e.detail ?? errMsg } catch {}
    throw new Error(errMsg)
  }
  return res.json()
}

export const governance = {
  proposals: () => request<Proposal[]>("/governance/proposals"),
  vote: (proposal_id: string, vote: "for" | "against" | "abstain") =>
    request("/governance/vote", { method: "POST", body: JSON.stringify({ proposal_id, vote }) }),
}

export interface Proposal {
  id: string
  propertyId: string
  propertyTitle: string
  title: string
  description: string
  status: string
  votesFor: number
  votesAgainst: number
  totalVotes: number
  endDate: string
  createdDate: string
}

// ── Watchlist (localStorage) ──────────────────────────────────────────────────
const WATCHLIST_KEY = "watchlist_ids"

export const watchlist = {
  get: (): string[] => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem(WATCHLIST_KEY) ?? "[]") } catch { return [] }
  },
  add: (id: string) => {
    const ids = watchlist.get()
    if (!ids.includes(id)) localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...ids, id]))
  },
  remove: (id: string) => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist.get().filter(i => i !== id)))
  },
  toggle: (id: string) => {
    watchlist.get().includes(id) ? watchlist.remove(id) : watchlist.add(id)
  },
  has: (id: string) => watchlist.get().includes(id),
}
