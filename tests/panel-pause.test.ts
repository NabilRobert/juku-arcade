import { describe, expect, it } from 'vitest';
import { usePanelPause } from '../src/composables/usePanelPause.ts';

/** A pretend run: paused or not, and whether Pause can be used right now. */
function fakeRun(isAvailable = true) {
  const run = { isPaused: false, isAvailable };
  const onPanelToggle = usePanelPause({
    isPaused: () => run.isPaused,
    isAvailable: () => run.isAvailable,
    pause: () => {
      run.isPaused = true;
    },
    resume: () => {
      run.isPaused = false;
    },
  });
  return { run, onPanelToggle };
}

describe('pausing for the side drawer', () => {
  it('pauses the run when the drawer opens, and resumes it when it closes', () => {
    const { run, onPanelToggle } = fakeRun();
    onPanelToggle(true);
    expect(run.isPaused).toBe(true);
    onPanelToggle(false);
    expect(run.isPaused).toBe(false);
  });

  it('leaves a run the player paused themself paused when the drawer closes', () => {
    const { run, onPanelToggle } = fakeRun();
    run.isPaused = true;
    onPanelToggle(true);
    onPanelToggle(false);
    expect(run.isPaused).toBe(true);
  });

  it('does nothing while Pause is off, such as between sets', () => {
    const { run, onPanelToggle } = fakeRun(false);
    onPanelToggle(true);
    expect(run.isPaused).toBe(false);
  });
});
