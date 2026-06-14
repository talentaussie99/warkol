import { Meja, TableId, Message, Pengunjung, MenuItem } from "./types";

export const INITIAL_MEJA_LIST: Meja[] = [
  {
    id: TableId.SANTAI,
    name: "Obrolan Terbuka Umum",
    icon: "☕",
    count: 1,
    topic: "Tempat nongkrong dan ngobrol bebas siapa aja",
    initialTopicDesc: "Meja obrolan umum pertama yang bisa diakses semuannya."
  }
];

export const INITIAL_PENGUNJUNG: Pengunjung[] = [
  { id: "1", name: "Bang Bakso", status: "Sedang meracik kuah gurih", isOnline: true, pin: "2B1F4A9E" },
  { id: "2", name: "Om Galon", status: "Lagi mikir langkah catur", isOnline: true, pin: "8D23FA7B" },
  { id: "3", name: "Kang Pecel", status: "Lagi ngunyah rempeyek", isOnline: true, pin: "5C78EF12" },
  { id: "4", name: "Bang Soto", status: "Menghitung mangkok pecah", isOnline: true, pin: "3A4B9F8D" },
  { id: "5", name: "Om Lele", status: "Menunggu pesanan mie rebus double", isOnline: true, pin: "1E2D3F4A" },
  { id: "6", name: "Kang Bubur", status: "Skripsi digantung dosen sekte diaduk", isOnline: true, pin: "7F8E0C9D" },
  { id: "8", name: "Pak RT", status: "Mencatat warga yang belum ronda", isOnline: true, pin: "8A9B7C1D" },
  { id: "9", name: "Cak Lontong", status: "Lagi bikin tebak-tebakan logika", isOnline: true, pin: "9C0D3E5F" },
  { id: "10", name: "Pak RW", status: "Membaca koran lampu merah", isOnline: false, pin: "6B432C10" }
];

export const KUTIPAN_WARUNG: string[] = [
  "Hidup itu seperti kopi, kadang pahit tapi bikin melek.",
  "Mending kopi pahit daripada janji manis yang berujung pahit.",
  "Uang tidak menjamin kebahagiaan, tapi gak punya uang bikin susah ngopi.",
  "Dua hal yang bikin bapak-bapak tenang: asap rokok pusaran catur dan kopi segelas.",
  "IPK tinggi itu bonus, yang utama adalah bisa menyelesaikan masalah sambil nyeruput kopi.",
  "Masalah hutang jangan dibawa lari, bawa ke warkop biar kelar (walau tetep ditagih).",
  "Catur mengajarkan kita bahwa melangkah itu harus mikir panjang, jangan asal skak.",
  "Gorengan satu dimakan dua, itu bukan hemat tapi solidaritas warkop.",
  "Kerja keraslah sampai tetangga mengira kamu pelihara tuyul.",
  "Waktu adalah uang. Kalau gak punya uang, mungkin kamu kebanyakan rebahan di warung."
];

export const MENU_ITEMS: MenuItem[] = [
  { id: "m1", name: "Kopi Hitam", price: "6.000", icon: "☕", category: "minuman", thirstBonus: 15, description: "Menambah status Haus sebesar 15%, cocok untuk menemani obrolan santai di warkop." },
  { id: "m2", name: "Kopi Susu", price: "8.000", icon: "🥛", category: "minuman", thirstBonus: 18, hungerBonus: 5, description: "Menambah status Haus sebesar 18% and Lapar sebesar 5%, memberikan rasa lebih mengenyangkan dibanding kopi biasa." },
  { id: "m4", name: "Teh Manis Panas", price: "5.000", icon: "☕", category: "minuman", thirstBonus: 15, description: "Menambah status Haus sebesar 15%, menjadi pilihan sederhana untuk bersantai." },
  { id: "m5", name: "Teh Manis Es", price: "6.000", icon: "🥤", category: "minuman", thirstBonus: 18, description: "Menambah status Haus sebesar 18%, memberikan kesegaran lebih saat nongkrong." },
  { id: "m6", name: "Teh Tarik", price: "10.000", icon: "🥤", category: "minuman", thirstBonus: 20, hungerBonus: 5, description: "Menambah status Haus sebesar 20% and Lapar sebesar 5%, dengan tekstur yang lebih padat and mengenyangkan." },
  { id: "m8", name: "Cokelat Panas", price: "8.000", icon: "☕", category: "minuman", thirstBonus: 15, hungerBonus: 8, description: "Menambah status Haus sebesar 15% and Lapar sebesar 8%, memberikan rasa manis yang mengenyangkan." },
  { id: "m9", name: "Soda Gembira", price: "8.000", icon: "🍹", category: "minuman", thirstBonus: 25, description: "Menambah status Haus sebesar 25%, menjadi minuman dengan efek Haus tertinggi di menu." },
  { id: "m10", name: "Mie Rebus", price: "12.000", icon: "🍜", category: "makanan", hungerBonus: 35, thirstBonus: 5, description: "Menambah status Lapar sebesar 35% and Haus sebesar 5%, cocok sebagai teman begadang." },
  { id: "m11", name: "Mie Goreng", price: "12.000", icon: "🍝", category: "makanan", hungerBonus: 40, description: "Menambah status Lapar sebesar 40%, menjadi salah satu menu paling mengenyangkan di warkop." },
  { id: "m12", name: "Roti Bakar Cokelat", price: "15.000", icon: "🍞", category: "makanan", hungerBonus: 25, description: "Menambah status Lapar sebesar 25%, cocok sebagai camilan saat ngobrol." },
  { id: "m13", name: "Burjo", price: "8.000", icon: "🥣", category: "makanan", hungerBonus: 30, thirstBonus: 5, description: "Menambah status Lapar sebesar 30% and Haus sebesar 5%, pilihan sederhana yang cukup mengenyangkan." },
  { id: "m14", name: "Burtam", price: "8.000", icon: "🥣", category: "makanan", hungerBonus: 28, thirstBonus: 5, description: "Menambah status Lapar sebesar 28% and Haus sebesar 5%, cocok untuk menemani waktu nongkrong yang panjang." },
  { id: "m15", name: "Bubur Ayam", price: "12.000", icon: "🥣", category: "makanan", hungerBonus: 65, description: "Menambah status Lapar sebesar 65%, pilihan utama untuk kenyang maksimal." },
  { id: "m16", name: "Gorengan", price: "2.000", icon: "🍤", category: "tambahan", hungerBonus: 10, description: "Menambah status Lapar sebesar 10%, camilan wajib para bapak." }
];

