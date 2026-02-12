import React, { useRef, useEffect } from "react";
import "../styles/TimelineControls.css";

export default function TimelineControls({
  currentYear,
  onYearChange,
  language,
  onLanguageToggle
}) {
  // Show 50-year range
  const rangeStart = currentYear;
  const rangeEnd = currentYear + 50;
  const formatYear = y => y < 0 ? `${Math.abs(y)} BC` : `${y} AD`;
  const SLIDER_MIN = -4000;
  const SLIDER_MAX = 2000;
  // generate ticks every 100 years across full slider range
  const TICK_STEP = 100;
  const ticks = [];
  for (let y = Math.ceil(SLIDER_MIN / TICK_STEP) * TICK_STEP; y <= SLIDER_MAX; y += TICK_STEP) {
    ticks.push(y);
  }
  const formatTick = y => {
    if (y === 0) return '0';
    return y < 0 ? `${Math.abs(y)} BC` : `${y}`;
  };

  const sliderRef = useRef(null);
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onYearChange(Math.max(currentYear - 50, -4000));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onYearChange(Math.min(currentYear + 50, 2000));
    }
  };

  return (
    <div className="timeline-controls">
      <div className="timeline-controls-row">
        <div className="year-label">
          Year: {formatYear(rangeStart)} to {formatYear(rangeEnd)}
        </div>
        <button
          onClick={onLanguageToggle}
          className="lang-toggle"
        >
          {language === "en" ? "EN" : "TE"}
        </button>
      </div>
      <div className="slider-container" style={{ position: 'relative' }}>
        <input
          ref={sliderRef}
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={50}
          value={currentYear}
          onChange={e => onYearChange(Number(e.target.value))}
          onKeyDown={handleKeyDown}
          className="year-slider"
          tabIndex={0}
        />
        <div style={{ position: 'absolute', left: 10, right: 7, top: 28, height: 28 }}>
          {ticks.map(t => {
            const pct = ((t - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
            return (
              <div key={t} className="timeline-tick" style={{ left: `${pct}%` }}>
                <div className="timeline-tick-line" />
                <div 
                  className="timeline-tick-label"
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
  );
}
