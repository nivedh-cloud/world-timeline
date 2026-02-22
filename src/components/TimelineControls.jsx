import React, { useRef, useEffect, useState } from "react";
import "../styles/TimelineControls.css";
import YearPickerGear from "./YearPickerGear";

export default function TimelineControls({
  currentYear,
  onYearChange,
  language,
  onLanguageToggle
}) {
  const [showGearPicker, setShowGearPicker] = useState(false);
  // Show 10-year range
  const rangeStart = currentYear;
  const rangeEnd = currentYear + 10;
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
      onYearChange(Math.max(currentYear - 10, -4000));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onYearChange(Math.min(currentYear + 10, 2000));
    }
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
      <div className="timeline-controls">
        <YearPickerGear currentYear={currentYear} onYearChange={onYearChange} />
      </div>
    </>
  );
}
