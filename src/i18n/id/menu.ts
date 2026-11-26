import type { Messages } from '../en/index.ts';

export const menu: Messages['menu'] = {
  loading: 'Memuat…',
  chooseMode: 'Pilih mode',
  setup: {
    question: 'Level JLPT mana yang sedang kamu pelajari?',
    classCode: 'Kode kelas (opsional, dari gurumu)',
    privacy: 'Kemajuanmu tetap tersimpan di peramban ini. Tanpa akun, tanpa nama.',
  },
  madeBy: 'dibuat oleh {author} · 2026',
  links: {
    mode: 'Ganti mode',
    stats: 'Statistik',
    settings: 'Pengaturan',
    about: 'Tentang data',
    research: 'Risetnya',
  },
  openPanel: 'Buka panel',
  closePanel: 'Tutup panel',
  rotate: {
    title: 'Putar ponselmu kembali ke posisi tegak',
    body: 'Game ini tidak mendukung posisi mendatar di ponsel. Permainan yang sedang berjalan dijeda.',
  },
  fold: {
    show: 'Buka',
    hide: 'Tutup',
    showPanel: 'Buka {panel}',
    hidePanel: 'Tutup {panel}',
  },
  sound: {
    sound: 'Suara',
    effects: 'Efek',
    music: 'Musik',
    volumeOf: 'Volume {label}',
    off: 'mati',
  },
};
