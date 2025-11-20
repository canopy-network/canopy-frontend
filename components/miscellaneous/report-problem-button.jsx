"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import ReportProblemDialog from "./report-problem-dialog";

export default function ReportProblemButton({ chainData }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center">
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground"
          onClick={() => setDialogOpen(true)}
        >
          <AlertCircle className="w-4 h-4" />
          Report a Problem
        </Button>
      </div>

      <ReportProblemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        chainData={chainData}
      />
    </>
  );
}
