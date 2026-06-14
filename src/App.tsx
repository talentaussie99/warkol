import React, { useState, useEffect, useRef } from "react";
import { 
  Coffee, 
  Clock, 
  Send, 
  Users, 
  Pin, 
  RefreshCw, 
  ChevronDown,
  Sparkles, 
  ChefHat, 
  Compass, 
  Plus, 
  BookOpen, 
  MessageSquare,
  Smile,
  DollarSign,
  User,
  Heart,
  Flag,
  Bell,
  ThumbsUp,
  Image as ImageIcon,
  Trash2,
  MessageCircle,
  X,
  Swords
} from "lucide-react";

import { TableId, Message, Meja, MenuItem, LinimasaPost, Notification } from "./types";
import { 
  INITIAL_MEJA_LIST, 
  INITIAL_PENGUNJUNG, 
  KUTIPAN_WARUNG, 
  MENU_ITEMS, 
  INITIAL_CHAT,
  AUTO_REPLIES,
  INDO_NAMES,
  TAGS,
  COLORS,
  CHAT_SENSORS_FOR_TABLES
} from "./data";
import { PRESET_AVATARS, renderUserAvatar, renderMessageTextWithTags, injectTagIfPossible } from "./components/common/UIComponents";
import { HowToOrderModal, PurchaseConfirmModal } from "./components/modals/SajianModals";
import { Header } from "./components/layout/Header";
import { LeftSidebar } from "./components/layout/LeftSidebar";
import { RightSidebar } from "./components/layout/RightSidebar";
import { LoginPage } from "./components/layout/LoginPage";
import { Timeline } from "./components/features/Timeline";
import { Notifications } from "./components/features/Notifications";
import { ChatArea } from "./components/features/ChatArea";
import ChessBoard from "./components/ChessBoard";
import { supabase } from "./lib/supabaseClient";

import { TutorialModal } from "./components/modals/TutorialModal";

