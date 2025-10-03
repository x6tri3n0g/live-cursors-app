import { useState, useLayoutEffect, useCallback } from "react";
import { PerfectCursor } from "perfect-cursors";

export function usePerfectCursors(cb, point) {
  const [pc] = useState(() => new PerfectCursor(cb));

  useLayoutEffect(() => {
    if (point) pc.addPoint(point);
    return () => pc.dispose();
  }, [pc]);

  const onPointChange = useCallback((point) => pc.addPoint(point), [pc]);

  return onPointChange;
}
