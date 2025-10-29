import { ChainHolder } from "@/types";

interface AvatarGroupProps {
  holders: ChainHolder[];
  maxVisible?: number;
}

// Color palette for avatars
const AVATAR_COLORS = [
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-orange-500",
];

// Get a randomized color based on string
function getAvatarColor(str: string): string {
  if (!str) return AVATAR_COLORS[5];
  const hash = str.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Get 2-letter initials from account name
function getInitials(accountName: string): string {
  if (!accountName || accountName.length === 0) return "??";
  const words = accountName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return accountName.slice(0, 2).toUpperCase();
}

export function AvatarGroup({ holders, maxVisible = 5 }: AvatarGroupProps) {
  const visibleHolders = holders.slice(0, maxVisible);
  const remainingCount = holders.length - maxVisible;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visibleHolders.map((holder, idx) => (
          <div
            key={holder.user_id || idx}
            className={`w-8 h-8 rounded-full border-2 border-card flex items-center justify-center text-xs font-semibold text-white ${getAvatarColor(
              holder.account_name
            )}`}
          >
            {getInitials(holder.account_name)}
          </div>
        ))}
      </div>
      {remainingCount > 0 && (
        <span className="text-xs text-muted-foreground">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
