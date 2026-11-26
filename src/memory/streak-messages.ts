/**
 * The start screen's streak reminder and milestones. Like Duolingo's
 * practice reminders (Yancey & Settles 2020, KDD), each message is a
 * written template that only shows when it fits the player's streak, one
 * is picked among those that fit, and the one shown last time is skipped
 * when another fits, since a fresh message works better than a repeated
 * one. The milestones are celebrated on the day they're reached. The text
 * is looked up in the interface language (streakMessageText), so the start
 * screen can write the picked message again after a language change.
 */
import { pickOne } from '../game/random.ts';
import { translate } from '../i18n/index.ts';
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
  text: () => translate('streak.messages.start'),
};

const TEMPLATES: readonly Template[] = [
  START,
  {
    id: 'restart',
    fits: ({ hasPlayed, streak }) => hasPlayed && streak.days === 0,
    text: () => translate('streak.messages.restart'),
  },
  {
    id: 'keep-going',
    fits: isOpen,
    text: ({ streak }) =>
      translate('streak.messages.keepGoing', { days: streak.days, next: streak.days + 1 }),
  },
  {
    id: 'dont-lose',
    fits: (context) => isOpen(context) && context.streak.days >= MILESTONES[0],
    text: ({ streak }) => translate('streak.messages.dontLose', { days: streak.days }),
  },
  {
    id: 'rest-saved',
    fits: (context) => isOpen(context) && context.streak.restDays[0] === addDays(context.today, -1),
    text: ({ streak }) => translate('streak.messages.restSaved', { days: streak.days }),
  },
  {
    id: 'done-today',
    fits: ({ streak }) => streak.isTodayPlayed,
    text: ({ streak }) => translate('streak.messages.doneToday', { days: streak.days }),
  },
  {
    id: 'milestone-near',
    fits: (context) =>
      context.streak.isTodayPlayed && daysToMilestone(context) <= MILESTONE_HINT_DAYS,
    text: (context) =>
      translate('streak.messages.milestoneNear', {
        left: daysToMilestone(context),
        milestone: nextMilestone(context.streak.days) ?? '',
      }),
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

/** A picked message's text again, in the interface language now. */
export function streakMessageText(id: string, context: StreakContext): string {
  const template = TEMPLATES.find((candidate) => candidate.id === id) ?? START;
  return template.text(context);
}
