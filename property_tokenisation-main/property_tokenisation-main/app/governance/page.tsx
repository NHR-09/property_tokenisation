"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Vote, Clock, CheckCircle2, XCircle, AlertCircle,
  Building2, Users, Calendar, ThumbsUp, ThumbsDown, Plus,
} from "lucide-react"
import { governance, portfolio, type Proposal, type Holding } from "@/lib/api-client"
import { proposals as mockProposals } from "@/lib/mock-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GovernancePage() {
  const [proposalList, setProposalList] = useState<Proposal[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  // Vote dialog
  const [selectedVote, setSelectedVote] = useState("")
  const [voteDialogOpen, setVoteDialogOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())

  // Create proposal dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newProposal, setNewProposal] = useState({ property_id: "", title: "", description: "", end_date: "" })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    setIsLoggedIn(!!token)

    // proposals are public — no token needed
    governance.proposals()
      .then(setProposalList)
      .catch(() => setProposalList(mockProposals as unknown as Proposal[]))
      .finally(() => setLoading(false))

    // holdings only needed if logged in
    if (token) {
      portfolio.holdings()
        .then(h => {
          setHoldings(h)
          // calculate total voting power
        })
        .catch(() => {})
    }
  }, [])

  const userVotingPower = holdings.reduce((acc, h) => acc + h.tokensOwned, 0)
  const activeProposals = proposalList.filter(p => p.status === "active")
  const closedProposals = proposalList.filter(p => p.status !== "active")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":   return <Badge className="bg-accent">Active</Badge>
      case "passed":   return <Badge className="bg-[oklch(0.65_0.15_165)]">Passed</Badge>
      case "rejected": return <Badge variant="destructive">Rejected</Badge>
      default:         return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":   return <Clock className="h-4 w-4 text-accent" />
      case "passed":   return <CheckCircle2 className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />
      default:         return <AlertCircle className="h-4 w-4" />
    }
  }

  const openVoteDialog = (proposal: Proposal) => {
    if (!isLoggedIn) { setVoteError("Please log in to vote"); return }
    setSelectedProposal(proposal)
    setVoteError(null)
    setSelectedVote("")
    setVoteDialogOpen(true)
  }

  const submitVote = async () => {
    if (!selectedProposal || !selectedVote) return
    setSubmitting(true)
    setVoteError(null)
    try {
      await governance.vote(selectedProposal.id, selectedVote as "for" | "against" | "abstain")
      setVotedIds(prev => new Set(prev).add(selectedProposal.id))
      setProposalList(prev => prev.map(p => {
        if (p.id !== selectedProposal.id) return p
        return {
          ...p,
          votesFor: selectedVote === "for" ? p.votesFor + userVotingPower : p.votesFor,
          votesAgainst: selectedVote === "against" ? p.votesAgainst + userVotingPower : p.votesAgainst,
        }
      }))
      setVoteDialogOpen(false)
    } catch (e: unknown) {
      setVoteError(e instanceof Error ? e.message : "Failed to submit vote. Make sure you own tokens for this property.")
    } finally {
      setSubmitting(false)
    }
  }

  const submitCreateProposal = async () => {
    if (!newProposal.property_id || !newProposal.title || !newProposal.description || !newProposal.end_date) {
      setCreateError("All fields are required")
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      const created = await governance.createProposal(newProposal)
      setProposalList(prev => [created, ...prev])
      setCreateDialogOpen(false)
      setNewProposal({ property_id: "", title: "", description: "", end_date: "" })
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Failed to create proposal. You must own tokens for this property.")
    } finally {
      setCreating(false)
    }
  }

  const ProposalCard = ({ proposal, index }: { proposal: Proposal; index: number }) => {
    const totalVoted = proposal.votesFor + proposal.votesAgainst
    const forPercentage = totalVoted > 0 ? (proposal.votesFor / totalVoted) * 100 : 0
    const againstPercentage = totalVoted > 0 ? (proposal.votesAgainst / totalVoted) * 100 : 0
    const participationRate = proposal.totalVotes > 0 ? (totalVoted / proposal.totalVotes) * 100 : 0
    const hasVoted = votedIds.has(proposal.id)

    return (
      <Card
        className="opacity-0 animate-fade-in-up"
        style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
      >
        <CardHeader className="pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(proposal.status)}
              {getStatusBadge(proposal.status)}
              {hasVoted && <Badge variant="outline" className="text-xs">Voted</Badge>}
            </div>
            <CardTitle className="text-lg">{proposal.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{proposal.propertyTitle}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{proposal.description}</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
                <span>For ({forPercentage.toFixed(1)}%)</span>
              </div>
              <span className="font-medium">{proposal.votesFor.toLocaleString()} votes</span>
            </div>
            <Progress value={forPercentage} className="h-2" />

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-destructive" />
                <span>Against ({againstPercentage.toFixed(1)}%)</span>
              </div>
              <span className="font-medium">{proposal.votesAgainst.toLocaleString()} votes</span>
            </div>
            <Progress value={againstPercentage} className="h-2 [&>div]:bg-destructive" />
          </div>

          <Separator />

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{participationRate.toFixed(1)}% participation</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{proposal.status === "active" ? `Ends ${proposal.endDate}` : `Ended ${proposal.endDate}`}</span>
            </div>
          </div>

          {proposal.status === "active" && (
            <Button
              className="w-full"
              onClick={() => openVoteDialog(proposal)}
              disabled={hasVoted}
            >
              <Vote className="mr-2 h-4 w-4" />
              {hasVoted ? "Already Voted" : "Cast Vote"}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar variant="investor" />

      <main className="pl-64 transition-all duration-300">
        <DashboardHeader title="Governance" subtitle="Vote on property decisions" />

        <div className="p-6 space-y-6">
          {/* Voting Power + Create Proposal */}
          <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Your Voting Power</p>
                  <p className="text-3xl font-semibold">{userVotingPower.toLocaleString()} votes</p>
                  <p className="text-xs text-muted-foreground">Based on tokens owned across all properties</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-accent">{activeProposals.length}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{closedProposals.length}</p>
                    <p className="text-sm text-muted-foreground">Closed</p>
                  </div>
                  {isLoggedIn && (
                    <Button onClick={() => { setCreateError(null); setCreateDialogOpen(true) }}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Proposal
                    </Button>
                  )}
                </div>
              </div>
              {!isLoggedIn && (
                <p className="text-sm text-muted-foreground mt-4 p-3 rounded-lg bg-muted/50">
                  ⚠️ Log in to vote or create proposals
                </p>
              )}
            </CardContent>
          </Card>

          {/* Proposals */}
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">
                Active Proposals
                {activeProposals.length > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 justify-center">{activeProposals.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="closed">Closed Proposals</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading proposals...</p>
              ) : activeProposals.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {activeProposals.map((p, i) => <ProposalCard key={p.id} proposal={p} index={i} />)}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Vote className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No Active Proposals</h3>
                    <p className="text-muted-foreground">There are no proposals currently open for voting</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="closed">
              <div className="grid gap-6 md:grid-cols-2">
                {closedProposals.map((p, i) => <ProposalCard key={p.id} proposal={p} index={i} />)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Vote Dialog */}
      <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cast Your Vote</DialogTitle>
            <DialogDescription>{selectedProposal?.title} — Min. 5% ownership required</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Your Voting Power</p>
              <p className="text-xl font-semibold">{userVotingPower.toLocaleString()} votes</p>
            </div>
            <RadioGroup value={selectedVote} onValueChange={setSelectedVote}>
              {[
                { value: "for", label: "Vote For", icon: <ThumbsUp className="h-4 w-4 text-[oklch(0.65_0.15_165)]" /> },
                { value: "against", label: "Vote Against", icon: <ThumbsDown className="h-4 w-4 text-destructive" /> },
                { value: "abstain", label: "Abstain", icon: <AlertCircle className="h-4 w-4 text-muted-foreground" /> },
              ].map(opt => (
                <div key={opt.value} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <Label htmlFor={opt.value} className="flex items-center gap-2 cursor-pointer flex-1">
                    {opt.icon}{opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {voteError && <p className="text-sm text-destructive">{voteError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoteDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button disabled={!selectedVote || submitting} onClick={submitVote}>
              {submitting ? "Submitting..." : "Submit Vote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Proposal Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Proposal</DialogTitle>
            <DialogDescription>You need at least 20% ownership in a property to create a proposal</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Property</Label>
              {holdings.length > 0 ? (
                <Select
                  value={newProposal.property_id}
                  onValueChange={v => setNewProposal(p => ({ ...p, property_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property you own tokens in" />
                  </SelectTrigger>
                  <SelectContent>
                    {holdings.map(h => {
                      const pct = h.tokensOwned && h.tokensOwned > 0
                        ? ((h.tokensOwned / (h.tokensOwned / (h.unrealizedPLPercent || 1))) * 100)
                        : 0
                      return (
                        <SelectItem key={h.propertyId} value={h.propertyId}>
                          {h.propertyTitle} — {h.tokensOwned} tokens
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                  You don't own tokens in any property yet. Buy tokens first to create a proposal.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Proposal title"
                value={newProposal.title}
                onChange={e => setNewProposal(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the proposal..."
                value={newProposal.description}
                onChange={e => setNewProposal(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={newProposal.end_date}
                onChange={e => setNewProposal(p => ({ ...p, end_date: e.target.value }))}
              />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={creating}>Cancel</Button>
            <Button disabled={creating} onClick={submitCreateProposal}>
              {creating ? "Creating..." : "Create Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
