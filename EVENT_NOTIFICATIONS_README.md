# Event Notifications Feature

## Overview

The Event Notifications feature displays scrolling notification cards (tales) when you change the timeline range. These notifications appear in the bottom-right corner of the screen, showing the top events from the current timeline period. Each notification displays for a configurable duration before fading out.

## Features

✅ **Automatic Display**: Notifications automatically trigger when the timeline changes
✅ **Bilingual Support**: Events display in English or Telugu based on language selection
✅ **Smooth Animations**: Fade-in from right, fade-out with progress bar
✅ **Stacked Notifications**: Multiple notifications stack neatly on top of each other
✅ **Progress Indicator**: Visual progress bar shows when notification will disappear
✅ **Event Icons**: Different emojis distinguish Biblical (📖) and World (🌍) events
✅ **Responsive**: Works on desktop and mobile devices
✅ **Fully Configurable**: All timing and display settings in one config file

## Configuration

All settings can be customized in `src/config/notificationConfig.js`:

```javascript
export const NOTIFICATION_CONFIG = {
  // Maximum number of events to display as notifications (top N events)
  MAX_EVENTS_DISPLAYED: 15,          // Show top 15 events

  // How long each notification stays visible (in milliseconds)
  DISPLAY_DURATION: 5000,            // 5 seconds

  // How long the fade-out animation takes (in milliseconds)
  FADE_OUT_DURATION: 1000,           // 1 second

  // Maximum number of notifications visible on screen simultaneously
  MAX_STACK_VISIBLE: 5,              // Show max 5 at once

  // Vertical spacing between stacked notifications (in pixels)
  NOTIFICATION_OFFSET: 16,           // 16px gap

  // Show/hide notifications
  ENABLED: true,                     // Enable/disable feature

  // Position (future expansion)
  POSITION: "bottom-right",          // Currently fixed to bottom-right
};
```

## Configuration Examples

### Example 1: Show More Events, Longer Display Time
```javascript
MAX_EVENTS_DISPLAYED: 20,        // Show top 20 events
DISPLAY_DURATION: 7000,          // Stay for 7 seconds
FADE_OUT_DURATION: 1500,         // Fade over 1.5 seconds
```

### Example 2: Minimal, Quick Notifications
```javascript
MAX_EVENTS_DISPLAYED: 5,         // Show top 5 events only
DISPLAY_DURATION: 3000,          // Quick 3-second display
FADE_OUT_DURATION: 500,          // Fast fade (0.5 seconds)
MAX_STACK_VISIBLE: 2,            // Only 2 visible at once
```

### Example 3: Disable Notifications
```javascript
ENABLED: false,                  // Completely disable feature
```

## Files Structure

```
src/
├── components/
│   ├── EventNotifications.jsx      # Main notification component
│   ├── TimelineControls.jsx
│   ├── MapView.jsx
│   └── Legend.jsx
├── styles/
│   ├── EventNotifications.css      # Styling and animations
│   ├── App.css
│   └── index.css
├── config/
│   └── notificationConfig.js       # Configuration constants
├── App.jsx                         # Main app (updated with notifications)
└── main.jsx
```

## How It Works

1. **Timeline Change Detection**: When user moves the slider, `App.jsx` updates `filteredEvents`
2. **Event Filtering**: Events are sorted by `startYear` and top N are selected
3. **Notification Trigger**: EventNotifications component detects new events and displays them
4. **Stacking**: Up to 5 notifications stack vertically with proper spacing
5. **Auto-Dismiss**: Each notification automatically fades out after configured duration
6. **Cleanup**: Removed notifications are cleaned from DOM to prevent memory leaks

## Notification Card Details

Each notification displays:

- **Header**: Event type icon (📖 or 🌍) + event name (bilingual)
- **Body**: Event description (2-line max, with ellipsis)
- **Footer**: Time period (e.g., "100 - 120 CE")
- **Progress Bar**: Visual indicator of remaining display time

## Styling Details

### Colors
- **Biblical Events**: Blue left border (#0078ff)
- **World Events**: Orange left border (#ff8800)
- **Progress Bar**: Blue-to-cyan gradient

### Animations
- **Fade In**: Slides in from right over 400ms
- **Fade Out**: Slides out to right over configurable duration
- **Progress Bar**: Linear countdown animation

### Responsive Design
- **Desktop**: 360px width, 24px margins
- **Tablet (768px)**: 320px width, 16px margins
- **Mobile (480px)**: 250-280px width, optimized text sizes

## Usage in App.jsx

```jsx
import EventNotifications from "./components/EventNotifications";

// In render:
<EventNotifications events={filteredEvents} language={language} />
```

The component automatically:
- Watches for changes in `filteredEvents` array
- Responds to `language` prop changes (EN/TE)
- Handles all notification lifecycle management

## Event Data Format

Notifications expect events with this structure:

```javascript
{
  type: "biblical" | "world",
  name_en: "English Event Name",
  name_te: "తెలుగు ఈవెంట్ పేరు",
  desc_en: "English description of the event...",
  desc_te: "ఈవెంట్ యొక్క తెలుగు వివరణ...",
  startYear: -100,
  endYear: 100
}
```

## Accessibility Features

- Clear visual progress indicator
- Sufficient color contrast (WCAG AA compliant)
- Readable font sizes at all breakpoints
- Smooth animations (respects prefers-reduced-motion in future versions)

## Performance Optimization

- Uses React keys for efficient rendering
- Properly cleans up timeout handlers
- Prevents memory leaks from removed notifications
- Efficient event ID generation for change detection
- Minimal re-renders with focused state management

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support
- CSS Animations support
- CSS Backdrop Filter support (with fallback)

## Future Enhancements

- [ ] Configurable position (top-left, top-right, bottom-left)
- [ ] Click-to-dismiss functionality
- [ ] Animation preferences (respects prefers-reduced-motion)
- [ ] Notification history/archive
- [ ] Event filtering options (show only Biblical/World)
- [ ] Custom notification templates

## Troubleshooting

### Notifications Not Appearing
1. Check `NOTIFICATION_CONFIG.ENABLED` is `true`
2. Verify events are being loaded correctly
3. Check browser console for errors
4. Ensure CSS file is imported

### Styling Issues
1. Check that `EventNotifications.css` is in `src/styles/`
2. Verify path in import statement
3. Clear browser cache
4. Check for CSS conflicts with other styles

### Animation Jerky/Slow
1. Check browser performance
2. Reduce `MAX_STACK_VISIBLE` for fewer simultaneous notifications
3. Check for conflicting CSS animations

## Example Timeline

When user moves slider from 1500-1550 CE to 1600-1650 CE:

```
1. Timeline change detected
2. Events loaded from files
3. Top 15 events sorted by startYear
4. First notification slides in (200ms animation)
5. Notification displays for 5 seconds
6. Progress bar fills from 100% to 0%
7. Notification fades out (1000ms animation)
8. Process repeats for each subsequent notification
```

## Support

For issues or feature requests related to Event Notifications:
1. Check configuration settings first
2. Verify event data structure
3. Check browser console for errors
4. Review this documentation

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Status**: Active
