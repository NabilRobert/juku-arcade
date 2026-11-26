import type { Messages } from '../en/index.ts';
import { research } from './pages/research.ts';

export const pages: Messages['pages'] = {
  stats: {
    title: 'Statistikmu',
    wordsKnown: 'Kata dikuasai ({level})',
    rightToday: 'Benar hari ini',
    rightOverall: 'Benar keseluruhan',
    rightCount: '{count} benar',
    bestCombo: 'Kombo terbaik',
    bestScore: 'Skor terbaik',
    playedToday: 'Main hari ini',
    minutes: '{minutes} mnt',
    setsPlayed: 'Set dimainkan',
    daysPlayed: 'Hari bermain',
    missedMost: 'Paling sering salah',
    noMisses: 'Belum ada yang salah.',
    mistakesByKind: 'Jenis kesalahan',
    noMistakes: 'Belum ada kesalahan.',
    footnote:
      'Dari yang sudah kamu mainkan di peramban ini. Mode Kanji dan mode Latihan tidak dihitung.',
    mistakes: {
      longVowel: 'Vokal panjang (おう atau おお?)',
      smallTsu: 'っ kecil',
      dakuten: 'Dakuten (か atau が?)',
      smallYoon: 'ゃゅょ kecil',
      otherReading: 'Cara baca lain dari kanjinya',
      mixUp: 'Tertukar dua kata',
    },
  },
  grammarStats: {
    title: 'Tata bahasa',
    known: 'Tata bahasa dikuasai',
    seen: 'Tata bahasa ditemui',
    missedMost: 'Tata bahasa paling sering salah',
    mistakesByKind: 'Jenis kesalahan tata bahasa',
    brokenRules: {
      verbNotLast: 'Kata kerja tidak di akhir',
      particleAfterWrongWord: 'Partikel setelah kata yang salah',
      piecesOutOfOrder: 'Bagian pola tidak berurutan',
    },
  },
  about: {
    title: 'Tentang data',
    containsData:
      'Berisi data dari {openJlpt} ({licence}), yang memakai JMdict dan KANJIDIC2 (EDRDG), daftar JLPT Jonathan Waller, dan Tatoeba.',
    jmdictLink: 'JMdict dan KANJIDIC2',
    jmdict:
      '{link}, Electronic Dictionary Research and Development Group: arti, cara baca, data kanji.',
    wallerLink: 'Daftar JLPT Jonathan Waller',
    waller: '{link} (CC BY): level N5–N1.',
    tatoeba: '{link} (CC BY 2.0 FR): contoh kalimat.',
    levelsNote:
      'Level JLPT hanya perkiraan: Japan Foundation tidak menerbitkan daftar kata resmi sejak 2010. Dek kata game ini diturunkan dari OpenJLPT, jadi juga berlisensi CC BY-SA 4.0.',
  },
  checkUp: {
    title: 'Cek harian',
    intro:
      '{count} pertanyaan singkat, sekitar satu menit. Ini menunjukkan apa yang sudah melekat. Tidak mengubah skor atau ulasanmu.',
    start: 'Mulai',
    skip: 'Lewati hari ini',
    timeLeft: 'Sisa waktu untuk kata ini',
  },
  wellbeing: {
    capped: 'Waktu main hari ini sudah habis. Sampai jumpa besok!',
    capNote: 'Sekolahmu menetapkan batas harian {minutes} menit.',
    nudge: '{minutes} menit: waktu yang pas untuk berhenti. Sampai jumpa besok!',
    nudgeNote: 'Latihan singkat setiap hari membantu kata lebih melekat.',
    stop: 'Berhenti untuk hari ini',
    keepGoing: 'Lanjut main',
  },
  research,
};
