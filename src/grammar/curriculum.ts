/**
 * The grammar points in teaching order, apart from their templates
 * (templates.ts), so the start screen's level goal can count them without
 * loading the templates.
 */

/**
 * Every grammar point with templates, in the order they're taught: a new
 * player's first points are the first ones here (grammar-reviews.ts).
 * The ids are OpenJLPT's, as in the shelf map.
 */
export const CURRICULUM = [
  'wa',
  'o',
  'ni-time',
  'de-place',
  'mo',
  'made',
  'to-with',
  'kara-from',
  'ga-subject',
  'ga-aru-ga-iru',
  'ni-destination',
  'te-iru',
  'te',
  'te-kara',
  'ga-but',
  'kara-reason',
  'nani-mo-nai-dare-mo-nai',
  'te-kudasai',
  'masen-ka',
  'yo',
] as const;
export type PointId = (typeof CURRICULUM)[number];
