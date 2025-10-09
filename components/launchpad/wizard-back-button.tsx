import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WizardBackButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function WizardBackButton({
  onClick,
  disabled = false,
  className = "",
}: WizardBackButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={`gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
