# Event Notifications - Quick Reference Guide

## 🚀 Quick Start

The Event Notifications feature is **already integrated and working**! When you move the timeline slider, you'll see event notifications scroll up from the bottom-right corner.

## ⚙️ Configuring the Feature

Open `src/config/notificationConfig.js` and adjust these values:

```javascript
// Show top 10 events instead of 15
MAX_EVENTS_DISPLAYED: 10

// Display each notification for 3 seconds
DISPLAY_DURATION: 3000

// Quick fade (0.5 second fade out)
FADE_OUT_DURATION: 500

// Only show 3 notifications at a time
MAX_STACK_VISIBLE: 3

// Spacing between stacked notifications
NOTIFICATION_OFFSET: 20

// Disable notifications completely
ENABLED: false
```

## 📊 Configuration Presets

### Standard (Default)
```javascript
MAX_EVENTS_DISPLAYED: 15
DISPLAY_DURATION: 5000
FADE_OUT_DURATION: 1000
MAX_STACK_VISIBLE: 5
```

### Minimal
```javascript
MAX_EVENTS_DISPLAYED: 5
DISPLAY_DURATION: 3000
FADE_OUT_DURATION: 500
MAX_STACK_VISIBLE: 2
```

### Extended
```javascript
MAX_EVENTS_DISPLAYED: 20
DISPLAY_DURATION: 8000
FADE_OUT_DURATION: 1500
MAX_STACK_VISIBLE: 8
```

### Silent
```javascript
ENABLED: false
```

## 📁 File Locations

| File | Purpose |
|------|---------|
| `src/components/EventNotifications.jsx` | Main component logic |
| `src/styles/EventNotifications.css` | Styling and animations |
| `src/config/notificationConfig.js` | Configuration constants |
| `src/App.jsx` | Integration point |

## 🎨 What You'll See

When moving the timeline:

1. **Notification Card** appears from the right
2. **Header**: Event icon (📖 Biblical or 🌍 World) + event title
3. **Body**: 2-line event description with ellipsis
4. **Footer**: Time period (e.g., "100 - 120 CE")
5. **Progress Bar**: Blue bar at bottom that empties over time
6. **Auto-dismiss**: Card fades out after duration expires

## 🌐 Bilingual Support

- **English**: `event.name_en` and `event.desc_en`
- **Telugu**: `event.name_te` and `event.desc_te`
- Changes automatically when language toggle clicked

## 💡 Common Changes

### Make notifications disappear faster
```javascript
DISPLAY_DURATION: 3000      // 3 seconds instead of 5
FADE_OUT_DURATION: 500      // Fade faster
```

### Show more events at once
```javascript
MAX_STACK_VISIBLE: 10       // Show 10 instead of 5
NOTIFICATION_OFFSET: 12     // Make them closer together
```

### Show fewer, more important events
```javascript
MAX_EVENTS_DISPLAYED: 5     // Only top 5 events
DISPLAY_DURATION: 7000      // Give more time to read
```

### Disable the feature
```javascript
ENABLED: false              // Turn off completely
```

## 🔄 How Events Are Selected

1. **Filtered**: Events matching current timeline range
2. **Sorted**: By `startYear` (earliest first)
3. **Limited**: Top N events (configurable)
4. **Displayed**: As stacked notifications

## ⏱️ Timing Reference

All times in milliseconds (1000 ms = 1 second):

| Setting | Default | Range |
|---------|---------|-------|
| Display Duration | 5000 ms | 1000 - 10000 ms |
| Fade Out | 1000 ms | 300 - 2000 ms |
| Stagger | 100 ms | 0 - 500 ms |

## 🎯 Visual Design

- **Position**: Fixed bottom-right corner
- **Colors**: Blue for Biblical (#0078ff), Orange for World (#ff8800)
- **Width**: 360px desktop, 320px tablet, 280px mobile
- **Animation**: Smooth slide-in and fade-out
- **Backdrop**: Frosted glass effect (blur + semi-transparent)

## ✅ Checklist for Using

- [ ] Feature is imported in `App.jsx` ✓
- [ ] Configuration file exists ✓
- [ ] CSS file is created ✓
- [ ] Notifications appear when slider moves
- [ ] Events display in correct language
- [ ] Notifications fade out automatically

## 🐛 If Something Isn't Working

1. Check `NOTIFICATION_CONFIG.ENABLED` is `true`
2. Verify events are loading from timeline
3. Check browser console for errors
4. Ensure CSS file path is correct
5. Clear browser cache and reload

## 📱 Responsive Behavior

| Screen Size | Width | Margins |
|------------|-------|---------|
| Desktop (>1024px) | 360px | 24px from right |
| Tablet (768-1024px) | 320px | 16px from right |
| Mobile (<768px) | 250-280px | 16px from right |

## 🚀 Deploy & Test

1. Save changes to `notificationConfig.js`
2. No build required - hot reload works
3. Move timeline slider to see notifications
4. Change language to verify bilingual support
5. Adjust config and test different values

---

**Need more details?** See `EVENT_NOTIFICATIONS_README.md` for comprehensive documentation.
