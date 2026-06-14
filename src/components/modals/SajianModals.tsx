import React from "react";
import { X, Pin } from "lucide-react";
import { MenuItem } from "../../types";

interface RulesAndFeaturesModalProps {
  show: boolean;
  onClose: () => void;
  _t: (id: string, en: string) => string;
}

export const HowToOrderModal: React.FC<RulesAndFeaturesModalProps> = ({ show, onClose, _t }) => {
  const [activeTab, setActiveTab] = React.useState<"rules" | "features">("rules");
  if (!show) return null;

  const features = [
    {
      icon: "☕",
      title: _t("Obrolan Meja (Chat)", "Table Chat"),
      desc: _t("Ngobrol santai di berbagai meja dengan vibe berbeda. Ada meja santai, serius, sampai meja ghibah.", "Chill chat at various tables with different vibes. From casual to serious and gossip tables.")
    },
    {
      icon: "📸",
      title: _t("Papan Cerita (Timeline)", "Story Board"),
      desc: _t("Bagikan foto dan status harianmu. Warga lain bisa like dan komen postinganmu.", "Share photos and daily status. Other citizens can like and comment on your posts.")
    },
    {
      icon: "♟️",
      title: _t("Pojok Catur", "Chess Corner"),
      desc: _t("Tantang warga lain duel catur secara live. Menang dapet saldo bonus buat jajan!", "Challenge others to live chess duels. Win and get bonus balance for snacks!")
    },
    {
      icon: "🍔",
      title: _t("Sajian Hidangan", "Warkol Menu"),
      desc: _t("Pesan kopi, mie instan, sampai gorengan untuk isi tenaga (Lapar & Haus) biar tetap bisa eksis.", "Order coffee, instant noodles, or snacks to refill energy (Hunger & Thirst) to stay active.")
    },
    {
      icon: "🔔",
      title: _t("Pemberitahuan", "Notifications"),
      desc: _t("Cek siapa yang ngetag kamu, like postinganmu, atau ngajak main catur.", "Check who tags you, likes your posts, or invites you to play chess.")
    },
    {
      icon: "🚩",
      title: _t("Sistem Laporan", "Report System"),
      desc: _t("Laporkan pesan yang melanggar aturan. Pesan dengan banyak laporan akan otomatis disembunyikan.", "Report messages that break the rules. Messages with many reports will be hidden automatically.")
    }
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[110] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#1C1713] border border-amber-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-[#E9C46A] tracking-tight uppercase flex items-center gap-2">
            🛡️ {_t("Pusat Informasi Warkol", "Warkol Info Center")}
          </h3>
          <button 
            onClick={onClose}
            className="text-stone-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/40 p-1 rounded-xl mb-5 border border-white/5">
          <button
            onClick={() => setActiveTab("rules")}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
              activeTab === "rules" ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "text-stone-500 hover:text-stone-300"
            }`}
          >
            📜 {_t("Aturan", "Rules")}
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
              activeTab === "features" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-stone-500 hover:text-stone-300"
            }`}
          >
            🚀 {_t("Fitur", "Features")}
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 warkop-scrollbar text-[11px] leading-relaxed">
          {activeTab === "rules" ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="space-y-2">
                <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-widest border-l-2 border-rose-500 pl-2">
                  🚨 {_t("01. TIDAK BOLEH SARA", "01. NO DISCRIMINATION / SARA")}
                </h4>
                <p className="text-[10px] text-stone-400 leading-relaxed font-sans">
                  {_t("Dilarang keras membawa isu SARA (Suku, Agama, Ras, dan Antar-golongan), politik panas, radikalisme, atau ujaran kebencian di obrolan.", 
                     "Strictly forbidden to bring up SARA issues (ethnic, religious, racial), heated politics, regional conflicts, or hate speech in chat.")}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest border-l-2 border-amber-500 pl-2">
                  🚫 {_t("02. DILARANG SPAM & PROMOSI", "02. NO SPAM & PROMOTIONS")}
                </h4>
                <p className="text-[10px] text-stone-400 leading-relaxed font-sans">
                  {_t("Dilarang mengirim text duplikat terus menerus, menyepam tautan mencurigakan, link phishing, bot judi, atau promosi liar.", 
                     "Forbidden to send repetitive duplicate messages, spam suspicious links, phishing urls, gambling bots, or unsolicited promotions.")}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-black text-sky-400 uppercase tracking-widest border-l-2 border-sky-500 pl-2">
                  📢 {_t("03. FITUR LAPORAN (REPORT)", "03. REPORT FEATURE (REPORT)")}
                </h4>
                <p className="text-[10px] text-stone-400 leading-relaxed font-sans">
                  {_t("Jika menemukan kawan atau warga warkop yang bertindak menyimpang, kamu bisa melapor ke Kang Pecel, Om Galon, atau langsung ke Admin via PIN profil.", 
                     "If you find an offending warkop citizen, you can report them to local characters like Kang Pecel, Om Galon, or directly to the Admin.")}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">
                  🔒 {_t("04. SISTEM BANNED (BAN SYSTEM)", "04. BAN SYSTEM (BANNED)")}
                </h4>
                <p className="text-[10px] text-stone-400 leading-relaxed font-sans">
                  {_t("Setiap pelanggaran serius akan dilaporkan secara otomatis, berujung pada blacklist PIN profil kawan dan dilarang masuk warkop selamanya.", 
                     "Serious violations will be logged, resulting in your profile PIN being blacklisted and barred from entering the cafe forever.")}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
               {features.map((feature, i) => (
                 <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-3">
                   <div className="text-xl shrink-0 mt-0.5">{feature.icon}</div>
                   <div className="flex flex-col gap-0.5">
                     <span className="text-[11px] font-black text-emerald-400 uppercase tracking-tight">{feature.title}</span>
                     <p className="text-[10px] text-stone-400 leading-snug">{feature.desc}</p>
                   </div>
                 </div>
               ))}
            </div>
          )}

          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl mt-4">
            <p className="text-[10px] text-stone-500 italic leading-relaxed text-center">
              {_t("Warkol Online adalah tempat santai untuk silaturahmi. Mari saling menghargai kawan lainnya!", 
                 "Warkol Online is a chill place for friendships. Let's respect other buddies!")}
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-6 w-full bg-[#E9C46A] hover:bg-amber-400 text-neutral-900 font-black py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] uppercase text-xs tracking-widest cursor-pointer"
        >
          {_t("Sip, Saya Paham", "Got it, I Understand")}
        </button>
      </div>
    </div>
  );
};

