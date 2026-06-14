import React, { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import { 
  RotateCcw, 
  Undo2, 
  Award, 
  Zap, 
  Brain, 
  User, 
  AlertCircle, 
  Users, 
  Radio, 
  Check, 
  X, 
  Gamepad2, 
  ChevronRight,
  Sparkles,
  Swords,
  Flag
} from "lucide-react";

const SOLID_PIECES: Record<string, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚"
};

interface BotPersonality {
  id: string;
  name: string;
  avatar: string;
  diffText: string;
  difficulty: "mudah" | "sedang" | "bapak";
  catchphrase: string;
  banters: {
    normal: string[];
    capture: string[];
    check: string;
    checkmate: string;
  };
}

const WARKOP_BOTS: BotPersonality[] = [
  {
    id: "galon",
    name: "Om Galon",
    avatar: "👴",
    diffText: "⭐ Sepuh (Cerdas)",
    difficulty: "bapak",
    catchphrase: "Monggo mas jalannya, saya pegang Hitam!",
    banters: {
      normal: [
        "Om Galon: Kopi dulu mas biar otaknya encer kayak santan.",
        "Om Galon: Langkahmu pelan tapi pasti, mirip tagihan listrik.",
        "Om Galon: Mikirnya jangan kelamaan, ntar keburu ubanan itu kuda.",
        "Om Galon: Tenang, jangan grogi, dispenser saya selalu siap sedia air dingin."
      ],
      capture: [
        "Om Galon: Mantap! Gula jawa di petak rontok kecaplok gua!",
        "Om Galon: Aduh kera sakti gua dimakan... mending minum kopi tubruk dulu.",
        "Om Galon: Wah, denda es teh manis segelas ini kalau benteng gua ilang."
      ],
      check: "Om Galon: SKAK! Hati-hati raja lu mau lari ke RT mana?!",
      checkmate: "Om Galon: SKAKMAT! Salamualaikum kawan, ganti baru lagi wkwk!"
    }
  },
  {
    id: "rt",
    name: "Pak RT",
    avatar: "👮",
    diffText: "⭐ Sedang (Disiplin)",
    difficulty: "sedang",
    catchphrase: "Bermain dengan tertib demi keharmonisan rukun warga.",
    banters: {
      normal: [
        "Pak RT: Hati-hati nak, kuasai sayap kanan, jangan asal sabet.",
        "Pak RT: Asap obat nyamuk bakar ini bikin mata pedih, tapi bidak tetep keliatan.",
        "Pak RT: Harap tertib melangkah, dilarang gaduh kayak tawuran gang sebelah."
      ],
      capture: [
        "Pak RT: Bideng bapak caplok ya, demi ketertiban wilayah.",
        "Pak RT: Wah menteri abdi negara dimakan! Ini namanya pelanggaran perda!"
      ],
      check: "Pak RT: SKAK! Tolong rajanya segera lapor posko darurat keamanan!",
      checkmate: "Pak RT: SKAKMAT! Silakan bayar iuran kebersihan untuk menebus kekalahan."
    }
  },
  {
    id: "bakso",
    name: "Bang Bakso",
    avatar: "🍲",
    diffText: "⭐ Pemula (Santai)",
    difficulty: "mudah",
    catchphrase: "Sambil nunggu kuah mendidih, kita adu menteri dulu.",
    banters: {
      normal: [
        "Bang Bakso: Sambil mikir, pesen bakso urat super gih.",
        "Bang Bakso: Jalannya licin bener, kayak mangkok bakso berminyak.",
        "Bang Bakso: Jangan kelamaan mikir mas, ntar mendoannya keburu dingin."
      ],
      capture: [
        "Bang Bakso: Hap! Dicaplok begitu aja tempe mendoan mulus lu.",
        "Bang Bakso: Waduh, pentol halus kesayangan gua digilas benteng!"
      ],
      check: "Bang Bakso: SKAK! Awas kecelup kuah kaldu panas rajamu kawan!",
      checkmate: "Bang Bakso: SKAKMAT! Mangkok kosong, game kelar, gantian ya mas."
    }
  },
  {
    id: "kopling",
    name: "Asep Kopling",
    avatar: "🏍️",
    diffText: "⭐ Pemula (Gasss)",
    difficulty: "mudah",
    catchphrase: "Gas poll ruji ruji! No rem, yang penting sabet!",
    banters: {
      normal: [
        "Asep Kopling: Sabet aja tancap gas gak usah pake taktik!",
        "Asep Kopling: Catur warkop kelar pas oli motor lu diganti.",
        "Asep Kopling: Setel kopling dulu mas biar lari kudanya kenceng."
      ],
      capture: [
        "Asep Kopling: Sikat gigi lima! Mak bres bidak lu melayang!",
        "Asep Kopling: Yahh piston gua macet kena begal ama gajah."
      ],
      check: "Asep Kopling: SKAK! Rem blong rajanya kepepet di trotoar!",
      checkmate: "Asep Kopling: SKAKMAT SLEBEWW! Motor lu mogok total pusing kepala!"
    }
  }
];

