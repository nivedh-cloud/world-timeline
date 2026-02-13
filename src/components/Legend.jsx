import React from "react";

export default function Legend({
  showBiblical,
  showWorld,
  onToggleBiblical,
  onToggleWorld
}) {
  return (
    <div className="legend-box">
      <label className="legend-row">
        <span className="legend-circle biblical"></span>
        <span>Middle East Events</span>
        <input type="checkbox" checked={showBiblical} onChange={onToggleBiblical} style={{marginLeft:8}} />
      </label>
      <label className="legend-row">
        <span className="legend-circle world"></span>
        <span>World Events</span>
        <input type="checkbox" checked={showWorld} onChange={onToggleWorld} style={{marginLeft:8}} />
      </label>
    </div>
  );
}
