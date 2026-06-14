import React from "react";
import { INDO_NAMES } from "../../data";

export const PRESET_AVATARS = [
  { value: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80", label: "Mas Santai" },
  { value: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80", label: "Mbak Kopi" },
  { value: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80", label: "Bapak Catur" },
  { value: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80", label: "Mbak Gaul" },
  { value: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80", label: "Mas Koplo" },
  { value: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80", label: "Mbak Manis" },
  { value: "☕", label: "Kopi Hitam" },
  { value: "🍜", label: "Mie Rebus" },
  { value: "🍤", label: "Gorengan" },
  { value: "🐱", label: "Kucing Oren" },
  { value: "♟️", label: "Pion Catur" }
];

export const renderUserAvatar = (nameOrAvatar: string, sizeClass: string = "w-8 h-8", extraStyles: string = "") => {
  let name = nameOrAvatar || "?";
  
  // Fallback to "K" if a URL or image path is passed as dynamic avatar value
  if (name.startsWith("http://") || name.startsWith("https://") || name.includes("/") || name.includes(".")) {
    name = "K";
  }
  
  // Clean string to get clean initial (e.g., "Kamu (Nongkrong)" -> "K")
  let cleanName = name.split(" ")[0].replace(/[^a-zA-Z0-9]/g, "");
  if (!cleanName) cleanName = name.charAt(0);
  const initial = cleanName ? cleanName.charAt(0).toUpperCase() : "?";

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    "bg-[#4D3C2C] border-[#6b523c]/50 text-amber-200", 
    "bg-[#362D24] border-[#4b3e32]/50 text-stone-300", 
    "bg-[#5c4033] border-[#7d5645]/50 text-[#E9C46A]", 
    "bg-[#2d4030] border-[#3e5942]/50 text-emerald-200",
    "bg-[#1c2e3d] border-[#294257]/50 text-sky-200",
    "bg-[#3d1c1c] border-[#572929]/50 text-rose-200",
  ];
  const colorClass = colors[Math.abs(hash) % colors.length];

  return (
    <div className={`${sizeClass} rounded-full border flex items-center justify-center font-extrabold select-none flex-shrink-0 shadow-lg text-[11px] leading-none ${colorClass} ${extraStyles}`}>
      {initial}
    </div>
  );
};

export const renderMessageTextWithTags = (text: string, currentUserName: string) => {
  if (!text) return "";
  
  const validNames = [currentUserName, "Kamu", "Kamu (Nongkrong)", ...INDO_NAMES];
  const escapedNames = validNames
    .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length);

  const regex = new RegExp(`@(${escapedNames.join('|')})`, 'gi');
  
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const nameOnly = match[1];
    
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    
    const isMe = nameOnly.toLowerCase() === currentUserName.toLowerCase() || nameOnly.toLowerCase() === "kamu";
    
    parts.push(
      <span 
        key={matchIndex} 
        className={`${
          isMe 
            ? "bg-amber-400 text-neutral-950 font-black border border-amber-300 shadow-sm ring-2 ring-amber-400/25" 
            : "bg-[#2d2822] text-[#E9C46A] border border-[#524436] font-semibold"
        } px-1.5 py-0.5 rounded text-[11px] inline-block mx-0.5`}
      >
        @{nameOnly}
      </span>
    );
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
};

export const injectTagIfPossible = (originalText: string, currentUserName: string, speakerName: string): string => {
  if (Math.random() < 0.35) {
    const candidates = [currentUserName, "Kamu", ...INDO_NAMES.filter(n => n !== speakerName)];
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    
    const patterns = [
      `Oi @${chosen}, ${originalText}`,
      `Heh @${chosen}! ${originalText}`,
      `${originalText} - Iya kan @${chosen}?`,
      `${originalText}, bener gak nih @${chosen}?`,
      `Setuju sama @${chosen}, ${originalText}`,
      `${originalText} (cc: @${chosen})`
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }
  return originalText;
};
