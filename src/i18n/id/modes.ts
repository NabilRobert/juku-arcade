import type { Messages } from '../en/index.ts';

export const modes: Messages['modes'] = {
  words: {
    name: 'Kata',
    description: 'Pasangkan tiap kata {level} dengan cara bacanya. Dihitung untuk ulasanmu.',
  },
  kanji: {
    name: 'Kanji',
    description:
      'Temukan semua cara baca satu kanji di antara {cards} kartu, dengan {lanterns} lentera per lembar. Tidak dihitung untuk ulasanmu.',
  },
  bunpou: {
    name: 'Bunpou',
    description: 'Susun tiap kalimat, lalu tonton ceritanya. Dihitung untuk ulasan tata bahasa.',
    note: 'Sementara hanya N5 · masih dikembangkan',
  },
  dojo: {
    name: 'Latihan',
    description:
      'Kata, kanji, dan tata bahasa yang sudah kamu temui, sampai {lanterns} kali salah. Ada peringkatnya.',
    bestRun: 'Permainan terbaik',
  },
  goals: {
    wordsKnown: 'Kata dikuasai',
    kanjiMastered: 'Kanji dikuasai',
    grammarKnown: 'Tata bahasa dikuasai',
  },
};