export const COLORS = [
  "text-emerald-400 bg-emerald-950/40 border-emerald-800",
  "text-amber-400 bg-amber-950/40 border-amber-800",
  "text-sky-400 bg-sky-950/40 border-sky-800",
  "text-rose-400 bg-rose-950/40 border-rose-800",
  "text-purple-400 bg-purple-950/40 border-purple-800",
  "text-orange-400 bg-orange-950/40 border-orange-800",
  "text-indigo-400 bg-indigo-950/40 border-indigo-800",
  "text-teal-400 bg-teal-950/40 border-teal-800"
];

export const CHAT_SENSORS_FOR_TABLES: Record<TableId, string[]> = {
  [TableId.SANTAI]: [
    "Kalau saya sih mending gaji gede lah, passion bisa dicari pas weekend.",
    "Bener juga sih. Tapi kalau ngerjain yang dibenci 9-to-5 mah stress cepet tua.",
    "Tergantung cicilan juga sih bos. Kalau cicilan numpuk, passion langsung ilang diganti kebutuhan hahah.",
    "Ada pepatah warkop: passion terbaik adalah pekerjaan yang menghasilkan uang.",
    "Halah, mending gausah kerja. Pelihara tuyul aja kayak tetangga sebelah.",
    "Bicara soal passion, passion bapak-bapak di sini ya main catur ampe subuh lah.",
    "Sruput kopi dulu kawan, biar otak anget bicaranya fokus.",
    "Yang penting halal dan gak ngerepotin orang tua lah ya."
  ],
  [TableId.KERJA]: [
    "Enakan remote lah, bisa kerja sambil rebahan dan pake kolor doang.",
    "Tapi internet di rumah kudu kenceng, kalau mati pas meeting langsung panik.",
    "Kerja kantoran Jakarta dapet capek di jalan doang, tua di jalan raya.",
    "Gaji dollar tapi kalau sakit bayar sendiri mah tekor juga bro.",
    "Udah paling bener jualan gorengan depan alfa, duit jalan tiap hari.",
    "Kemarin dapet tawaran remote dari Singapore, sayang bahasa inggris saya cuma yes-no doang.",
    "Rapat terus tapi gak pernah eksekusi, emang kultur kantoran keren sikit.",
    "Yang penting kopi hitam selalu sedia brosis."
  ],
  [TableId.KULIAH]: [
    "Dosen pembimbing saya killer banget, revisi mulu gak pernah dibaca.",
    "Sabar bro, angkatan tua emang cobaan hidupnya berat.",
    "Kuliah mahal mending jualan es teh jumbo pinggir jalan, sebulan dapet omset bejibun.",
    "IPK itu cuma kertas, tapi kalau di bawah 3.00 ya cv langsung dibuang hrd.",
    "Skripsi saya stuck di bab 3, ada yang bisa bantu analisa data gak?",
    "Kemarin liat UKT naik lagi, pusing bapak saya di rumah nyari pinjeman.",
    "Udah semester 12 nih, mending lanjut apa langsung nikah aja ya?",
    "Makan mie instan pake nasi adalah penolong mahasiswa akhir bulan."
  ],
  [TableId.GAMING]: [
    "Bocil jaman sekarang mainnya ML mulu, gak tau serunya main catur kayu koplak-koplok.",
    "ML asik kalo mabar bro, kalo solo dapet tim beban mulu dibilang yatim.",
    "Saya semalem kalah beruntun 5 kali, pengen banting hp rasanya.",
    "Bapak-bapak mah mainnya Onet atau Solitaire aja lah haha.",
    "Catur di warkop ini tetep game nomor satu sepajang masa.",
    "Semalem liat pro player maen seru amat, pas coba sendiri malah dituduh feeder.",
    "Mending maen game mancing aja santai gak bikin tensi naik.",
    "Ayo yang mau mabar, ntar saya pick tank."
  ],
  [TableId.CURHAT]: [
    "Gara-gara khilaf klik iklan dapet paylater limit gede, keranjang shopee abis diperas.",
    "Hati-hati lho, bunga pinjol melilit leher lebih cepet dari ular piton.",
    "Gua pusing istri minta dibeliin panci presto baru padahal panci lama masih bagus.",
    "Solusinya matikan hp, tidur, besok narik ojek lagi nyari tambahan.",
    "Semoga besok ada mukjizat, tagihan numpuk gak karuan.",
    "Emang paling tenang gak punya utang, makan tahu tempe juga nikmat.",
    "Curhat di warkop rasanya beban agak keangkat dikit.",
    "Sabar lur, badai pasti berlalu, tapi gerimisnya agak lama."
  ],
  [TableId.BOLA]: [
    "Wasitnya semalem parah banget, offside jelas dibilang onside. Sialan.",
    "Halah tim lu emang maen ampas aja, gak usah nyalahin wasit lek.",
    "Gelandangnya lemes banget kayak belum minum STMJ sbelum tanding.",
    "Musim ini emang waktunya tim medioker buat pamer kekuatan asli.",
    "Pelatihnya kudu dipecat, taktik kuno bertahan mulu kayak parkir bus kota.",
    "Semalem kalah taruhan sebungkus rokok djarum super, apes bener.",
    "Beli pemain mahal-mahal cuma buat hiasan bangku cadangan.",
    "Yang penting tontonan seru sambil makan kacang garuda."
  ]
};

