import React, { useRef, useEffect } from "react";
import "../styles/TimelineControlsVertical.css";
import YearPickerGear from "./YearPickerGear";

export default function TimelineControlsVertical({
  currentYear,
  onYearChange,
  language,
  onLanguageToggle
}) {
  const sliderRef = useRef(null);

  // Show 10-year range
  const rangeStart = currentYear;
  const rangeEnd = currentYear + 10;
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
      onYearChange(Math.min(currentYear + 10, SLIDER_MAX));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onYearChange(Math.max(currentYear - 10, SLIDER_MIN));
    }
  };

  // Convert slider value to vertical position (0 at bottom, height at top)
  const sliderValueToPosition = (value) => {
    const percentage = ((value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
    return ((SLIDER_MAX - value) / (SLIDER_MAX - SLIDER_MIN)) * 100;
  };

  return (
    <>
      <button 
        className="lang-toggle"
        onClick={onLanguageToggle}
        title={`Switch to ${language === 'en' ? 'Telugu' : 'English'}`}
      >
        {language === 'en' ? 'TE' : 'EN'} 
      </button>
      <div className="timeline-controls-vertical">
        <YearPickerGear currentYear={currentYear} onYearChange={onYearChange} />
      </div>
    </>
  );
}
