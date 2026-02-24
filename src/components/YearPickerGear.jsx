import React, { useRef, useEffect, useState } from "react";
import "../styles/YearPickerGear.css";

export default function YearPickerGear({ currentYear, onYearChange }) {
  const SLIDER_MIN = -4000;
  const SLIDER_MAX = 2000;
  const PICKER_STEP = 10; // Show every 10 years
  const scrollContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const userInteractedRef = useRef(false); // Only snap after user touches/wheels
  const expectedScrollRefRef = useRef(0); // Track programmatic scroll position to ignore it
  const lastYearChangeRef = useRef(0); // Prevent rapid year changes
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Mobile expand/collapse state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Detect mobile
  const [yearInput, setYearInput] = useState(String(currentYear)); // Year input field
  const startYRef = useRef(0);
  const startScrollRef = useRef(0);
  const dragDistanceRef = useRef(0); // Track drag distance
  const justSelectedRef = useRef(false); // Prevent snap after direct selection

  // Update year input when currentYear changes
  useEffect(() => {
    setYearInput(String(currentYear));
  }, [currentYear]);

  // Generate yearly options - memoized to prevent recreating on every render
  const years = React.useMemo(() => {
    const result = [];
    for (let y = SLIDER_MIN; y <= SLIDER_MAX; y += PICKER_STEP) {
      // Skip 0 and add 1 instead
      if (y === 0) {
        result.push(1);
      } else {
        result.push(y);
      }
    }
    return result;
  }, [SLIDER_MIN, SLIDER_MAX, PICKER_STEP]);

  // Get correct spacer height based on viewport
  const getSpacerHeight = () => {
    if (isMobile) {
      return 95; // Mobile always uses 95px spacer (see CSS)
    }
    return 75; // Desktop uses 75px spacer
  };

  // Calculate scroll position for a given year
  const calculateScrollPosition = (year) => {
    if (!scrollContainerRef.current || years.length === 0) return 0;
    
    const selectedIndex = years.indexOf(year);
    if (selectedIndex === -1) return 0;
    
    const itemHeight = 50;
    const spacerHeight = getSpacerHeight();
    
    // Get container height - use viewport for mobile expanded, otherwise clientHeight
    let containerHeight = scrollContainerRef.current.clientHeight;
    if (isMobile && isExpanded) {
      // Mobile expanded uses full screen minus label height (~60px)
      containerHeight = window.innerHeight - 60;
      console.log('[ScrollCalc] Mobile Expanded - using viewport height:', window.innerHeight, 'actual container:', containerHeight);
    }
    
    console.log('[ScrollCalc] Year:', year, 'Index:', selectedIndex, 'ContainerHeight:', containerHeight, 'SpacerHeight:', spacerHeight);
    
    // Position the item to align with the indicator line
    const scrollPosition = spacerHeight + (selectedIndex * itemHeight) - (containerHeight / 2.2);
    console.log('[ScrollCalc] Final position:', scrollPosition);
    return Math.max(0, scrollPosition);
  };

  const formatYear = (y) => {
    if (y === 0) return "0";
    return y < 0 ? `${Math.abs(y)} BC` : `${y} AD`;
  };

  // Handle year change and auto-collapse on mobile
  const handleYearChange = (year, isDrag = false) => {
    // Don't change year if it was a drag (drag distance > 5px)
    if (isDrag) {
      console.log('[YearChange] Ignoring drag event');
      return;
    }
    onYearChange(year);
    // Auto-collapse on mobile after selection
    if (isMobile) {
      setTimeout(() => {
        setIsExpanded(false);
      }, 300);
    }
  };

  // Handle year input change
  const handleYearInputChange = (e) => {
    const input = e.target.value;
    setYearInput(input);
  };

  // Handle year input submission
  const handleYearInputSubmit = (e) => {
    if (e.key !== 'Enter') return;
    
    let year = parseInt(yearInput, 10);
    if (isNaN(year)) return;
    
    // Handle BC suffix
    if (yearInput.toUpperCase().includes('BC')) {
      year = -Math.abs(year);
    }
    
    // Clamp to valid range
    year = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, year));
    
    console.log('[YearInput] Selected year:', year);
    setYearInput(String(year));
    handleYearChange(year, false);
  };

  const handleYearItemClick = (year) => {
    // Only ignore if drag distance is significant (> 10px)
    if (dragDistanceRef.current > 10) {
      console.log('[YearItemClick] Ignoring - was a drag (distance:', dragDistanceRef.current, ')');
      return;
    }
    
    console.log('[YearItemClick] Selecting year:', year, 'drag distance was:', dragDistanceRef.current);
    dragDistanceRef.current = 0; // Reset for next interaction
    
    // Set flag to prevent snap logic from firing
    justSelectedRef.current = true;
    setTimeout(() => {
      justSelectedRef.current = false;
      console.log('[YearItemClick] Snap logic re-enabled');
    }, 500);
    
    handleYearChange(year, false);
  };

  // Snap to nearest year when scroll ends - debounced
  const handleScrollEnd = React.useCallback(() => {
    // Skip snap if a year was just selected via click
    if (justSelectedRef.current) {
      console.log('[Snap] Skipping - year was just selected');
      return;
    }

    // Only snap if user has interacted (touched/wheeled)
    if (!userInteractedRef.current) {
      console.log('[Snap] Skipping - waiting for user interaction');
      return;
    }

    // Skip if this was likely a programmatic scroll (scroll position matches expected)
    if (scrollContainerRef.current) {
      const currentScrollTop = scrollContainerRef.current.scrollTop;
      const diff = Math.abs(currentScrollTop - expectedScrollRefRef.current);
      if (diff < 5) { // Very close to programmatic scroll
        console.log('[Snap] Skipping - programmatic scroll detected');
        return;
      }
    }

    if (scrollContainerRef.current && years.length > 0) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      const itemHeight = 50;
      const containerHeight = scrollContainerRef.current.clientHeight;
      const spacerHeight = getSpacerHeight();
      
      // Calculate which item is aligned with the indicator line
      const centerPosition = scrollTop + containerHeight / 2.2 - spacerHeight;
      const selectedIndex = Math.max(0, Math.round(centerPosition / itemHeight));
      const safeIndex = Math.min(selectedIndex, years.length - 1);
      const closestYear = years[safeIndex];
      
      // Only call onYearChange if the year actually changed
      if (closestYear !== currentYear) {
        console.log('[Snap] User changed year to:', closestYear);
        lastYearChangeRef.current = Date.now();
        // Pass isDrag=true to indicate this is from snap, not a direct click
        onYearChange(closestYear);
      }
    }
  }, [years, currentYear, onYearChange, isMobile]);

  // Debounced scroll handler
  const handleScroll = (e) => {
    if (!isDragging) {
      console.log('[Scroll] Event received, debouncing...');
    }
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      handleScrollEnd();
    }, 150);
  };

  // Scroll to center selected year on mount and when year changes
  useEffect(() => {
    if (scrollContainerRef.current && years.length > 0) {
      // Add delay when expanding on mobile to let layout settle
      const delay = (isMobile && isExpanded) ? 300 : 0;
      
      const scrollTimer = setTimeout(() => {
        const selectedIndex = years.indexOf(currentYear);
        if (selectedIndex !== -1) {
          // Try to find the actual element and scroll it into view
          const allItems = scrollContainerRef.current.querySelectorAll('.picker-item');
          if (allItems && allItems[selectedIndex]) {
            const itemElement = allItems[selectedIndex];
            const containerHeight = scrollContainerRef.current.clientHeight;
            const itemRect = itemElement.getBoundingClientRect();
            const containerRect = scrollContainerRef.current.getBoundingClientRect();
            
            // Center the item in the middle of container
            const itemScrollTop = scrollContainerRef.current.scrollTop + itemRect.top - containerRect.top;
            const scrollPosition = itemScrollTop - (containerHeight / 2.07) + (itemRect.height / 2);
            
            console.log('[Program Scroll] Using actual DOM elements:');
            console.log('  Item rect:', itemRect);
            console.log('  Container rect:', containerRect);
            console.log('  Calculated scroll position:', scrollPosition);
            
            // Disable snap while scrolling
            justSelectedRef.current = true;
            scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition);
            expectedScrollRefRef.current = scrollPosition;
            
            setTimeout(() => {
              justSelectedRef.current = false;
              console.log('[Program Scroll] Snap re-enabled');
            }, 1000);
          } else {
            // Fallback to calculated position
            const scrollPosition = calculateScrollPosition(currentYear);
            expectedScrollRefRef.current = scrollPosition;
            justSelectedRef.current = true;
            scrollContainerRef.current.scrollTop = scrollPosition;
            setTimeout(() => {
              justSelectedRef.current = false;
            }, 1000);
          }
        }
      }, delay);
      
      return () => clearTimeout(scrollTimer);
    }
  }, [currentYear, years, isMobile, isExpanded]);

  // Handle touch drag for mobile
  const handleTouchStart = (e) => {
    userInteractedRef.current = true;
    console.log('[Touch] User started dragging');
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;
    startScrollRef.current = scrollContainerRef.current.scrollTop;
    dragDistanceRef.current = 0; // Reset drag distance
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent page scroll during drag
    const deltaY = e.touches[0].clientY - startYRef.current;
    dragDistanceRef.current = Math.abs(deltaY); // Track total drag distance
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = startScrollRef.current - deltaY;
    }
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
    console.log('[Touch] User stopped dragging, drag distance:', dragDistanceRef.current);
    // Reset drag distance for next interaction
    dragDistanceRef.current = 0;
    handleScrollEnd();
  };

  // Handle wheel scroll
  const handleWheel = (e) => {
    userInteractedRef.current = true;
    console.log('[Wheel] User wheeled');
    e.preventDefault();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY * 0.5;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`year-picker-gear ${isMobile && isExpanded ? "year-picker-gear-expanded" : ""}`}>
      {/* Mobile Toggle Button - Only show on mobile when collapsed */}
      {isMobile && !isExpanded && (
        <button
          className="year-picker-mobile-button"
          onClick={() => setIsExpanded(true)}
        >
          <span className="year-picker-mobile-button-text">📅 {formatYear(currentYear)}</span>
        </button>
      )}

      {/* Full Picker - Show on desktop or when expanded on mobile */}
      {(!isMobile || isExpanded) && (
        <>
          <div className="picker-label-container">
            <div className="picker-label">Select Year</div>
            <input
              type="text"
              className="picker-year-input"
              value={yearInput}
              onChange={handleYearInputChange}
              onKeyDown={handleYearInputSubmit}
              placeholder="Enter year or BC"
              maxLength="10"
            />
            {isMobile && (
              <button
                className="picker-close-button"
                onClick={() => setIsExpanded(false)}
              >
                ✕
              </button>
            )}
          </div>
          <div
            className="picker-scroll-container"
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <div className="picker-spacer" />
            {years.map((year) => (
              <div
                key={year}
                className={`picker-item ${year === currentYear ? "picker-item-active" : ""}`}
                onClick={() => handleYearItemClick(year)}
              >
                <span className="picker-item-text">{formatYear(year)}</span>
              </div>
            ))}
            <div className="picker-spacer" />
          </div>
          <div className="picker-indicator" />
        </>
      )}
    </div>
  );
}
