# Slice 0 spike: what the decks can hold

Answers slice 0's questions from the slice plan:
- how many words per level can go in a deck under L2's rules?
- can the irregular-reading flag be computed?
- which error types (R8) can be computed, and how many decoys of each can
  every level supply (D27)?

Regenerate with `npm run decks:report` (about 1 s). Data: OpenJLPT
`bf4e1ee`, the same pinned build as Juku.

## Results (2026-11-21)

| Level | Words | Usable (has kanji) | Share a reading | Irregular | Unknown | longVowel | smallTsu | dakuten | smallYoon | otherReading |
|---|---|---|---|---|---|---|---|---|---|---|
| N5 | 674 | 499 | 23 | 30 | 2 | 45% | 53% | 85% | 9% | 97% |
| N4 | 630 | 490 | 10 | 10 | 3 | 48% | 52% | 88% | 16% | 97% |
| N3 | 1659 | 1441 | 129 | 14 | 22 | 52% | 51% | 89% | 18% | 95% |
| N2 | 1778 | 1468 | 95 | 39 | 65 | 55% | 59% | 93% | 17% | 93% |
| N1 | 3070 | 2758 | 276 | 67 | 110 | 55% | 64% | 94% | 20% | 94% |

The decoy columns show the share of usable words that have a decoy of that
type. Deck files are 17 KB gzipped at N5 and N4, and 100 KB at N1.

## Findings

1. **Enough words.** 499 N5 words (74%) have kanji. The other 175 are
   kana-only (これ, ソース) and are left out. "Share a reading" counts words
   with a homophone in the same level (橋 / 箸 はし). The deal keeps them
   apart (`canJoin`, tested).
2. **The irregular flag works.** At N5 it flags 30 words: 今年 ことし,
   今日 きょう, 明日 あした, 二十日 はつか, お母さん おかあさん… Only 2 are
   "unknown": a kanji missing from KANJIDIC2, or too many combinations.
   Two mistakes found and fixed in the spike:
   - 入口 いりぐち was wrongly flagged. Compounds use the verb's stem form
     (入る → 入り), which is now generated;
   - the stem form then produced すわりる for 座る. It now applies only
     when no kana follow the kanji.
3. **Error types: 5 of the planned 7 can be computed.**
   - Long vowel, small っ, dakuten, small ゃゅょ and other reading are all
     computed from the reading and KANJIDIC2.
   - **Look-alike kanji is dropped.** OpenJLPT has each kanji's radical,
     but not its components. 待 and 持 share 寺, not a radical, so a
     radical-based guess would mislabel errors. EDRDG's KRADFILE (also
     CC BY-SA) has components, if this type is wanted later.
   - "A mix-up with another word in the set" needs no decoy. It comes from
     the real cards.
   - Every decoy must pass `isPronounceable`. The spike first produced
     いっにち and せんっせい, which no word could be.
4. **Supply is uneven, so even rotation needs care in slice 1.** Small
   ゃゅょ decoys exist for only 9% of N5 words, so only about 37% of N5
   sets contain a word that has one. Rotating types evenly within every
   set isn't possible. **Proposal for slice 1:** each set uses the type
   tested least so far that the set can supply. The class report divides
   misses by the number of times each type was shown, which keeps phase
   3's "at equal exposure" fair.
5. **The difficulty guess is narrow at N5:** from 0.15 to 0.37, with a
   median of 0.17. Mapping that chance straight onto +0.1×…+0.5× tags would
   tag almost every N5 card +0.1×. **Proposal for slice 1:** tags come from
   a word's rank within its level (fifths: +0.1× for the easiest fifth, up
   to +0.5× for the hardest), so tags are spread from the first set.
6. **Known risk: a "wrong" combination can be a real reading.** OpenJLPT
   lists only some alternative readings. The other-reading decoy prefers
   the closest wrong combination, which makes this rare. R6 logs the
   decoy text with every miss, so the playtest can catch any decoy players
   are right to pick.
