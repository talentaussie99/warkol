import React, { useState } from "react";
import { Sparkles, Send, Mail, Lock, ArrowRight, RefreshCw } from "lucide-react";
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
        setUserStatus(_t("☕ Lagi Ngopi", "☕ Having Coffee"));
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
    <div id="login-screen-container" className="relative w-full h-[100dvh] md:h-screen grid grid-cols-1 md:grid-cols-12 bg-[#0a0807] overflow-hidden select-none">
      {/* Background Layers */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.35] pointer-events-none select-none z-0 filter blur-2xl scale-110"
        style={{ 
          backgroundImage: `url('https://imgur.com/0zvxntt.jpg')`
        }}
      />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-45 pointer-events-none select-none z-0"
        style={{ 
          backgroundImage: `url('https://imgur.com/0zvxntt.jpg')`
        }}
      />
      
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-[#0a0807] via-transparent to-[#0a0807] opacity-80 z-0"
      />

      {/* Form Container Panel */}
      <div id="login-left-pane" className="col-span-12 md:col-span-5 h-[100dvh] md:h-full flex flex-col items-center justify-center p-4 xs:p-6 sm:p-8 md:p-6 relative z-10 bg-gradient-to-r from-black/95 via-black/50 to-transparent overflow-hidden">
        <div className="w-full max-w-sm py-12 px-6 xs:py-14 xs:px-8 sm:p-10 md:p-7 bg-black/60 backdrop-blur-xl md:backdrop-blur-2xl border border-white/10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.98)] rounded-[2.5rem] relative overflow-hidden ring-1 ring-white/15 animate-fade-in-up flex flex-col justify-between max-h-[96dvh] md:max-h-[90dvh] overflow-y-auto warkop-scrollbar">
          
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-[#E9C46A]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Logo & Subtitle */}
          <div className="text-center mb-8 md:mb-3 flex flex-col items-center shrink-0">
            <img
              src="https://imgur.com/m16hDt0.jpg"
              alt="WARKOL Logo"
              className="h-20 xs:h-22 sm:h-24 md:h-20 w-auto object-contain mb-3 animate-bounce [animation-duration:10s]"
              referrerPolicy="no-referrer"
            />

            <span className="text-[8.5px] sm:text-[9px] md:text-[8px] font-mono tracking-[0.12em] font-black text-[#E9C46A] bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/30 inline-block uppercase select-none shadow-sm">
              ☕ Warkop Online Pertama di Indonesia
            </span>

            <span className="mt-2 sm:mt-2 bg-red-600/90 text-white font-sans font-black text-[8px] sm:text-[8px] px-2.5 sm:px-2.5 py-1 rounded-md border border-red-500/40 tracking-wider uppercase shadow-[0_4px_12px_rgba(220,38,38,0.5)] select-none animate-pulse">
              🔴 Buka 24 Jam
            </span>
          </div>

          {/* MESSAGES ALERT */}
          {message && (
            <div className={`p-2.5 sm:p-3 text-[10px] sm:text-[10.5px] leading-snug rounded-xl border mb-2 sm:mb-4 font-semibold animate-fade-in shrink-0 ${
              message.type === "success" 
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/20" 
                : "bg-rose-950/40 text-rose-300 border-rose-500/20"
            }`}>
              {message.text}
            </div>
          )}

          {/* MAIN DYNAMIC CONTENT */}
          <div className="space-y-5 sm:space-y-4 flex-1 flex flex-col justify-center">
            
          {/* 1. Header Copywriting based on selected tab */}
          <div className="text-center pb-2 md:pb-0.5 shrink-0">
            <h2 className="text-sm xs:text-base md:text-sm font-black text-white leading-tight font-sans">
              {authMode === "login" && _t("Masih ada kursi kosong nih,", "There's still an empty seat,")}
              {authMode === "register" && _t("Sini pesen meja dulu, kawan,", "Get a table registered first, buddy,")}
              {authMode === "forgot" && _t("Aduh lupa kunci meja ya?", "Forgot your keys, buddy?")}
            </h2>
            <p className="text-[9px] xs:text-[9px] md:text-[8px] text-amber-500/80 font-mono mt-1 font-bold tracking-wider uppercase">
                {authMode === "login" && _t("Yuk nyari temen ngobrol di warkol!", "Let's find friends to chat at our warkop!")}
                {authMode === "register" && _t("Bikin akun dulu biar simpan saldo & kantong!", "Create an account to keep your wallet & data!")}
                {authMode === "forgot" && _t("Jangan panik, bisa diatur lewat email!", "Don't panic, let's fix it via email!")}
              </p>
            </div>

            {/* FORM CONTAINER */}
            <form onSubmit={handleFormSubmit} className="space-y-2 md:space-y-2.5">
              
              {/* EMAIL FIELD */}
              <div className="space-y-1 md:space-y-0.5">
                <label className="text-[8.5px] md:text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1 sm:gap-1.5 pl-1">
                  <Mail size={10} className="text-amber-500" />
                  {authMode === "login" && _t("Tulis email dulu ya,", "Write down your email first,")}
                  {authMode === "register" && _t("Tulis email buatanmu ya,", "Fill in your registration email,")}
                  {authMode === "forgot" && _t("Tulis email terdaftarmu ya,", "Enter your registered email,")}
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    placeholder="contoh@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-4 py-3 sm:py-3.5 md:py-2.5 text-xs sm:text-sm md:text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-sans font-semibold"
                  />
                </div>
              </div>

              {/* PASSWORD FIELD (Only on login or register) */}
              {authMode !== "forgot" && (
                <div className="space-y-1 md:space-y-0.5">
                  <label className="text-[8.5px] md:text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1 sm:gap-1.5 pl-1">
                    <Lock size={10} className="text-amber-500" />
                    <span>{_t("Isi sandi / password kawan", "Fill in password")}</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:py-3.5 md:py-2.5 text-xs sm:text-sm md:text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-sans"
                    />
                  </div>
                </div>
              )}

              {/* CONFIRM PASSWORD (Only on register) */}
              {authMode === "register" && (
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[8.5px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1 sm:gap-1.5 pl-1">
                    <Lock size={10} className="text-[#E9C46A]" />
                    <span>{_t("Ulangi password kawan", "Repeat password")}</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-sans"
                    />
                  </div>
                </div>
              )}

              {/* ACTION BTN SUBMIT */}
              <button
                type="submit"
                disabled={simulatedLoading}
                className="w-full mt-4 md:mt-3.5 bg-[#E9C46A] hover:bg-amber-400 disabled:opacity-50 text-neutral-900 font-black py-3 sm:py-3.5 md:py-2.5 rounded-2xl transition-all shadow-md hover:shadow-lg hover:shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-2 uppercase text-[10px] md:text-[9.5px] tracking-[0.15em] group"
              >
                {simulatedLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                      {authMode === "login" && _t("Masuk Warkol", "Masuk Warkol")}
                      {authMode === "register" && _t("Daftar Akun", "Register Account")}
                      {authMode === "forgot" && _t("Reset Kunci Meja", "Reset Keys")}
                    </span>
                    <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* HELPFUL MODE ALTERNATIVES */}
            <div className="text-center pt-1.5 sm:pt-2 text-[8.5px] xs:text-[9px] sm:text-[10px] text-stone-500 flex flex-col gap-1 sm:gap-1.5">
              {authMode === "login" ? (
                <>
                  <div>
                    {_t("Belum nongkrong sebelumnya?", "Haven't hung out yet?")}{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className="text-[#E9C46A] hover:underline font-bold cursor-pointer inline-block"
                    >
                      {_t("Ayo daftar akun!", "Let's register an account!")}
                    </button>
                  </div>
                  <div>
                    {_t("Gak ingat password-nya?", "Forgot password?")}{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot")}
                      className="text-stone-400 hover:text-white hover:underline cursor-pointer inline-block"
                    >
                      {_t("Ketuk di sini", "Tap here")}
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  {_t("Kembali ke pintu masuk?", "Go back to entrance?")}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-[#E9C46A] hover:underline font-bold cursor-pointer inline-block"
                  >
                    {_t("Silakan ketuk untuk Masuk!", "Please select Log In!")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Aesthetic footer */}
          <div className="mt-4 md:mt-3 pt-2 border-t border-white/5 text-center flex flex-col items-center justify-center gap-0.5 text-[#E9C46A]/30 font-mono text-[7px] md:text-[7.5px] select-none shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-[#E9C46A]/80 animate-pulse">☕</span>
              <span>Warkol Online — Tempat Berbagi Cerita & Tawa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Pane: Atmospheric visuals */}
      <div id="login-right-pane" className="hidden md:flex md:col-span-7 h-full flex-col items-center justify-center p-2 relative z-10 border-l border-white/5 bg-transparent">
        {/* Intentionally empty for background depth */}
      </div>
    </div>
  );
};
