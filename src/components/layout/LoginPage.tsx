import React, { useState } from "react";
import { Sparkles, Send, Mail, Lock, ArrowRight, RefreshCw, LogIn, UserPlus, HelpCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface LoginPageProps {
  _t: (id: string, en: string) => string;
  userName: string;
  setUserName: (v: string) => void;
  userAvatar: string;
  setUserAvatar: (v: string) => void;
  isLoggingIn: boolean;
  handleLogin: (e: React.FormEvent) => void;
  setIsLoggedIn: (v: boolean) => void;
  setUserStatus: (v: string) => void;
  PRESET_AVATARS: any[];
  renderUserAvatar: any;
  authMode: "login" | "register" | "forgot";
  setAuthMode: (v: "login" | "register" | "forgot") => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  _t,
  userName,
  setUserName,
  userAvatar,
  setUserAvatar,
  isLoggingIn,
  handleLogin,
  setIsLoggedIn,
  setUserStatus,
  PRESET_AVATARS,
  renderUserAvatar,
  authMode,
  setAuthMode
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [simulatedLoading, setSimulatedLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getNicknameFromEmail = (emailStr: string) => {
    if (!emailStr) return "Kang_Kopi";
    const part = emailStr.split("@")[0];
    const cleanNick = part.replace(/[^a-zA-Z0-9]/g, "_");
    return cleanNick.slice(0, 15) || "Kang_Kopi";
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ type: "error", text: _t("Aduh, email nya diisi dulu ya kawan!", "Oops, please fill in your email first!") });
      return;
    }

    if (authMode !== "forgot" && !password) {
      setMessage({ type: "error", text: _t("Sandi/password tidak boleh kosong kawan!", "Password cannot be empty!") });
      return;
    }

    setSimulatedLoading(true);

    try {
      if (authMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
        
        const nick = getNicknameFromEmail(email);
        setUserName(nick);
        // Set a random avatar or first preset
        if (PRESET_AVATARS && PRESET_AVATARS.length > 0) {
          setUserAvatar(PRESET_AVATARS[0].value);
        }
        setUserStatus(_t("☕ Lagi Nongkrong", "☕ Hanging Out"));
        setIsLoggedIn(true);
      } else if (authMode === "register") {
        if (password !== confirmPassword) {
          setMessage({ type: "error", text: _t("Duh, password konfirmasi nya gak cocok kawan!", "Oops, confirmation password doesn't match!") });
          setSimulatedLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password
        });
        if (error) throw error;
        
        setMessage({ type: "success", text: _t("Akun berhasil dibuat! Silakan masuk kawan.", "Account created successfully! Please log in.") });
        setAuthMode("login");
        setPassword("");
        setConfirmPassword("");
      } else if (authMode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        
        setMessage({ 
          type: "success", 
          text: _t(
            "Link petunjuk reset sudah dikirim ke email kamu kawan! Silakan cek kotak masuk/spam ya.", 
            "Instruction reset link has been sent to your email! Please check your inbox or spam."
          ) 
        });
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setMessage({ type: "error", text: err.message || _t("Aduh, ada kendala koneksi ke Supabase kawan!", "Oops, some issues connecting to database, friend!") });
    } finally {
      setSimulatedLoading(false);
    }
  };

  return (
    <div id="login-screen-container" className="relative w-full h-[100dvh] md:h-screen flex items-center justify-center md:justify-start bg-[#14110f] overflow-hidden select-none px-4 md:pl-36 md:pr-12 py-6">
      {/* Background Layers - Adjusted opacity to be brighter */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.45] pointer-events-none select-none z-0 filter blur-3xl scale-110"
        style={{ 
          backgroundImage: `url('https://imgur.com/0zvxntt.jpg')`
        }}
      />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.55] pointer-events-none select-none z-0"
        style={{ 
          backgroundImage: `url('https://imgur.com/0zvxntt.jpg')`
        }}
      />
      
      {/* Dynamic Overlay Gradient for cinematic depth - slightly brighter stone shades instead of pure black */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#14110f]/95 via-[#1a1512]/60 to-[#1c1917]/40 z-0" />

      {/* Decorative ambient blurred orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-500/15 rounded-full blur-[80px] pointer-events-none animate-pulse [animation-duration:8s] z-0" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Main Professional Glassmorphic Card Frame */}
      <div className="relative z-10 w-full max-w-sm bg-[#12100e]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/5 overflow-hidden animate-fade-in-up flex flex-col justify-between max-h-[96dvh] warkop-scrollbar">
        
        {/* Top Accent line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-600 via-[#E9C46A] to-amber-700 shrink-0" />
        
        <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between overflow-y-auto warkop-scrollbar">
          
          {/* Header Branding */}
          <div className="text-center mb-5 flex flex-col items-center shrink-0">
            <div className="relative group mb-3">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl scale-125 opacity-75 group-hover:opacity-100 transition-opacity" />
              <img
                src="https://imgur.com/m16hDt0.jpg"
                alt="WARKOL Logo"
                className="relative h-14 w-auto object-contain animate-bounce [animation-duration:8s]"
                referrerPolicy="no-referrer"
              />
            </div>

            <h1 className="text-sm font-black text-white tracking-[0.05em] uppercase font-sans mb-1 flex items-center gap-1.5 justify-center">
              <span className="bg-gradient-to-r from-amber-400 via-[#E9C46A] to-amber-300 bg-clip-text text-transparent">WARKOL ONLINE</span>
            </h1>
            
            <p className="text-[9px] text-stone-400 font-medium tracking-wide max-w-xs px-2 leading-relaxed">
              {_t("Tempat nongkrong digital warga kopi se-Indonesia. Berbagi cerita, tawa & catur.", "The digital coffee shop for direct social connection, community & chess.")}
            </p>
          </div>

          {/* Clean Segmented Tab Control */}
          {authMode !== "forgot" && (
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mb-4 shrink-0 transition-all">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === "login"
                    ? "bg-amber-500/20 text-[#E9C46A] border border-amber-500/20 shadow-inner"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                <LogIn size={11} />
                <span>{_t("Masuk", "Log In")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === "register"
                    ? "bg-amber-500/20 text-[#E9C46A] border border-amber-500/20 shadow-inner"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                <UserPlus size={11} />
                <span>{_t("Daftar", "Register")}</span>
              </button>
            </div>
          )}

          {/* Forgot Password Header */}
          {authMode === "forgot" && (
            <div className="mb-4 text-center shrink-0">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-1">
                <HelpCircle size={12} className="text-[#E9C46A]" />
                {_t("Atur Ulang Sandi", "Reset Password")}
              </h2>
              <p className="text-[9px] text-stone-400 mt-1 leading-normal">
                {_t("Masukkan email kawan untuk kami kirimkan kunci instruksi reset.", "Enter your email and we'll send reset credentials instructions.")}
              </p>
            </div>
          )}

          {/* Alert Message Notification */}
          {message && (
            <div className={`p-2.5 text-[9.5px] leading-relaxed rounded-xl border mb-4 font-semibold animate-fade-in shrink-0 ${
              message.type === "success" 
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/20 shadow-sm shadow-emerald-500/10" 
                : "bg-rose-950/40 text-rose-300 border-rose-500/20 shadow-sm shadow-rose-500/10"
            }`}>
              {message.text}
            </div>
          )}

          {/* Form Processing Center */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5 flex-1 flex flex-col justify-center">
            
            {/* EMAIL INPUT BOX */}
            <div className="space-y-1">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[8px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
                  <Mail size={10} className="text-stone-400" />
                  <span>{_t("Surel / Email", "Email Address")}</span>
                </label>
              </div>
              <input
                type="email"
                required
                placeholder="contoh@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-zinc-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none transition-all font-sans font-medium hover:border-zinc-700 shadow-inner"
              />
            </div>

            {/* PASSWORD INPUT BOX */}
            {authMode !== "forgot" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[8px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
                    <Lock size={10} className="text-stone-400" />
                    <span>{_t("Sandi Rahasia", "Password")}</span>
                  </label>
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("forgot");
                        setMessage(null);
                      }}
                      className="text-[8px] font-bold text-stone-400 hover:text-[#E9C46A] tracking-wider uppercase transition-colors cursor-pointer"
                    >
                      {_t("Lupa Sandi?", "Forgot?")}
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none transition-all font-sans hover:border-zinc-700 shadow-inner"
                />
              </div>
            )}

            {/* CONFIRM PASSWORD INPUT BOX */}
            {authMode === "register" && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[8px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
                    <Lock size={10} className="text-stone-400" />
                    <span>{_t("Ulangi Sandi", "Confirm Password")}</span>
                  </label>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none transition-all font-sans hover:border-zinc-700 shadow-inner"
                />
              </div>
            )}

            {/* MAIN ACTION SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={simulatedLoading}
              className="w-full mt-2.5 bg-[#E9C46A] hover:bg-amber-400 disabled:opacity-50 text-neutral-900 font-extrabold py-3 rounded-xl transition-all shadow-md hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-2 uppercase text-[9.5px] tracking-[0.15em] group cursor-pointer shrink-0"
            >
              {simulatedLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>
                    {authMode === "login" && _t("Masuk Warkol", "Masuk Warkol")}
                    {authMode === "register" && _t("Daftar Akun Baru", "Register Account")}
                    {authMode === "forgot" && _t("Kirim Link Reset", "Send Password Instructions")}
                  </span>
                  <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Extra Help Links on recovery mode */}
          {authMode === "forgot" && (
            <div className="text-center pt-3 text-[9px] text-stone-500">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setMessage(null);
                }}
                className="text-[#E9C46A] hover:underline font-bold cursor-pointer inline-block"
              >
                {_t("← Kembali ke halaman Masuk", "← Back to Login")}
              </button>
            </div>
          )}

          {/* Micro Status Indicators (No clutter, humbler indicators) */}
          <div className="flex items-center gap-4 justify-center mt-5 shrink-0 text-[8px] font-mono tracking-widest text-stone-600 font-bold uppercase select-none">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              Warkol Server Active
            </span>
            <span className="text-stone-700">|</span>
            <span>Est. 2024</span>
          </div>

          {/* Aesthetic Professional Slate Footer */}
          <div className="mt-5 pt-3 border-t border-white/5 text-center flex flex-col items-center justify-center gap-1 shrink-0 font-sans">
            <div className="flex items-center gap-1.5 text-stone-400 font-bold tracking-tight text-[8px]">
              <span className="text-[#E9C46A] text-[9px] animate-pulse">☕</span>
              <span>Warkol — Tempat Berbagi Cerita & Tawa</span>
            </div>
            <div className="text-[7.5px] uppercase tracking-[0.18em] text-amber-500/50 font-black font-mono">
              Soft Launching Versi 1.0 Beta
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