interface GuideModalProps {
  show: boolean;
  onClose: () => void;
  _t: (id: string, en: string) => string;
}

export const GuideModal: React.FC<GuideModalProps> = ({ show, onClose, _t }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[110] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#1C1713] border border-emerald-950/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200 text-left">
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
          <h3 className="text-lg font-black text-emerald-400 tracking-tight uppercase flex items-center gap-2">
            📘 {_t("Panduan & Aturan Warkol", "Guide & Rules")}
          </h3>
          <button 
            onClick={onClose}
            className="text-stone-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 warkop-scrollbar">
          <div className="space-y-2">
            <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">
              🚀 {_t("Fitur Utama", "Main Features")}
            </h4>
            <ul className="list-disc list-inside space-y-1 text-stone-400 text-[10px] leading-relaxed">
              <li>{_t("Tongkrongan: Meja obrolan real-time dengan berbagai vibe bapak-bapak.", "Hangout: Real-time chat tables with classic vibes.")}</li>
              <li>{_t("Papan Cerita: Bagikan cerita, foto, dan aktivitas harianmu ke warga lain.", "Story Board: Share stories, photos, and daily activities.")}</li>
              <li>{_t("Main Catur: Tantang warga lain main catur klasik nan sengit.", "Play Chess: Challenge others to a classic chess match.")}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-widest border-l-2 border-amber-500 pl-2">
              ⚖️ {_t("Aturan Warga (Wajib!)", "Citizen Rules (Mandatory!)")}
            </h4>
            <ul className="list-disc list-inside space-y-1 text-stone-400 text-[10px] leading-relaxed">
              <li>{_t("Jaga sopan santun, dilarang SARA & ujaran kebencian.", "Stay polite, no racism or hate speech allowed.")}</li>
              <li>{_t("Dilarang spamming atau share konten dewasa/vulgar.", "No spamming or sharing adult/vulgar content.")}</li>
              <li>{_t("Warkol adalah tempat santai, jangan cari keributan di sini.", "Warkol is a chill place, don't look for trouble.")}</li>
            </ul>
          </div>

          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
             <p className="text-[10px] text-stone-500 italic leading-relaxed">
               {_t("Warkol Online adalah simulasi tongkrongan digital. Gunakan dengan bijak untuk menjalin silaturahmi kawan!", 
                  "Warkol Online is a digital hangout simulation. Use it wisely to build friendships!")}
             </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] uppercase text-xs tracking-widest"
        >
          {_t("Saya Paham Aturannya", "I Understand the Rules")}
        </button>
      </div>
    </div>
  );
};

interface PurchaseConfirmModalProps {
  item: MenuItem | null;
  onConfirm: (item: MenuItem) => void;
  onCancel: () => void;
  _t: (id: string, en: string) => string;
}

export const PurchaseConfirmModal: React.FC<PurchaseConfirmModalProps> = ({ item, onConfirm, onCancel, _t }) => {
  if (!item) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[120] px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onCancel}></div>
      <div className="relative w-full max-w-xs bg-[#1C1713] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <span className="text-3xl">{item.icon}</span>
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
            {_t("Konfirmasi Pesanan", "Confirm Order")}
          </h3>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            {_t(`Yakin ingin beli ${item.name} seharga Rp ${item.price}?`, 
               `Are you sure you want to buy ${item.name} for IDR ${item.price}?`)}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => onConfirm(item)}
            className="w-full bg-[#E9C46A] hover:bg-amber-400 text-neutral-900 font-extrabold py-2.5 rounded-xl transition-all shadow-lg active:scale-[0.98] uppercase text-[10px] tracking-widest"
          >
            {_t("YA, BELI SEKARANG!", "YES, BUY NOW!")}
          </button>
          <button 
            onClick={onCancel}
            className="w-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white font-bold py-2 rounded-xl transition-all uppercase text-[9px] tracking-widest"
          >
            {_t("BATAL", "CANCEL")}
          </button>
        </div>
      </div>
    </div>
  );
};
