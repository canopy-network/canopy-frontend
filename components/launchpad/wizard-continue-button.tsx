import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WizardContinueButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function WizardContinueButton({
  onClick,
  disabled = false,
  className = "",
  children = "Continue",
}: WizardContinueButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className={`gap-2 px-8 ${className}`}
    >
      {children}
      <ArrowRight className="h-5 w-5" />
    </Button>
  );
}
