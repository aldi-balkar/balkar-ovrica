interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

const getColorFromName = (name: string): string => {
  const colors = [
    '#2d7a4a', // green
    '#FF6436', // orange
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f97316', // orange-600
    '#06b6d4', // cyan
    '#a855f7', // purple-500
    '#84cc16', // lime
    '#ef4444', // red
    '#22c55e', // green-500
  ];
  
  const code = name.codePointAt(0);
  if (!code) return colors[0];
  const charCode = code.toString();
  const index = Number.parseInt(charCode, 10) % colors.length;
  return colors[index];
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  const last = words.at(-1);
  return (words[0].charAt(0) + (last?.charAt(0) ?? '')).toUpperCase();
};

export default function Avatar({ name, size = 40, className = '' }: Readonly<AvatarProps>) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
        fontSize: `${size * 0.4}px`,
      }}
    >
      {initials}
    </div>
  );
}
