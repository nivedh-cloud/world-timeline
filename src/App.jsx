import React, { useState, useMemo, useEffect, useRef } from "react";
import TimelineControls from "./components/TimelineControls";
import TimelineControlsVertical from "./components/TimelineControlsVertical";
import MapView from "./components/MapView";
import EventNotifications from "./components/EventNotifications";

export default function App() {
  // State
  const [currentYear, setCurrentYear] = useState(10);
  const [language, setLanguage] = useState("en");
  const [isMobilePortrait, setIsMobilePortrait] = useState(window.innerWidth < 768);

  // Load events from split files based on year range
  const [eventData, setEventData] = useState({ BIBLICAL_EVENTS: [], WORLD_EVENTS: [] });
  const [loading, setLoading] = useState(true);

  // Detect device orientation (portrait = mobile vertical timeline, landscape = horizontal)
  useEffect(() => {
    const handleResize = () => {
      setIsMobilePortrait(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Available file ranges (update this if you add/remove files)
  // Dynamically generate 100-year intervals from -4000 to 2000
  const FILE_RANGES = useMemo(() => {
    const ranges = [];
    for (let start = -4000; start < 2000; start += 100) {
      ranges.push({ start, end: start + 100 });
    }
    return ranges;
  }, []);

  // Track fetch calls for debugging
  const fetchCountRef = React.useRef(0);

  useEffect(() => {
    fetchCountRef.current++;
    console.log(`%c=== YEAR SELECTED: ${currentYear} ===`, 'background: #ff6b6b; color: white; font-size: 14px; font-weight: bold;');
    
    // Determine the selected range (slider window)
    const SLIDER_STEP = 10; // Changed to 10-year intervals
    const selectedRangeStart = currentYear;
    const selectedRangeEnd = currentYear + SLIDER_STEP;
    const found = FILE_RANGES.find(r => currentYear >= r.start && currentYear < r.end);
    if (!found) {
      console.error(`No file range found for year ${currentYear}`);
      setEventData({ BIBLICAL_EVENTS: [], WORLD_EVENTS: [] });
      setLoading(false);
      return;
    }
    const bibleUrl = `${import.meta.env.BASE_URL}assets/Bible/${found.start}To${found.end}-BibleEvents.json`;
    const worldUrl = `${import.meta.env.BASE_URL}assets/World/${found.start}To${found.end}-WorldEvents.json`;
    setLoading(true);
    console.log(`%c📖 LOADING BIBLE FILE: ${found.start}To${found.end}-BibleEvents.json`, 'color: #7c3aed; font-weight: bold;');
    console.log(`%c🌍 LOADING WORLD FILE: ${found.start}To${found.end}-WorldEvents.json`, 'color: #ff8800; font-weight: bold;');
    Promise.all([
      (() => {
        console.log(`  → Fetching: ${bibleUrl}`);
        return fetch(bibleUrl)
          .then(res => {
            if (!res.ok) {
              console.warn(`  ✗ Bible file NOT FOUND: ${bibleUrl}`);
              return [];
            }
            return res.json().catch(e => {
              console.warn(`  ✗ Invalid JSON in Bible file:`, e);
              return [];
            });
          })
          .catch(e => {
            console.warn(`  ✗ Bible fetch error:`, e);
            return [];
          });
      })(),
      (() => {
        console.log(`  → Fetching: ${worldUrl}`);
        return fetch(worldUrl)
          .then(res => {
            if (!res.ok) {
              console.warn(`  ✗ World file NOT FOUND: ${worldUrl}`);
              return [];
            }
            return res.json().catch(e => {
              console.warn(`  ✗ Invalid JSON in World file:`, e);
              return [];
            });
          })
          .catch(e => {
            console.warn(`  ✗ World fetch error:`, e);
            return [];
          });
      })()
    ]).then(([bible, world]) => {
      console.log(`%c✓ FILES LOADED SUCCESSFULLY`, 'color: #22c55e; font-weight: bold;');
      console.log(`  📖 Bible events: ${bible.length} events`);
      console.log(`  🌍 World events: ${world.length} events`);
      // Filter events immediately after fetching, based on the actual selected slider range
      const minYear = Math.min(selectedRangeStart, selectedRangeEnd);
      const maxYear = Math.max(selectedRangeStart, selectedRangeEnd);
      const filterByRange = ev => {
        const year = Number(ev.year);
        return year >= minYear && year < maxYear;
      };
      const filteredBible = (bible || []).filter(filterByRange);
      const filteredWorld = (world || []).filter(filterByRange);
      setEventData({
        BIBLICAL_EVENTS: filteredBible,
        WORLD_EVENTS: filteredWorld
      });
      setLoading(false);
    });
  }, [currentYear, FILE_RANGES]);

  // Filter events based on overlap with selected range
  // Use the same range as the file
  const getRange = (year) => {
    const found = FILE_RANGES.find(r => year >= r.start && year < r.end);
    if (found) return [found.start, found.end];
    return [year, year + 1];
  };
  const [rangeStart, rangeEnd] = getRange(currentYear);
  const filteredEvents = useMemo(() => {
    let events = [];
    // Only include events that overlap the selected 10-year range (inclusive)
    // For BC dates, -100 to -90 means 100 BC to 90 BC inclusive
    // Show event if any part of it falls within [rangeStart, rangeEnd)
    console.log('Filtering events for range:', rangeStart, 'to', rangeEnd);
    const minYear = Math.min(rangeStart, rangeEnd);
    const maxYear = Math.max(rangeStart, rangeEnd);
    // Only include events within the selected range
    const filterByRange = ev => {
      const year = Number(ev.year);
      const match = year >= minYear && year < maxYear;
      console.log(`Event: ${ev.name_en || ev.name} (${year}) - match: ${match}`);
      return match;
    };
    // Combine all events regardless of type
    events = events.concat(
      eventData.BIBLICAL_EVENTS
        .filter(filterByRange)
        .map((ev, idx) => ({ ...ev, type: "biblical", key: `b-${ev.name_en}-${ev.year}-${idx}` }))
    );
    events = events.concat(
      eventData.WORLD_EVENTS
        .filter(filterByRange)
        .map((ev, idx) => ({ ...ev, type: "world", key: `w-${ev.name_en}-${ev.year}-${idx}` }))
    );
    return events;
  }, [rangeStart, rangeEnd, eventData]);

  // Handlers
  const handleYearChange = year => setCurrentYear(year);
  const handleLanguageToggle = () => {
    setLanguage(l => (l === "en" ? "te" : "en"));
    setCurrentYear(0);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {loading && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.95)',
            padding: '24px 32px',
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            zIndex: 1200,
            fontSize: 18,
            fontWeight: 600,
            color: '#222'
          }}>Loading events...</div>
        )}
        <EventNotifications events={filteredEvents} language={language} />
        
        {isMobilePortrait ? (
          // Mobile Portrait: Full screen map with overlay controls
          <>
            {/* Map takes full screen */}
            <div style={{ 
              width: '100%', 
              flex: 1,
              minHeight: 0,
              overflow: 'hidden'
            }}>
              <MapView events={filteredEvents} language={language} isMobilePortrait={isMobilePortrait} />
            </div>
            
            {/* TimelineControlsVertical now renders as fixed overlay at bottom */}
            <TimelineControlsVertical
              currentYear={currentYear}
              onYearChange={handleYearChange}
              language={language}
              onLanguageToggle={handleLanguageToggle}
            />
          </>
        ) : (
          // Desktop/Landscape: Full screen map with overlay controls
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', padding: '0' }}>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <MapView events={filteredEvents} language={language} isMobilePortrait={isMobilePortrait} />
            </div>
            
            {/* TimelineControls now renders as fixed overlay at bottom-right */}
            <TimelineControls
              currentYear={currentYear}
              onYearChange={handleYearChange}
              language={language}
              onLanguageToggle={handleLanguageToggle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
