import React from "react";

interface TutorialModalProps {
  step: number;
  onNext: () => void;
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: "Selamat Datang di Warkop Online! \u2615",
    desc: "Ini adalah tempat buat nongkrong dan ngopi virtual. Ayo kita keliling sebentar lihat fitur-fiturnya."
  },
  {
    title: "1. Papan Cerita (Linimasa)",
    desc: "Di menu Papan Cerita (ikon koran di kanan atas/bawah), kamu bisa lihat postingan dari teman-teman lain. Bisa bagikan cerita, gambar, atau status."
  },
  {
    title: "2. Chat & Obrolan Meja",
    desc: "Kamu bisa ngobrol langsung di obrolan meja. Sekarang sistem murni tanpa bot, semua chat di sini 100% dari user asli yang udah daftar!"
  },
  {
    title: "3. Pesan Meja Khusus",
    desc: "Klik 'Pesan Meja / Buat Topik Baru' di bagian atas layar obrolan. Kamu bisa buat meja obrolanmu sendiri dengan topik tertentu dan mengundang teman."
  },
  {
    title: "4. FITUR BARU: PIN Profil",
    desc: "Lihat kode warna-warni di Menu Profil? Itu adalah PIN akunmu! Kamu bisa membagikan PIN ini untuk keperluan menambah teman rahasia atau diundang ke meja eksklusif."
  },
  {
    title: "Siap Nongkrong!",
    desc: "Tenaga (Lapar & Haus) akunmu sudah 100%! Jangan lupa untuk jajan gorengan atau ngopi lewat menu 'Sajian' biar energimu tidak habis. Selamat nongkrong!"
  }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ step, onNext, onClose }) => {
  const current = tutorialSteps[step];
  const isLast = step === tutorialSteps.length - 1;

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-900/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
        <div className="absolute top-3 right-4 text-xs font-mono font-bold text-amber-500/50">
          LANGKAH {step + 1}/{tutorialSteps.length}
        </div>
        
        <h2 className="text-lg font-black text-amber-400 mb-3 uppercase tracking-wide pr-8">
          {current.title}
        </h2>
        <p className="text-sm font-medium text-stone-300 leading-relaxed min-h-[4rem]">
          {current.desc}
        </p>

        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-1">
            {tutorialSteps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-4 bg-amber-400" : "w-1.5 bg-stone-700"}`}
              />
            ))}
          </div>

          <button
            onClick={isLast ? onClose : onNext}
            className="py-2 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-lg text-sm font-bold text-black transform transition-transform active:scale-95 shadow-md shadow-amber-900/40"
          >
            {isLast ? "Mulai Nongkrong 🚀" : "Lanjut \u279c"}
          </button>
        </div>
      </div>
    </div>
  );
};
