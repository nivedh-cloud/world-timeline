import React, { useState, useEffect } from "react";
import { NOTIFICATION_CONFIG } from "../config/notificationConfig";
import "../styles/EventNotifications.css";

export default function EventNotifications({ events = [], language = "en" }) {
  const [notifications, setNotifications] = useState([]);
  const [eventIds, setEventIds] = useState(new Set());
  const [notificationHeights, setNotificationHeights] = useState({});

  // Constant for notification height and gap
  const NOTIFICATION_HEIGHT = 60; // Approximate height in pixels
  const NOTIFICATION_GAP = 0; // No gap between notifications
  const MAX_VISIBLE = 12; // Show up to 12 tiles

  // Generate unique ID for event
  const getEventId = (event) => {
    return `${event.type}-${event.year}-${event.name_en}`;
  };

  // Calculate bottom position based on stack index
  const calculateBottomPosition = (stackIndex) => {
    let totalHeight = 0; // Initial bottom margin (no gap)
    for (let i = 0; i < stackIndex; i++) {
      totalHeight += NOTIFICATION_HEIGHT + NOTIFICATION_GAP;
    }
    return totalHeight;
  };

  // Show events as notifications when events prop changes
  useEffect(() => {
    if (!events || events.length === 0 || !NOTIFICATION_CONFIG.ENABLED) return;

    // Get current event IDs
    const currentIds = new Set(events.map(getEventId));

    // Check if events have changed (new timeline range)
    const hasNewEvents = Array.from(currentIds).some(id => !eventIds.has(id));

    if (hasNewEvents) {
      // Sort events by year and take top N
      const sortedEvents = [...events]
        .sort((a, b) => Number(a.year) - Number(b.year))
        .slice(0, NOTIFICATION_CONFIG.MAX_EVENTS_DISPLAYED);

      // Create notification objects with unique IDs and timers
      const newNotifications = sortedEvents.map((event, index) => ({
        id: getEventId(event),
        event,
        index,
        createdAt: Date.now(),
        isRemoved: false,
      }));

      setNotifications(newNotifications);
      setEventIds(currentIds);

      // Auto-remove notifications after display duration
      newNotifications.forEach((notif, idx) => {
        setTimeout(() => {
          setNotifications(prev =>
            prev.map(n =>
              n.id === notif.id ? { ...n, isRemoved: true } : n
            )
          );
        }, NOTIFICATION_CONFIG.DISPLAY_DURATION + (idx * 100)); // Stagger removal slightly

        // Remove from array completely after fade-out
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notif.id));
        }, NOTIFICATION_CONFIG.DISPLAY_DURATION + NOTIFICATION_CONFIG.FADE_OUT_DURATION + (idx * 100));
      });
    }
  }, [events, eventIds]);

  return (
    <div className="event-notifications-container">
      {notifications.slice(0, MAX_VISIBLE).map((notif, stackIndex) => {
        const bottomPosition = calculateBottomPosition(stackIndex);
        
        return (
          <div
            key={notif.id}
            className={`event-notification ${notif.isRemoved ? 'fade-out' : 'fade-in'}`}
            style={{
              bottom: `${bottomPosition}px`,
              right: '24px',
              opacity: notif.isRemoved ? 0 : 1,
              transform: notif.isRemoved ? 'translateX(20px)' : 'translateX(0)',
            }}
          >
            <div className="notification-content">
              <div className="notification-header">
                <span className={`event-type-badge ${notif.event.type}`}>
                  {notif.event.type === "biblical" ? "📖" : "🌍"}
                </span>
                <span className="event-title">
                  {language === "en" ? notif.event.name_en : notif.event.name_te}
                </span>
              </div>

              <div className="notification-footer">
                <span className="event-period">
                  {`${notif.event.year} ${notif.event.year >= 0 ? 'CE' : 'BCE'}`}
                </span>
              </div>
            </div>

            <div className="notification-progress-bar">
              <div
                className="progress-fill"
                style={{
                  animation: `progress-bar-fill ${NOTIFICATION_CONFIG.DISPLAY_DURATION}ms linear forwards`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
