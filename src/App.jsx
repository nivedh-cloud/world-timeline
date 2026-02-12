import React, { useState, useMemo, useEffect } from "react";
import TimelineControls from "./components/TimelineControls";
import MapView from "./components/MapView";
import Legend from "./components/Legend";
import EventNotifications from "./components/EventNotifications";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  // State
  const [currentYear, setCurrentYear] = useState(0);
  const [showBiblical, setShowBiblical] = useState(true);
  const [showWorld, setShowWorld] = useState(true);
  const [language, setLanguage] = useState("en");
  const [notif, setNotif] = useState("");

  // Load events from split files based on year range
  const [eventData, setEventData] = useState({ BIBLICAL_EVENTS: [], WORLD_EVENTS: [] });
  const [loading, setLoading] = useState(true);

  // Available file ranges (update this if you add/remove files)
  // Dynamically generate 100-year intervals from -4000 to 2000
  const FILE_RANGES = useMemo(() => {
    const ranges = [];
    for (let start = -4000; start < 2000; start += 100) {
      ranges.push({ start, end: start + 100 });
    }
    return ranges;
  }, []);

  useEffect(() => {
    // Determine the selected range (slider window)
    const SLIDER_STEP = 50; // adjust if your slider step is different
    const selectedRangeStart = currentYear;
    const selectedRangeEnd = currentYear + SLIDER_STEP;
    const found = FILE_RANGES.find(r => currentYear >= r.start && currentYear < r.end);
    if (!found) {
      setNotif(`No file range found for year ${currentYear}`);
      setEventData({ BIBLICAL_EVENTS: [], WORLD_EVENTS: [] });
      setLoading(false);
      return;
    }
    const bibleUrl = `${import.meta.env.BASE_URL}assets/Bible/${found.start}To${found.end}-BibleEvents.json`;
    const worldUrl = `${import.meta.env.BASE_URL}assets/World/${found.start}To${found.end}-WorldEvents.json`;
    //setNotif(`Loading files: ${bibleUrl}, ${worldUrl}`);
    setLoading(true);
    console.log(`Trying to fetch Bible events from: ${bibleUrl}`);
    console.log(`Trying to fetch World events from: ${worldUrl}`);
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
          return s >= minYear && s <= maxYear;
        }
        return s <= maxYear && e >= minYear;
      };
      const filteredBible = (bible || []).filter(filterByRange);
      const filteredWorld = (world || []).filter(filterByRange);
      setEventData({
        BIBLICAL_EVENTS: filteredBible,
        WORLD_EVENTS: filteredWorld
      });
      //setNotif(`Loaded: ${filteredBible.length} Bible events, ${filteredWorld.length} World events for this range. (Files: ${bibleUrl}, ${worldUrl})`);
      setLoading(false);
    });
  }, [currentYear]);

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
    // Only include events that overlap the selected 50-year range (inclusive)
    // For BC dates, -100 to -50 means 100 BC to 50 BC inclusive
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
        const match = s >= minYear && s <= maxYear;
        console.log(`Event: ${ev.name_en || ev.name} (${s}) - match: ${match}`);
        return match;
      }
      // For intervals, check for overlap (inclusive bounds)
      const match = (s <= maxYear && e >= minYear);
      console.log(`Event: ${ev.name_en || ev.name} (${s} to ${e}) - match: ${match}`);
      return match;
    };
    if (showBiblical) {
      events = events.concat(
        eventData.BIBLICAL_EVENTS
          .filter(filterByRange)
          .map((ev, idx) => ({ ...ev, type: "biblical", key: `b-${ev.name_en}-${ev.startYear}-${idx}` }))
      );
    }
    if (showWorld) {
      events = events.concat(
        eventData.WORLD_EVENTS
          .filter(filterByRange)
          .map((ev, idx) => ({ ...ev, type: "world", key: `w-${ev.name_en}-${ev.startYear}-${idx}` }))
      );
    }
    return events;
  }, [rangeStart, rangeEnd, showBiblical, showWorld, eventData]);

  // Handlers
  const handleYearChange = year => setCurrentYear(year);
  const handleToggleBiblical = () => {
    setShowBiblical(v => !v);
    setCurrentYear(0);
  };
  const handleToggleWorld = () => {
    setShowWorld(v => !v);
    setCurrentYear(0);
  };
  const handleLanguageToggle = () => {
    setLanguage(l => (l === "en" ? "te" : "en"));
    setCurrentYear(0);
  };

  useEffect(() => {
    if (!loading) {
      //setNotif(`Loaded: ${eventData.BIBLICAL_EVENTS.length} Bible events, ${eventData.WORLD_EVENTS.length} World events for this range.`);
      const timer = setTimeout(() => setNotif(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [rangeStart, rangeEnd, eventData.BIBLICAL_EVENTS.length, eventData.WORLD_EVENTS.length, loading]);

  // Toast notifications disabled - using EventNotifications component instead

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-5xl">
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
        {notif && (
          <div style={{
            position: 'fixed',
            top: 24,
            left: 0,
            right: 0,
            margin: '0 auto',
            zIndex: 1000,
            width: 'fit-content',
            background: '#222',
            color: '#fff',
            borderRadius: 8,
            padding: '10px 24px',
            fontSize: 16,
            boxShadow: '0 2px 12px #0002',
            opacity: 0.95,
            textAlign: 'center',
            transition: 'opacity 0.3s'
          }}>{notif}</div>
        )}
        <EventNotifications events={filteredEvents} language={language} />
        <TimelineControls
          currentYear={currentYear}
          onYearChange={handleYearChange}
          language={language}
          onLanguageToggle={handleLanguageToggle}
        />
        <Legend
          showBiblical={showBiblical}
          showWorld={showWorld}
          onToggleBiblical={handleToggleBiblical}
          onToggleWorld={handleToggleWorld}
        />
        <MapView events={filteredEvents} language={language} />
      </div>
    </div>
  );
}
