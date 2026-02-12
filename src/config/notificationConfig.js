/**
 * Event Notifications Configuration
 * 
 * Easily customize the behavior of scrolling event notifications
 */

export const NOTIFICATION_CONFIG = {
  // Maximum number of events to display as notifications (top N events)
  MAX_EVENTS_DISPLAYED: 15,

  // How long each notification stays visible (in milliseconds)
  DISPLAY_DURATION: 5000,

  // How long the fade-out animation takes (in milliseconds)
  FADE_OUT_DURATION: 1000,

  // Maximum number of notifications visible on screen simultaneously
  MAX_STACK_VISIBLE: 5,

  // Approximate height of each notification card in pixels
  // Used for calculating proper vertical stacking
  NOTIFICATION_HEIGHT: 140,

  // Gap between stacked notifications in pixels
  NOTIFICATION_GAP: 12,

  // Show/hide notifications
  ENABLED: true,

  // Position can be: "bottom-right", "bottom-left", "top-right", "top-left"
  POSITION: "bottom-right",
};

export default NOTIFICATION_CONFIG;
