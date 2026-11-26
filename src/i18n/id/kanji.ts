import type { Messages } from '../en/index.ts';

export const kanji: Messages['kanji'] = {
  sidePanel: 'Permainan Kanji',
  modeTitle: 'Mode Kanji · {level}',
  progress: 'Kanji {number} / {total}',
  board: 'Papan kanji',
  wrongPicksLeft: 'Sisa {left} dari {max} salah pilih',
  perfect: 'Sempurna',
  howToPlay:
    'Pilih setiap cara baca kanji itu, lalu tekan Mainkan. Kamu boleh salah pilih {maxWrong} kali per kanji; kanji yang cara bacanya belum ketemu semua memadamkan satu lentera, dan lembar berakhir saat semua {lanterns} lentera padam. Kanji yang meleset kembali besok; yang sempurna menunggu lebih lama.',
  sheetNote:
    'Satu lembar berisi {perSheet} kanji, atau berakhir saat semua {lanterns} lentera padam. Sebuah kanji dianggap dikuasai setelah kamu menemukan semua cara bacanya tanpa salah pilih pada {days} hari yang berbeda.',
  anotherSheet: 'Lembar lagi',
  lanternsOut: 'Lentera padam',
  sheetDone: 'Lembar selesai',
  result: {
    perfect: 'Sempurna! +{points}',
    found: 'Ketemu {hits} dari {total}',
    points: '· +{points}',
    wrongPicks: '{n} salah pilih',
    crests: 'Lambang {sign}{points}',
    prompt: 'Pilih cara bacanya, lalu Mainkan.',
  },
  scout: {
    turnBack: '↩ Balikkan lagi',
    earn: 'Ronde sempurna memberimu satu intai.',
  },
  crestEffects: {
    koban: 'Dipilih benar: poin dua kali lipat untuk cara baca itu.',
    omikuji: 'Dipilih benar: bonus {min} sampai {max} poin.',
    cursed: 'Dipilih: kehilangan {points} poin. Selalu cara baca yang salah.',
  },
  crestBonus: {
    koban: '{symbol} Koban! +{points}',
    omikuji: '{symbol} Omikuji! +{points}',
    cursed: '{symbol} Terkutuk! −{points}',
  },
};