export default function App() {
  // Application State
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Kamu (Nongkrong)");
  const [nameChanges, setNameChanges] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [userPin, setUserPin] = useState<string>(() => {
    const savedPin = localStorage.getItem("user_pin");
    if (savedPin) return savedPin;

    const chars = "0123456789ABCDEF";
    let pinStr = "";
    for (let i = 0; i < 8; i++) {
      pinStr += chars[Math.floor(Math.random() * chars.length)];
    }
    localStorage.setItem("user_pin", pinStr);
    return pinStr;
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [userStatus, setUserStatus] = useState("☕ Lagi Ngopi");
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const [activeTableId, setActiveTableId] = useState<string>(TableId.SANTAI);
  const [mainView, setMainView] = useState<"chat" | "chess">("chat");
  const [mobileActiveTab, setMobileActiveTab] = useState<"chat" | "rooms" | "menu" | "chess" | "profile">("chat");
  const [dashboardTab, setDashboardTab] = useState<"obrolan" | "linimasa" | "pemberitahuan">("obrolan");
  const [previousTab, setPreviousTab] = useState<"obrolan" | "linimasa">("obrolan");
  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [tables, setTables] = useState<Meja[]>([]);
  const [pengunjung, setPengunjung] = useState<any[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(true);

  // Notifications State
  const [notifications, setNotifications] = useState<{
    id: string;
    type: "like" | "comment";
    sender: string;
    postId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
  }[]>([]);

  // The Sims-style hunger & thirst states
  const [hunger, setHunger] = useState<number>(100); // Lapar (0-100)
  const [thirst, setThirst] = useState<number>(100); // Haus (0-100)
  const [foodInventory, setFoodInventory] = useState<(MenuItem & { instanceId: string })[]>([]);
  
  const [userAvatar, setUserAvatar] = useState<string>(() => localStorage.getItem("user_avatar") || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80");
  
  // Order frequency limiting & cooldown state
  const [orderHistory, setOrderHistory] = useState<number[]>([]);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [orderWarningText, setOrderWarningText] = useState<string | null>(null);
  
  // Create Room state
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomTopic, setNewRoomTopic] = useState("");
  const [newRoomIcon, setNewRoomIcon] = useState("☕");
  const [newRoomInviteUsername, setNewRoomInviteUsername] = useState("");
  
  // Input fields
  const [newMsgText, setNewMsgText] = useState("");
  
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const [saldo, setSaldo] = useState<number>(20000);
  const [showHowToOrderModal, setShowHowToOrderModal] = useState(false);
  const [showPanduanModal, setShowPanduanModal] = useState(false);
  const [purchaseConfirmItem, setPurchaseConfirmItem] = useState<MenuItem | null>(null);
  const [orderConfirmingId, setOrderConfirmingId] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"terms" | "privacy" | "account" | "lang" | "guide" | "support">("lang");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [activeMobileToast, setActiveMobileToast] = useState<any | null>(null);

  // Automatically switch mobile view to 'chat' tab if notifications tab is opened from header bell
  useEffect(() => {
    if (dashboardTab === "pemberitahuan") {
      setMobileActiveTab("chat");
    }
  }, [dashboardTab]);

  // Watch for new notifications on mobile to display as instant toasted feedback
  const prevNotificationsLength = useRef(0);
  useEffect(() => {
    if (notifications && notifications.length > prevNotificationsLength.current) {
      const latestNotif = notifications[0];
      if (latestNotif) {
        setActiveMobileToast(latestNotif);
        const timer = setTimeout(() => {
          setActiveMobileToast(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
    prevNotificationsLength.current = notifications ? notifications.length : 0;
  }, [notifications]);

  // Translation helpers
  const _t = (idText: string, enText: string) => lang === "en" ? enText : idText;

  // Login / Join State
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinEmail, setJoinEmail] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [showAuthRequiredAlert, setShowAuthRequiredAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Spam Control & Rate Limiting state
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [cooldownViolationCount, setCooldownViolationCount] = useState<number>(0);
  const [lastPostTime, setLastPostTime] = useState<number>(0);
  const [fastChatStreak, setFastChatStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Chat Reporting state
  const [messageReports, setMessageReports] = useState<Record<string, number>>({});
  const [reportingMessage, setReportingMessage] = useState<Message | null>(null);
  const [selectedReportReason, setSelectedReportReason] = useState<string>("");
  const [reportSuccessFeedback, setReportSuccessFeedback] = useState<boolean>(false);

  // --- SUPABASE REALTIME SYNCHRONIZATION ---

  // Clean up legacy and active bot entries from the database to ensure strictly real users
  useEffect(() => {
    const cleanAllBots = async () => {
      try {
        const botNames = [
          "Bang Bakso", "Om Galon", "Kang Pecel", "Bang Soto", "Om Lele", "Kang Bubur",
          "Pak RT", "Mbah Kopi", "Cak Lontong", "Lek Kupat", "Pak RW", "Kang Siomay",
          "Mas Batagor", "Mpok Jamu", "Bang Ojol", "Mas Gorengan", "Kang Gorengan"
        ];
        await supabase.from("pesan_chat").delete().in("sender", botNames);
        await supabase.from("pengunjung").delete().in("name", botNames);
      } catch (err) {
        console.error("Error cleaning bots from database:", err);
      }
    };
    cleanAllBots();
  }, []);

  // 1. Authenticated session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        const email = session.user.email || "";
        const parts = email.split("@")[0];
        const nick = parts.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 15) || "Kang_Kopi";
        setUserName(nick);
        if (!localStorage.getItem("tutorial_done")) {
          setShowTutorial(true);
        }
      }
      setIsAuthLoading(false);
    }).catch(() => {
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setIsLoggedIn(true);
        const email = session.user.email || "";
        const parts = email.split("@")[0];
        const defaultNick = parts.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 15) || "Kang_Kopi";
        
        // Fetch saved saldo, hunger, thirst, inventory for this user
        // Migrate to session.user.id if needed
        let fetchId = session.user.id;
        let { data } = await supabase.from("pengunjung").select("name, status, avatar, name_changes, saldo, hunger, thirst, inventory").eq("id", fetchId).single();
        
        if (!data) {
           // Fallback attempt migration from old email-based ID
           const { data: oldData } = await supabase.from("pengunjung").select("name, status, avatar, name_changes, saldo, hunger, thirst, inventory").eq("id", `visitor-${defaultNick}`).single();
           if (oldData) data = oldData;
        }

        if (data) {
          if (data.name) setUserName(data.name);
          else setUserName(defaultNick);
          
          if (data.status) setUserStatus(data.status);
          if (data.avatar) setUserAvatar(data.avatar);
          if (data.name_changes) setNameChanges(data.name_changes);
          
          setSaldo(data.saldo ?? 20000);
          setHunger(data.hunger ?? 100);
          setThirst(data.thirst ?? 100);
          setFoodInventory(data.inventory ?? []);
        } else {
          setUserName(defaultNick);
        }

        if (!localStorage.getItem("tutorial_done")) {
          setShowTutorial(true);
        }
      } else {
        setIsLoggedIn(false);
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load meja (rooms) and listen live
  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase.from("meja").select("*").order("created_at", { ascending: true });
      if (!error && data) {
        const mapped: Meja[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          icon: d.icon || "☕",
          count: d.count || 1,
          topic: d.topic || "",
          initialTopicDesc: d.initial_topic_desc || "",
          creator: d.creator || null,
          invitedUsers: d.invited_users || [],
          code: d.code || null
        }));
        
        if (!mapped.some(t => t.id === TableId.SANTAI)) {
          const defaultMeja = {
            id: TableId.SANTAI,
            name: "Obrolan Terbuka Umum",
            icon: "☕",
            count: 1,
            topic: "Tempat nongkrong dan ngobrol bebas siapa aja",
            initial_topic_desc: "Meja obrolan umum pertama yang bisa diakses semuannya."
          };
          await supabase.from("meja").insert(defaultMeja);
          mapped.unshift({
            id: defaultMeja.id,
            name: defaultMeja.name,
            icon: defaultMeja.icon,
            count: defaultMeja.count,
            topic: defaultMeja.topic,
            initialTopicDesc: defaultMeja.initial_topic_desc,
            invitedUsers: []
          });
        }
        setTables(mapped);
      }
    };

    fetchRooms();

    const channel = supabase
      .channel("meja-db-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "meja" }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Load chats (pesan_chat) and listen live
  useEffect(() => {
    if (tables.length === 0) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("pesan_chat")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data) {
        const botNames = [
          "Bang Bakso", "Om Galon", "Kang Pecel", "Bang Soto", "Om Lele", "Kang Bubur",
          "Pak RT", "Mbah Kopi", "Cak Lontong", "Lek Kupat", "Pak RW", "Kang Siomay",
          "Mas Batagor", "Mpok Jamu", "Bang Ojol", "Mas Gorengan", "Kang Gorengan"
        ];
        const realMessages = data.filter((m: any) => !botNames.includes(m.sender));

        const grouped: Record<string, Message[]> = {};
        realMessages.forEach((m: any) => {
          if (!grouped[m.table_id]) grouped[m.table_id] = [];
          grouped[m.table_id].push({
            id: m.id,
            sender: m.sender,
            text: m.text,
            role: m.role as any,
            tag: m.tag,
            timestamp: m.timestamp,
            color: m.color,
            isWithdrawn: m.is_withdrawn
          });
        });
        
        tables.forEach(t => {
          if (!grouped[t.id]) grouped[t.id] = [];
        });
        setChats(grouped);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel("chats-db-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "pesan_chat" }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tables]);

  // 4. Load linimasa_posts (with nested comments) and listen live
  useEffect(() => {
    const fetchPostsAndComments = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("linimasa_posts")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: commentsData, error: commentsError } = await supabase
        .from("linimasa_comments")
        .select("*")
        .order("created_at", { ascending: true });

      if (!postsError && postsData) {
        const commentsGrouped: Record<string, any[]> = {};
        if (commentsData) {
          commentsData.forEach((c: any) => {
            if (!commentsGrouped[c.post_id]) commentsGrouped[c.post_id] = [];
            commentsGrouped[c.post_id].push({
              id: c.id,
              author: c.author,
              text: c.text,
              timestamp: c.timestamp
            });
          });
        }

        const mapped: LinimasaPost[] = postsData.map((p: any) => {
          const rawDate = p.created_at ? new Date(p.created_at).getTime() : Date.now();
          return {
            id: p.id,
            author: p.author,
            avatarColor: p.avatar_color,
            text: p.text,
            image: p.image || undefined,
            timestamp: p.timestamp,
            createdAt: isNaN(rawDate) ? Date.now() : rawDate,
            likes: p.likes || 0,
            isLikedByUser: p.liked_by?.includes(userName) || false,
            comments: commentsGrouped[p.id] || []
          };
        });

        // Merge with existing local-only posts in localStorage (so they don't disappear)
        let mergedList = [...mapped];
        try {
          const stored = localStorage.getItem("warkop_linimasa_posts");
          if (stored) {
            const parsed = JSON.parse(stored) as LinimasaPost[];
            const now = Date.now();
            const freshStored = parsed.filter(post => now - (post.createdAt || 0) < 24 * 60 * 60 * 1000);
            
            freshStored.forEach((localPost) => {
              if (!mergedList.some((p) => p.id === localPost.id)) {
                mergedList.push(localPost);
              }
            });
          }
        } catch (e) {
          console.error("Error merging fallback posts:", e);
        }

        // Sort by createdAt descending
        mergedList.sort((a, b) => b.createdAt - a.createdAt);

        // Filter 24 hours
        const now = Date.now();
        const finalPosts = mergedList.filter(p => now - (p.createdAt || 0) < 24 * 60 * 60 * 1000);

        setLinimasaPosts(finalPosts);
      }
    };

    fetchPostsAndComments();

    const channelPosts = supabase
      .channel("timeline-db-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "linimasa_posts" }, () => {
        fetchPostsAndComments();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "linimasa_comments" }, () => {
        fetchPostsAndComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelPosts);
    };
  }, [userName]);

  // 5. Load notifications and listen live
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotifications(data.map((n: any) => ({
          id: n.id,
          type: n.type as any,
          sender: n.sender,
          postId: n.post_id,
          content: n.content,
          timestamp: n.timestamp,
          isRead: n.is_read
        })));
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel("notifications-db-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 6. Load pengunjung (online status) and register ourselves
  useEffect(() => {
    const fetchVisitors = async () => {
      const { data, error } = await supabase.from("pengunjung").select("*");
      if (!error && data) {
        const botNames = [
          "Bang Bakso", "Om Galon", "Kang Pecel", "Bang Soto", "Om Lele", "Kang Bubur",
          "Pak RT", "Mbah Kopi", "Cak Lontong", "Lek Kupat", "Pak RW", "Kang Siomay",
          "Mas Batagor", "Mpok Jamu", "Bang Ojol", "Mas Gorengan", "Kang Gorengan"
        ];
        const realVisitors = data.filter((p: any) => !botNames.includes(p.name));
        setPengunjung(realVisitors.map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status,
          isOnline: p.is_online,
          table: p.table_id || "santai",
          pin: p.pin,
          saldo: p.saldo ?? 20000,
          hunger: p.hunger ?? 100,
          thirst: p.thirst ?? 100,
          inventory: p.inventory ?? []
        })));
      }
    };

    fetchVisitors();

    const channel = supabase
      .channel("visitors-db-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "pengunjung" }, () => {
        fetchVisitors();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync player stats to DB
  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    const syncStats = async () => {
      await supabase.from("pengunjung").update({
        saldo,
        hunger,
        thirst,
        inventory: foodInventory
      }).eq("id", userId);
    };
    // Debounce stat syncing to avoid spamming the DB on rapid updates
    const timeout = setTimeout(syncStats, 1000);
    return () => clearTimeout(timeout);
  }, [saldo, hunger, thirst, foodInventory, isLoggedIn, userId]);

  // Register or update our visitor card
  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    const upsertVisitor = async () => {
      await supabase.from("pengunjung").upsert({
        id: userId,
        name: userName,
        status: userStatus,
        avatar: userAvatar,
        name_changes: nameChanges,
        is_online: true,
        table_id: activeTableId,
        pin: userPin,
        saldo: saldo,
        hunger: hunger,
        thirst: thirst,
        inventory: foodInventory,
        last_active_at: new Date().toISOString()
      }, { onConflict: 'id' });
    };

    upsertVisitor();
  }, [isLoggedIn, userId, userName, userStatus, userAvatar, activeTableId, userPin, nameChanges, saldo, hunger, thirst, foodInventory]);

  // Separate session-based unload hook to only run on genuine logout or window exit
  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    const handleUnload = async () => {
      await supabase.from("pengunjung").update({ is_online: false }).eq("id", userId);
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload();
    };
  }, [isLoggedIn, userId]);

  const handleUpdateStatus = async (newStatus: string) => {
    setUserStatus(newStatus);
    if (userId) {
      await supabase.from("pengunjung").update({ status: newStatus }).eq("id", userId);
    }
  };

  const handleUpdateAvatar = async (base64Avatar: string) => {
    setUserAvatar(base64Avatar);
    localStorage.setItem("user_avatar", base64Avatar);
    if (userId) {
      await supabase.from("pengunjung").update({ avatar: base64Avatar }).eq("id", userId);
    }
  };

  // Synchronize mainView with mobileActiveTab for chess integration
  useEffect(() => {
    if (mainView === "chess") {
      setMobileActiveTab("chess");
    } else if (mobileActiveTab === "chess") {
      setMobileActiveTab("chat");
    }
  }, [mainView]);

  // Synchronize browser URL route paths with active views and query parameters (Warkop Custom Router)
  useEffect(() => {
    const syncURLFromBrowser = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const mejaId = searchParams.get("meja");
      if (mejaId) {
        setActiveTableId(mejaId);
      }
      
      if (path.includes("/daftar")) {
        setAuthMode("register");
      } else if (path.includes("/lupakatasandi")) {
        setAuthMode("forgot");
      } else if (path.includes("/masuk")) {
        setAuthMode("login");
      } else if (path.includes("/papancerita")) {
        setMainView("chat");
        setMobileActiveTab("chat");
        setDashboardTab("linimasa");
      } else if (path.includes("/pojokcatur")) {
        setMainView("chess");
        setMobileActiveTab("chess");
      } else if (path.includes("/pemberitahuan")) {
        setMainView("chat");
        setMobileActiveTab("chat");
        setDashboardTab("pemberitahuan");
      } else if (path.includes("/beranda")) {
        setMainView("chat");
        setMobileActiveTab("chat");
        setDashboardTab("obrolan");
      }
    };

    syncURLFromBrowser();
    window.addEventListener("popstate", syncURLFromBrowser);
    return () => window.removeEventListener("popstate", syncURLFromBrowser);
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    let path = "/beranda";
    let search = "";

    if (!isLoggedIn) {
      if (authMode === "register") {
        path = "/daftar";
      } else if (authMode === "forgot") {
        path = "/lupakatasandi";
      } else {
        path = "/masuk";
      }
    } else {
      if (mainView === "chess") {
        path = "/pojokcatur";
      } else if (dashboardTab === "linimasa") {
        path = "/papancerita";
      } else if (dashboardTab === "pemberitahuan") {
        path = "/pemberitahuan";
      } else if (dashboardTab === "obrolan") {
        path = "/beranda";
      }

      if (activeTableId && activeTableId !== TableId.SANTAI) {
        search = `?meja=${activeTableId}`;
      }
    }

    const currentFull = window.location.pathname + window.location.search;
    const targetFull = path + search;
    if (currentFull !== targetFull) {
      window.history.pushState(null, "", targetFull);
    }
  }, [isAuthLoading, isLoggedIn, authMode, mainView, dashboardTab, activeTableId]);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldownUntil <= Date.now()) {
      if (timeLeft > 0) setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [cooldownUntil, timeLeft]);

  const triggerAuthAlert = (message: string) => {
    setAlertMessage(message);
    setShowAuthRequiredAlert(true);
  };

  const ensureAuth = (actionName: string): boolean => {
    if (!isLoggedIn) {
      triggerAuthAlert(`Untuk ${actionName}, kamu perlu Join Tongkrongan terlebih dahulu.`);
      setShowJoinForm(true);
      setTimeout(() => {
        const joinCard = document.getElementById("join-nongkrong-card");
        if (joinCard) {
          joinCard.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    // Fallback if needed, but the auth listener handles actual state
    const { data } = await supabase.from("pengunjung").select("saldo, hunger, thirst, inventory").eq("id", userId).single();
    if (data) {
      setSaldo(data.saldo ?? 20000);
      setHunger(data.hunger ?? 100);
      setThirst(data.thirst ?? 100);
      setFoodInventory(data.inventory ?? []);
    }

    setIsLoggedIn(true);
    setIsLoggingIn(false);
  };

  const getDisplaySender = (senderName: string): string => {
    if (isLoggedIn) return senderName;
    if (senderName === "Warkop AI" || senderName === "Sistem" || senderName === "Admin") {
      return senderName;
    }
    let hash = 0;
    for (let i = 0; i < senderName.length; i++) {
      hash = senderName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const suffix = Math.abs(hash % 90) + 10;
    return `Anonim #${suffix}`;
  };

  // Linimasa (Timeline / Social Media Feed) states
  const [linimasaPosts, setLinimasaPosts] = useState<LinimasaPost[]>(() => {
    try {
      const stored = localStorage.getItem("warkop_linimasa_posts");
      if (stored) {
        const parsed = JSON.parse(stored) as LinimasaPost[];
        const now = Date.now();
        return parsed.filter(post => now - (post.createdAt || 0) < 24 * 60 * 60 * 1000);
      }
    } catch (e) {
      console.error("Error reading initial linimasa_posts from localStorage:", e);
    }
    return [];
  });

  useEffect(() => {
    try {
      const now = Date.now();
      const freshPosts = linimasaPosts.filter(post => now - (post.createdAt || 0) < 24 * 60 * 60 * 1000);
      localStorage.setItem("warkop_linimasa_posts", JSON.stringify(freshPosts));
    } catch (e) {
      console.error("Error writing linimasa_posts to localStorage:", e);
    }
  }, [linimasaPosts]);
  const [visiblePostsCount, setVisiblePostsCount] = useState(3);
  const [seeMoreClicks, setSeeMoreClicks] = useState(0);

  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [newPostImageFile, setNewPostImageFile] = useState<File | null>(null);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostText, setEditingPostText] = useState("");
  const [confirmingDeletePostId, setConfirmingDeletePostId] = useState<string | null>(null);
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});
  
  const [secondsActive, setSecondsActive] = useState(0);
  const [virtualBill, setVirtualBill] = useState(0);
  const [virtualPiring, setVirtualPiring] = useState(0); // number of ordered snacks
  const [searchTableCode, setSearchTableCode] = useState("");
  const [showMejaSettings, setShowMejaSettings] = useState(false);
  
  // Real-time Chess Challenge State
  const [incomingChessChallenge, setIncomingChessChallenge] = useState<{
    from: string;
    senderPin: string;
    to: string;
  } | null>(null);

  const [acceptedChessChallenge, setAcceptedChessChallenge] = useState<{
    name: string;
    pin: string;
    color: "w" | "b";
  } | null>(null);
  
  // Realtime clock
  const [currentTime, setCurrentTime] = useState("");
  const nongkrongCount = pengunjung.filter(p => p.isOnline).length;

  // Chat scroll container ref
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Format current Indonesian time live
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      };
      setCurrentTime(now.toLocaleTimeString("id-ID", options) + " WIB");
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global Broadcast Listener for Chess Challenges
  useEffect(() => {
    const channel = new BroadcastChannel("warkop_chess_multiplayer");
    
    const handleGlobalMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;
      
      const normalizedMyName = userName.trim().toLowerCase();
      const normalizedMyPin = userPin.trim().toLowerCase();
      const normalizedMsgTo = (msg.to || "").trim().toLowerCase();
      
      if (msg.type === "CHESS_INVITE") {
        if (normalizedMsgTo === normalizedMyName || normalizedMsgTo === normalizedMyPin) {
          setIncomingChessChallenge({
            from: msg.from,
            senderPin: msg.senderPin || "",
            to: msg.to
          });
        }
      } else if (msg.type === "CHESS_INVITE_RESPONSE") {
        // If someone responded to our challenge and accepted, start multiplayer
        if (normalizedMsgTo === normalizedMyName || normalizedMsgTo === normalizedMyPin) {
          if (msg.accepted) {
            setAcceptedChessChallenge({
              name: msg.from,
              pin: msg.senderPin || "",
              color: "w" // Since the other person accepted, we are the inviter (White)
            });
            setMainView("chess");
          }
        }
      }
    };
    
    channel.addEventListener("message", handleGlobalMessage);
    return () => {
      channel.removeEventListener("message", handleGlobalMessage);
      channel.close();
    };
  }, [userName, userPin]);


  // Active session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsActive(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 10. INTERVALS FOR DECAY & REWARDS
  useEffect(() => {
    const timer = setInterval(() => {
      // 30 min reward check
      setSaldo(s => s + 3000);
    }, 30 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      // Post expiration (24h)
      setLinimasaPosts((prev) => prev.filter(post => Date.now() - (post.createdAt || 0) < 24 * 60 * 60 * 1000));

      setHunger((prev) => {
        const next = prev - (Math.random() > 0.5 ? 1 : 0);
        return next < 0 ? 0 : next;
      });
      setThirst((prev) => {
        const next = prev - (Math.random() > 0.5 ? 1 : 0);
        return next < 0 ? 0 : next;
      });
    }, 28000); // Decays very slowly every 28 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Order Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const formatActiveDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    if (minutes < 30) {
      return "< 30 menit";
    } else if (minutes < 60) {
      return "1 jam";
    } else {
      const hours = Math.floor(minutes / 60);
      return `lebih dr ${hours} jam`;
    }
  };

  // Scroll chat area to the top when we have newly inverted structure
  const scrollToTop = (instant = false) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: 0,
        behavior: instant ? "auto" : "smooth"
      });
    }
  };

  // Instantly scroll to top when switching obrolan
  useEffect(() => {
    scrollToTop(true);
  }, [activeTableId]);

  // Smoothly scroll to top when new messages arrive
  useEffect(() => {
    scrollToTop(false);
  }, [chats]);

  // Linimasa (Timeline / Social Media Feed) Handlers
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      ensureAuth(_t("membuat postingan linimasa", "creating a post"));
      return;
    }
    if (hunger <= 10 || thirst <= 10) {
      alert("❌ Kehabisan tenaga! Lapar atau haus kamu di bawah atau sama dengan 10%. Silakan makan atau minum di menu Sajian Hidangan terlebih dahulu.");
      return;
    }
    if (!newPostText.trim() && !newPostImage && !newPostImageFile) {
      alert("Tulis caption atau lampirkan foto terlebih dahulu, kawan!");
      return;
    }

    const finalImage = newPostImage || (newPostImageFile ? URL.createObjectURL(newPostImageFile) : undefined);

    const postId = `post-${Date.now()}`;
    const postObj = {
      id: postId,
      author: userName,
      avatar_color: "bg-[#D4A373]",
      text: newPostText,
      image: finalImage,
      timestamp: _t("Baru saja", "Just now"),
      likes: 0,
      liked_by: []
    };

    const { data: newPost, error } = await supabase.from("linimasa_posts").insert(postObj).select().single();

    const actualPost = newPost || postObj;
    setLinimasaPosts(prev => [
      {
        id: actualPost.id,
        author: actualPost.author,
        avatarColor: actualPost.avatar_color || "bg-[#D4A373]",
        text: actualPost.text,
        image: actualPost.image || undefined,
        timestamp: actualPost.timestamp,
        createdAt: actualPost.created_at ? new Date(actualPost.created_at).getTime() : Date.now(),
        likes: actualPost.likes || 0,
        isLikedByUser: false,
        comments: []
      },
      ...prev
    ]);

    setSaldo(s => s + 1000);
    setNewPostText("");
    setNewPostImage("");
    setNewPostImageFile(null);
  };

  const handleUpdatePost = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPostText.trim()) return;

    await supabase.from("linimasa_posts").update({ text: editingPostText }).eq("id", postId);
    setLinimasaPosts(prev => prev.map(p => p.id === postId ? { ...p, text: editingPostText } : p));
    setEditingPostId(null);
    setEditingPostText("");
  };

  const handleLikePost = async (postId: string) => {
    if (!isLoggedIn) {
      ensureAuth(_t("menyukai postingan", "liking a post"));
      return;
    }
    const post = linimasaPosts.find(p => p.id === postId);
    if (!post) return;

    const isLiked = post.isLikedByUser;
    const nextLikedBy = isLiked 
      ? (post.liked_by || []).filter((u: string) => u !== userName)
      : [...(post.liked_by || []), userName];

    const nextLikes = isLiked ? Math.max(0, post.likes - 1) : post.likes + 1;

    await supabase.from("linimasa_posts").update({
      likes: nextLikes,
      liked_by: nextLikedBy
    }).eq("id", postId);

    setLinimasaPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      likes: nextLikes,
      liked_by: nextLikedBy,
      isLikedByUser: !isLiked
    } : p));

    if (!isLiked && post.author !== userName) {
      await supabase.from("notifications").insert({
        id: `notif-like-${Date.now()}`,
        type: "like",
        sender: userName,
        post_id: postId,
        content: _t("menyukai postinganmu", "liked your post"),
        timestamp: _t("Baru saja", "Just now"),
        is_read: false,
        recipient: post.author
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!isLoggedIn) return;
    if (window.confirm("Apakah kamu yakin ingin menghapus postingan ini, kawan? Cerita ini tidak akan bisa kembali lagi.")) {
      await supabase.from("linimasa_posts").delete().eq("id", postId);
      setLinimasaPosts(prev => prev.filter(p => p.id !== postId));
    }
  };

  const handleSeeMore = () => {
    if (seeMoreClicks < 5) {
      setVisiblePostsCount(prev => prev + 3);
      setSeeMoreClicks(prev => prev + 1);
    }
  };

  const handleCreateComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      ensureAuth(_t("menulis komentar", "writing a comment"));
      return;
    }
    if (hunger <= 10 || thirst <= 10) {
      alert("❌ Kehabisan tenaga! Lapar atau haus kamu di bawah atau sama dengan 10%. Silakan makan atau minum di menu Sajian Hidangan terlebih dahulu.");
      return;
    }
    const txt = newCommentTexts[postId]?.trim();
    if (!txt) return;

    const post = linimasaPosts.find(p => p.id === postId);
    if (!post) return;

    const commentId = `com-${Date.now()}`;
    const newComment = {
      id: commentId,
      post_id: postId,
      author: userName,
      text: txt,
      timestamp: _t("Baru saja", "Just now")
    };
    await supabase.from("linimasa_comments").insert(newComment);

    setLinimasaPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        comments: [...p.comments, newComment]
    } : p));

    if (post.author !== userName) {
      await supabase.from("notifications").insert({
        id: `notif-comment-${Date.now()}`,
        type: "comment",
        sender: userName,
        post_id: postId,
        content: `${_t("mengomentari:", "commented:")} "${txt}"`,
        timestamp: _t("Baru saja", "Just now"),
        is_read: false,
        recipient: post.author
      });
    }

    setNewCommentTexts((prev) => ({
      ...prev,
      [postId]: ""
    }));
  };

  // Send Message logic
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureAuth(_t("mengirim pesan obrolan", "sending a chat message"))) return;
    if (hunger <= 10 || thirst <= 10) {
      alert("❌ Kehabisan tenaga! Lapar atau haus kamu di bawah atau sama dengan 10%. Silakan makan atau minum di menu Sajian Hidangan terlebih dahulu.");
      return;
    }
    if (!newMsgText.trim()) return;

    const nowMs = Date.now();

    // 1. Check if we are currently inside an active spam cooldown
    if (nowMs < cooldownUntil) {
      const nextViolations = cooldownViolationCount + 1;
      setCooldownViolationCount(nextViolations);

      if (nextViolations >= 2) {
        // Second violation or more -> Block and give a 25-second cooldown from *now*
        const newCooldown = nowMs + 25000;
        setCooldownUntil(newCooldown);
        alert(`🚨 WOI! Masih nekat nyepam? Dihukum tunggu 25 detik lagi dari sekarang! (Silakan tunggu sampai jam pasir/cooldown habis kawan)`);
      } else {
        // First violation -> Block and restart/extend the 15-second cooldown from *now*
        const newCooldown = nowMs + 15000;
        setCooldownUntil(newCooldown);
        alert(`⚠️ Sabar toh mas! Kan dibilang tunggu dulu. Cooldown diulang kembali 15 detik dari sekarang!`);
      }
      return;
    }

    // 2. Not in active cooldown, check for "chat cepat" (fast chat)
    const gap = lastPostTime ? (nowMs - lastPostTime) : 99999;
    let currentStreak = 1;
    if (gap < 4500) {
      currentStreak = fastChatStreak + 1;
    } else {
      currentStreak = 1;
    }

    setFastChatStreak(currentStreak);
    setLastPostTime(nowMs);

    const now = new Date();
    const stamp = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const originalMsg = newMsgText.trim();
    setNewMsgText("");

    // Save to Supabase
    const userMsgId = `user-${Date.now()}`;
    const userMsgObj = {
      id: userMsgId,
      table_id: activeTableId,
      sender: userName,
      text: originalMsg,
      role: "user",
      tag: "Warga",
      timestamp: stamp,
      color: "text-[#E9C46A] bg-amber-950/70 border-amber-500"
    };

    // Append instantly to local state to avoid database sync lag
    setChats(prev => ({
      ...prev,
      [activeTableId]: [
        ...(prev[activeTableId] || []),
        {
          id: userMsgObj.id,
          sender: userMsgObj.sender,
          text: userMsgObj.text,
          role: userMsgObj.role as any,
          tag: userMsgObj.tag,
          timestamp: userMsgObj.timestamp,
          color: userMsgObj.color,
          isWithdrawn: false
        }
      ]
    }));

    await supabase.from("pesan_chat").insert(userMsgObj);

    // Decrease Hunger and Thirst slightly since talking is hard work!
    setHunger(prev => Math.max(0, prev - (Math.random() > 0.85 ? 1 : 0)));
    setThirst(prev => Math.max(0, prev - (Math.random() > 0.8 ? 1 : 0)));

    setUserStatus("💬 Lagi Ngobrol");

    // Check if the streak has reached 5; if so, trigger cooldown *after* sending this message
    if (currentStreak >= 5) {
      setCooldownUntil(nowMs + 15000);
      setCooldownViolationCount(0);
      setFastChatStreak(0);
      alert(`⚠️ Astaga cepat sekali jarimu kawan! Kamu terdeteksi mengirim 5x chat cepat beruntun. Demi ketertiban warkop, silakan bertenang & tunggu 15 detik ya kawan!`);
    } else {
      // Successfully sent without violating, reset violation counters
      setCooldownViolationCount(0);
    }
  };

  const handleWithdrawMessage = async (msgId: string) => {
    if (!window.confirm(_t("Apakah kamu yakin ingin menarik pesan ini, kawan? Teman nongkrongmu mungkin sudah membacanya.", "Are you sure you want to withdraw this message, buddy? Your hanging friends might have read it."))) {
      return;
    }
    await supabase.from("pesan_chat").update({ is_withdrawn: true }).eq("id", msgId);
  };

  // Order Virtual Drink & Food Logic
  const handleChessWin = (opponentType: "bot" | "user") => {
    const reward = opponentType === "bot" ? 2000 : 5000;
    setSaldo(s => s + reward);
    alert(_t(`🏆 Menang Catur! Kamu dapet Rp ${reward.toLocaleString("id-ID")}.`, `🏆 Chess Win! You got Rp ${reward.toLocaleString("id-ID")}.`));
  };

  const handleAcceptChessChallenge = () => {
    if (!incomingChessChallenge) return;
    
    // Broadcast the accept response back to inviter
    const channel = new BroadcastChannel("warkop_chess_multiplayer");
    channel.postMessage({
      type: "CHESS_INVITE_RESPONSE",
      from: userName,
      senderPin: userPin,
      to: incomingChessChallenge.from,
      accepted: true
    });
    channel.close();

    // Configure accepted state for the unmounted ChessBoard config
    setAcceptedChessChallenge({
      name: incomingChessChallenge.from,
      pin: incomingChessChallenge.senderPin,
      color: "b" // invited guest plays black
    });

    // Directly focus and open Chess Board View
    setMainView("chess");
    setIncomingChessChallenge(null);
  };

  const handleRejectChessChallenge = () => {
    if (!incomingChessChallenge) return;

    // Broadcast reject response
    const channel = new BroadcastChannel("warkop_chess_multiplayer");
    channel.postMessage({
      type: "CHESS_INVITE_RESPONSE",
      from: userName,
      senderPin: userPin,
      to: incomingChessChallenge.from,
      accepted: false
    });
    channel.close();

    setIncomingChessChallenge(null);
  };

  const handleOrderSajian = async (item: MenuItem) => {
    if (!ensureAuth(_t("memesan menu hidangan", "ordering from the menu"))) return;

    const priceInt = parseInt(item.price.replace(/\./g, ""));

    // 2. Cek Saldo
    if (saldo < priceInt) {
      triggerAuthAlert(`❌ Saldo tidak cukup kawan! Tabunganmu cuma Rp ${saldo.toLocaleString("id-ID")}, sedangkan ${item.name} itu Rp ${item.price}.`);
      return;
    }

    if (foodInventory.length >= 3) {
      setOrderWarningText("Kantong makanan penuh! Lahap makanan di kantongmu dulu kawan (Maksimal 3 item).");
      setTimeout(() => setOrderWarningText(null), 5000);
      return;
    }

    const nowTime = Date.now();
    const threshold = 12000; // 12 seconds
    const cleanHistory = orderHistory.filter(t => nowTime - t < threshold);

    if (cooldownRemaining > 0) {
      setOrderWarningText("Mohon tunggu, Bang Kol sedang menyiapkan pesanan...");
      setTimeout(() => setOrderWarningText(null), 4000);
      return;
    }

    if (cleanHistory.length >= 1) {
      // 2nd order placed quickly! Trigger 15s cooldown limit
      setCooldownRemaining(15);
      setOrderHistory([]);
    } else {
      setOrderHistory(prev => [...cleanHistory, nowTime]);
    }

    // 3. Potong Saldo (Hanya jika lolos semua check)
    setSaldo(prev => prev - priceInt);
    setVirtualBill(prev => prev + priceInt);
    setVirtualPiring(prev => prev + 1);

    const now = new Date();
    const stamp = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    // Put item in food inventory for later consumption
    const newInvItem = {
      ...item,
      instanceId: `food-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setFoodInventory(prev => [...prev, newInvItem]);

    // 1. Log payment/order statement into chat history
    const orderLog = {
      id: `order-${Date.now()}`,
      table_id: activeTableId,
      sender: "Sistem Warkop",
      text: `🍵 ${userName} memesan virtual [${item.icon} ${item.name}] seharga Rp ${item.price} (Masuk ke Kantong!)`,
      role: "admin",
      tag: "Kasir",
      timestamp: stamp,
      color: "text-amber-300 bg-amber-950/30 border-amber-900"
    };

    await supabase.from("pesan_chat").insert(orderLog);
  };

  // Consume Food/Drink from Inventory to fill Laper/Haus
  const handleConsumeItem = (instanceId: string) => {
    const itemToEat = foodInventory.find(i => i.instanceId === instanceId);
    if (!itemToEat) return;
  
    // Remove from inventory
    setFoodInventory(prev => prev.filter(i => i.instanceId !== instanceId));
  
    // Replenish hunger or thirst based on item bonuses
    if (itemToEat.hungerBonus) {
      setHunger(prev => Math.min(100, prev + (itemToEat.hungerBonus || 0)));
    }
    if (itemToEat.thirstBonus) {
      setThirst(prev => Math.min(100, prev + (itemToEat.thirstBonus || 0)));
    }
  };

  // Create Custom Warkop Table/Discussion
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureAuth(_t("membuat obrolan baru", "creating a new chat room"))) return;
    if (saldo < 35000) {
      alert(_t(
        "Waduh kawan! Saldo kamu tidak cukup untuk membuat meja barumu (Butuh Rp 35.000). Silakan nongkrong lebih lama lagi kawan biar saldo/rejekimu bertambah!",
        "Oops buddy! Your balance is not enough to create a new chat table (Needs Rp 35,000). Please hang out longer to collect enough coins!"
      ));
      return;
    }
    if (!newRoomName.trim()) return;

    // Deduct rental cost
    setSaldo(prev => prev - 35000);

    const roomId = "room_" + Date.now();
    const invites: string[] = [];
    let displayInviteName = newRoomInviteUsername.trim();
    if (newRoomInviteUsername.trim()) {
      const targetInput = newRoomInviteUsername.trim().toUpperCase();
      const matchedVisitor = pengunjung.find(p => p.pin && p.pin.toUpperCase() === targetInput);
      if (matchedVisitor) {
        invites.push(matchedVisitor.name);
        displayInviteName = `${matchedVisitor.name} (PIN: ${matchedVisitor.pin})`;
      } else if (userPin.toUpperCase() === targetInput) {
        invites.push(userName);
        displayInviteName = `${userName} (PIN: ${userPin})`;
      } else {
        invites.push(newRoomInviteUsername.trim());
      }
    }

    const roomCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newRoom = {
      id: roomId,
      name: newRoomName.trim(),
      icon: newRoomIcon,
      count: 1,
      topic: newRoomTopic.trim() || `Ngobrol santai seputar ${newRoomName.trim()}`,
      initial_topic_desc: `Topik obrolan hangat bentukan oleh ${userName} di Warkol.`,
      creator: userName,
      invited_users: invites,
      code: roomCode
    };

    await supabase.from("meja").insert(newRoom);

    const initMsgs: any[] = [
      {
        id: `init-${Date.now()}`,
        table_id: roomId,
        sender: "Sistem Warung",
        text: `Halo kawan-kawan! Selamat datang di meja baru kita: [${newRoomIcon} ${newRoomName.trim()}]. No meja (Kode Cari) adalah: ${roomCode}. Bagikan kode 4 angka ini ke teman kawan biar bisa cari & join di sini! Biaya sewa meja sebesar Rp 35.000 telah dibayar lunas oleh @${userName}! Mari bahas: ${newRoomTopic.trim() || 'mari sruput kopinya dulu!'}`,
        role: "admin",
        tag: "Sistem",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        color: "text-rose-400 bg-rose-950/40 border-rose-800"
      }
    ];

    if (newRoomInviteUsername.trim()) {
      initMsgs.push({
        id: `invite-init-${Date.now()}`,
        table_id: roomId,
        sender: "Sistem Warung",
        text: `📢 Warga @${displayInviteName} langsung diundang ke meja private ini oleh @${userName}! Only invited users can see and join this room.`,
        role: "admin",
        tag: "Sistem",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        color: "text-amber-400 bg-amber-950/45 border-amber-900"
      });
    }

    await supabase.from("pesan_chat").insert(initMsgs);

    setActiveTableId(roomId);
    setMainView("chat");
    setMobileActiveTab("chat");
    setShowCreateRoomModal(false);
    setNewRoomName("");
    setNewRoomTopic("");
    setNewRoomIcon("☕");
    setNewRoomInviteUsername("");
  };

  // Invite user to discussion
  const handleInviteUser = async (tableId: string, usernameToInvite: string) => {
    if (!usernameToInvite.trim()) return;

    let targetUsername = usernameToInvite.trim();
    let displayInviteName = usernameToInvite.trim();
    const targetInput = usernameToInvite.trim().toUpperCase();

    // Look up in pengunjung list by PIN
    const matchedVisitor = pengunjung.find(p => p.pin && p.pin.toUpperCase() === targetInput);
    if (matchedVisitor) {
      targetUsername = matchedVisitor.name;
      displayInviteName = `${matchedVisitor.name} (PIN: ${matchedVisitor.pin})`;
    } else if (userPin.toUpperCase() === targetInput) {
      targetUsername = userName;
      displayInviteName = `${userName} (PIN: ${userPin})`;
    }

    // Update the room's invitedUsers list
    const activeTable = tables.find(t => t.id === tableId);
    if (activeTable) {
      const invited = activeTable.invitedUsers || [];
      if (!invited.includes(targetUsername)) {
        await supabase
          .from("meja")
          .update({ invited_users: [...invited, targetUsername] })
          .eq("id", tableId);
      }
    }

    // Post a lovely system message so the chat log reflects the invite
    const now = new Date();
    const stamp = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    await supabase.from("pesan_chat").insert({
      id: `sys-invite-${Date.now()}`,
      table_id: tableId,
      sender: "Sistem Warung",
      text: `📢 Warga @${displayInviteName} berhasil diundang ke meja ini oleh @${userName}!`,
      role: "admin",
      tag: "Sistem",
      timestamp: stamp,
      color: "text-amber-400 bg-amber-950/45 border-amber-900"
    });
  };

  const handleKickUser = async (tableId: string, usernameToKick: string) => {
    const activeTable = tables.find(t => t.id === tableId);
    if (activeTable) {
      await supabase
        .from("meja")
        .update({ invited_users: (activeTable.invitedUsers || []).filter((u: string) => u !== usernameToKick) })
        .eq("id", tableId);
    }

    // Post log message as system
    const stamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    await supabase.from("pesan_chat").insert({
      id: `sys-kick-${Date.now()}`,
      table_id: tableId,
      sender: "Sistem Warung",
      text: `📢 Warga @${usernameToKick} telah diusir (kick) dari meja ini oleh sang pembuat meja!`,
      role: "admin",
      tag: "Sistem",
      timestamp: stamp,
      color: "text-red-400 bg-red-955/20 border-red-900 border"
    });
  };

  const handleJoinTableByCode = async (code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    // Find custom table with this code
    const foundTable = tables.find(t => t.code === trimmedCode);
    if (!foundTable) {
      alert(`Waduh kawan! Meja dengan kode "${trimmedCode}" tidak ditemukan. Pastikan kodenya benar ya!`);
      return;
    }

    const invited = foundTable.invitedUsers || [];
    if (!invited.includes(userName) && foundTable.creator !== userName) {
      await supabase
        .from("meja")
        .update({ invited_users: [...invited, userName] })
        .eq("id", foundTable.id);
    }

    const stamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const wasAlreadyInvited = foundTable.invitedUsers?.includes(userName) || foundTable.creator === userName;
    
    if (!wasAlreadyInvited) {
      await supabase.from("pesan_chat").insert({
        id: `sys-joincode-${Date.now()}`,
        table_id: foundTable.id,
        sender: "Sistem Warung",
        text: `📢 Warga @${userName} berhasil menemukan dan masuk ke meja ini menggunakan pencarian kode 4 angka! Sapa warganya dulu kawan!`,
        role: "admin",
        tag: "Sistem",
        timestamp: stamp,
        color: "text-emerald-400 bg-emerald-955/20 border-emerald-900 border"
      });
    }

    // Navigate to and activate the table!
    setActiveTableId(foundTable.id);
    setMainView("chat");
    setMobileActiveTab("chat");
    setSearchTableCode(""); // clear search
    alert(`Sukses bergabung ke meja "${foundTable.name}"!`);
  };

  const getActiveTable = (): Meja => {
    return tables.find(m => m.id === activeTableId) || tables[0] || INITIAL_MEJA_LIST[0];
  };

  const visibleTables = tables.filter((table) => {
    // Guest (not logged in) can ONLY see Obrolan Santai
    if (!isLoggedIn) {
      return table.id === TableId.SANTAI;
    }

    // Logged in user can see:
    // 1. All default tables in INITIAL_MEJA_LIST
    const isDefault = INITIAL_MEJA_LIST.some((t) => t.id === table.id);
    if (isDefault) return true;

    // 2. Custom tables created by the user, or where they are invited
    const isCreator = table.creator === userName;
    const isInvited = table.invitedUsers && table.invitedUsers.includes(userName);
    return isCreator || isInvited;
  });

  return (
    <div className={`bg-[#1A1A1A] min-h-screen text-[#E0E0E0] font-sans selection:bg-[#D4A373] selection:text-neutral-900 ${isLoggedIn ? "pb-20" : ""}`}>
      {/* 1. TOP HEADER BAR */}
      {isLoggedIn && (
        <Header 
          _t={_t}
          onShowHowToOrder={() => setShowHowToOrderModal(true)}
          nongkrongCount={nongkrongCount}
          dashboardTab={dashboardTab}
          previousTab={previousTab as any}
          setDashboardTab={setDashboardTab}
          notifications={notifications}
          setNotifications={setNotifications}
          currentTime={currentTime}
          onShowSettings={() => setShowSettingsModal(true)}
        />
      )}

      {/* 2. MODALS */}
      <HowToOrderModal 
        show={showHowToOrderModal} 
        onClose={() => setShowHowToOrderModal(false)} 
        _t={_t} 
      />

      {/* Real-time Global Chess Challenge Banner */}
      {incomingChessChallenge && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-[#1C1713] border-2 border-emerald-500 rounded-xl p-4 shadow-2xl shadow-emerald-500/20 duration-300 animate-bounce [animation-duration:4s]">
          <div className="flex items-start gap-3">
            <span className="text-3xl animate-pulse">⚔️</span>
            <div className="flex-1">
              <h4 className="text-xs font-black text-emerald-400 tracking-wider uppercase flex items-center gap-2">
                <span>Tantangan Catur Masuk!</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping pb-2.5" />
              </h4>
              <p className="text-[11px] text-stone-200 mt-1 font-sans leading-relaxed">
                <span className="font-bold text-amber-300">@{incomingChessChallenge.from}</span> mengajak kamu bertanding catur bapak-bapak secara live!
              </p>
              {incomingChessChallenge.senderPin && (
                <p className="text-[9px] text-[#A69076] font-mono mt-0.5">
                  PIN Pengirim: <span className="bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded text-amber-400 font-bold tracking-wider">{incomingChessChallenge.senderPin}</span>
                </p>
              )}
              <div className="flex gap-2 mt-3.5">
                <button
                  onClick={handleAcceptChessChallenge}
                  className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-neutral-950 text-[10.5px] font-black rounded-lg transition-transform cursor-pointer shadow-md text-center"
                >
                  Terima (+ Main)
                </button>
                <button
                  onClick={handleRejectChessChallenge}
                  className="py-1.5 px-3 bg-red-500/15 hover:bg-red-500/25 active:scale-95 border border-red-500/35 text-rose-300 text-[10.5px] font-bold rounded-lg transition-transform cursor-pointer"
                >
                  Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <PurchaseConfirmModal 
        item={purchaseConfirmItem}
        onConfirm={(item) => {
          handleOrderSajian(item);
          setPurchaseConfirmItem(null);
        }}
        onCancel={() => setPurchaseConfirmItem(null)}
        _t={_t}
      />

      {/* 2. BODY CONTENT (3 COLUMNS or LANDING PAGE FOR GUESTS) */}
      {!isLoggedIn ? (
        <LoginPage 
          _t={_t}
          userName={userName}
          setUserName={setUserName}
          userAvatar={userAvatar}
          setUserAvatar={setUserAvatar}
          isLoggingIn={isLoggingIn}
          handleLogin={handleLogin}
          setIsLoggedIn={setIsLoggedIn}
          setUserStatus={setUserStatus}
          PRESET_AVATARS={PRESET_AVATARS}
          renderUserAvatar={renderUserAvatar}
          authMode={authMode}
          setAuthMode={setAuthMode}
        />
      ) : (
        <>
          {/* NORMAL LOGGED IN 3_COLUMN LAYOUT */}
          <main className={`max-w-[1300px] w-full mx-auto px-4 mt-4 mb-24 pb-8 lg:mb-20 lg:pb-0 grid grid-cols-1 lg:grid-cols-12 gap-4 transition-all duration-1000 ${
              (hunger < 10 || thirst < 10) ? "blur-[2px] grayscale-[0.3] brightness-75 pointer-events-none" : ""
            }`}>
        
        {/* LEFT COLUMN: MENU & DIRECTORY (3 cols) */}
        <div id="meja-directory" className={`lg:col-span-3 flex flex-col gap-3 ${mobileActiveTab === "rooms" || mobileActiveTab === "menu" ? "flex" : "hidden lg:flex"}`}>
          
          {/* TAB BAR: OBROLAN VS LINIMASA VS NOTIFIKASI */}
          <div className="bg-[#171412]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 flex-col gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hidden lg:flex">
            <div className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest px-2 pt-1 flex justify-between items-center">
              <span>🧭 {_t("Menu Utama", "Main Menu")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setDashboardTab("obrolan");
                    setPreviousTab("obrolan");
                  }}
                  className={`py-2.5 px-2 rounded-lg flex flex-row items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                    dashboardTab === "obrolan"
                      ? "bg-[#E9C46A] text-neutral-900 font-extrabold shadow-[0_2px_10px_rgba(233,196,106,0.25)] scale-[1.01]"
                      : "text-stone-400 hover:text-stone-200 hover:bg-white/5 font-semibold"
                  }`}
                >
                  <MessageCircle size={14} className={dashboardTab === "obrolan" ? "text-neutral-900" : "text-stone-400"} />
                  <span className="text-[10px] uppercase tracking-wider">{_t("Tongkrongan", "Hangout")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDashboardTab("linimasa");
                    setPreviousTab("linimasa");
                  }}
                  className={`py-2.5 px-2 rounded-lg flex flex-row items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                    dashboardTab === "linimasa"
                      ? "bg-[#E9C46A] text-neutral-900 font-extrabold shadow-[0_2px_10px_rgba(233,196,106,0.25)] scale-[1.01]"
                      : "text-stone-400 hover:text-stone-200 hover:bg-white/5 font-semibold"
                  }`}
                >
                  <Sparkles size={14} className={dashboardTab === "linimasa" ? "text-neutral-900" : "text-amber-400"} />
                  <span className="text-[10px] uppercase tracking-wider">{_t("Papan Cerita", "Story Board")}</span>
                </button>
              </div>
            </div>
          </div>

          <div className={`immersive-card p-4 ${mobileActiveTab === "rooms" ? "block" : "hidden lg:block"}`}>
            {/* Header section */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                {_t("Daftar Obrolan", "Chat Rooms")}
              </span>
            </div>

            {/* Cari Meja via 4 Angka */}
            {isLoggedIn && (
              <div className="mb-3.5 space-y-1.5 p-2 bg-[#2d2824]/40 rounded-lg border border-white/5">
                <label className="text-[9px] font-bold font-mono text-amber-500/80 tracking-wider flex items-center gap-1 uppercase">
                  🔍 Cari Meja Kawan
                </label>
                <div id="cari-meja-bar" className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Masukkan 4 angka kode meja..."
                    maxLength={4}
                    value={searchTableCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setSearchTableCode(val);
                    }}
                    className="w-full bg-[#14120F] text-stone-200 border border-white/10 text-[10px] py-1.5 pl-2 py-1 select-all pr-12 rounded-lg font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 placeholder-white/10"
                  />
                  {searchTableCode && (
                    <button
                      onClick={() => setSearchTableCode("")}
                      className="absolute right-2 px-1 text-[8.5px] font-mono text-zinc-400 hover:text-white cursor-pointer transition-colors"
                      type="button"
                    >
                      Batal
                    </button>
                  )}
                </div>
                
                {/* Search Results Display */}
                {searchTableCode.length > 0 && (() => {
                  const matched = tables.find(t => t.code === searchTableCode);
                  if (matched) {
                    const isAlreadyMember = matched.creator === userName || (matched.invitedUsers && matched.invitedUsers.includes(userName));
                    return (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded flex flex-col gap-1.5 animate-fade-in mt-2">
                        <span className="text-[8.5px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">🎉 Meja Ditemukan!</span>
                        <div className="flex items-center justify-between text-[10px] font-sans">
                          <span className="font-bold text-white max-w-[125px] truncate">
                            {matched.icon} {matched.name}
                          </span>
                          <span className="text-stone-400 text-[9px] font-mono">@{matched.creator || "Admin"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleJoinTableByCode(matched.code || "")}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-extrabold text-[9px] py-1 rounded transition-colors cursor-pointer uppercase tracking-wider text-center"
                        >
                          {isAlreadyMember ? "Masuk Meja" : "🤝 Sruput & Join"}
                        </button>
                      </div>
                    );
                  } else if (searchTableCode.length === 4) {
                    return (
                      <div className="bg-red-950/20 border border-red-500/10 p-1.5 rounded text-center text-red-400 text-[8.5px] font-sans mt-2">
                        ⚠️ Meja berkode <strong className="font-mono bg-red-950 px-1 py-0.2 rounded border border-red-500/20">{searchTableCode}</strong> tidak ada!
                      </div>
                    );
                  }
                  return (
                    <div className="text-[8px] text-stone-500 font-mono italic text-right px-1 mt-1 font-semibold leading-tight">
                      Ketik 4 digit angka kode meja kawan...
                    </div>
                  );
                })()}
              </div>
            )}
            
            {/* Table Buttons list */}
            <div className="space-y-1 max-h-[290px] overflow-y-auto pr-1 no-scrollbar">
              {visibleTables.map((table) => {
                const isActive = table.id === activeTableId;
                const lastMsg = chats[table.id]?.[chats[table.id].length - 1];
                
                return (
                  <button
                    key={table.id}
                    onClick={() => {
                      setActiveTableId(table.id);
                      setMainView("chat");
                      setMobileActiveTab("chat");
                    }}
                    className={`w-full text-left p-2.5 rounded transition-all flex flex-col justify-between cursor-pointer border border-transparent ${
                      isActive
                        ? "active-table-button shadow-md shadow-black/20"
                        : "hover:bg-white/5 text-white/70"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-sans text-sm font-semibold flex items-center gap-1.5 flex-wrap">
                        <span className="text-base leading-none">{table.icon}</span> 
                        <span>{table.name}</span>
                        {table.creator && (
                          <span className="text-[8px] bg-rose-950/40 border border-rose-500/20 text-rose-400 px-1 py-0.2 rounded font-mono font-bold flex items-center gap-0.5 uppercase tracking-wide">
                            🔒 Private
                          </span>
                        )}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? "bg-[#D4A373]/25 text-amber-300" : "bg-white/5 text-white/40 font-semibold"}`}>
                        {table.count}
                      </span>
                    </div>

                    {/* Brief sneak peak at the latest message */}
                    {isLoggedIn && (
                      <p className="text-[10px] text-white/40 italic truncate w-full mt-1 font-mono leading-none">
                        {lastMsg ? `"${lastMsg.sender}: ${lastMsg.text}"` : `Silakan ngobrol dulu`}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Buat obrolan baru button */}
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  if (ensureAuth(_t("membuat obrolan baru", "creating a new chat room"))) {
                    setShowCreateRoomModal(true);
                  }
                }}
                className="w-full mt-3 py-2 px-3 rounded text-center text-xs font-bold text-[#E9C46A] hover:text-amber-300 bg-amber-950/15 border border-dashed border-amber-900/40 hover:border-amber-700/60 flex items-center justify-center gap-1.5 cursor-pointer select-none transition-all"
                title={_t("Buka form pembuatan obrolan baru!", "Open new chat room form")}
              >
                <Plus size={13} className="text-[#E9C46A]" />
                <span>{_t("Buat Meja Obrolan Baru", "Create New Chat Table")}</span>
                <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1 py-0.2 rounded ml-1 scale-90 font-mono font-bold tracking-widest">{_t("BUAT", "CREATE")}</span>
              </button>
            )}
          </div>

          {/* MENU CATUR WARKOL */}
          <div 
            id="menu-pojok-catur" 
            onClick={() => {
              if (ensureAuth(_t("bermain catur bapak", "playing chess"))) {
                setMainView("chess");
              }
            }}
            className={`immersive-card p-3.5 bg-gradient-to-br transition-all cursor-pointer border ${
              mainView === "chess"
                ? "from-amber-950/45 to-amber-900/35 border-amber-500/70 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/30 text-amber-100"
                : "from-[#241F1A] to-[#1C1713] border-amber-900/40 hover:border-amber-700/60 hover:bg-amber-950/15"
            } hidden lg:block`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-[#E9C46A] uppercase flex items-center gap-1.5 font-sans tracking-wider font-semibold">
                👑 {_t("Pojok Catur", "Chess Corner")}
              </span>
              <span className={`text-[8px] font-mono select-none px-2 py-0.5 rounded font-bold uppercase tracking-widest ${
                mainView === "chess" 
                  ? "bg-[#E9C46A] text-neutral-950 font-black border border-[#E9C46A]" 
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
              }`}>
                {mainView === "chess" ? _t("SEDANG DILIHAT", "VIEWING") : _t("MAINKAN", "PLAY")}
              </span>
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="text-2xl select-none">♟️</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#E9C46A] hover:text-amber-300 font-sans font-bold leading-snug">{_t("Latihan vs Bot Warkop", "Practice vs Warkop Bot")}</p>
                <p className="text-[9.5px] text-white/40 font-mono mt-0.5 leading-tight">{_t("Mulai pertandingan asah otak di sini.", "Start your brain teaser match here.")}</p>
              </div>
            </div>
          </div>

          {/* VIRTUAL WARUNG MENU BAR (Immersion boost) */}
          <div id="virtual-menu" className={`immersive-card p-4 ${mobileActiveTab === "menu" ? "block" : "hidden lg:block"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#E9C46A] uppercase tracking-widest flex items-center gap-1 font-sans">
                <ChefHat size={12} /> {_t("Menu Warkol", "Café Menu")}
              </span>
              <span className="text-[8px] bg-amber-500/10 text-amber-400/90 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-black uppercase tracking-widest animate-pulse">
                {_t("Klik 2x untuk membeli", "Double click to buy")}
              </span>
            </div>
            <p className="text-[10px] text-white/40 mb-3 font-mono leading-relaxed">{_t("Pesan virtual ala-ala (hidangan simulasi, tidak benar-benar disajikan ya kawan!).", "Virtual orders (simulated menu, not real!).")}</p>

            {/* Delay/Warning Alert */}
            {cooldownRemaining > 0 && (
              <div className="bg-amber-950/65 border border-amber-850/60 text-[#E9C46A] rounded-xl p-2.5 mb-3 text-center text-[10px] font-mono font-bold leading-normal animate-pulse">
                ⏳ {_t(`Mohon tunggu Bang Kol sedang menyiapkan pesanan... Jeda ${cooldownRemaining} detik.`, `Please wait while order is being prepared... Cooldown ${cooldownRemaining} sec.`)}
              </div>
            )}
            {orderWarningText && (
              <div className="bg-[#5a1b1b]/55 border border-red-900/40 text-red-200 rounded-xl p-2.5 mb-3 text-center text-[10px] font-mono font-bold leading-normal">
                ⚠️ {orderWarningText}
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOrderConfirmingId(item.id);
                    // Reset lock after 5 seconds if not bought
                    setTimeout(() => {
                      setOrderConfirmingId(prev => prev === item.id ? null : prev);
                    }, 5000);
                  }}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    if (ensureAuth(_t("memesan menu hidangan", "ordering from the menu"))) {
                      setPurchaseConfirmItem(item);
                    }
                  }}
                  className={`p-1.5 border transition-all rounded text-left flex flex-col justify-between group cursor-pointer relative ${
                    orderConfirmingId === item.id 
                      ? "bg-amber-600/30 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] scale-[1.02]" 
                      : "bg-[#1e1e1e] hover:bg-amber-950/20 border-white/5 hover:border-amber-900/60"
                  }`}
                  title={item.description}
                >
                  {orderConfirmingId === item.id && (
                    <div className="absolute top-0 right-0 p-0.5 bg-amber-500 rounded-bl rounded-tr-none text-[#151515]">
                      <Pin size={8} className="fill-current" />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{item.icon}</span>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] text-white/70 line-clamp-1 group-hover:text-[#E9C46A] font-sans font-bold">{item.name}</span>
                      <span className="text-[7px] text-white/20 line-clamp-1 font-sans italic leading-none mt-0.5">{item.description}</span>
                    </div>
                  </div>
                  <div className="text-[8.5px] font-mono font-bold text-[#D4A373] self-end mt-1">
                    {_t("Rp " + item.price, "IDR " + item.price)}
                  </div>
                </button>
              ))}
            </div>

            {/* SETTINGS CARD - INTEGRATED INTO SIDEBAR MENU */}
            <div id="settings-card" className="mt-4 pt-3 border-t border-white/5">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="w-full border border-white/10 bg-black/20 hover:bg-amber-950/40 px-3 py-2 text-[10px] text-stone-300 hover:text-amber-200 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer font-bold tracking-wider uppercase font-mono shadow-sm"
              >
                ⚙️ {_t("Pengaturan", "Settings")}
              </button>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: ACTIVE TOPIC BOX + LIVE CHAT FEED (6 cols) */}
        <div id="main-obrolan" className={`lg:col-span-6 flex flex-col gap-4 min-h-0 ${mobileActiveTab === "chat" || mobileActiveTab === "chess" ? "flex" : "hidden lg:flex"}`}>
          {/* Mobile-only tab bar at the top of chat view */}
          {isLoggedIn && mobileActiveTab === "chat" && (
            <div className="lg:hidden bg-[#171412]/90 backdrop-blur-md p-1 rounded-xl border border-white/5 flex flex-col gap-1.5 shadow-md">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setDashboardTab("obrolan");
                    setPreviousTab("obrolan");
                  }}
                  className={`py-2 px-2 rounded-lg flex flex-row items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                    dashboardTab === "obrolan"
                      ? "bg-[#E9C46A] text-neutral-900 font-extrabold"
                      : "text-stone-400 font-semibold"
                  }`}
                >
                  <MessageCircle size={13} className={dashboardTab === "obrolan" ? "text-neutral-900" : "text-stone-400"} />
                  <span className="text-[10px] uppercase tracking-wider">{_t("Tongkrongan", "Hangout")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDashboardTab("linimasa");
                    setPreviousTab("linimasa");
                  }}
                  className={`py-2 px-2 rounded-lg flex flex-row items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                    dashboardTab === "linimasa"
                      ? "bg-[#E9C46A] text-[#151515] font-extrabold"
                      : "text-stone-400 font-semibold"
                  }`}
                >
                  <Sparkles size={13} className={dashboardTab === "linimasa" ? "text-[#151515]" : "text-amber-400"} />
                  <span className="text-[10px] uppercase tracking-wider">{_t("Papan Cerita", "Story Board")}</span>
                </button>
              </div>
            </div>
          )}

          {mainView === "chat" ? (
            <div className="flex flex-col gap-4 flex-1 min-h-0">
            
            {/* HEADER WARKOP BANNER IMAGE - ONLY ON OBROLAN TAB */}
            {dashboardTab === "obrolan" && (
              <div className="flex flex-col gap-1.5 font-sans">
                <div className="flex items-center justify-between px-1 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Suasana Warkop</span>
                    <span className="text-[9px] text-[#E9C46A] font-mono font-bold">
                      📢 Mau ngiklan dibanner? kirim ke warkol.ads@gmail.com
                    </span>
                  </div>
                </div>
                <div id="warkop-banner-container" className="w-full overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a] shadow-md animate-fade-in">
                  <img
                    id="warkop-banner-img"
                    src="https://imgur.com/onB4wid.jpg"
                    alt="Warkop Indonesia"
                    className="w-full h-auto object-cover max-h-[240px] block"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            {/* LINIMASA (TIMELINE / SOCIAL MEDIA FEED) - ONLY AFTER LOGGED IN & SELECTED */}
            {isLoggedIn && dashboardTab === "linimasa" && (
              <div id="linimasa-container" className="immersive-card p-4 bg-gradient-to-br from-[#1d1916] to-[#141210] border border-amber-900/30 rounded-xl flex flex-col gap-4 animate-fade-in mb-1 h-[1050px]">
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-[#E9C46A] tracking-[0.2em] font-sans">
                      📍 {_t("Papan Cerita Warkol", "Warkol Story Board")}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-stone-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                    {linimasaPosts.length} {_t("Postingan Warga", "Posts")}
                  </span>
                </div>

                {/* Create New Post form */}
                {hunger <= 10 || thirst <= 10 ? (
                  <div className="bg-[#1c1410] border border-amber-900/40 p-4 rounded-lg text-center flex flex-col items-center gap-2.5 shadow-md">
                    <span className="text-2xl animate-bounce [animation-duration:3s]">🥵</span>
                    <span className="text-xs font-black text-amber-400 tracking-wider">TENAGA HABIS (LAPAR / HAUS SEKARANG ≤ 10%)</span>
                    <p className="text-[10.5px] text-stone-300 font-sans leading-relaxed max-w-sm">
                      Kondisi fisikmu menurun kawan! Tidak bertenaga untuk menyebarkan gosip warga sekarang. Ayo isi perut dengan memesan hidangan dulu!
                    </p>
                    <div className="text-[9.5px] text-[#E9C46A] bg-black/50 px-3 py-1 rounded border border-amber-500/10 font-mono">
                      Ayo klik menu Sajian Hidangan di atas meja kawan! 🍜
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreatePost} className="space-y-2 bg-[#171412] p-2.5 rounded-lg border border-white/5">
                    <div className="flex gap-2 items-start">
                      {/* User profile avatar */}
                      {renderUserAvatar(userName, "w-7 h-7", "shrink-0 border border-amber-500/20")}
                      
                      <div className="flex-1">
                        <textarea
                          rows={2}
                          value={newPostText}
                          onChange={(e) => setNewPostText(e.target.value)}
                          placeholder={_t("Apa gosip hangat di mejamu hari ini, kawan? Tulis cerita atau bagikan foto...", "What's the hot gossip on your table today, buddy? Write a story or share a photo...")}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E9C46A] focus:ring-1 focus:ring-[#E9C46A]/20 transition-all font-sans resize-none"
                        />
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-white/5 flex items-center justify-between gap-2">
                      {/* Compact Attachment Actions */}
                      <div className="flex items-center gap-1.5">
                        {/* Compact Upload File */}
                        <label className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-amber-950/20 border border-white/5 hover:border-amber-900/45 rounded text-[9.5px] text-[#E9C46A] font-semibold transition-all cursor-pointer select-none">
                          <ImageIcon size={11} className="text-[#E9C46A]" />
                          <span>{_t("Upload", "Upload")}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setNewPostImageFile(file);
                                setNewPostImage("");
                              }
                            }}
                          />
                        </label>

                        {/* Compact Link Paste Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const url = window.prompt(_t("Masukkan link URL foto:", "Enter photo URL link:"));
                            if (url !== null) {
                              setNewPostImage(url);
                              setNewPostImageFile(null);
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-amber-950/20 border border-white/5 hover:border-amber-900/45 rounded text-[9.5px] text-stone-300 font-semibold transition-all select-none"
                        >
                          <Plus size={11} className="text-stone-400" />
                          <span>{_t("Link Foto", "Photo Link")}</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="py-1 px-3 bg-[#E9C46A] hover:bg-amber-400 text-neutral-950 font-black rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md select-none active:scale-95 text-center shrink-0"
                      >
                        <Sparkles size={11} />
                        <span>Posting</span>
                      </button>
                    </div>

                    {/* Image Attachment Preview */}
                    {(newPostImage || newPostImageFile) && (
                      <div className="p-1.5 bg-black/60 rounded border border-amber-500/10 flex items-center justify-between gap-3 animate-fade-in text-center">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img
                            src={newPostImage || (newPostImageFile ? URL.createObjectURL(newPostImageFile) : "")}
                            alt="Preview Lampiran"
                            className="w-10 h-10 object-cover rounded border border-white/10 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop&q=60";
                            }}
                          />
                          <span className="text-[9px] font-mono text-amber-300 truncate font-semibold">
                            📷 Tersemat: {newPostImageFile ? "File Upload" : "Link Foto"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewPostImage("");
                            setNewPostImageFile(null);
                          }}
                          className="p-1 text-stone-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
                          title="Hapus Lampiran"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {/* Linimasa Feed Scroller */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 no-scrollbar">
                  {linimasaPosts.length === 0 ? (
                    <div className="p-8 text-center text-stone-500 italic text-[11px]">
                      Belum ada postingan warga, ayo jadi yang pertama berbagi cerita, kawan! ☀️
                    </div>
                  ) : (
                    <>
                      {linimasaPosts.slice(0, visiblePostsCount).map((post) => {
                        const isSelf = post.author === userName;
                        const isCommentsExpanded = expandedCommentsPostId === post.id;
                        
                        return (
                          <div
                            key={post.id}
                            className="p-3 bg-[#171412] border border-white/5 rounded-lg flex flex-col gap-2.5 relative transition-all hover:bg-neutral-900/50 animate-fade-in"
                          >
                          {/* Post Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {renderUserAvatar(post.author || userName, "w-7 h-7", "border border-amber-500/25")}
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-stone-200 font-sans">{post.author}</span>
                                <span className="text-[9px] text-stone-500 font-mono mt-0.5">
                                  {post.timestamp === "10 menit yang lalu" || post.timestamp === "10 mins ago" ? _t("10 menit yang lalu", "10 mins ago") : 
                                   post.timestamp === "1 jam yang lalu" || post.timestamp === "1 hour ago" ? _t("1 jam yang lalu", "1 hour ago") : 
                                   post.timestamp === "2 jam yang lalu" || post.timestamp === "2 hours ago" ? _t("2 jam yang lalu", "2 hours ago") : 
                                   post.timestamp === "3 jam yang lalu" || post.timestamp === "3 hours ago" ? _t("3 jam yang lalu", "3 hours ago") : 
                                   post.timestamp === "Baru saja" || post.timestamp === "Just now" ? _t("Baru saja", "Just now") : 
                                   post.timestamp}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {isSelf && (
                                <>
                                  {Date.now() - post.createdAt < 15 * 60 * 1000 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingPostId(post.id);
                                        setEditingPostText(post.text);
                                      }}
                                      className="text-stone-500 hover:text-amber-400 p-1 rounded hover:bg-amber-500/10 transition-all cursor-pointer"
                                      title="Edit postingan kawan"
                                    >
                                      <RefreshCw size={11} />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-stone-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-all cursor-pointer"
                                    title="Hapus postingan kawan"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Caption/Content or Edit Form */}
                          {editingPostId === post.id ? (
                            <form 
                              onSubmit={(e) => handleUpdatePost(post.id, e)}
                              className="flex flex-col gap-2 bg-black/30 p-2 rounded-lg border border-amber-500/20"
                            >
                              <textarea
                                value={editingPostText}
                                onChange={(e) => setEditingPostText(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#E9C46A] font-sans resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingPostId(null)}
                                  className="px-2 py-1 text-[9px] text-stone-500 hover:text-stone-300 font-bold uppercase tracking-wider"
                                >
                                  Batal
                                </button>
                                <button
                                  type="submit"
                                  className="px-2.5 py-1 bg-[#E9C46A] text-neutral-900 rounded text-[9px] font-black uppercase tracking-wider shadow-sm"
                                >
                                  Simpan
                                </button>
                              </div>
                            </form>
                          ) : (
                            <p className="text-xs text-stone-300 leading-relaxed font-sans whitespace-pre-wrap select-text">
                              {post.text}
                            </p>
                          )}

                          {/* Post Photo (pastiin background/image-nya utuh tidak terpotong) */}
                          {post.image && (
                            <div className="w-full bg-[#120f0e] rounded-lg p-1 border border-white/10 flex items-center justify-center overflow-hidden">
                              <img
                                src={post.image}
                                alt="Post Image Media"
                                className="max-h-[250px] max-w-full object-contain rounded-md"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          )}

                          {/* Interaction buttons line */}
                          <div className="pt-1.5 border-t border-white/5 flex items-center gap-4 text-stone-400 select-none">
                            {/* Like button */}
                            <button
                              type="button"
                              onClick={() => handleLikePost(post.id)}
                              className={`flex items-center gap-1.5 text-[10.5px] cursor-pointer hover:text-rose-400 transition-colors ${
                                post.isLikedByUser ? "text-rose-400 font-bold" : ""
                              }`}
                            >
                              <Heart size={12} className={post.isLikedByUser ? "fill-rose-500 text-rose-500" : "fill-transparent"} />
                              <span>{post.likes} {_t("Suka", "Like" + (post.likes !== 1 ? "s" : ""))}</span>
                            </button>

                            {/* Comment expanded toggle button */}
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedCommentsPostId(isCommentsExpanded ? null : post.id);
                              }}
                              className={`flex items-center gap-1.5 text-[10.5px] cursor-pointer hover:text-amber-400 transition-colors ${
                                isCommentsExpanded ? "text-amber-400 font-bold" : ""
                              }`}
                            >
                              <MessageCircle size={12} />
                              <span>{post.comments.length} {_t("Komentar", "Comment" + (post.comments.length !== 1 ? "s" : ""))}</span>
                            </button>
                          </div>

                          {/* Expandable Comments list */}
                          {isCommentsExpanded && (
                            <div className="mt-2.5 pt-2.5 border-t border-dashed border-white/5 space-y-3 animate-fade-in">
                              {/* Comment form */}
                              {hunger <= 10 || thirst <= 10 ? (
                                <div className="text-[10px] text-amber-500/80 bg-amber-950/20 px-2.5 py-1.5 rounded border border-amber-950/30 font-mono italic text-center select-none">
                                  ⚠️ {_t("Perut keroncongan / haus, silakan santap menu hidangan dulu agar bisa membalas.", "Stomach growling / thirsty, please eat or drink first to reply.")}
                                </div>
                              ) : (
                                <form
                                  onSubmit={(e) => handleCreateComment(post.id, e)}
                                  className="flex items-center gap-2 mt-1"
                                >
                                  <input
                                    type="text"
                                    placeholder={_t("Tulis balasan di postingan ini...", "Write a reply to this post...")}
                                    value={newCommentTexts[post.id] || ""}
                                    onChange={(e) =>
                                      setNewCommentTexts((prev) => ({
                                        ...prev,
                                        [post.id]: e.target.value
                                      }))
                                    }
                                    className="flex-1 bg-black/45 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-white/20 focus:outline-[#E9C46A] focus:outline-none focus:border-[#E9C46A]"
                                    required
                                  />
                                  <button
                                    type="submit"
                                    className="py-1 px-3 bg-amber-500/10 hover:bg-amber-500 text-[#E9C46A] hover:text-neutral-900 border border-amber-500/20 font-bold rounded-lg transition-all text-[10px] cursor-pointer"
                                  >
                                    {_t("Balas", "Reply")}
                                  </button>
                                </form>
                              )}

                              {/* List of comments */}
                              {post.comments.length > 0 && (
                                <div className="space-y-2 bg-black/25 p-2 rounded-lg border border-white/5 max-h-[140px] overflow-y-auto no-scrollbar">
                                  {post.comments.map((comment) => (
                                    <div key={comment.id} className="text-[10.5px] leading-relaxed border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-amber-300/90 font-sans">{comment.author}:</span>
                                        <span className="text-[8px] text-stone-500 font-mono">
                                          {comment.timestamp === "8 menit yang lalu" || comment.timestamp === "8 mins ago" ? _t("8 menit yang lalu", "8 mins ago") : 
                                           comment.timestamp === "5 menit yang lalu" || comment.timestamp === "5 mins ago" ? _t("5 menit yang lalu", "5 mins ago") : 
                                           comment.timestamp === "45 menit yang lalu" || comment.timestamp === "45 mins ago" ? _t("45 menit yang lalu", "45 mins ago") : 
                                           comment.timestamp === "Baru saja" || comment.timestamp === "Just now" ? _t("Baru saja", "Just now") : 
                                           comment.timestamp}
                                        </span>
                                      </div>
                                      <p className="text-stone-300 mt-0.5 ml-1 select-text">
                                        {comment.text}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })}

                    {linimasaPosts.length > visiblePostsCount && (
                      <div className="pt-2 pb-6 flex flex-col items-center gap-3 animate-fade-in">
                        {seeMoreClicks < 5 ? (
                          <button
                            onClick={handleSeeMore}
                            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[11px] font-bold text-stone-400 hover:text-amber-400 transition-all flex items-center gap-2 cursor-pointer active:scale-95 group"
                          >
                            <span>{_t("Lihat Lebih Banyak", "See More")}</span>
                            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                          </button>
                        ) : (
                          <div className="flex flex-col items-center gap-2 px-6 py-4 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-xl text-center">
                            <RefreshCw size={18} className="text-amber-500/60 mb-1" />
                            <p className="text-[11px] font-medium text-stone-400 italic">
                              {_t("Sudah terlalu jauh nongkrongnya, kawan.", "You've scrolled quite a bit, friend.")}
                            </p>
                            <p className="text-[10px] text-stone-500">
                              {_t("Silakan segarkan (refresh) halaman untuk melihat cerita terbaru dari warga.", "Please refresh the page to see the latest stories from residents.")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* PEMBERITAHUAN (NOTIFICATIONS) - ONLY AFTER LOGGED IN & SELECTED */}
            {isLoggedIn && dashboardTab === "pemberitahuan" && (
              <div id="notifications-container" className="immersive-card p-4 bg-gradient-to-br from-[#1d1916] to-[#141210] border border-amber-900/30 rounded-xl flex flex-col gap-4 animate-fade-in mb-1 h-[900px]">
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-[#E9C46A] tracking-[0.2em] font-sans">
                      🔔 {_t("Pemberitahuan Warkol", "Warkol Notifications")}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-3xl opacity-30">
                        📭
                      </div>
                      <p className="text-xs text-stone-500 font-sans italic">{_t("Belum ada kabar baru hari ini, kawan.", "No new news today, buddy.")}</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-start gap-3 hover:bg-white/5 transition-colors cursor-default group">
                        <div className={`mt-1 p-2 rounded-lg flex items-center justify-center shrink-0 ${notif.type === 'like' ? 'bg-rose-500/10 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'bg-blue-500/10 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]'}`}>
                          {notif.type === 'like' ? <Heart size={14} fill="currentColor" /> : <MessageSquare size={14} fill="currentColor" />}
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <p className="text-[11px] leading-relaxed">
                            <span className="font-bold text-stone-200 hover:text-amber-400 cursor-pointer transition-colors">@{notif.sender}</span>
                            {" "}<span className="text-stone-400">{notif.content}</span>
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono text-stone-600 uppercase tracking-tight">{notif.timestamp}</span>
                            <button 
                              onClick={() => setDashboardTab("linimasa")}
                              className="text-[9px] font-black text-amber-500/60 hover:text-amber-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              {_t("LIHAT POST", "VIEW")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {dashboardTab === "obrolan" && (
              <div className="immersive-card flex flex-col relative overflow-hidden transition-all duration-300 h-[900px]">

                {/* INTEGRATED OBROLAN HARI INI */}
                <div className="px-4 py-2.5 border-b border-white/5 bg-[#1f1d1a] flex-shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold text-[#E9C46A] uppercase tracking-wider font-sans">
                        <span className="text-sm leading-none">{getActiveTable().icon}</span>
                        <span>{_t("Meja:", "Room:")} {getActiveTable().name}</span>
                        {getActiveTable().creator && (
                          <span className="text-[7.5px] lowercase py-0.5 px-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono rounded tracking-wider">
                            {_t("oleh ", "by ")}@{getActiveTable().creator}
                          </span>
                        )}
                        {getActiveTable().code && (
                          <button
                            type="button"
                            onClick={() => {
                              if (getActiveTable().code) {
                                navigator.clipboard.writeText(getActiveTable().code!);
                                alert(`Kode meja ${getActiveTable().code} berhasil disalin ke clipboard!`);
                              }
                            }}
                            className="text-[7.5px] bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/20 font-mono font-bold px-1.5 py-0.5 rounded tracking-widest cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                            title="Klik untuk salin kode meja kawan"
                          >
                            🔑 KODE: {getActiveTable().code}
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-300 leading-normal mt-0.5 font-sans">
                        <strong className="text-zinc-500 mr-1 font-mono">{_t("Topik:", "Topic:")}</strong> {getActiveTable().topic}
                      </p>
                    </div>

                    {/* Invitation form for custom rooms */}
                    {!INITIAL_MEJA_LIST.some(t => t.id === activeTableId) && (
                      <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded border border-white/5 self-start sm:self-auto">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const input = form.elements.namedItem("inviteUsername") as HTMLInputElement;
                            const nameToInvite = input.value.trim();
                            if (nameToInvite) {
                              if (nameToInvite.toLowerCase() === userName.toLowerCase()) {
                                alert("Kamu tidak bisa mengundang dirimu sendiri, kawan!");
                                return;
                              }
                              handleInviteUser(activeTableId, nameToInvite);
                              input.value = "";
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="text"
                            name="inviteUsername"
                            required
                            placeholder="Undang kawan..."
                            maxLength={15}
                            className="bg-[#14120F] text-[9.5px] font-mono text-amber-100 placeholder-white/20 px-2 py-0.5 rounded focus:outline-none border border-white/10 w-[100px] focus:border-[#D4A373]"
                          />
                          <button
                            type="submit"
                            className="bg-[#D4A373] hover:bg-amber-400 text-[9.5px] text-neutral-900 font-bold px-2 py-0.5 rounded cursor-pointer leading-tight transition-all"
                          >
                            Undang
                          </button>
                        </form>
                        
                        {getActiveTable().creator === userName && (
                          <button
                            type="button"
                            onClick={() => setShowMejaSettings(!showMejaSettings)}
                            className={`p-1 rounded text-[10px] border cursor-pointer transition-colors ${
                              showMejaSettings 
                                ? "bg-[#D4A373]/20 border-[#D4A373] text-amber-300"
                                : "bg-white/5 border-white/10 text-stone-400 hover:text-white"
                            }`}
                            title="Setelan Kelola Meja"
                          >
                            ⚙️
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Creator Dedicated Settings Dropdown / Drawer */}
                  {!INITIAL_MEJA_LIST.some(t => t.id === activeTableId) && getActiveTable().creator === userName && showMejaSettings && (
                    <div className="mt-2.5 p-2.5 bg-[#201c18] border border-[#D4A373]/30 rounded-lg animate-fade-in text-[10px] space-y-2 text-stone-350">
                      <div className="flex items-center justify-between border-b border-[#D4A373]/10 pb-1.5">
                        <span className="font-bold text-[#E9C46A] uppercase font-mono tracking-wider flex items-center gap-1">🛠️ Opsi Pengelola Meja</span>
                        <button 
                          onClick={() => setShowMejaSettings(false)}
                          className="text-stone-500 hover:text-white text-[9px] font-mono cursor-pointer"
                        >
                          Tutup ×
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px] font-sans">
                        <div>
                          <p className="text-zinc-400 font-semibold mb-1">📋 Detail Meja Kamu:</p>
                          <ul className="space-y-0.5 font-mono select-all">
                            <li>Nama: <span className="text-amber-200">{getActiveTable().name}</span></li>
                            <li>Kode Cari: <span className="text-amber-400 font-bold tracking-widest">{getActiveTable().code || "Tidak Ada"}</span></li>
                            <li>Kapasitas: <span className="text-stone-300">{getActiveTable().count} orang</span></li>
                          </ul>
                        </div>
                        
                        <div>
                          <p className="text-zinc-400 font-semibold mb-1">🚨 Fitur Usir Cepat (Kick):</p>
                          {(!getActiveTable().invitedUsers || getActiveTable().invitedUsers!.length === 0) ? (
                            <p className="text-stone-500 italic font-sans leading-relaxed">Belum ada warga lain yang terundang kawan.</p>
                          ) : (
                            <div className="max-h-[60px] overflow-y-auto space-y-1 warkop-scrollbar pr-0.5 mt-0.5">
                              {getActiveTable().invitedUsers!.map((usr, index) => {
                                const isSelf = usr.trim().toLowerCase() === userName.trim().toLowerCase();
                                if (isSelf) return null;
                                return (
                                  <div key={index} className="flex items-center justify-between bg-black/30 px-2 py-1 rounded border border-white/5">
                                    <span className="text-stone-200 truncate pr-1">@{usr}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Usir warga @${usr} dari meja?`)) {
                                          handleKickUser(activeTableId, usr);
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-300 bg-red-950/45 hover:bg-red-900 border border-red-500/20 px-1.5 py-0.2 rounded font-sans leading-none cursor-pointer text-[8px]"
                                    >
                                      Usir
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* List of invited members if any, for custom tables */}
                  {!INITIAL_MEJA_LIST.some(t => t.id === activeTableId) && getActiveTable().invitedUsers && getActiveTable().invitedUsers!.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-amber-500/80 font-black">Terundang sekamar:</span>
                      {getActiveTable().invitedUsers!.map((usr, i) => {
                        const isSelf = usr.trim().toLowerCase() === userName.trim().toLowerCase();
                        const isCreator = getActiveTable().creator === userName;
                        return (
                          <span key={i} className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/5 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block animate-pulse" />
                            <span>{usr}</span>
                            {isCreator && !isSelf && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Apakah kawan yakin ingin mengusir @${usr} dari meja ini?`)) {
                                    handleKickUser(activeTableId, usr);
                                  }
                                }}
                                className="text-[8.5px] text-red-400 hover:text-red-300 hover:bg-red-500/10 px-1 rounded transition-colors ml-1 cursor-pointer font-bold font-mono active:scale-95 border border-red-500/15"
                                title={`Bag pembuat: Usir @${usr}`}
                              >
                                Usir
                              </button>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Anti-Spam Cooldown Active Notice */}
                {timeLeft > 0 && (
                  <div className="bg-red-950/45 border-b border-rose-955/20 px-4 py-2 flex items-center justify-between text-[11px] text-rose-300 font-mono animate-pulse flex-shrink-0">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="text-sm select-none">⏳</span>
                      <span>Sruput kopi dulu kawan! Cooldown anti-spam: tunggu {timeLeft} detik lagi.</span>
                    </span>
                    <span className="bg-rose-950/70 text-rose-400 font-black px-2 py-0.5 rounded border border-rose-900/40 text-[10px]">
                      {timeLeft}s
                    </span>
                  </div>
                )}

                 {/* Input message form TOP */}
                 <form 
                   onSubmit={(e) => {
                     e.preventDefault();
                     if (!isLoggedIn) {
                       ensureAuth(_t("mengirim pesan obrolan", "sending a chat message"));
                       return;
                     }
                     handleSendMessage(e);
                   }} 
                   className="p-2 border-b border-white/5 bg-[#1c1c1c] flex items-center gap-1.5 flex-shrink-0"
                 >
                   <input
                     type="text"
                     maxLength={100}
                     readOnly={!isLoggedIn || hunger <= 10 || thirst <= 10}
                     onClick={() => {
                       if (!isLoggedIn) {
                         ensureAuth(_t("mengirim pesan obrolan", "sending a chat message"));
                       }
                     }}
                     onFocus={(e) => {
                       if (!isLoggedIn) {
                         e.currentTarget.blur();
                         ensureAuth(_t("mengirim pesan obrolan", "sending a chat message"));
                       }
                     }}
                     placeholder={
                       !isLoggedIn 
                         ? _t("Klik di sini untuk Join Tongkrongan & mulai ngobrol...", "Click here to Join and start chatting...")
                         : (hunger <= 10 || thirst <= 10)
                           ? _t("⚠️ Lapar/Haus ≤10%! Makan/minum di menu Sajian dulu...", "⚠️ Hunger/Thirst ≤10%! Eat/drink from Menu first...")
                           : _t("Ngobrol bareng bapak-bapak: 'bakar obat nyamuk'...", "Chat with the guys: 'light up mosquito coil'...")
                     }
                     value={newMsgText}
                     onChange={(e) => {
                       if (isLoggedIn && hunger > 10 && thirst > 10) {
                         setNewMsgText(e.target.value);
                       }
                     }}
                     className={`flex-1 border bg-[#232323] px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-700/80 font-sans cursor-pointer ${
                       (hunger <= 10 || thirst <= 10) ? "opacity-45 border-amber-900/30 cursor-not-allowed bg-black/40 focus:border-transparent text-amber-500/50" : "border-white/5"
                     }`}
                     disabled={isLoggedIn && (hunger <= 10 || thirst <= 10)}
                   />
                   <button
                     type="submit"
                     disabled={isLoggedIn && (!newMsgText.trim() || hunger <= 10 || thirst <= 10)}
                     className="bg-[#D4A373] hover:bg-[#c19262] text-neutral-900 p-1.5 rounded transition disabled:opacity-30 flex items-center justify-center cursor-pointer"
                   >
                     <Send size={14} className="stroke-[2.5]" />
                   </button>
                 </form>

                {/* Chats Feed Scroller */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {chats[activeTableId]?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-stone-500 font-sans py-12">
                      <span className="text-3xl mb-1 opacity-60">💨</span>
                      <p className="text-xs italic">Warung hening sejenak... Kirimlah pesan buat memancing tawa.</p>
                    </div>
                  ) : (
                    chats[activeTableId]?.slice().reverse().map((msg) => {
                      const reportCount = messageReports[msg.id] || 0;
                      if (reportCount > 10) return null; // Automatic high-report hiding

                      const isUser = msg.role === "user";
                      const isAdmin = msg.role === "admin";
                      
                      // Highlight condition when current user is tagged in a message from others
                      const isUserTagged = !isUser && (
                        msg.text.toLowerCase().includes(`@${userName.toLowerCase()}`) ||
                        msg.text.toLowerCase().includes("@kamu")
                      );
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[85%] transition-all ${
                            isUser ? "ml-auto items-end" : "items-start"
                          } ${
                            isUserTagged 
                              ? "border-l-3 border-amber-500 bg-amber-500/5 p-2 rounded-r-lg shadow-[0_0_15px_rgba(233,196,106,0.12)] border border-[#524436]" 
                              : ""
                          }`}
                        >
                          {/* Message tag notification */}
                          {isUserTagged && (
                            <span className="text-[8.5px] font-mono font-bold text-amber-400 flex items-center gap-1 mb-1 animate-pulse uppercase tracking-widest">
                              🔔 Kamu Ditag!
                            </span>
                          )}

                          {/* Message header details */}
                          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono flex-wrap">
                            {!isUser && (
                              <span className="text-[#D4A373] font-semibold">{getDisplaySender(msg.sender)}</span>
                            )}
                            {msg.tag && (
                              <span className={`px-1.5 py-0.2 rounded text-[8px] tracking-wide border font-bold ${
                                isAdmin 
                                  ? "bg-amber-950/80 text-[#E9C46A] border-amber-900" 
                                  : isUser
                                    ? "bg-[#D4A373] text-neutral-900 border-amber-800/10"
                                    : msg.color || "bg-[#2d2d2d] text-white/50 border-white/5"
                              }`}>
                                {msg.tag}
                              </span>
                            )}
                            <span className="text-white/30 text-[8.5px] font-medium">{msg.timestamp}</span>

                            {/* Flag / Report Button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (ensureAuth(_t("melaporkan pesan", "reporting a message"))) {
                                  setReportingMessage(msg);
                                  setSelectedReportReason("");
                                  setReportSuccessFeedback(false);
                                }
                              }}
                              className="text-stone-500 hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer ml-1 flex items-center justify-center transform hover:scale-110 active:scale-95"
                              title="Laporkan pesan ini kawan"
                            >
                              <Flag size={9.5} className="fill-transparent hover:fill-red-500/10" />
                            </button>

                            {/* Show report badge for test transparency */}
                            {reportCount > 0 && (
                              <span className="text-[8.5px] font-semibold font-mono text-rose-450 bg-rose-950/50 border border-rose-900/35 px-1 py-0.2 rounded ml-0.5 flex items-center justify-center gap-0.5" title={`${reportCount} laporan warga kawan`}>
                                🚩 {reportCount}
                              </span>
                            )}
                          </div>

                          {/* Message body bubbles */}
                          <div
                            className={`p-2.5 rounded text-xs font-sans whitespace-pre-wrap leading-relaxed relative group ${
                              isUser
                                ? "bg-[#D4A373] text-neutral-900 font-medium rounded-tr-none"
                                : isAdmin
                                  ? "bg-amber-950/15 border border-amber-900/30 text-amber-200/95 font-mono"
                                  : "bg-[#232323] text-gray-200 font-normal rounded-tl-none border border-white/5"
                            }`}
                            style={{ borderRadius: "8px" }}
                          >
                            {msg.isWithdrawn ? (
                              <span className="italic opacity-50 flex items-center gap-1.5 grayscale text-[10px]">
                                <span className="rotate-12 select-none">↩️</span>
                                {userName === msg.sender ? _t("Pesan ini telah kamu tarik, kawan", "You have withdrawn this message, friend") : _t("Pesan ini telah ditarik oleh pengirim", "This message has been withdrawn by the sender")}
                              </span>
                            ) : (
                              <>
                                {renderMessageTextWithTags(msg.text, userName)}
                                {isUser && (
                                  <button
                                    onClick={() => handleWithdrawMessage(msg.id)}
                                    className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-stone-400 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-mono hover:bg-rose-500 hover:text-white cursor-pointer z-20 shadow-sm"
                                  >
                                    Tarik Chat
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 h-full">
              {/* Chess Mode Header Banner */}
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#241F1A] to-[#1C1713] rounded border border-amber-900/40">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl select-none">♟️</span>
                  <div>
                    <h2 className="text-xs font-bold text-[#E9C46A] tracking-wider uppercase">{_t("CATUR WARKOL", "WARKOL CHESS")}</h2>
                    <p className="text-[10px] text-zinc-400 font-mono leading-none mt-0.5">{_t("Asah Otak vs Om Galon, Pak RT, atur papan catur tetap kokoh kok!", "Train your brain vs Bot. The chessboard is steady!")}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMainView("chat")}
                  className="text-[10px] font-bold bg-[#D4A373] hover:bg-[#c19262] text-neutral-950 px-2.5 py-1.5 rounded cursor-pointer transition-colors flex items-center gap-1 font-sans"
                >
                  ← {_t("Kembali ke Chat", "Back to Chat")}
                </button>
              </div>

              <div className="flex-1 min-h-[500px]">
                <ChessBoard 
                  userName={userName} 
                  userPin={userPin} 
                  pengunjung={pengunjung} 
                  disabled={hunger <= 10 || thirst <= 10} 
                  onWin={(type) => handleChessWin(type)} 
                  acceptedChallengeOpponent={acceptedChessChallenge}
                  onClearChallenge={() => setAcceptedChessChallenge(null)}
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PAPAN KARDUS & VISITORS & QUOTES (3 cols) */}
        <RightSidebar 
          _t={_t}
          isLoggedIn={isLoggedIn}
          userName={userName}
          userAvatar={userAvatar}
          userStatus={userStatus}
          userPin={userPin}
          saldo={saldo}
          secondsActive={secondsActive}
          setSecondsActive={setSecondsActive}
          formatActiveDuration={formatActiveDuration}
          hunger={hunger}
          thirst={thirst}
          isStatsExpanded={isStatsExpanded}
          setIsStatsExpanded={setIsStatsExpanded}
          isEditingName={isEditingName}
          setIsEditingName={setIsEditingName}
          isEditingStatus={isEditingStatus}
          setIsEditingStatus={setIsEditingStatus}
          setUserName={setUserName}
          handleNameChange={async (newName) => {
            setUserName(newName);
            const ts = new Date().toISOString();
            const updated = [...nameChanges, ts];
            setNameChanges(updated);
            if (userId) {
              await supabase.from("pengunjung").update({
                name: newName,
                name_changes: updated
              }).eq("id", userId);
            }
          }}
          handleUpdateStatus={handleUpdateStatus}
          handleUpdateAvatar={handleUpdateAvatar}
          setIsLoggedIn={setIsLoggedIn}
          inventory={foodInventory}
          handleConsumeItem={handleConsumeItem}
          setActiveTableId={setActiveTableId}
          setMainView={setMainView}
          TableId={TableId}
          pengunjung={pengunjung}
          mobileActiveTab={mobileActiveTab}
        />
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {isLoggedIn && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#171412]/95 backdrop-blur-md border-t border-amber-900/40 px-3 py-2 flex items-center justify-between z-50 shadow-[0_-5px_25px_rgba(0,0,0,0.8)] pb-safe">
          <button
            onClick={() => {
              setMobileActiveTab("chat");
              setMainView("chat");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
              mobileActiveTab === "chat" ? "text-[#E9C46A] scale-105 font-extrabold" : "text-stone-400 font-semibold"
            }`}
          >
            <MessageCircle size={18} className="mb-0.5" />
            <span className="text-[9px] mt-0.5 tracking-tight uppercase font-mono">{_t("Obrolan", "Chat")}</span>
          </button>

          <button
            onClick={() => {
              setMobileActiveTab("rooms");
              setMainView("chat");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
              mobileActiveTab === "rooms" ? "text-[#E9C46A] scale-105 font-extrabold" : "text-stone-400 font-semibold"
            }`}
          >
            <Compass size={18} className="mb-0.5" />
            <span className="text-[9px] mt-0.5 tracking-tight uppercase font-mono">{_t("Daftar Meja", "Rooms")}</span>
          </button>

          <button
            onClick={() => {
              setMobileActiveTab("menu");
              setMainView("chat");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
              mobileActiveTab === "menu" ? "text-[#E9C46A] scale-105 font-extrabold" : "text-stone-400 font-semibold"
            }`}
          >
            <ChefHat size={18} className="mb-0.5" />
            <span className="text-[9px] mt-0.5 tracking-tight uppercase font-mono">{_t("Menu Warkol", "Menu")}</span>
          </button>

          <button
            onClick={() => {
              setMobileActiveTab("chess");
              setMainView("chess");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
              mobileActiveTab === "chess" ? "text-[#E9C46A] scale-105 font-extrabold" : "text-stone-400 font-semibold"
            }`}
          >
            <Swords size={18} className="mb-0.5" />
            <span className="text-[9px] mt-0.5 tracking-tight uppercase font-mono text-center leading-none">{_t("Pojok Catur", "Chess Corner")}</span>
          </button>

          <button
            onClick={() => {
              setMobileActiveTab("profile");
              setMainView("chat");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
              mobileActiveTab === "profile" ? "text-[#E9C46A] scale-105 font-extrabold" : "text-stone-400 font-semibold"
            }`}
          >
            <User size={18} className="mb-0.5" />
            <span className="text-[9px] mt-0.5 tracking-tight uppercase font-mono">{_t("Profil", "Profile")}</span>
          </button>
        </div>
      )}

      {/* MOBILE FLOATING TOAST NOTIFICATION */}
      {isLoggedIn && activeMobileToast && (
        <div className="lg:hidden fixed bottom-16 left-4 right-4 z-[9999] bg-[#1C1713]/95 backdrop-blur-md border border-amber-500/40 rounded-xl p-3 shadow-2xl flex items-start gap-3 animate-slide-up">
          <div className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${activeMobileToast.type === 'like' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
            {activeMobileToast.type === 'like' ? <Heart size={14} fill="currentColor" /> : <MessageSquare size={14} fill="currentColor" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-zinc-100 leading-normal">
              <span className="font-bold text-amber-400">@{activeMobileToast.sender}</span>
              {" "}<span className="text-zinc-300">{activeMobileToast.content}</span>
            </p>
            <span className="text-[9px] font-mono text-zinc-500">{activeMobileToast.timestamp}</span>
          </div>
          <button 
            type="button"
            onClick={() => setActiveMobileToast(null)}
            className="text-stone-500 hover:text-white p-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </>
  )}

      {/* MODALS */}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettingsModal(false)}></div>
          <div className="relative bg-[#1A1613] w-[95%] max-w-lg rounded-xl border border-amber-900/40 shadow-2xl p-5 md:p-6 animate-scale-up flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-bold text-amber-400 font-mono tracking-widest uppercase mb-1">
                ⚙️ {_t("Pengaturan", "Settings")}
              </h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-stone-500 hover:text-amber-400 transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono border-b border-white/10 pb-2">
              <button
                onClick={() => setSettingsTab("lang")}
                className={`px-3 py-1.5 rounded uppercase font-bold transition-colors ${settingsTab === "lang" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-stone-400 hover:text-amber-200"}`}
              >
                🌐 {_t("Bahasa", "Language")}
              </button>
              <button
                onClick={() => setSettingsTab("guide")}
                className={`px-3 py-1.5 rounded uppercase font-bold transition-colors ${settingsTab === "guide" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "text-stone-400 hover:text-emerald-200"}`}
              >
                📘 {_t("Panduan", "Guide")}
              </button>
              <button
                onClick={() => setSettingsTab("terms")}
                className={`px-3 py-1.5 rounded uppercase font-bold transition-colors ${settingsTab === "terms" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-stone-400 hover:text-amber-200"}`}
              >
                📜 {_t("Peraturan", "Rules")}
              </button>
              <button
                onClick={() => setSettingsTab("privacy")}
                className={`px-3 py-1.5 rounded uppercase font-bold transition-colors ${settingsTab === "privacy" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-stone-400 hover:text-amber-200"}`}
              >
                🔒 {_t("Privasi", "Privacy")}
              </button>
              <button
                onClick={() => setSettingsTab("account")}
                className={`px-3 py-1.5 rounded uppercase font-bold transition-colors ${settingsTab === "account" ? "bg-red-500/15 text-red-400 border border-red-500/30" : "text-stone-400 hover:text-red-300"}`}
              >
                ⛔ {_t("Akun", "Account")}
              </button>
              <button
                onClick={() => setSettingsTab("support")}
                className={`px-3 py-1.5 rounded uppercase font-bold transition-colors ${settingsTab === "support" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" : "text-stone-450 hover:text-rose-200"}`}
              >
                💝 {_t("Dukung", "Support")}
              </button>
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-white/5 h-[300px] overflow-y-auto warkop-scrollbar text-[11px] text-stone-300 font-sans leading-relaxed">
              {settingsTab === "lang" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-[#E9C46A] mb-2">{_t("Pilih Bahasa Intermuka:", "Select Interface Language:")}</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setLang("id")}
                      className={`text-left p-2.5 rounded border transition-all ${lang === "id" ? "bg-amber-950/40 border-amber-500/50 text-amber-200" : "bg-black/40 border-white/10 hover:border-white/20 text-stone-400"}`}
                    >
                      <span className="font-bold">🇮🇩 Bahasa Indonesia</span>
                      <p className="text-[9px] mt-1 opacity-60">Bahasa gaul warung kopi / tongkrongan lokal.</p>
                    </button>
                    <button
                      onClick={() => setLang("en")}
                      className={`text-left p-2.5 rounded border transition-all ${lang === "en" ? "bg-amber-950/40 border-amber-500/50 text-amber-200" : "bg-black/40 border-white/10 hover:border-white/20 text-stone-400"}`}
                    >
                      <span className="font-bold">🇬🇧 English</span>
                      <p className="text-[9px] mt-1 opacity-60">Standard English interface translation.</p>
                    </button>
                  </div>
                </div>
              )}
              {settingsTab === "guide" && (
                <div className="space-y-4 font-sans leading-relaxed animate-fade-in pr-1 text-[11px]">
                  <div className="border-b border-white/5 pb-2">
                    <h4 className="font-bold text-emerald-400 text-xs tracking-tight mb-1 flex items-center gap-1.5">
                      📖 {_t("Panduan Bermain Warkol", "Warkol Gameplay Guide")}
                    </h4>
                    <p className="text-[10px] text-stone-400 leading-normal">
                      {_t("Berikut adalah tata cara dan mekanisme bersenang-senang di Warkop Online kita ini:", "Here are the procedures and mechanisms for having fun in our Warkop Online:")}
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <h5 className="font-bold text-amber-300 flex items-center gap-1">
                        🛒 <span>{_t("Cara Beli Hidangan (Klik 2x)", "How to Buy Dishes (Double Click)")}</span>
                      </h5>
                      <p className="text-[10px] text-stone-300 pl-4">
                        {_t("Klik 1x pada daftar menu untuk me-lock (mengunci), lalu klik 2x untuk membelinya. Ada konfirmasi sebelum saldo kawan berkurang.",
                           "Click once on the menu list to lock, then double-click to purchase. There is a confirmation before your balance is reduced.")}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-bold text-emerald-400 flex items-center gap-1">
                        💰 <span>{_t("Duit Nambah Dari Mana?", "How to Get Money?")}</span>
                      </h5>
                      <p className="text-[10px] text-stone-300 pl-4">
                        {_t("Dapatkan cuan nongkrong dengan rajin beraktivitas:", "Get some hangout cash by being active:")}
                      </p>
                      <ul className="list-disc list-inside text-[9.5px] text-stone-400 space-y-0.5 ml-4 font-mono">
                        <li>{_t("🎁 + Rp 3.000 Tip tiap 30 menit online (gaji nongkrong).", "🎁 + Rp 3.000 Tip every 30 minutes online.")}</li>
                        <li>{_t("📝 + Rp 1.000 Tiap kali kirim status di Papan Cerita.", "📝 + Rp 1.000 Every time you post on Story Board.")}</li>
                        <li>{_t("🏁 + Rp 5.000 Kalo menang main Catur Bapak.", "🏁 + Rp 5.000 If you win a Chess game.")}</li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-bold text-[#D4A373] flex items-center gap-1">
                        🍴 <span>{_t("Cara Makan / Minum", "How to Eat / Drink")}</span>
                      </h5>
                      <p className="text-[10px] text-stone-300 pl-4">
                        {_t("Setelah beli, hidangan masuk ke 'Kantong Warga' (di atas kartu profilmu di kanan). Klik ikon hidangan di situ untuk melahapnya.",
                           "After buying, the item goes to 'Citizen Pouch' (above your profile card on the right). Click the food icon there to eat/drink it.")}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-bold text-sky-400 flex items-center gap-1">
                        🔋 <span>{_t("Statistik Tubuh (Lapar & Haus)", "Body Stats (Hunger & Thirst)")}</span>
                      </h5>
                      <p className="text-[10px] text-stone-300 pl-4">
                        {_t("Lapar & Haus bertambah saat makan/minum. Indomie nambah kenyang, Kopi nambah haus (simulasi haus kafein) & segerr.",
                           "Hunger & Thirst points increase when you consume items. Noodles fill you up, Coffee refreshes you.")}
                      </p>
                    </div>

                    <div className="p-2.5 bg-red-950/25 border border-red-900/35 rounded-lg">
                      <h5 className="font-bold text-rose-400 text-[10px] flex items-center gap-1 mb-1">
                        💀 <span>{_t("Kalo Gak Makan/Minum?", "If you don't eat/drink?")}</span>
                      </h5>
                      <p className="text-[9.5px] text-stone-400 italic leading-snug">
                        {_t("Kalo statistik lapar/haus kamu di bawah 10%, pandangan kamu bakal mulai burem (Blur) dan layar jadi grayscale. Kamu gak bisa ngobrol/nongkrong sampe perut keisi lagi!",
                           "If your stats go below 10%, your vision will blur and the screen turns grayscale. You won't be able to chat or hang out until you eat again!")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {settingsTab === "terms" && (
                <div className="space-y-4 font-sans leading-relaxed animate-fade-in pr-1 text-[11px]">
                  <div className="border-b border-white/5 pb-2">
                    <h4 className="font-bold text-amber-400 text-xs tracking-tight mb-1 flex items-center gap-1.5">
                      🛡️ {_t("Peraturan Warga Warkop", "Warkop Community Rules")}
                    </h4>
                    <p className="text-[10px] text-stone-400 leading-normal">
                      {_t("Harap patuhi kesepakatan bersama demi ketertiban dan kedamaian warkop kita tercinta ini:", "Please adhere to the mutual agreement for the order and peace of our beloved cafe:")}
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex gap-2.5">
                      <span className="text-red-400 font-mono font-bold text-xs">01.</span>
                      <div>
                        <h5 className="font-bold text-stone-200">{_t("TIDAK BOLEH SARA", "NO DISCRIMINATION / SARA")}</h5>
                        <p className="text-[10px] text-stone-400">
                          {_t("Dilarang keras membawa isu SARA (Suku, Agama, Ras, dan Antar-golongan), politik panas, radikalisme, atau ujaran kebencian di obrolan.",
                             "Strictly forbidden to bring up SARA issues (ethnic, religious, racial), heated politics, regional conflicts, or hate speech in chat.")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <span className="text-red-400 font-mono font-bold text-xs">02.</span>
                      <div>
                        <h5 className="font-bold text-stone-200">{_t("DILARANG SPAM & PROMOSI", "NO SPAM & PROMOTIONS")}</h5>
                        <p className="text-[10px] text-stone-400">
                          {_t("Dilarang mengirim text duplikat terus menerus, menyepam tautan mencurigakan, link phishing, bot judi, atau promosi liar.",
                             "Forbidden to send repetitive duplicate messages, spam suspicious links, phishing urls, gambling bots, or unsolicited promotions.")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <span className="text-red-400 font-mono font-bold text-xs">03.</span>
                      <div>
                        <h5 className="font-bold text-stone-200">{_t("FITUR LAPORAN (REPORT)", "REPORT FEATURE (REPORT)")}</h5>
                        <p className="text-[10px] text-stone-400">
                          {_t("Jika menemukan kawan atau warga warkop yang bertindak menyimpang, kamu bisa melapor ke Kang Pecel, Om Galon, atau langsung ke Admin via PIN profil.",
                             "If you find an offending warkop citizen, you can report them to local characters like Kang Pecel, Om Galon, or directly to the Admin.")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <span className="text-red-400 font-mono font-bold text-xs">04.</span>
                      <div>
                        <h5 className="font-bold text-stone-200">{_t("SISTEM BANNED (BAN SYSTEM)", "BAN SYSTEM (BANNED)")}</h5>
                        <p className="text-[10px] text-stone-400">
                          {_t("Setiap pelanggaran serius akan dilaporkan secara otomatis, berujung pada blacklist PIN profil kawan dan dilarang masuk warkop selamanya.",
                             "Serious violations will be logged, resulting in your profile PIN being blacklisted and barred from entering the cafe forever.")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {settingsTab === "privacy" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#E9C46A] mb-1">{_t("Kebijakan Privasi Data", "Data Privacy Policy")}</h4>
                  <p>{_t("Warkop ini menggunakan penyimpanan lokal (browser) sementara. Kami tidak mengirimkan password asli kamu ke server manapun, karena ini adalah lingkungan simulasi front-end. Avatar dan status juga cuma nginep sementara di tab yang sama.", "This application uses local state storage. We do not transmit your real password to any server since this is a simulated front-end environment. Avatars and statuses live temporarily in memory.")}</p>
                  <p>{_t("Kami menghormati kerahasiaan gosipmu.", "We respect the confidentiality of your gossip.")}</p>
                </div>
              )}
              {settingsTab === "account" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-red-400 mb-1">{_t("Zona Berbahaya - Pengaturan Akun", "Danger Zone - Account Settings")}</h4>
                  <p className="text-red-400/80 mb-3">{_t("Penghapusan akun bersifat permanen (untuk simulasi ini). Semua pesan, riwayat kantong inventory, status, dan statistik lapar/haus akan hilang selamanya.", "Account deletion is permanent. All messages, inventory records, status, and hunger/thirst statistics will be lost forever.")}</p>
                  
                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg space-y-3">
                    <p className="font-bold text-stone-200 text-xs">{_t("Tindakan:", "Action:")}</p>
                    
                    <button
                      onClick={async () => {
                        if (confirm(_t("Yakin kawan mau keluar? Kasbonan kamu masih saya catat lho.", "Are you sure you want to log out? We'll keep your tab open."))) {
                          try {
                            await supabase.from("pengunjung").update({ is_online: false }).eq("id", userId);
                          } catch (e) {
                            console.error("Error setting offline status:", e);
                          }
                          setIsLoggedIn(false);
                          setUserId("");
                          try {
                            await supabase.auth.signOut();
                          } catch (e) {
                            console.error("Error signing out:", e);
                          }
                          // Manually remove all supabase credentials and sessions to avoid any auto-login on reload
                          Object.keys(localStorage).forEach(key => {
                            if (key.startsWith("sb-") || key.includes("supabase.auth")) {
                              localStorage.removeItem(key);
                            }
                          });
                          localStorage.removeItem("user_pin");
                          localStorage.removeItem("user_avatar");
                          localStorage.removeItem("tutorial_done");
                          
                          // Wait a moment for localStorage to guarantee saving changed files before reloading
                          await new Promise(resolve => setTimeout(resolve, 500));
                          window.location.href = "/";
                        }
                      }}
                      className="bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800 px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors w-full sm:w-auto"
                    >
                      🚪 {_t("KELUAR (LOGOUT)", "LOG OUT")}
                    </button>

                    <br/>

                    <button
                      onClick={async () => {
                        if (confirm(_t("Yakin hapus akun? Semua data simulasi akan lenyap.", "Are you sure you want to delete your account? All simulated data will vanish."))) {
                          try {
                            await supabase.from("pengunjung").delete().eq("id", userId);
                          } catch (e) {
                            console.error("Error deleting user from pengunjung:", e);
                          }
                          setIsLoggedIn(false);
                          setUserId("");
                          try {
                            await supabase.auth.signOut();
                          } catch (e) {
                            console.error("Error signing out:", e);
                          }
                          localStorage.clear();
                          sessionStorage.clear();
                          await new Promise(resolve => setTimeout(resolve, 500));
                          window.location.href = "/";
                        }
                      }}
                      className="bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors w-full sm:w-auto"
                    >
                      🗑️ {_t("HAPUS AKUN SAYA", "DELETE MY ACCOUNT")}
                    </button>
                  </div>
                </div>
              )}
              {settingsTab === "support" && (
                <div className="space-y-4 font-sans text-center py-4 animate-fade-in block">
                  <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/25 text-2xl">
                    💝
                  </div>
                  <h4 className="font-bold text-rose-450 text-xs tracking-wider uppercase font-mono">
                    {_t("Dukung Pembuat Warkol", "Support the Creator")}
                  </h4>
                  <p className="text-[10.5px] text-stone-300 max-w-sm mx-auto leading-relaxed font-sans">
                    {_t("Warkop Online ini dibuat dengan kasih sayang dan kopi hitam hangat oleh Minekaze. Jika kawan merasa terhibur dan ingin traktir kopi atau dukung biaya server, kawan bisa klik link di bawah ini:",
                       "This online cafe was made with love and hot black coffee by Minekaze. If you feel entertained and want to buy some coffee or support server costs, you can click the link below:")}
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://saweria.co/minekaze"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-[#D4A373] hover:from-amber-400 hover:to-[#c19262] text-neutral-950 px-5 py-2 rounded-full text-[10.5px] font-black cursor-pointer transition-all shadow-md shadow-amber-500/10 active:scale-95 shrink-0"
                    >
                      <Heart size={12} className="text-neutral-950 fill-neutral-950" />
                      <span>{_t("DILAYANI VIA SAWERIA", "SUPPORT VIA SAWERIA")}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded font-bold text-xs border border-amber-500/20 transition-colors"
              >
                {_t("Tutup", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP ALERT REGISTER/LOGIN REQUIREMENT */}
      {showAuthRequiredAlert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-[3px] flex items-center justify-center z-[999] p-4 animate-fade-in">
          <div className="bg-[#1C1915] border border-amber-500/40 p-6 rounded-lg max-w-sm w-full shadow-2xl text-center space-y-4 relative">
            <button
              onClick={() => setShowAuthRequiredAlert(false)}
              className="absolute top-2 right-2.5 text-zinc-400 hover:text-white text-sm cursor-pointer"
            >
              ✕
            </button>
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-2xl select-none animate-bounce">
              🔒
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-sans font-extrabold text-[#E9C46A] uppercase tracking-widest">Join Tongkrongan</h3>
              <p className="text-xs text-zinc-350 font-sans leading-relaxed">
                {alertMessage || "Kamu harus Join Tongkrongan terlebih dahulu untuk menikmati fitur ini kawan."}
              </p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded text-[10.5px] text-zinc-400 text-left leading-normal font-sans">
              📌 <span className="font-bold text-amber-300">Tips Warkol:</span> Gunakan tombol <span className="text-white font-semibold">"Masuk Instan (Akun Demo)"</span> di sebelah kanan atas untuk langsung diizinkan nongkrong!
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAuthRequiredAlert(false)}
                className="flex-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 rounded text-xs font-semibold text-white/70 hover:text-white transition-all cursor-pointer border border-white/10"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoggedIn(true);
                  setUserName("Rifki (Demo)");
                  setUserStatus("☕ Lagi Ngopi");
                  setShowAuthRequiredAlert(false);
                }}
                className="flex-[1.5] py-1.5 px-3 bg-gradient-to-r from-amber-400 to-[#D4A373] hover:from-amber-350 hover:to-amber-550 rounded text-xs font-black text-neutral-950 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
              >
                <span>⚡ Masuk Instan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MEMBUAT OBROLAN BARU */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-[3px] flex items-start md:items-center justify-center z-[999] p-2 sm:p-4 animate-fade-in overflow-y-auto">
          <form 
            onSubmit={handleCreateRoom} 
            className="bg-[#1C1915] border border-amber-500/40 p-4 sm:p-6 rounded-xl max-w-2xl w-full shadow-2xl relative text-left my-3 md:my-auto max-h-[calc(100vh-2.5rem)] md:max-h-none overflow-y-auto warkop-scrollbar"
          >
            <button
              type="button"
              onClick={() => setShowCreateRoomModal(false)}
              className="absolute top-4 right-4 text-zinc-450 hover:text-white text-base cursor-pointer"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <span className="text-xl select-none">🚪</span>
              <div>
                <h3 className="text-xs font-sans font-extrabold text-[#E9C46A] uppercase tracking-widest leading-none">Meja Obrolan Baru</h3>
                <p className="text-[10px] text-zinc-400 font-mono leading-none mt-1">Bikin lapak diskusi baru.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-5 py-4">
              {/* Left Column: Rent cost & Balance info */}
              <div className="md:col-span-2">
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] space-y-2.5 h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] sm:text-xs text-amber-400 font-bold font-mono border-b border-amber-550/15 pb-2 gap-1 flex-nowrap">
                      <span className="whitespace-nowrap shrink-0">💰 BIAYA SEWA SELLER:</span>
                      <span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-extrabold whitespace-nowrap shrink-0">Rp 35.000</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-zinc-300 text-[10.5px] font-mono">
                      <span>Saldo kamu:</span>
                      <span className={saldo >= 35000 ? "text-emerald-400 font-bold" : "text-rose-450 font-bold"}>
                        Rp {saldo.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {saldo < 35000 ? (
                      <div className="text-[9.5px] text-red-355 bg-red-950/45 p-2 rounded-md border border-red-500/10 font-sans leading-relaxed select-none font-medium">
                        ⚠️ <strong>Saldo tidak cukup kawan!</strong> Kurang Rp {(35000 - saldo).toLocaleString('id-ID')}. Nongkronglah lebih lama biar dapat kucuran dana koin reguler tiap 30 menit, menangkan pertarungan catur bapak-bapak vs bot, atau posting cerita seru di Papan Cerita untuk dapat cuan tambahan!
                      </div>
                    ) : (
                      <div className="text-[9.5px] text-emerald-355 bg-emerald-950/45 p-2 rounded-md border border-emerald-500/10 font-sans leading-relaxed select-none font-medium">
                        ✅ <strong>Saldo mencukupi kawan!</strong> Saldo kamu dipotong Rp 35.000 otomatis saat meja diluncurkan ke warung.
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t border-white/5 text-[9px] font-mono text-zinc-500 leading-tight">
                    * Meja baru yang disewa akan bersifat private. Hanya pembuat meja dan warga yang diundang saja yang bisa melihat dan join obrolan ini!
                  </div>
                </div>
              </div>

              {/* Right Column: Inputs & table emblem choice */}
              <div className="md:col-span-3 space-y-3.5">
                <div>
                  <label className="text-[9.5px] font-bold font-mono text-amber-400 block tracking-wider uppercase mb-1">Nama Obrolan / Meja:</label>
                  <input
                    type="text"
                    maxLength={22}
                    required
                    placeholder="Contoh: Obrolan Motor Klasik"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-[#141210] border border-white/10 text-xs py-2 px-3 rounded text-amber-100 placeholder-white/20 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] font-bold font-mono text-amber-400 block tracking-wider uppercase mb-1">Topik Pembahasan:</label>
                  <input
                    type="text"
                    maxLength={55}
                    required
                    placeholder="Contoh: Mending pesen mendoan atau pisang?"
                    value={newRoomTopic}
                    onChange={(e) => setNewRoomTopic(e.target.value)}
                    className="w-full bg-[#141210] border border-white/10 text-xs py-2 px-3 rounded text-amber-200 placeholder-white/20 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] font-bold font-mono text-amber-400 block tracking-wider uppercase mb-1">
                    Undang via PIN Warkol (Opsional):
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="Masukkan PIN Profil (contoh: 2B1F4A9E) atau nama kawan..."
                    value={newRoomInviteUsername}
                    onChange={(e) => setNewRoomInviteUsername(e.target.value)}
                    className="w-full bg-[#141210] border border-white/10 text-xs py-2 px-3 rounded text-amber-100 placeholder-white/20 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 font-sans"
                  />
                  <span className="text-[8.5px] text-zinc-400 font-mono mt-1 block leading-tight">
                    🔒 Meja baru ini adalah private (hanya pembuat & kawan yang diundang via PIN saja yang bisa masuk!). Kamu juga bisa undang teman tambahan nanti di dalam ruang obrolan!
                  </span>
                </div>

                <div>
                  <label className="text-[9.5px] font-bold font-mono text-amber-400 block tracking-wider uppercase mb-1.5">Pilih Lambang Meja (Icon):</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {["☕", "🚬", "⚽", "🍜", "😂", "🤝", "🔞", "🗿", "🔥", "🍻"].map((icon) => (
                      <button
                        type="button"
                        key={icon}
                        onClick={() => setNewRoomIcon(icon)}
                        className={`text-lg p-1.5 rounded border cursor-pointer transition-all flex items-center justify-center ${
                          newRoomIcon === icon 
                            ? "bg-amber-500/15 border-amber-500 text-amber-350 ring-2 ring-amber-400/25" 
                            : "bg-black/35 border-white/5 hover:border-white/20 hover:bg-white/5 text-white/70"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-white/5 justify-end">
              <button
                type="button"
                onClick={() => setShowCreateRoomModal(false)}
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs font-semibold text-white/70 hover:text-white transition-all cursor-pointer border border-white/10 font-sans"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saldo < 35000 || !newRoomName.trim() || !newRoomTopic.trim()}
                className="px-5 py-1.5 bg-[#D4A373] hover:bg-[#c19262] disabled:opacity-30 disabled:cursor-not-allowed rounded text-xs font-black text-neutral-950 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-amber-950/20 font-sans"
              >
                <span>➕ Buka Meja</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POPUP LAPORKAN PESAN / OBROLAN */}
      {reportingMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-[4px] flex items-center justify-center z-[999] p-4 animate-fade-in">
          <div className="bg-[#1C1915] border border-rose-500/40 p-6 rounded-lg max-w-sm w-full shadow-2xl relative text-left space-y-4">
            <button
              type="button"
              onClick={() => {
                setReportingMessage(null);
                setReportSuccessFeedback(false);
              }}
              className="absolute top-2.5 right-3.5 text-zinc-400 hover:text-white text-base cursor-pointer"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-2 border-b border-rose-500/10 pb-3">
              <span className="text-xl select-none text-rose-500">🚩</span>
              <div>
                <h3 className="text-xs font-sans font-extrabold text-rose-450 uppercase tracking-widest leading-none">Laporkan Obrolan</h3>
                <p className="text-[9.5px] text-zinc-400 font-mono leading-none mt-1">Bantu warkop kita tetap ramah & santai.</p>
              </div>
            </div>

            {/* Message brief */}
            <div className="bg-black/25 p-2 rounded border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-550">
                <span>PENGIRIM: @{reportingMessage.sender}</span>
                <span>{reportingMessage.timestamp}</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-sans italic line-clamp-2">"{reportingMessage.text}"</p>
            </div>

            {reportSuccessFeedback ? (
              <div className="bg-emerald-950/40 border border-emerald-950/60 p-4 rounded text-center space-y-2 animate-fade-in">
                <p className="text-emerald-400 text-xs font-bold">🎉 Laporan Kamu berhasil dikirim!</p>
                <p className="text-[10px] text-zinc-400 leading-normal">Bang Kol & Pak RT akan segera meninjau laporan ini. Terima kasih telah menjaga ketertiban warung kawan!</p>
                <button
                  type="button"
                  onClick={() => {
                    setReportingMessage(null);
                    setReportSuccessFeedback(false);
                  }}
                  className="w-full mt-2 py-1.5 bg-emerald-500 hover:bg-emerald-450 text-neutral-950 font-black rounded text-xs cursor-pointer transition-colors"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedReportReason) {
                    alert("Silakan pilih alasan laporan dulu, kawan!");
                    return;
                  }
                  
                  // Standard report handling
                  setMessageReports(prev => {
                    const currentVal = prev[reportingMessage.id] || 0;
                    const nextVal = currentVal + 1;
                    return { ...prev, [reportingMessage.id]: nextVal };
                  });
                  setReportSuccessFeedback(true);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[9.5px] font-bold font-mono text-amber-400 block tracking-wider uppercase">PILIH ALASAN LAPORAN:</label>
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1 no-scrollbar text-xs">
                    {[
                      "🚫 Spam, Iklan Judi, atau Penipuan",
                      "SARA, Ujaran Kebencian / Penghinaan",
                      "🔞 Konten Dewasa / Pornografi",
                      "⚔️ Kekerasan, Ancaman, atau Kebiadaban",
                      "🎭 Perundungan / Pelecehan (Bullying)",
                      "☕ Bukan Obrolan Bapak-bapak / Gak Santai",
                    ].map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
                          selectedReportReason === reason
                            ? "bg-rose-950/40 border-rose-500/70 text-rose-300"
                            : "bg-black/35 border-white/5 hover:border-white/10 hover:bg-white/5 text-zinc-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="report_reason"
                          checked={selectedReportReason === reason}
                          onChange={() => setSelectedReportReason(reason)}
                          className="accent-rose-500 cursor-pointer"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReportingMessage(null)}
                      className="flex-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 rounded text-xs font-semibold text-white/70 hover:text-white transition-all cursor-pointer border border-white/10 font-sans"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedReportReason}
                      className="flex-[1.5] py-1.5 px-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 rounded text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-rose-950/30 font-sans"
                    >
                      <span>🚀 Lapor Pesan</span>
                    </button>
                  </div>

                  {/* DEMO SHORTCUT BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      // Instantly report 11 times so they can see the message hidden because reportCount > 10.
                      setMessageReports(prev => {
                        const currentVal = prev[reportingMessage.id] || 0;
                        const nextVal = currentVal + 11; // Ensure it exceeds 10!
                        return { ...prev, [reportingMessage.id]: nextVal };
                      });
                      setReportSuccessFeedback(true);
                    }}
                    className="py-1 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-900/40 text-[9px] font-mono font-bold text-amber-300 rounded cursor-pointer transition-all text-center flex items-center justify-center gap-1"
                  >
                    <span>🧪 Simulator: Instan +11 Laporan (Biar Sembunyi)</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      {/* TUTORIAL MODAL */}
      {showTutorial && (
        <TutorialModal
          step={tutorialStep}
          onNext={() => setTutorialStep(prev => prev + 1)}
          onClose={() => {
            setShowTutorial(false);
            localStorage.setItem("tutorial_done", "true");
          }}
        />
      )}

      {/* 4. FOOTER */}
      {isLoggedIn && (
        <footer className="max-w-[1300px] mx-auto px-4 py-4 border-t border-white/5 text-center flex flex-col gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <div id="footer-decor" className="flex items-center justify-center gap-2 text-white/30 font-sans text-[11px]">
            <span>☕</span>
            <span className="font-semibold">{_t("Nongkrong digital tanpa ribet.", "Hassle-free digital hangout.")}</span>
          </div>
          <div className="text-[9.5px] text-stone-600 font-mono">
            Warkol © 2026. {_t("Semua Hak Dilindungi — Berbagi Cerita & Tawa", "All Rights Reserved — Sharing Stories & Laughter")}
          </div>
        </footer>
      )}
    </div>
  );
}
