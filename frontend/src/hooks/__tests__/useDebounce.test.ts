import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("updates value only after specified debounce delay (default 300ms)", () => {
    const { result, rerender } = renderHook(
      ({ val, delay }: { val: string; delay?: number }) => useDebounce(val, delay),
      { initialProps: { val: "hello", delay: 300 } }
    );

    expect(result.current).toBe("hello");

    // Update the input value
    rerender({ val: "hello world", delay: 300 });

    // Value should NOT have changed yet before 300ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("hello");

    // Value updates after 300ms
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("hello world");
  });

  it("resets delay timer if value changes rapidly", () => {
    const { result, rerender } = renderHook(
      ({ val }: { val: string }) => useDebounce(val, 300),
      { initialProps: { val: "c" } }
    );

    rerender({ val: "ca" });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe("c");

    rerender({ val: "car" });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe("c");

    rerender({ val: "cardio" });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("cardio");
  });

  it("cleans up timer on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = renderHook(() => useDebounce("test", 300));

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
