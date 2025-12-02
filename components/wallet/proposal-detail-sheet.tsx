"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatBalance } from "@/lib/utils/wallet-helpers";
import { withCommas } from "@/lib/utils/denomination";

interface ProposalDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal?: {
    id: number;
    title: string;
    description: string;
    chain: string;
    symbol: string;
    color: string;
    status: "active" | "passed" | "not_passed";
    endsAt?: number; // timestamp for active proposals
    options: Array<{
      id: string;
      label: string;
      votes: number;
    }>;
    totalVotes: number;
    userVote?: string; // option id if user has voted
    urgent?: boolean;
  };
  votingPower: number;
  onVote?: (proposalId: number, optionId: string) => void;
}

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: Clock,
    className: "bg-blue-500/20 text-blue-500 border-blue-500/20",
  },
  passed: {
    label: "Passed",
    icon: CheckCircle,
    className: "bg-green-500/20 text-green-500 border-green-500/20",
  },
  not_passed: {
    label: "Not Passed",
    icon: XCircle,
    className: "bg-red-500/20 text-red-500 border-red-500/20",
  },
};

export function ProposalDetailSheet({
  open,
  onOpenChange,
  proposal,
  votingPower,
  onVote,
}: ProposalDetailSheetProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    proposal?.userVote || null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  const handleVote = async () => {
    if (!proposal || !selectedOption || proposal.userVote) return;

    setIsVoting(true);
    setVoteSuccess(false);

    // Simulate vote delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsVoting(false);
    setVoteSuccess(true);

    // Wait to show success state
    setTimeout(() => {
      setVoteSuccess(false);
      onVote?.(proposal.id, selectedOption);
      onOpenChange(false);
    }, 1500);
  };

  if (!proposal) return null;

  const statusConfig = STATUS_CONFIG[proposal.status];
  const StatusIcon = statusConfig.icon;
  const canVote = proposal.status === "active" && !proposal.userVote;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Proposal Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Chain Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${proposal.color}20` }}
            >
              <span
                className="text-lg font-bold"
                style={{ color: proposal.color }}
              >
                {proposal.symbol[0]}
              </span>
            </div>
            <div>
              <p className="font-semibold">{proposal.chain}</p>
              <p className="text-sm text-muted-foreground">{proposal.symbol}</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={statusConfig.className}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
            {proposal.urgent && (
              <Badge variant="outline" className="bg-orange-500/20 text-orange-500 border-orange-500/20">
                Urgent
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold">{proposal.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {proposal.description}
            </p>
          </div>

          {/* Voting Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Vote Distribution</h4>
              <p className="text-sm text-muted-foreground">
                {withCommas(proposal.totalVotes, 0)} total votes
              </p>
            </div>

            <RadioGroup
              value={selectedOption || undefined}
              onValueChange={setSelectedOption}
              disabled={!canVote}
            >
              <div className="space-y-3">
                {proposal.options.map((option) => {
                  const percentage = proposal.totalVotes > 0
                    ? (option.votes / proposal.totalVotes) * 100
                    : 0;
                  const isUserVote = proposal.userVote === option.id;

                  return (
                    <div
                      key={option.id}
                      className={`p-4 border rounded-lg space-y-3 ${
                        selectedOption === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      } ${!canVote ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value={option.id}
                            id={option.id}
                            disabled={!canVote}
                          />
                          <Label
                            htmlFor={option.id}
                            className="font-medium cursor-pointer"
                          >
                            {option.label}
                          </Label>
                          {isUserVote && (
                            <Badge variant="secondary" className="text-xs">
                              Your Vote
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {withCommas(percentage, 1)}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {formatBalance(option.votes, 0)} votes
                      </p>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Your Voting Power */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Your Voting Power</p>
            <p className="text-lg font-bold">
              {formatBalance(votingPower, 0)} CNPY
            </p>
          </div>

          {/* Vote Button */}
          {canVote && (
            <Button
              className={`w-full h-11 ${
                voteSuccess ? "bg-green-600 hover:bg-green-600" : ""
              }`}
              onClick={handleVote}
              disabled={!selectedOption || isVoting || voteSuccess}
            >
              {isVoting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Casting Vote...
                </>
              ) : voteSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Vote Cast!
                </>
              ) : (
                "Cast Vote"
              )}
            </Button>
          )}

          {proposal.userVote && (
            <p className="text-sm text-center text-muted-foreground">
              You have already voted on this proposal
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
