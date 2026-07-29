import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  EASTER_EGG_CLICK_THRESHOLD,
  EASTER_EGG_CLICK_WINDOW_MS,
  recordRapidClick,
} from './rapid-click.ts';

describe('recordRapidClick', () => {
  it('opens after threshold clicks inside the window', () => {
    let timestamps = [];
    let result;
    for (let i = 0; i < EASTER_EGG_CLICK_THRESHOLD; i++) {
      result = recordRapidClick(timestamps, 1000 + i * 100);
      timestamps = result.timestamps;
    }
    assert.equal(result.shouldOpen, true);
    assert.deepEqual(result.timestamps, []);
  });

  it('does not open when clicks are spaced beyond the window', () => {
    let timestamps = [];
    let result = recordRapidClick(timestamps, 0);
    timestamps = result.timestamps;
    result = recordRapidClick(timestamps, 1);
    timestamps = result.timestamps;
    result = recordRapidClick(timestamps, 2);
    timestamps = result.timestamps;
    result = recordRapidClick(
      timestamps,
      2 + EASTER_EGG_CLICK_WINDOW_MS + 1,
    );
    assert.equal(result.shouldOpen, false);
    assert.equal(result.timestamps.length, 1);
  });

  it('keeps only clicks inside the rolling window', () => {
    const result = recordRapidClick(
      [0, 100, 200],
      100 + EASTER_EGG_CLICK_WINDOW_MS,
      EASTER_EGG_CLICK_WINDOW_MS,
      EASTER_EGG_CLICK_THRESHOLD,
    );
    assert.equal(result.shouldOpen, false);
    assert.deepEqual(result.timestamps, [100, 200, 100 + EASTER_EGG_CLICK_WINDOW_MS]);
  });
});
