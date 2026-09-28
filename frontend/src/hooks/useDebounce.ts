"use client";

import { useEffect, useState } from "react";

/**
 * Custom React hook that debounces any fast-changing value.
 *
 * @typeParam T - Type of the value being debounced
 * @param value - The input value to debounce
 * @param delay - Milliseconds to delay before updating debounced value (default: 300)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
