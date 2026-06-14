export enum TableId {
  SANTAI = "santai",
  KERJA = "kerja",
  KULIAH = "kuliah",
  GAMING = "gaming",
  CURHAT = "curhat",
  BOLA = "bola"
}

export interface Meja {
  id: string;
  name: string;
  icon: string;
  count: number;
  topic: string;
  initialTopicDesc: string;
  creator?: string;
  invitedUsers?: string[];
  code?: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  role: "user" | "guest" | "system" | "admin";
  tag?: string;
  timestamp: string;
  color: string; // Tailind badge or text color
  isWithdrawn?: boolean;
}

export interface Pengunjung {
  id: string;
  name: string;
  status: string;
  isOnline: boolean;
  table?: string;
  pin?: string;
  saldo?: number;
  hunger?: number;
  thirst?: number;
  inventory?: any[];
  avatar?: string;
  name_changes?: string[]; // Array of ISO timestamp strings
}

export interface Notification {
  id: string;
  type: "like" | "comment";
  sender: string;
  postId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  icon: string;
  category: "minuman" | "makanan" | "tambahan";
  hungerBonus?: number;
  thirstBonus?: number;
  description?: string;
  instanceId?: string; // For inventory items
}

export interface LinimasaPost {
  id: string;
  author: string;
  avatarColor?: string;
  text: string;
  image?: string;
  timestamp: string;
  createdAt: number;
  likes: number;
  isLikedByUser: boolean;
  comments: { id: string; author: string; text: string; timestamp: string }[];
}
