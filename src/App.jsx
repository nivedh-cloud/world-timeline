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
    console.log(`%c=== FETCH #${fetchCountRef.current} === Year: ${currentYear}`, 'background: red; color: white; font-size: 14px; font-weight: bold;');
    
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
    console.log(`Fetch #${fetchCountRef.current}: Bible from ${found.start}To${found.end}-BibleEvents.json`);
    console.log(`Fetch #${fetchCountRef.current}: World from ${found.start}To${found.end}-WorldEvents.json`);
    Promise.all([
      (() => {
        console.log(`Fetching Bible events file: ${bibleUrl}`);
        return fetch(bibleUrl)
          .then(res => {
            if (!res.ok) {
              console.warn(`File not found: ${bibleUrl}`);
              return [];
            }
            return res.json().catch(e => {
              console.warn(`Invalid JSON in: ${bibleUrl}`);
              return [];
            });
          })
          .catch(e => {
            console.warn(`Fetch error for: ${bibleUrl}`);
            return [];
          });
      })(),
      (() => {
        console.log(`Fetching World events file: ${worldUrl}`);
        return fetch(worldUrl)
          .then(res => {
            if (!res.ok) {
              console.warn(`File not found: ${worldUrl}`);
              return [];
            }
            return res.json().catch(e => {
              console.warn(`Invalid JSON in: ${worldUrl}`);
              return [];
            });
          })
          .catch(e => {
            console.warn(`Fetch error for: ${worldUrl}`);
            return [];
          });
      })()
    ]).then(([bible, world]) => {
      console.log(`Loaded Bible events:`, bible);
      console.log(`Loaded World events:`, world);
      console.log(`Bible events count: ${bible.length}`);
      console.log(`World events count: ${world.length}`);
      // Filter events immediately after fetching, based on the actual selected slider range
      const minYear = Math.min(selectedRangeStart, selectedRangeEnd);
      const maxYear = Math.max(selectedRangeStart, selectedRangeEnd);
      const filterByRange = ev => {
        const s = Number(ev.startYear);
        const e = Number(ev.endYear);
        if (s === e) {
          return s >= minYear && s < maxYear;
        }
        return s < maxYear && e >= minYear;
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
    // Only include events that overlap the selected range (inclusive)
    // For single-year events, treat startYear == endYear as a single point
    const filterByRange = ev => {
      const s = Number(ev.startYear);
      const e = Number(ev.endYear);
      // If event is a single year
      if (s === e) {
        const match = s >= minYear && s < maxYear;
        console.log(`Event: ${ev.name_en || ev.name} (${s}) - match: ${match}`);
        return match;
      }
      // For intervals, check for overlap (non-overlapping windows: [start, end))
      const match = (s < maxYear && e >= minYear);
      console.log(`Event: ${ev.name_en || ev.name} (${s} to ${e}) - match: ${match}`);
      return match;
    };
    // Combine all events regardless of type
    events = events.concat(
      eventData.BIBLICAL_EVENTS
        .filter(filterByRange)
        .map((ev, idx) => ({ ...ev, type: "biblical", key: `b-${ev.name_en}-${ev.startYear}-${idx}` }))
    );
    events = events.concat(
      eventData.WORLD_EVENTS
        .filter(filterByRange)
        .map((ev, idx) => ({ ...ev, type: "world", key: `w-${ev.name_en}-${ev.startYear}-${idx}` }))
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
              display: 'flex', 
              gap: '0px', 
              width: '100%', 
              flex: 1,
              minHeight: 0,
              overflow: 'hidden'
            }}>
              {/* Map full width and height */}
              <div style={{ 
                flex: 1, 
                minWidth: 0, 
                minHeight: 0,
                overflow: 'hidden'
              }}>
                <MapView events={filteredEvents} language={language} />
              </div>
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