export const INITIAL_CHAT: Record<TableId, Message[]> = {
  [TableId.SANTAI]: [
    { id: "s1", sender: "Om Galon", text: "Passion itu bagus kalau tabungan tebel. Kalau kosong? Kerja apa aja yang penting jadi beras.", role: "guest", tag: "Langganan", timestamp: "04:50", color: "text-amber-400 bg-amber-950/40 border-amber-800" },
    { id: "s2", sender: "Kang Pecel", text: "Betul Om. Passion gak bisa buat bayar listrik atau SPP anak.", role: "guest", tag: "Warga", timestamp: "04:52", color: "text-sky-400 bg-sky-950/40 border-sky-800" },
    { id: "s3", sender: "Bang Bakso", text: "Tapi kerja terpaksa tiap hari bikin makan gak enak tidur jam 3 pagi lho.", role: "guest", tag: "Ronda", timestamp: "04:55", color: "text-emerald-400 bg-emerald-950/40 border-emerald-800" },
    { id: "s4", sender: "Pak RT", text: "Yang penting ada kopi hitam hangat di meja. Semua masalah kelar dipikir bertenang.", role: "admin", tag: "Pak RT", timestamp: "04:58", color: "text-rose-400 bg-rose-950/40 border-rose-800" }
  ],
  [TableId.KERJA]: [],
  [TableId.KULIAH]: [],
  [TableId.GAMING]: [],
  [TableId.CURHAT]: [],
  [TableId.BOLA]: []
};

export const AUTO_REPLIES = [
  "Betul banget itu bang. Saya setuju sepuluh piring.",
  "Sruput kopi dulu lah biar gak emosi ginian.",
  "Duh, masalah itu mah berat, mending lanjut main catur aja wis.",
  "Waduh bener juga ya, baru kepikiran ane.",
  "Halah hoax itu bang, denger kabar dari grup WA RT mana ya?",
  "Ah masa sih? Semalem ane liat di tiktok gak gitu deh.",
  "Kembali lagi ke masing-masing sih ya, yang penting dapet thr tahun ini.",
  "Ojo dibanding-bandingke, yang penting dapet gorengan satu gratis sambal goreng.",
  "Wah parah sih kalau beneran begitu kejadiannya.",
  "Mending beli kopi segelas lagi, biar diskusinya lancar."
];

export const INDO_NAMES = [
  "Bang Bakso",
  "Om Galon",
  "Kang Pecel",
  "Bang Soto",
  "Om Lele",
  "Kang Bubur",
  "Pak RT",
  "Mbah Kopi",
  "Cak Lontong",
  "Lek Kupat",
  "Pak RW",
  "Kang Siomay",
  "Mas Batagor",
  "Mpok Jamu",
  "Bang Ojol"
];

export const TAGS = ["Langganan", "Sepuh", "Ronda", "Suhu", "Rakyat Biasa", "Tukang Ngopi", "Penikmat Mie"];
