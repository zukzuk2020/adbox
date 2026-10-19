import { useEffect, useRef, useState } from 'react';

const MIN_PERCENT = 20;
const MAX_PERCENT = 75;

export default function SplitPane({ left, right, initialPercent = 38 }) {
  const containerRef = useRef(null);
  const [percent, setPercent] = useState(initialPercent);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return undefined;
    const move = (event) => {
      const box = containerRef.current.getBoundingClientRect();
      const next = ((event.clientX - box.left) / box.width) * 100;
      setPercent(Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, next)));
    };
    const stop = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
  }, [dragging]);

  return (
    <div ref={containerRef} className={`flex min-h-0 flex-1 ${dragging ? 'cursor-col-resize select-none' : ''}`}>
      <div className="min-w-0 overflow-y-auto" style={{ width: `${percent}%` }}>
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panes"
        onPointerDown={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        className="w-1.5 shrink-0 cursor-col-resize bg-gray-200 transition-colors hover:bg-blue-400"
      />
      {/* The iframe would swallow pointer events mid-drag without this. */}
      <div className={`min-w-0 flex-1 ${dragging ? 'pointer-events-none' : ''}`}>{right}</div>
    </div>
  );
}
