import type { Messages } from '../../en/index.ts';

export const research: Messages['pages']['research'] = {
  title: 'Risetnya',
  intro:
    'Penelitian yang menjadi dasar desain game ini. Penelitian ini menjelaskan kenapa game ini dibuat seperti ini; tidak satu pun meneliti game ini, dan semuanya bukan jaminan hasil belajar atau nilai ujian.',
  where: 'Letaknya di makalah: {where}',
  freeCopy: 'Salinan gratis (PDF)',
  inGame: 'Di juku-arcade: {use}',
  groups: {
    learning: 'Belajar yang melekat',
    motivation: 'Kenapa unsur game membantu',
    goals: 'Target dan kemajuan',
    streak: 'Streak',
    sound: 'Suara yang tidak mengganggu',
  },
  sources: {
    cepeda2006: {
      finding:
        'Belajar yang diberi jeda waktu diingat lebih lama daripada belajar yang sama tapi dijejalkan sekaligus.',
      summary:
        'Ini bukan satu eksperimen, melainkan tinjauan yang menggabungkan 317 eksperimen dari 184 artikel tentang mengingat kata, pasangan kata, dan fakta. Di tiap eksperimen, sebagian orang mempelajari sesuatu beberapa kali berturut-turut, sebagian lagi dengan jeda di antaranya. Kelompok yang diberi jeda mengingat lebih banyak di tes akhir, dan makin lama sesuatu harus diingat, makin panjang jeda terbaiknya. Ini mendukung jeda secara umum; jeda game ini yang makin panjang mengikuti temuan terakhir itu, tapi tidak diuji di makalah ini.',
      where: 'hlm. 358, "Spacing Effects: Massing Versus Spacing", paragraf ke-2.',
      inGame:
        'Dek harian dan kotak ulasan: sebuah kata kembali setelah jeda, bukan sepuluh kali dalam satu duduk.',
    },
    roediger2006: {
      finding:
        'Menguji diri sendiri lebih baik daripada membaca ulang untuk ingatan jangka panjang.',
      summary:
        'Mahasiswa membaca teks pendek. Satu kelompok membaca teks empat kali; kelompok lain membacanya tiga kali lalu menuliskan semua yang mereka ingat; kelompok ketiga membacanya sekali lalu mengerjakan tes mengingat itu tiga kali, tanpa umpan balik. Lima menit kemudian, yang membaca ulang paling unggul (83% lawan 71%). Seminggu kemudian hasilnya terbalik: kelompok yang diuji ingat 61% dan yang membaca ulang 40%, padahal yang membaca ulang merasa lebih yakin.',
      where: 'hlm. 249, abstrak; hlm. 253, "General Discussion", paragraf ke-1.',
      inGame: 'Setiap kartu meminta jawaban; tidak pernah ada jawaban yang hanya untuk dibaca.',
    },
    hattie2007: {
      finding:
        'Umpan balik termasuk pengaruh terkuat dalam belajar, terutama umpan balik yang menunjukkan mana yang benar dan mana yang salah.',
      summary:
        'Sebuah tinjauan, bukan eksperimen: menggabungkan 12 meta-analisis sebelumnya yang mencakup 196 penelitian tentang umpan balik di kelas. Pengaruh rata-ratanya sekitar dua kali pengaruh sekolah yang biasa. Para penulis menekankan bahwa umpan balik juga bisa merugikan: paling efektif saat membahas tugasnya (apa yang benar, apa yang salah, dan cara memperbaikinya) dan paling lemah saat hanya berupa pujian.',
      where: 'hlm. 81, abstrak, kalimat ke-1; hlm. 91, "Feedback About the Task", paragraf ke-1.',
      inGame: 'Saat meleset, jawaban yang benar langsung muncul, dan kata itu segera kembali lagi.',
    },
    sailer2020: {
      finding:
        'Unsur game memberi pengaruh positif yang kecil tapi signifikan pada belajar, motivasi, dan perilaku.',
      summary:
        'Meta-analisis eksperimen yang membandingkan pelajaran dengan unsur game dan pelajaran yang sama tanpa unsur game. Unsur game membantu belajar (19 perbandingan, 1.686 pelajar), motivasi (16 perbandingan, 2.246 pelajar), dan perilaku belajar (9 perbandingan, 951 pelajar). Para penulis menyebut pengaruh ini kecil tapi signifikan. Pengaruh pada belajar bertahan di penelitian yang paling cermat; pengaruh pada motivasi dan perilaku kurang stabil. Ini mendukung unsur game secara umum, tanpa menjanjikan hasil besar.',
      where: 'hlm. 77, abstrak.',
      inGame: 'Kombo, koin, level, dan papan skor.',
    },
    ryan2006: {
      finding: 'Game memikat karena membuat pemain merasa mampu dan bebas memilih.',
      summary:
        'Empat penelitian. Di tiga penelitian pertama, mahasiswa memainkan satu, dua, atau empat game di laboratorium lalu menilai seberapa mampu dan seberapa bebas memilih yang mereka rasakan; perasaan itu memprediksi seberapa senang mereka dengan game itu, apakah mereka ingin memainkannya lagi, dan bagaimana suasana hati mereka berubah. Penelitian keempat menyurvei komunitas daring pemain game multipemain: merasa mampu, bebas memilih, dan terhubung dengan orang lain masing-masing memprediksi rasa senang dan keinginan bermain lagi.',
      where:
        'hlm. 344, abstrak; hlm. 358, "General discussion", paragraf ke-2. Salinan gratisnya adalah versi daring awal, jadi halamannya berbeda: abstrak di hlm. 347 dan pembahasan di hlm. 361.',
      inGame: 'Kamu memilih mode sendiri, dan tingkat kesulitannya mengikuti kemampuanmu.',
    },
    kivetz2006: {
      finding: 'Orang berusaha lebih keras saat makin dekat ke target.',
      summary:
        'Di sebuah kafe kampus, pelanggan punya kartu stempel: beli 10 kopi, dapat satu gratis. Makin dekat ke kopi gratis, makin cepat mereka kembali membeli kopi berikutnya. Penelitian kedua menemukan hal yang sama pada orang yang menilai lagu secara daring demi voucer hadiah: mereka lebih sering berkunjung dan menilai lebih banyak lagu saat hadiah makin dekat. Kartu 12 stempel yang sudah berisi 2 stempel gratis juga lebih cepat selesai daripada kartu 10 stempel biasa, jadi rasa sudah maju saja sudah membuat orang lebih cepat.',
      where: 'hlm. 39, abstrak, temuan (1) dan (2).',
      inGame:
        'Bar target JLPT, dengan tanda di setiap seperempat, dan hasil yang membandingkan permainan dengan skor terbaikmu.',
    },
    silverman2023: {
      finding:
        'Streak yang utuh membuat orang terus kembali, streak yang putus membuat mereka berhenti, dan bisa memperbaiki yang putus meredam efek itu.',
      summary:
        'Tujuh penelitian. Yang pertama memakai data langkah kaki sungguhan dari tantangan jalan kaki di sebuah universitas; sisanya penelitian laboratorium dengan aplikasi olahraga, belajar bahasa, dan game. Orang yang sudah melakukan jumlah yang persis sama lebih mungkin melanjutkan saat catatannya menunjukkan streak utuh daripada streak putus. Efek ini makin kuat saat orang menyalahkan diri sendiri atas putusnya streak, dan melemah saat mereka bisa memperbaikinya: di penelitian game, 93% melanjutkan dengan streak utuh, 69% dengan streak putus, dan 85% dengan streak putus yang bisa diperbaiki. Hari istirahat mingguan di game ini mirip perbaikan, tapi bukan itu yang diuji penelitian ini.',
      where:
        'Abstrak (hlm. 1095 di jurnal); perbaikan streak ada di Studi 7. Salinan gratisnya adalah naskah yang diterima, jadi halamannya berbeda: abstrak di hlm. 3 dan Studi 7 di hlm. 43.',
      inGame:
        'Streak bermain, yang tidak putus karena satu hari istirahat seminggu, dan kalender bermain.',
    },
    moreno2000: {
      finding: 'Suara latar yang tidak berhubungan dengan pelajaran mengurangi hasil belajar.',
      summary:
        'Dua eksperimen. Mahasiswa menonton animasi pendek bernarasi tentang terbentuknya petir atau cara kerja rem mobil; sebagian versi diberi musik latar, sebagian efek suara, sebagian keduanya, dan sebagian tidak sama sekali. Yang mendengar musik latar mengingat lebih sedikit dan memecahkan lebih sedikit soal daripada yang tidak, dan gabungan keduanya paling buruk. Penjelasannya: suara tambahan berebut ingatan dengar yang terbatas dengan narasi. Game ini tidak punya narasi, jadi ini alasan untuk berhati-hati, bukan uji langsung.',
      where: 'hlm. 117, abstrak.',
      inGame:
        'Musik dimulai pelan, di bawah efek suara, punya pengatur volume sendiri, dan bisa dimatikan.',
    },
  },
};
