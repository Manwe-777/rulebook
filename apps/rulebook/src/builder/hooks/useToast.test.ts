import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '../testing/renderHook';
import { useToast } from './useToast';

describe('useToast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('a message hides itself after its time', () => {
    const { result } = renderHook(() => useToast(1000));

    act(() => result.current[1]('Added Troopers'));
    expect(result.current[0]?.text).toBe('Added Troopers');

    act(() => vi.advanceTimersByTime(999));
    expect(result.current[0]).not.toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(result.current[0]).toBeNull();
  });

  it('a new message replaces the old one, gets a new key and restarts the time', () => {
    const { result } = renderHook(() => useToast(1000));

    act(() => result.current[1]('Added Troopers'));
    const first = result.current[0]!.key;

    act(() => vi.advanceTimersByTime(800));
    act(() => result.current[1]('Added Troopers'));

    expect(result.current[0]!.key).not.toBe(first);

    act(() => vi.advanceTimersByTime(800));
    expect(result.current[0]).not.toBeNull();
  });
});
