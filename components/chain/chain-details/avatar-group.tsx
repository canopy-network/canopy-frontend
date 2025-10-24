interface Holder {
  address: string;
  label?: string;
}

interface AvatarGroupProps {
  holders: Holder[];
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

// Get a consistent color based on address
function getAvatarColor(address: string): string {
  const hash = address.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function AvatarGroup({ holders, maxVisible = 5 }: AvatarGroupProps) {
  const visibleHolders = holders.slice(0, maxVisible);
  const remainingCount = holders.length - maxVisible;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visibleHolders.map((holder, idx) => (
          <div
            key={holder.address || idx}
            className={`w-8 h-8 rounded-full border-2 border-card flex items-center justify-center text-xs font-semibold text-white ${getAvatarColor(
              holder.address
            )}`}
          >
            {holder.label || holder.address.slice(2, 4).toUpperCase()}
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
