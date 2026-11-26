/**
 * The start screen's streak reminder and milestones. Like Duolingo's
 * practice reminders (Yancey & Settles 2020, KDD), each message is a
 * written template that only shows when it fits the player's streak, one
 * is picked among those that fit, and the one shown last time is skipped
 * when another fits, since a fresh message works better than a repeated
 * one. The milestones are celebrated on the day they're reached.
 */
import { pickOne } from '../game/random.ts';
import type { RandomSource } from '../game/deal.ts';
import { addDays } from './days.ts';
import type { Streak } from './streak.ts';

/** Streak lengths celebrated on the day they're reached. */
export const MILESTONES = [3, 7, 14, 30, 50, 100, 365] as const;
/** A milestone this close or closer is mentioned once today is played. */
const MILESTONE_HINT_DAYS = 3;

export interface StreakContext {
  streak: Streak;
  today: string;
  /** False until the player has played any run at all. */
  hasPlayed: boolean;
}

export interface StreakMessage {
  id: string;
  text: string;
}

interface Template {
  id: string;
  fits: (context: StreakContext) => boolean;
  text: (context: StreakContext) => string;
}

export function nextMilestone(days: number): number | null {
  return MILESTONES.find((milestone) => milestone > days) ?? null;
}

/** The milestone reached today, if one was. */
export function milestoneToday(streak: Streak): number | null {
  const isMilestone = (MILESTONES as readonly number[]).includes(streak.days);
  return streak.isTodayPlayed && isMilestone ? streak.days : null;
}

const isOpen = ({ streak }: StreakContext): boolean => streak.days > 0 && !streak.isTodayPlayed;
const daysToMilestone = ({ streak }: StreakContext): number =>
  (nextMilestone(streak.days) ?? Infinity) - streak.days;

const START: Template = {
  id: 'start',
  fits: ({ hasPlayed }) => !hasPlayed,
  text: () => 'Play a run today to start a streak.',
};

const TEMPLATES: readonly Template[] = [
  START,
  {
    id: 'restart',
    fits: ({ hasPlayed, streak }) => hasPlayed && streak.days === 0,
    text: () => 'Start a new streak today: one run is enough.',
  },
  {
    id: 'keep-going',
    fits: isOpen,
    text: ({ streak }) => `${streak.days}-day streak! Play today to make it ${streak.days + 1}.`,
  },
  {
    id: 'dont-lose',
    fits: (context) => isOpen(context) && context.streak.days >= MILESTONES[0],
    text: ({ streak }) => `Don't lose your ${streak.days}-day streak: one run keeps it going.`,
  },
  {
    id: 'rest-saved',
    fits: (context) => isOpen(context) && context.streak.restDays[0] === addDays(context.today, -1),
    text: ({ streak }) =>
      `Your rest day saved your ${streak.days}-day streak. Play today to keep it.`,
  },
  {
    id: 'done-today',
    fits: ({ streak }) => streak.isTodayPlayed,
    text: ({ streak }) => `Today ✓ · ${streak.days}-day streak. See you tomorrow!`,
  },
  {
    id: 'milestone-near',
    fits: (context) =>
      context.streak.isTodayPlayed && daysToMilestone(context) <= MILESTONE_HINT_DAYS,
    text: (context) =>
      `Today ✓ · ${daysToMilestone(context)} more to a ${nextMilestone(context.streak.days) ?? ''}-day streak.`,
  },
];

/** A message that fits, avoiding the last one shown when another fits too. */
export function streakMessage(
  context: StreakContext,
  lastId: string | null,
  random: RandomSource,
): StreakMessage {
  const fitting = TEMPLATES.filter((template) => template.fits(context));
  const fresh = fitting.filter((template) => template.id !== lastId);
  const choices = fresh.length > 0 ? fresh : fitting;
  const template = pickOne(choices, random) ?? START;
  return { id: template.id, text: template.text(context) };
}
