import { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";

const avatarColorStyles = [
  "bg-[#EDF8F3] text-[#176B4D]",
  "bg-[#EFF6FF] text-[#2563EB]",
  "bg-[#FEE2E2] text-[#C2413A]",
  "bg-[#F3E8FF] text-[#7E22CE]",
  "bg-[#FEF3C7] text-[#B7791F]",
  "bg-[#F4F4F5] text-[#52525B]",
];

const getAvatarColorStyle = (name?: string | null) => {
  if (!name) return avatarColorStyles[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return avatarColorStyles[hash % avatarColorStyles.length];
};

const buildInitials = (value?: string | null) => {
  const source = value?.trim();
  if (!source) {
    return "NW";
  }

  const digitsOnly = source.replace(/\D/g, "");
  if (digitsOnly.length >= 7 && (source.startsWith("+") || /^\d+$/.test(source))) {
    if (digitsOnly.startsWith("91") && digitsOnly.length === 12) {
      return `9${digitsOnly[2]}`;
    }
    return digitsOnly.slice(0, 2);
  }

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export interface ContactAvatarProps {
  avatarUrl?: string | null;
  className?: string;
  name?: string | null;
}

export function ContactAvatar({ avatarUrl, className, name }: ContactAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  if (avatarUrl && !imageFailed) {
    return (
      <img
        alt={name ?? "Contact"}
        className={cn("rounded-full object-cover shrink-0", className)}
        onError={() => setImageFailed(true)}
        referrerPolicy="no-referrer"
        src={avatarUrl}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold transition-colors shrink-0",
        getAvatarColorStyle(name),
        className,
      )}
    >
      {buildInitials(name)}
    </div>
  );
}
