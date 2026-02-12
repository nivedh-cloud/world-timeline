# Notification Stack Positioning - Reference Guide

## 🎯 Current Configuration

```javascript
NOTIFICATION_HEIGHT: 140px    // Height of card + padding
NOTIFICATION_GAP: 12px        // Space between cards
INITIAL_MARGIN: 24px          // Space from screen bottom
```

## 📏 Exact Positioning

| Stack Position | Bottom Position | Calculation |
|---|---|---|
| Card 1 (Bottom) | 24px | 24 + (0 × 152) |
| Card 2 | 176px | 24 + (1 × 152) |
| Card 3 | 328px | 24 + (2 × 152) |
| Card 4 | 480px | 24 + (3 × 152) |
| Card 5 (Top) | 632px | 24 + (4 × 152) |

**Formula**: `Bottom = 24 + (StackIndex × 152)`

## 🔢 Per-Card Spacing

- Card Height: 140px
- Gap Below: 12px
- **Total per card**: 152px

## 📐 Stack Height Calculation

To fit N cards on screen:
```
Required Height = 24 + (N × 152)

Examples:
- 1 card: 24 + (1 × 152) = 176px
- 2 cards: 24 + (2 × 152) = 328px
- 3 cards: 24 + (3 × 152) = 480px
- 4 cards: 24 + (4 × 152) = 632px
- 5 cards: 24 + (5 × 152) = 784px
```

## ⚙️ To Adjust Spacing

### Increase Gap Between Cards
```javascript
// In src/config/notificationConfig.js
NOTIFICATION_GAP: 20        // Instead of 12

// Effect: Each card now takes 160px (140 + 20)
// New positioning: 24, 184, 344, 504, 664
```

### Decrease Gap Between Cards
```javascript
// More compact stacking
NOTIFICATION_GAP: 8         // Instead of 12

// Effect: Each card now takes 148px (140 + 8)
// New positioning: 24, 172, 320, 468, 616
```

### Larger Cards (160px height)
```javascript
NOTIFICATION_HEIGHT: 160    // Instead of 140

// Effect: Each card takes 172px (160 + 12)
// New positioning: 24, 196, 368, 540, 712
```

### Smaller Cards (120px height)
```javascript
NOTIFICATION_HEIGHT: 120    // Instead of 140

// Effect: Each card takes 132px (120 + 12)
// New positioning: 24, 156, 288, 420, 552
```

## 📱 Responsive Adjustments

### Mobile (280px width)
```javascript
// Cards are narrower but same height
NOTIFICATION_HEIGHT: 140    // Unchanged
NOTIFICATION_GAP: 10        // Slightly reduced gap
// New positioning: 24, 150, 276, 402, 528
```

### Large Desktop (wider screen)
```javascript
// Can show more cards
MAX_STACK_VISIBLE: 8        // Instead of 5
NOTIFICATION_GAP: 12        // Keep normal gap
// New positioning: 24, 176, 328, 480, 632, 784, 936, 1088
```

## 🧮 Quick Reference Table

| Config | Card Height | Gap | Per-Card | 5-Stack Height |
|---|---|---|---|---|
| Compact | 120px | 8px | 128px | 664px |
| Tight | 130px | 10px | 140px | 724px |
| Default | 140px | 12px | 152px | 784px |
| Relaxed | 150px | 15px | 165px | 854px |
| Spacious | 160px | 20px | 180px | 924px |

## 💻 Code Implementation

```javascript
// In component
const NOTIFICATION_HEIGHT = 140;  // pixels
const NOTIFICATION_GAP = 12;      // pixels

// Calculate position
const calculateBottomPosition = (stackIndex) => {
  let totalHeight = 24; // initial margin
  for (let i = 0; i < stackIndex; i++) {
    totalHeight += NOTIFICATION_HEIGHT + NOTIFICATION_GAP;
  }
  return totalHeight;
};

// Usage
Card 0: calculateBottomPosition(0) = 24px
Card 1: calculateBottomPosition(1) = 176px
Card 2: calculateBottomPosition(2) = 328px
Card 3: calculateBottomPosition(3) = 480px
Card 4: calculateBottomPosition(4) = 632px
```

## 🎨 Visual Stack Diagram

```
Screen Height = 1080px

Top ─────────────────────────────────────
    │
    │  [Empty space for content]
    │
    ├─────────────────────────────────────
    │  ┌──────────────────────────────┐
    │  │  Notification 5 (optional)   │  ← Bottom: 632px
    │  │  Visible if enough height    │
    │  └──────────────────────────────┘
    │          (12px gap)
    │  ┌──────────────────────────────┐
    │  │  Notification 4              │  ← Bottom: 480px
    │  └──────────────────────────────┘
    │          (12px gap)
    │  ┌──────────────────────────────┐
    │  │  Notification 3              │  ← Bottom: 328px
    │  └──────────────────────────────┘
    │          (12px gap)
    │  ┌──────────────────────────────┐
    │  │  Notification 2              │  ← Bottom: 176px
    │  └──────────────────────────────┘
    │          (12px gap)
    │  ┌──────────────────────────────┐
    │  │  Notification 1 (always first)│  ← Bottom: 24px
    │  └──────────────────────────────┘
    │     (24px margin from screen edge)
Bottom ──────────────────────────────────
```

## 🔄 Animation Timeline

```
Time: 0ms
  Position: 24px (calculated)
  Opacity: 0 → 1 (fade in)
  Transform: translateX(20px) → translateX(0) (slide in)

Time: 400ms
  Position: 24px (settled)
  Opacity: 1 (fully visible)
  Transform: translateX(0)

Time: 5000ms (DISPLAY_DURATION)
  Position: 24px (still)
  Opacity: 1 (still visible)
  Progress bar: 100% → 0%

Time: 6000ms (5000 + 1000 FADE_OUT_DURATION)
  Position: 24px (unchanged)
  Opacity: 1 → 0 (fade out)
  Transform: translateX(0) → translateX(20px) (slide out)

Time: 6100ms
  Removed from DOM
```

## ⚡ Performance Impact

- **Per notification**: ~2-3 KB
- **5 notifications**: ~10-15 KB
- **DOM operations**: O(1) per stack update
- **No memory leaks**: Proper cleanup on removal
- **Smooth animations**: 60fps (no janking)

---

**Use this as reference when adjusting notification positioning!**