interface ChessBoardProps {
  userName?: string;
  userPin?: string;
  pengunjung?: any[];
  disabled?: boolean;
  onWin?: (opponentType: "bot" | "user") => void;
  acceptedChallengeOpponent?: {
    name: string;
    pin: string;
    color: "w" | "b";
  } | null;
  onClearChallenge?: () => void;
}

export default function ChessBoard({ 
  userName = "Kamu (Nongkrong)", 
  userPin = "",
  pengunjung = [],
  disabled = false, 
  onWin,
  acceptedChallengeOpponent = null,
  onClearChallenge
}: ChessBoardProps) {
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [isCpuThinking, setIsCpuThinking] = useState(false);

  // Multiplayer & Opponent States
  const [gameMode, setGameMode] = useState<"VS_BOT" | "MULTIPLAYER" | "LATIHAN">("VS_BOT");
  const [activeBot, setActiveBot] = useState<BotPersonality>(WARKOP_BOTS[0]);
  const [activeOnlineOpponent, setActiveOnlineOpponent] = useState<string>("");
  const [targetFriendName, setTargetFriendName] = useState("");
  const [myColor, setMyColor] = useState<"w" | "b">("w"); // 'w' or 'b'
  
  // Invitation systems
  const [isWaitingAcceptance, setIsWaitingAcceptance] = useState(false);
  const [receivedInvite, setReceivedInvite] = useState<{ from: string } | null>(null);
  const [showOpponentSelector, setShowOpponentSelector] = useState(false);

  const [banter, setBanter] = useState("Om Galon: Monggo mas jalannya, saya pegang Hitam!");

  // Sync board representation from chess.js instance
  const board = game.board();
  const turn = game.turn(); // 'w' or 'b'
  const isGameOver = game.isGameOver();
  const isCheck = game.inCheck();

  // Create native browser Broadcast Channel for Multi-tab play
  const channelRef = useRef<BroadcastChannel | null>(null);
  const moveHistoryRef = useRef<HTMLDivElement>(null);

  // Auto-scroll move history to the bottom when updated
  useEffect(() => {
    if (moveHistoryRef.current) {
      moveHistoryRef.current.scrollTop = moveHistoryRef.current.scrollHeight;
    }
  }, [gameHistory]);

  // Synchronize on mount/update if we have an accepted challenge from a parent notification
  useEffect(() => {
    if (acceptedChallengeOpponent) {
      setGameMode("MULTIPLAYER");
      setActiveOnlineOpponent(acceptedChallengeOpponent.name);
      setMyColor(acceptedChallengeOpponent.color);
      
      const newGame = new Chess();
      setGame(newGame);
      setFen(newGame.fen());
      setSelectedSquare(null);
      setPossibleMoves([]);
      setGameHistory([]);
      
      if (acceptedChallengeOpponent.color === "b") {
        setBanter(`⚔️ Duel Live dimulai! Kamu memegang Hitam melawan @${acceptedChallengeOpponent.name} (Putih jalan duluan).`);
      } else {
        setBanter(`⚔️ Duel Live dimulai! Kamu jalan duluan sebagai Putih melawan @${acceptedChallengeOpponent.name}.`);
      }
      
      // Clear parent accepted challenge trigger so it won't repeatedly initialize
      if (onClearChallenge) {
        onClearChallenge();
      }
    }
  }, [acceptedChallengeOpponent, onClearChallenge]);

  // Initialize write channel
  useEffect(() => {
    channelRef.current = new BroadcastChannel("warkop_chess_multiplayer");
    return () => {
      channelRef.current?.close();
    };
  }, []);

  // Sending broadcast messages with sender PIN included
  const sendBroadcastMessage = (type: string, toWhom: string, payload: any) => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type,
        from: userName,
        senderPin: userPin,
        to: toWhom,
        ...payload
      });
    }
  };

  // Broadcast Listener
  useEffect(() => {
    const channel = new BroadcastChannel("warkop_chess_multiplayer");

    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      const normalizedMyName = userName.trim().toLowerCase();
      const normalizedMyPin = userPin.trim().toLowerCase();
      const normalizedMsgTo = (msg.to || "").trim().toLowerCase();
      const normalizedMsgFrom = (msg.from || "").trim().toLowerCase();

      const isForMe = (normalizedMsgTo === normalizedMyName || normalizedMsgTo === normalizedMyPin);

      switch (msg.type) {
        case "CHESS_INVITE": {
          if (isForMe) {
            setReceivedInvite({ from: msg.from });
            setBanter(`📩 Tantangan masuk dari ${msg.from}!`);
          }
          break;
        }
        case "CHESS_INVITE_RESPONSE": {
          if (isForMe) {
            if (msg.accepted) {
              // Invitation accepted!
              setGameMode("MULTIPLAYER");
              setActiveOnlineOpponent(msg.from);
              setMyColor("w"); // Inviter is White
              setIsWaitingAcceptance(false);
              
              const newGame = new Chess();
              setGame(newGame);
              setFen(newGame.fen());
              setSelectedSquare(null);
              setPossibleMoves([]);
              setGameHistory([]);
              setBanter(`⚔️ Tantangan diterima! Kamu jalan duluan sebagai Putih melawan ${msg.from}.`);
            } else {
              setIsWaitingAcceptance(false);
              setBanter(`🚫 ${msg.from} menolak undangan main caturmu.`);
            }
          }
          break;
        }
        case "CHESS_MOVE": {
          if (
            gameMode === "MULTIPLAYER" &&
            isForMe &&
            normalizedMsgFrom === activeOnlineOpponent.trim().toLowerCase()
          ) {
            try {
              game.load(msg.fen);
              setFen(game.fen());
              setGameHistory(msg.history);
              setSelectedSquare(null);
              setPossibleMoves([]);
              setBanter(`⚡ ${activeOnlineOpponent} selesai melangkah! Sekarang giliranmu.`);
            } catch (err) {
              console.error("Failed to sync move", err);
            }
          }
          break;
        }
        case "CHESS_UNDO": {
          if (
            gameMode === "MULTIPLAYER" &&
            isForMe &&
            normalizedMsgFrom === activeOnlineOpponent.trim().toLowerCase()
          ) {
            game.undo();
            setFen(game.fen());
            setSelectedSquare(null);
            setPossibleMoves([]);
            setGameHistory(game.history());
            setBanter(`↩️ ${activeOnlineOpponent} menarik kembali langkahnya.`);
          }
          break;
        }
        case "CHESS_RESET": {
          if (
            gameMode === "MULTIPLAYER" &&
            isForMe &&
            normalizedMsgFrom === activeOnlineOpponent.trim().toLowerCase()
          ) {
            const newGame = new Chess();
            setGame(newGame);
            setFen(newGame.fen());
            setSelectedSquare(null);
            setPossibleMoves([]);
            setGameHistory([]);
            setBanter(`🔄 ${activeOnlineOpponent} memulai ulang papan catur.`);
          }
          break;
        }
        case "CHESS_LEAVE": {
          if (
            gameMode === "MULTIPLAYER" &&
            isForMe &&
            normalizedMsgFrom === activeOnlineOpponent.trim().toLowerCase()
          ) {
            setGameMode("VS_BOT");
            setBanter(`🚪 ${activeOnlineOpponent} keluar permainan. Bertanding kembali dengan ${activeBot.name}.`);
          }
          break;
        }
        case "CHESS_RESIGN": {
          if (
            gameMode === "MULTIPLAYER" &&
            isForMe &&
            normalizedMsgFrom === activeOnlineOpponent.trim().toLowerCase()
          ) {
            setBanter(`🎉 @${msg.from} telah menyerah (resign)! Kamu memenangkan duel catur warkol ini!`);
          }
          break;
        }
      }
    };

    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [userName, userPin, activeOnlineOpponent, gameMode, activeBot]);

  // Reset Game
  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setGameHistory([]);

    if (gameMode === "MULTIPLAYER") {
      sendBroadcastMessage("CHESS_RESET", activeOnlineOpponent, {});
      setBanter(`🔄 Kamu mereset game. Papan baru kosong!`);
    } else {
      setBanter(`${activeBot.name}: Game diulang! Sruput kopi hitam dulu biar fokus.`);
    }
  };

  // Leave active multiplayer
  const handleLeaveMultiplayer = () => {
    if (gameMode === "MULTIPLAYER") {
      sendBroadcastMessage("CHESS_LEAVE", activeOnlineOpponent, {});
    }
    setGameMode("VS_BOT");
    handleReset();
  };

  // Resign / Nyerah
  const handleResign = () => {
    if (gameMode !== "MULTIPLAYER") return;
    const confirmResign = window.confirm("Apakah kamu yakin ingin menyerah dari duel ini?");
    if (!confirmResign) return;

    sendBroadcastMessage("CHESS_RESIGN", activeOnlineOpponent, {});
    setBanter(`🏳️ Kamu menyerah! Kemenangan untuk @${activeOnlineOpponent}.`);
  };

  // Undo Move
  const handleUndo = () => {
    if (gameHistory.length === 0) return;
    
    if (gameMode === "MULTIPLAYER") {
      // Send undo event to friend
      game.undo();
      setFen(game.fen());
      setSelectedSquare(null);
      setPossibleMoves([]);
      setGameHistory(game.history());
      sendBroadcastMessage("CHESS_UNDO", activeOnlineOpponent, {});
      setBanter(`↩️ Kamu meminta mundur selangkah.`);
    } else if (gameMode === "VS_BOT" && gameHistory.length >= 2) {
      game.undo();
      game.undo();
      setFen(game.fen());
      setSelectedSquare(null);
      setPossibleMoves([]);
      setGameHistory(game.history());
      
      const BANTERS_ON_UNDO = [
        "Lah lah, catur kok mundur?! Gak ada dalam kamus bapak-bapak!",
        "Wah denda kopi susu ini mah, masa ditarik lagi jalannya.",
        "Hidup gak bisa di-undo kawan, tapi kalau catur di warkop bolehlah hha.",
        "Namanya juga latihan, dilarang marah ya kalau di-undo!"
      ];
      const randomBanter = `${activeBot.name}: ${BANTERS_ON_UNDO[Math.floor(Math.random() * BANTERS_ON_UNDO.length)]}`;
      setBanter(randomBanter);
    } else {
      game.undo();
      setFen(game.fen());
      setSelectedSquare(null);
      setPossibleMoves([]);
      setGameHistory(game.history());
      setBanter("Mundur satu langkah.");
    }
  };

  // Invite another user
  const handleInviteFriend = (e: React.FormEvent) => {
    e.preventDefault();
    const target = targetFriendName.trim().toUpperCase();
    if (!target) return;

    // Check if inviting online bot (using PIN or Name)
    const matchedVisitor = pengunjung?.find(v => (v.pin && v.pin.toUpperCase() === target) || v.name.toUpperCase() === target);
    if (matchedVisitor) {
      const botMatch = WARKOP_BOTS.find(b => b.name.toLowerCase() === matchedVisitor.name.toLowerCase() || b.id.toLowerCase() === matchedVisitor.name.toLowerCase());
      if (botMatch) {
        setActiveBot(botMatch);
        setGameMode("VS_BOT");
        setBanter(`🤖 Bertanding dengan ${botMatch.name}: ${botMatch.catchphrase}`);
        setTargetFriendName("");
        setShowOpponentSelector(false);
        handleReset();
        return;
      }
    }

    // Direct match against Bot names directly
    const botMatch = WARKOP_BOTS.find(b => b.name.toLowerCase().includes(target.toLowerCase()) || b.id.toLowerCase() === target.toLowerCase());
    if (botMatch) {
      setActiveBot(botMatch);
      setGameMode("VS_BOT");
      setBanter(`🤖 Bertanding dengan ${botMatch.name}: ${botMatch.catchphrase}`);
      setTargetFriendName("");
      setShowOpponentSelector(false);
      handleReset();
      return;
    }

    // Standard multi-tab invite
    setIsWaitingAcceptance(true);
    setBanter(`✉️ Mengirim tantangan catur ke PIN [${target}]... Menunggu tanggapan.`);
    sendBroadcastMessage("CHESS_INVITE", target, {});
    setShowOpponentSelector(false);
  };

  // Accept incoming invite
  const handleAcceptInvite = () => {
    if (!receivedInvite) return;
    
    // Set up multiplayer game
    setGameMode("MULTIPLAYER");
    setActiveOnlineOpponent(receivedInvite.from);
    setMyColor("b"); // Invited plays black

    // Accept response
    sendBroadcastMessage("CHESS_INVITE_RESPONSE", receivedInvite.from, { accepted: true });
    
    // Reset game board
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setGameHistory([]);
    setReceivedInvite(null);

    setBanter(`⚔️ Kamu menerima tantangan ${receivedInvite.from}! Kamu memegang Hitam (Giliran Putih duluan).`);
  };

  // Reject incoming invite
  const handleRejectInvite = () => {
    if (!receivedInvite) return;
    sendBroadcastMessage("CHESS_INVITE_RESPONSE", receivedInvite.from, { accepted: false });
    setReceivedInvite(null);
    setBanter("Tantangan ditolak.");
  };

  // Click on a tile
  const handleSquareClick = (squareRepresentation: Square) => {
    if (isGameOver || isCpuThinking) return;

    // If multiplayer, check if it's our turn and color matches
    if (gameMode === "MULTIPLAYER") {
      if (turn !== myColor) {
        setBanter(`⚠️ Sabar lek! Sekarang giliran bidak ${activeOnlineOpponent} melangkah.`);
        return;
      }
    }

    // Check match for current selection
    if (selectedSquare === squareRepresentation) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    const piece = game.get(squareRepresentation);

    // If a square is already selected, try to move
    if (selectedSquare) {
      const isMovePossible = possibleMoves.includes(squareRepresentation);
      
      if (isMovePossible) {
        try {
          const moveConfig: any = {
            from: selectedSquare,
            to: squareRepresentation,
          };

          // Auto-promote to Queen for pawns hitting end ranks
          const pieceOnSelected = game.get(selectedSquare);
          if (
            pieceOnSelected && 
            pieceOnSelected.type === "p" && 
            (squareRepresentation.startsWith("a8") || squareRepresentation.endsWith("8") || squareRepresentation.startsWith("a1") || squareRepresentation.endsWith("1"))
          ) {
            moveConfig.promotion = "q";
          }

          const moveResult = game.move(moveConfig);

          if (moveResult) {
            const nextFen = game.fen();
            const nextHistory = game.history();
            setFen(nextFen);
            setGameHistory(nextHistory);
            setSelectedSquare(null);
            setPossibleMoves([]);

            // If Multiplayer: Synchronize move to peer
            if (gameMode === "MULTIPLAYER") {
              sendBroadcastMessage("CHESS_MOVE", activeOnlineOpponent, {
                fen: nextFen,
                history: nextHistory
              });
              setBanter(`📤 Langkah dikirim. Menunggu balasan dari ${activeOnlineOpponent}...`);
            } else {
              // Versus CPU / Solo banter triggers
              if (moveResult.captured) {
                const capturedBanter = activeBot.banters.capture[Math.floor(Math.random() * activeBot.banters.capture.length)];
                setBanter(capturedBanter);
              } else if (game.isGameOver()) {
                if (game.isCheckmate()) {
                  setBanter(activeBot.banters.checkmate);
                  if (onWin) onWin("bot");
                } else {
                  setBanter("Cak Lontong: Seri! Sama-sama kuat kayak pilar warung warkop.");
                }
              } else {
                if (Math.random() > 0.6) {
                  const normalBanter = activeBot.banters.normal[Math.floor(Math.random() * activeBot.banters.normal.length)];
                  setBanter(normalBanter);
                }
              }
            }
            return;
          }
        } catch (e) {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    }

    // Select piece checking turn & colors
    if (piece) {
      // In multiplayer, must select our own color
      if (gameMode === "MULTIPLAYER") {
        if (piece.color !== myColor) return;
      } else if (gameMode === "VS_BOT") {
        // VS Bot you can only move White
        if (piece.color !== "w") return;
      }

      if (piece.color === turn) {
        setSelectedSquare(squareRepresentation);
        const moves = game.moves({ square: squareRepresentation, verbose: true }) as any[];
        setPossibleMoves(moves.map((m) => m.to as Square));
      }
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  // Bot move logic triggers automatically in VS_BOT mode
  useEffect(() => {
    if (isGameOver || gameMode !== "VS_BOT" || turn !== "b") return;

    setIsCpuThinking(true);
    const thinkingDelay = setTimeout(() => {
      const legalMoves = game.moves({ verbose: true });
      if (legalMoves.length === 0) {
        setIsCpuThinking(false);
        return;
      }

      let selectedMove = legalMoves[0];

      // Determine move based on bot difficulties
      if (activeBot.difficulty === "bapak") {
        // Smart prioritised captures heuristic
        const captureMoves = legalMoves.filter((m) => m.captured);
        if (captureMoves.length > 0) {
          const valueMap: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 };
          captureMoves.sort((a, b) => {
            const valA = valueMap[a.captured || "p"] || 1;
            const valB = valueMap[b.captured || "p"] || 1;
            return valB - valA;
          });
          // 80% smartest capture, 20% random
          selectedMove = Math.random() < 0.82 ? captureMoves[0] : legalMoves[Math.floor(Math.random() * legalMoves.length)];
        } else {
          selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }
      } else if (activeBot.difficulty === "sedang") {
        // 50% capture choice if available
        const captureMoves = legalMoves.filter((m) => m.captured);
        if (captureMoves.length > 0 && Math.random() < 0.5) {
          selectedMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
        } else {
          selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }
      } else {
        // "mudah": Completely random
        selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      }

      try {
        const result = game.move({
          from: selectedMove.from,
          to: selectedMove.to,
          promotion: "q"
        });

        if (result) {
          setFen(game.fen());
          setGameHistory(game.history());
          
          // AI banter feedback
          if (result.captured) {
            setBanter(activeBot.banters.capture[Math.floor(Math.random() * activeBot.banters.capture.length)]);
          } else if (game.isCheckmate()) {
            setBanter(activeBot.banters.checkmate);
          } else if (game.inCheck()) {
            setBanter(activeBot.banters.check);
          } else {
            if (Math.random() > 0.65) {
              setBanter(activeBot.banters.normal[Math.floor(Math.random() * activeBot.banters.normal.length)]);
            }
          }
        }
      } catch (err) {
        console.error("AI failed move", err);
      } finally {
        setIsCpuThinking(false);
      }
    }, 1100);

    return () => clearTimeout(thinkingDelay);
  }, [fen, turn, gameMode, isGameOver, activeBot]);

  // Group gameHistory into pairs of dual moves (White & Black) for clean vertical logs
  const movePairs: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < gameHistory.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: gameHistory[i],
      black: gameHistory[i + 1]
    });
  }

  return (
    <div id="catur-bapak-bapak" className="immersive-card p-3 sm:p-4 w-full relative overflow-hidden">
      {/* If disabled, show blur overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-[#141210]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center select-none rounded-xl">
          <div className="p-5 bg-amber-950/40 rounded-xl border border-amber-900/30 max-w-[280px] sm:max-w-xs flex flex-col items-center gap-3 shadow-xl">
            <span className="text-4xl animate-bounce [animation-duration:3s]">🥵</span>
            <h4 className="text-xs font-bold text-amber-300 tracking-wide">KONDISI LAPAR / HAUS LAPAR KRITIS! (≤10%)</h4>
            <p className="text-[10px] text-stone-300 font-sans leading-relaxed">
              Energi kamu di bawah 10% kawan, tidak bisa konsentrasi main catur bapak-bapak dalam keadaan mulas dan dehidrasi begini!
            </p>
            <p className="text-[10px] text-[#E9C46A] font-sans font-bold bg-black/60 px-2 py-1 rounded border border-amber-500/15">
              Pesan Mie 🍜 atau Es Kopi ☕ dulu di menu Sajian Hidangan ya!
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🪵</span>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pojok Catur Bapak-Bapak</h3>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-amber-500 font-mono">
              {gameMode === "VS_BOT" && `Latihan vs ${activeBot.avatar} ${activeBot.name}`}
              {gameMode === "LATIHAN" && "Asah Otak Mandiri (Solo Pass & Play)"}
              {gameMode === "MULTIPLAYER" && `⚔️ Duel Live vs @${activeOnlineOpponent}`}
            </p>
          </div>
        </div>

        {/* Change opponent & setup button */}
        <button
          onClick={() => setShowOpponentSelector(!showOpponentSelector)}
          className="text-[9px] font-bold bg-[#D4A373] text-neutral-900 hover:bg-[#c19262] transition px-2 py-0.5 rounded flex items-center gap-0.5"
        >
          <span>Ganti Lawan</span>
          <ChevronRight size={10} className={`transform transition ${showOpponentSelector ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Opponent Settings Panels */}
      {showOpponentSelector && (
        <div className="bg-black/45 p-3 rounded border border-white/5 mb-3 transition-all space-y-2.5">
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <button
              onClick={() => { setGameMode("VS_BOT"); handleReset(); setShowOpponentSelector(false); }}
              className={`py-1 text-[10px] font-bold rounded border transition ${gameMode === "VS_BOT" ? "bg-amber-950/40 text-amber-300 border-amber-800" : "bg-white/5 text-white/50 border-transparent"}`}
            >
              🤖 Bot Warkop
            </button>
            {/* Solo removed */}
            <button
              onClick={() => { setGameMode("MULTIPLAYER"); }}
              className={`py-1 text-[10px] font-bold rounded border transition ${gameMode === "MULTIPLAYER" ? "bg-amber-950/40 text-amber-300 border-amber-800" : "bg-white/5 text-white/50 border-transparent"}`}
            >
              🤝 Duel Tab
            </button>
          </div>

          {/* Subpanel 1: Warkop Regular Bots List */}
          {gameMode === "VS_BOT" && (
            <div className="space-y-1.5 pt-1.5 border-t border-white/5">
              <span className="text-[9px] font-mono font-bold text-amber-400 block uppercase tracking-wider">Pilih Teman Ngopi Bidak:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {WARKOP_BOTS.map((bot) => (
                  <button
                    key={bot.id}
                    onClick={() => { setActiveBot(bot); handleReset(); setShowOpponentSelector(false); }}
                    className={`p-1.5 border rounded flex flex-col items-center justify-center transition text-center ${activeBot.id === bot.id ? "bg-amber-950/40 border-amber-800 text-amber-300" : "bg-white/5 border-transparent text-white/70 hover:bg-white/10"}`}
                  >
                    <span className="text-lg">{bot.avatar}</span>
                    <span className="text-[10px] font-bold tracking-tight">{bot.name}</span>
                    <span className="text-[8px] opacity-60 font-mono scale-[0.9] mt-0.5">{bot.diffText}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subpanel 2: Duel Tab Invite Form */}
          {gameMode === "MULTIPLAYER" && (
            <div className="space-y-2.5 pt-1.5 border-t border-white/5">
              <div className="bg-amber-950/20 p-2 border border-amber-900/30 rounded text-[9.5px] text-amber-300 leading-normal">
                💡 <b>Cara Duel (Multi-Tab):</b> Buka warkop ini di tab/kaca baru browser kawan. Setiap tab punya PIN profil unik di sidebar kanan. Masukkan PIN profil dari tab kawan di sini untuk berduel live secara instan!
              </div>

              <form onSubmit={handleInviteFriend} className="flex gap-1.5 items-end">
                <div className="flex-1">
                  <label className="text-[8px] font-bold text-white/40 block font-mono uppercase tracking-wider mb-0.5">PIN Profil Teman:</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="Contoh: 2B1F4A9E"
                    value={targetFriendName}
                    onChange={(e) => setTargetFriendName(e.target.value.toUpperCase().trim())}
                    className="w-full bg-black/40 border border-white/5 rounded px-2.5 py-1 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-700 font-mono tracking-wider"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-900 px-3 py-1 text-xs font-bold rounded transition cursor-pointer flex items-center gap-1 h-[26px]"
                >
                  <Swords size={12} />
                  <span>Kirim Tantangan</span>
                </button>
              </form>


              <div className="flex items-center justify-between text-[9px] text-white/40 pt-1 font-mono">
                <span>Profilmu: <b>@{userName}</b> (PIN: <b className="text-amber-400">{userPin}</b>)</span>
                {activeOnlineOpponent && (
                  <button
                    type="button"
                    onClick={handleLeaveMultiplayer}
                    className="text-rose-400 hover:underline cursor-pointer font-bold"
                  >
                    Cabut Duel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Received invitation Banner alerts */}
      {receivedInvite && (
        <div className="bg-amber-950/70 border border-amber-900 rounded p-2.5 mb-3 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">⚔️</span>
            <div>
              <p className="text-[10px] text-white font-bold leading-none">Tantangan Catur Masuk!</p>
              <p className="text-[9px] text-[#D4A373] mt-1 font-mono">@{receivedInvite.from} mengajak kamu tanding live.</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleAcceptInvite}
              className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold px-2 py-0.5 text-[10px] rounded transition flex items-center gap-0.5"
            >
              <Check size={10} /> Terima
            </button>
            <button
              onClick={handleRejectInvite}
              className="bg-red-500/20 hover:bg-red-500/30 text-rose-300 font-bold px-2 py-0.5 text-[10px] rounded transition flex items-center gap-0.5 border border-red-500/30"
            >
              <X size={10} /> Tolak
            </button>
          </div>
        </div>
      )}

      {/* Outgoing waiting state representation */}
      {isWaitingAcceptance && (
        <div className="bg-black/30 border border-white/5 rounded p-2 mb-3 flex items-center justify-between text-[10px] text-[#D4A373] font-mono">
          <span className="flex items-center gap-1.5">
            <Radio size={12} className="text-amber-500 animate-ping" />
            <span>Menunggu persetujuan kawan di tab sebelah...</span>
          </span>
          <button
            onClick={() => setIsWaitingAcceptance(false)}
            className="text-rose-400 hover:underline text-[9px]"
          >
            Batal
          </button>
        </div>
      )}

      {/* Board & Info Grid */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* The Wooden Styled Chessboard container - Rigid & Non-Shrinking */}
        <div className="w-full md:w-[360px] flex-shrink-0 mx-auto aspect-square select-none mb-4 md:mb-0">
          <div className="wooden-board-glass rounded p-1 md:p-1.5 h-full">
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full relative" style={{ touchAction: "none" }}>
              {board.map((row, rIndex) => {
                return row.map((square, cIndex) => {
                  const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
                  const squareName = `${letters[cIndex]}${8 - rIndex}` as Square;
                  
                  // Color calculation
                  const isDark = (rIndex + cIndex) % 2 === 1;
                  const isSelected = selectedSquare === squareName;
                  const isPossible = possibleMoves.includes(squareName);
                  const isTileChecking = isCheck && square && square.type === "k" && square.color === turn;

                  let tileBg = isDark ? "bg-[#553c26]" : "bg-[#d4a373]";
                  if (isSelected) {
                    tileBg = "bg-yellow-700/80";
                  } else if (isTileChecking) {
                    tileBg = "bg-red-900/90 animate-pulse";
                  }

                  return (
                    <div
                      key={squareName}
                      id={`chess-sq-${squareName}`}
                      onClick={() => handleSquareClick(squareName)}
                      className={`relative flex items-center justify-center cursor-pointer aspect-square ${tileBg} transition-colors duration-100`}
                    >
                      {/* Piece Icon or Empty dot preview */}
                      {square ? (
                        <span
                          className={`text-3xl font-sans select-none relative z-10 ${
                            square.color === "w"
                              ? "text-amber-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.85)]"
                              : "text-neutral-900 drop-shadow-[0_1.5px_1px_rgba(255,255,255,0.25)]"
                          }`}
                        >
                          {SOLID_PIECES[square.type]}
                        </span>
                      ) : null}

                      {/* Possible move dot overlay */}
                      {isPossible && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <div className={`rounded-full ${square ? "w-6 h-6 border-2 border-green-400" : "w-3.5 h-3.5 bg-green-500/50"}`} />
                        </div>
                      )}

                      {/* Selected tile ring indicators */}
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-yellow-400 z-10" />
                      )}

                      {/* Small coordinate labels for warkop board style on 'a' column and rank '1' row */}
                      {cIndex === 0 && (
                        <span className="absolute top-0 left-0.5 text-[7px] font-mono leading-none font-bold text-neutral-400/60 pointer-events-none">
                          {8 - rIndex}
                        </span>
                      )}
                      {rIndex === 7 && (
                        <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono leading-none font-bold text-neutral-400/60 pointer-events-none">
                          {letters[cIndex]}
                        </span>
                      )}
                    </div>
                  );
                });
              })}
            </div>
          </div>
        </div>

        {/* Right Info pane */}
        <div className="flex-1 flex flex-col justify-between pt-2 md:pt-0">
          <div className="space-y-3 md:space-y-2">
            {/* Turn Indicators */}
            <div className="bg-black/20 rounded p-2.5 border border-white/5 text-[11px] flex justify-between items-center shadow-lg">
              <span className="text-zinc-400 flex items-center gap-1.5">
                {isCpuThinking ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                ) : (
                  <span className={`w-2 h-2 rounded-full ${turn === "w" ? "bg-amber-100" : "bg-stone-850 border border-white/10"}`}></span>
                )}
                {turn === "w" ? (
                  gameMode === "MULTIPLAYER" && myColor === "b" ? `Lawan (${activeOnlineOpponent}) Melangkah` : "Giliran Putih (Kamu)"
                ) : (
                  gameMode === "MULTIPLAYER" && myColor === "w" ? `Lawan (${activeOnlineOpponent}) Melangkah` : isCpuThinking ? `${activeBot.name} Mikir...` : `Giliran Hitam`
                )}
              </span>
              <span className="text-[10px] font-mono text-white/40">Step {gameHistory.length}</span>
            </div>

            {/* Banter box */}
            <div className="bg-[#1B1813] border border-amber-950/40 rounded p-2.5 min-h-[58px] flex flex-col justify-between">
              <div className="text-[11px] font-sans text-amber-200/95 italic leading-relaxed break-words">
                {isCpuThinking ? `${activeBot.name} menggaruk jenggot sambil megang kening...` : banter}
              </div>
              {isCheck && !isGameOver && (
                <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-1 font-mono">
                  <AlertCircle size={10} className="stroke-[3]" /> AWAS KENA SKAK!
                </div>
              )}
              {isGameOver && (
                <div className="text-[10.5px] text-emerald-400 bg-emerald-950/50 border border-emerald-950 rounded px-1.5 py-0.5 mt-1.5 flex items-center gap-1 font-sans">
                  <Award size={12} />
                  <span>
                    {game.isCheckmate() 
                      ? `Skakmat! ${turn === "w" ? "Hitam Menang" : "Putih Menang"}` 
                      : "Game Berakhir dengan Remis/Seri!"}
                  </span>
                </div>
              )}
            </div>

            {/* Step list summary (minimal logs listed vertically downwards) */}
            <div 
              ref={moveHistoryRef}
              className="text-[10px] font-mono text-zinc-400 h-[72px] overflow-y-auto bg-black/25 p-2 rounded border border-white/5 scrollbar-thin"
            >
              <div className="text-white/35 select-none font-bold border-b border-white/5 pb-1 mb-1.5 flex justify-between">
                <span>📓 Buku Langkah</span>
                <span className="text-[9px] font-normal">{gameHistory.length} Total</span>
              </div>
              {movePairs.length === 0 ? (
                <div className="italic text-white/20 text-center py-1.5">Belum ada langkah.</div>
              ) : (
                <div className="space-y-1">
                  {movePairs.map((pair) => (
                    <div key={pair.num} className="flex items-center text-[11px] border-b border-white/[0.02] pb-0.5">
                      <span className="text-amber-500/40 w-8 font-bold">{pair.num}.</span>
                      <span className="w-20 text-zinc-300">{pair.white}</span>
                      <span className="text-[#D4A373]/90 font-medium">{pair.black || "-"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button
              onClick={handleUndo}
              disabled={gameMode === "MULTIPLAYER" || gameHistory.length === 0 || isCpuThinking}
              title={gameMode === "MULTIPLAYER" ? "Fitur mundur tidak diizinkan saat duel!" : ""}
              className="py-1 px-2 border border-white/5 hover:bg-white/5 text-white/70 disabled:opacity-30 disabled:hover:bg-transparent rounded flex items-center justify-center gap-1 text-[11px] font-bold transition cursor-pointer"
            >
              <Undo2 size={12} />
              <span>Catur Mundur</span>
            </button>
            {gameMode === "MULTIPLAYER" ? (
              <button
                onClick={handleResign}
                className="py-1 px-2 bg-red-950/40 hover:bg-red-900/30 border border-red-900/60 text-red-300 rounded flex items-center justify-center gap-1 text-[11px] font-bold transition cursor-pointer"
              >
                <Flag size={12} className="fill-current" />
                <span>Nyerah</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="py-1 px-2 bg-amber-950/40 hover:bg-[#2c1a0e] border border-amber-900/60 text-amber-300 rounded flex items-center justify-center gap-1 text-[11px] font-bold transition cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Ganti Baru</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
