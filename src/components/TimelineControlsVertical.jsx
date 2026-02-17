import React, { useRef, useEffect } from "react";
import "../styles/TimelineControlsVertical.css";

export default function TimelineControlsVertical({
  currentYear,
  onYearChange
}) {
  const sliderRef = useRef(null);

  // Show 50-year range
  const rangeStart = currentYear;
  const rangeEnd = currentYear + 50;
  const SLIDER_MIN = -4000;
  const SLIDER_MAX = 2000;
  
  // generate ticks every 200 years across full slider range
  const TICK_STEP = 200;
  const ticks = [];
  for (let y = Math.ceil(SLIDER_MIN / TICK_STEP) * TICK_STEP; y <= SLIDER_MAX; y += TICK_STEP) {
    ticks.push(y);
  }
  const formatTick = y => {
    if (y === 0) return '0';
    return y < 0 ? `${Math.abs(y)} BC` : `${y}`;
  };

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      onYearChange(Math.min(currentYear + 50, SLIDER_MAX));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onYearChange(Math.max(currentYear - 50, SLIDER_MIN));
    }
  };

  // Convert slider value to vertical position (0 at bottom, height at top)
  const sliderValueToPosition = (value) => {
    const percentage = ((value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
    return ((SLIDER_MAX - value) / (SLIDER_MAX - SLIDER_MIN)) * 100;
  };

  return (
    <div className="timeline-controls-vertical">
      <div className="vertical-slider-wrapper">
        <div className="vertical-slider-container">
          <input
            ref={sliderRef}
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={50}
            value={currentYear}
            onChange={e => onYearChange(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            className="year-slider-vertical"
            tabIndex={0}
          />
          
          {/* Vertical Timeline Ticks */}
          <div className="vertical-ticks-container">
            {ticks.map(t => {
              const pct = sliderValueToPosition(t);
              const isSpecialRange = t >= 0 && t <= 100; // 0 AD to 100 AD
              return (
                <div 
                  key={t} 
                  className={`timeline-tick-vertical ${isSpecialRange ? 'timeline-tick-special' : ''}`}
                  style={{ top: `${pct}%` }}
                >
                  <div className="timeline-tick-line-vertical" />
                  <div 
                    className={`timeline-tick-label-vertical ${isSpecialRange ? 'timeline-tick-label-top' : ''}`}
                    onClick={() => onYearChange(t)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onYearChange(t);
                      }
                    }}
                  >
                    {formatTick(t)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
