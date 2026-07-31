import { describe, expect, it } from 'vitest';
import { mayContainTvCall, mayNeedTvTransform } from '../src/normalize-arrays.js';

describe('transform gates', () => {
  it('mayContainTvCall detects tv(', () => {
    expect(mayContainTvCall("tv({ base: 'a' })", { tvFunctions: ['tv'] })).toBe(true);
    expect(mayContainTvCall("createTv({ base: 'a' })", { tvFunctions: ['createTv'] })).toBe(true);
    expect(mayContainTvCall('const x = 1', { tvFunctions: ['tv'] })).toBe(false);
  });

  it('mayNeedTvTransform skips string-only tv (Tailwind handles strings)', () => {
    expect(mayNeedTvTransform("tv({ base: 'px-4 text-white' })", { tvFunctions: ['tv'] })).toBe(
      false
    );
  });

  it('mayNeedTvTransform runs for arrays', () => {
    expect(
      mayNeedTvTransform("tv({ base: ['px-4', 'text-white'] })", { tvFunctions: ['tv'] })
    ).toBe(true);
  });

  it('mayNeedTvTransform runs for blank class strings', () => {
    expect(mayNeedTvTransform("tv({ base: '' })", { tvFunctions: ['tv'] })).toBe(true);
    expect(mayNeedTvTransform("tv({ base: '   ' })", { tvFunctions: ['tv'] })).toBe(true);
    expect(mayNeedTvTransform("tv({ base: '\\t' })", { tvFunctions: ['tv'] })).toBe(true);
  });
});
