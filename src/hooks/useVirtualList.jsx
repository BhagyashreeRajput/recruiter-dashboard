
import { useState, useRef, useCallback, useEffect, useMemo } from "react";

/**
 * useVirtualList
 * @param {object[]} items      - full data array
 * @param {number}   rowHeight  - fixed row height in px
 * @param {number}   overscan   - extra rows above/below viewport (default 5)
 * @returns containerRef, virtualItems, totalHeight, scrollToIndex
 */
export function useVirtualList(items, rowHeight = 52, overscan = 5) {
  const containerRef  = useRef(null);
  const [scrollTop,   setScrollTop]   = useState(0);
  const [viewHeight,  setViewHeight]  = useState(600);

  // Track scroll + resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => setScrollTop(el.scrollTop);
    const ro = new ResizeObserver(([entry]) => setViewHeight(entry.contentRect.height));

    el.addEventListener("scroll", onScroll, { passive: true });
    ro.observe(el);
    return () => { el.removeEventListener("scroll", onScroll); ro.disconnect(); };
  }, []);

  const virtualItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endIndex   = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + viewHeight) / rowHeight) + overscan
    );
    return items.slice(startIndex, endIndex + 1).map((item, i) => ({
      item,
      index:     startIndex + i,
      offsetTop: (startIndex + i) * rowHeight,
    }));
  }, [items, scrollTop, viewHeight, rowHeight, overscan]);

  const totalHeight = items.length * rowHeight;

  const scrollToIndex = useCallback((index) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * rowHeight;
    }
  }, [rowHeight]);

  return { containerRef, virtualItems, totalHeight, scrollToIndex };
}

// ─────────────────────────────────────────────────────────────
//  useDebounce — debounce any rapidly changing value
// ─────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}


export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}