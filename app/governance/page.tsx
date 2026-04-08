"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import {
  Vote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Users,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
} from "lucide-react"
import { governance, type Proposal } from "@/lib/api-client"
import { proposals as mockProposals } from "@/lib/mock-data"

export default function GovernancePage() {
  const [proposalList, setProposalList] = useState<Proposal[]>([])
  const [selectedVote, setSelectedVote] = useState<string>("")
  const [voteDialogOpen, setVoteDialogOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    governance.proposals()
      .then(setProposalList)
      .catch(() => {
        // fallback to mock data if backend is down
        setProposalList(mockProposals as unknown as Proposal[])
      })
  }, [])

  const userVotingPower = 1500
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
      // optimistically update vote counts in UI
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
      setVoteError(e instanceof Error ? e.message : "Failed to submit vote")
    } finally {
      setSubmitting(false)
    }
  }

  const ProposalCard = ({ proposal, index }: { proposal: Proposal; index: number }) => {
    const totalVoted = proposal.votesFor + proposal.votesAgainst
    const forPercentage = totalVoted > 0 ? (proposal.votesFor / totalVoted) * 100 : 0
    const againstPercentage = totalVoted > 0 ? (proposal.votesAgainst / totalVoted) * 100 : 0
    const participationRate = (totalVoted / proposal.totalVotes) * 100
    const hasVoted = votedIds.has(proposal.id)

    return (
      <Card
        className="opacity-0 animate-fade-in-up hover-lift"
        style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
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

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{participationRate.toFixed(1)}% participation</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{proposal.status === "active" ? `Ends ${proposal.endDate}` : `Ended ${proposal.endDate}`}</span>
              </div>
            </div>
          </div>

          {proposal.status === "active" && (
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => openVoteDialog(proposal)}
                disabled={hasVoted}
              >
                <Vote className="mr-2 h-4 w-4" />
                {hasVoted ? "Already Voted" : "Cast Vote"}
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
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
          <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Your Voting Power</p>
                  <p className="text-3xl font-semibold">{userVotingPower.toLocaleString()} votes</p>
                  <p className="text-xs text-muted-foreground">Based on tokens owned across all properties</p>
                </div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-accent">{activeProposals.length}</p>
                    <p className="text-sm text-muted-foreground">Active Proposals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{closedProposals.length}</p>
                    <p className="text-sm text-muted-foreground">Closed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active" className="relative">
                Active Proposals
                {activeProposals.length > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 justify-center">{activeProposals.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="closed">Closed Proposals</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeProposals.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {activeProposals.map((p, i) => <ProposalCard key={p.id} proposal={p} index={i} />)}
                </div>
              ) : (
                <Card className="opacity-0 animate-fade-in-up">
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

          <Card className="opacity-0 animate-fade-in-up animation-delay-200">
            <CardHeader>
              <CardTitle className="text-base">How Governance Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: 1, title: "Proposal Created", description: "Property managers or token holders with >5% ownership can create proposals" },
                  { step: 2, title: "Voting Period", description: "Token holders have 7-14 days to cast their votes based on tokens owned" },
                  { step: 3, title: "Quorum Required", description: "At least 30% of total tokens must participate for the vote to be valid" },
                  { step: 4, title: "Execution", description: "If passed with >50% approval, the proposal is executed by the property manager" },
                ].map((item, index) => (
                  <div
                    key={item.step}
                    className="opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${(index + 3) * 100}ms`, animationFillMode: "forwards" }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold text-sm">
                        {item.step}
                      </div>
                      <h4 className="font-medium">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground pl-11">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cast Your Vote</DialogTitle>
            <DialogDescription>{selectedProposal?.title}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Your Voting Power</p>
              <p className="text-xl font-semibold">{userVotingPower.toLocaleString()} votes</p>
            </div>

            <RadioGroup value={selectedVote} onValueChange={setSelectedVote}>
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                <RadioGroupItem value="for" id="for" />
                <Label htmlFor="for" className="flex items-center gap-2 cursor-pointer flex-1">
                  <ThumbsUp className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
                  Vote For
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                <RadioGroupItem value="against" id="against" />
                <Label htmlFor="against" className="flex items-center gap-2 cursor-pointer flex-1">
                  <ThumbsDown className="h-4 w-4 text-destructive" />
                  Vote Against
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                <RadioGroupItem value="abstain" id="abstain" />
                <Label htmlFor="abstain" className="flex items-center gap-2 cursor-pointer flex-1">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Abstain
                </Label>
              </div>
            </RadioGroup>

            {voteError && (
              <p className="text-sm text-destructive">{voteError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button disabled={!selectedVote || submitting} onClick={submitVote}>
              {submitting ? "Submitting..." : "Submit Vote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
