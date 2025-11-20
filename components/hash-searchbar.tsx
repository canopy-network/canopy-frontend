import { ChangeEvent, ComponentProps } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type HashSearchbarSize = "default" | "md";

interface HashSearchbarProps
  extends Omit<ComponentProps<typeof Input>, "size" | "onChange"> {
  size?: ComponentProps<typeof Input>["size"];
  onType?: (value: string) => void;
  wrapperClassName?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function HashSearchbar({
  size = "default",
  onType,
  wrapperClassName,
  className,
  onChange,
  ...props
}: HashSearchbarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onType?.(event.target.value);
    onChange?.(event);
  };

  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <Search
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4"
        )}
      />
      <Input
        {...props}
        size={size}
        className={cn(
          "pl-11 bg-white/5 border-white/10 text-sm",
          size === "md" && "text-base",
          className
        )}
        onChange={handleChange}
      />
    </div>
  );
}
