import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/ClusterOverlay.css";

// Create different marker icons based on event type
const getMarkerIcon = (eventType) => {
  const color = eventType === 'biblical' ? '#7c3aed' : '#ff8800'; // Purple for biblical, orange for world
  return new L.DivIcon({
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px #0002;"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
};

// Location detection based on coordinates
const getLocationName = (lat, lng, language = 'en') => {
  const locations = [
    // Specific Countries & Small Regions (checked first for specificity)
    { name_en: 'Israel', name_te: 'ఇజ్రాయెల్', minLat: 31, maxLat: 33.4, minLng: 34.2, maxLng: 35.9 },
    { name_en: 'Palestine', name_te: 'పాలస్తీనియా', minLat: 31.9, maxLat: 32.6, minLng: 35.1, maxLng: 35.6 },
    { name_en: 'Egypt', name_te: 'ఈజిప్టు', minLat: 22, maxLat: 31.6, minLng: 25, maxLng: 34.9 },
    { name_en: 'Jordan', name_te: 'జార్డాన్', minLat: 29.2, maxLat: 32.8, minLng: 35.7, maxLng: 39.3 },
    { name_en: 'Lebanon', name_te: 'లెబనాన్', minLat: 33, maxLat: 34.7, minLng: 35.1, maxLng: 36.6 },
    { name_en: 'Syria', name_te: 'సిరియా', minLat: 32.3, maxLat: 37.3, minLng: 35.7, maxLng: 42.5 },
    { name_en: 'Iraq', name_te: 'ఇరాక్', minLat: 29.1, maxLat: 37.4, minLng: 38.8, maxLng: 48.6 },
    { name_en: 'Saudi Arabia', name_te: 'సౌదీ అరేబియా', minLat: 16.4, maxLat: 32.2, minLng: 34.5, maxLng: 55.9 },
    { name_en: 'Yemen', name_te: 'యెమెన్', minLat: 12.1, maxLat: 19.1, minLng: 42.5, maxLng: 54.6 },
    { name_en: 'Persia (Iran)', name_te: 'పర్షియా (ఇరాన్)', minLat: 25, maxLat: 39.8, minLng: 44.0, maxLng: 60.6 },
    
    { name_en: 'Greece', name_te: 'గ్రీస్', minLat: 35, maxLat: 41.8, minLng: 19.3, maxLng: 28.4 },
    { name_en: 'Rome (Italy)', name_te: 'రోమ్ (ఇటలీ)', minLat: 36, maxLat: 47.1, minLng: 6.6, maxLng: 18.5 },
    { name_en: 'Britain', name_te: 'బ్రిటన్', minLat: 50.0, maxLat: 58.6, minLng: -8.6, maxLng: 1.7 },
    { name_en: 'Gaul (France)', name_te: 'గాల్ (ఫ్రాన్సు)', minLat: 42.3, maxLat: 51.1, minLng: -8.2, maxLng: 8.2 },
    { name_en: 'Spain', name_te: 'స్పెయిన్', minLat: 35.9, maxLat: 43.8, minLng: -9.3, maxLng: 3.0 },
    { name_en: 'North Africa', name_te: 'ఉత్తర ఆఫ్రికా', minLat: 15, maxLat: 37, minLng: -18, maxLng: 55 },
    
    { name_en: 'India', name_te: 'భారతదేశం', minLat: 8, maxLat: 35, minLng: 68, maxLng: 97 },
    { name_en: 'China', name_te: 'చైనా', minLat: 18, maxLat: 53, minLng: 73, maxLng: 135 },
    { name_en: 'Japan', name_te: 'జపాన్', minLat: 30, maxLat: 45, minLng: 130, maxLng: 145 },
    { name_en: 'Southeast Asia', name_te: 'ఆగ్నేయ ఆసియా', minLat: -10, maxLat: 20, minLng: 95, maxLng: 140 },
    
    { name_en: 'Peru', name_te: 'పెరూ', minLat: -18.3, maxLat: 0.0, minLng: -81.3, maxLng: -68.7 },
    { name_en: 'Mexico', name_te: 'మెక్సికో', minLat: 14.5, maxLat: 32.7, minLng: -117.1, maxLng: -86.7 },
    
    // Broader Regions (checked if no specific country matched)
    // Europe
    { name_en: 'Europe', name_te: 'యూరప్', minLat: 35, maxLat: 71, minLng: -10, maxLng: 40 },
    { name_en: 'Western Europe', name_te: 'పశ్చిమ యూరప్', minLat: 43, maxLat: 60, minLng: -10, maxLng: 15 },
    { name_en: 'Eastern Europe', name_te: 'తూర్పు యూరప్', minLat: 44, maxLat: 56, minLng: 15, maxLng: 40 },
    
    // Asia
    { name_en: 'Asia', name_te: 'ఆసియా', minLat: -10, maxLat: 55, minLng: 60, maxLng: 150 },
    { name_en: 'Middle East', name_te: 'మధ్య తూర్పు', minLat: 12, maxLat: 42, minLng: 25, maxLng: 60 },
    
    // Africa
    { name_en: 'Africa', name_te: 'ఆఫ్రికా', minLat: -35, maxLat: 37, minLng: -18, maxLng: 55 },
    { name_en: 'East Africa', name_te: 'తూర్పు ఆఫ్రికా', minLat: -12, maxLat: 5, minLng: 29, maxLng: 42 },
    
    // Americas
    { name_en: 'North America', name_te: 'ఉత్తర అమెరికా', minLat: 15, maxLat: 85, minLng: -170, maxLng: -50 },
    { name_en: 'Central America', name_te: 'మధ్య అమెరికా', minLat: 7, maxLat: 18, minLng: -92, maxLng: -77 },
    { name_en: 'South America', name_te: 'దక్షిణ అమెరికా', minLat: -56, maxLat: 13, minLng: -82, maxLng: -35 },
    
    // Oceania
    { name_en: 'Oceania', name_te: 'ఓషియానియా', minLat: -50, maxLat: 0, minLng: 110, maxLng: 180 },
    { name_en: 'Australia', name_te: 'ఆస్ట్రేలియా', minLat: -44, maxLat: -10, minLng: 113, maxLng: 154 },
  ];
  
  // Find the most specific location (smallest area)
  let matched = null;
  let smallestArea = Infinity;
  
  for (const loc of locations) {
    if (lat >= loc.minLat && lat <= loc.maxLat && lng >= loc.minLng && lng <= loc.maxLng) {
      const area = (loc.maxLat - loc.minLat) * (loc.maxLng - loc.minLng);
      if (area < smallestArea) {
        matched = loc;
        smallestArea = area;
      }
    }
  }
  
  return matched ? (language === 'en' ? matched.name_en : matched.name_te) : (language === 'en' ? 'World' : 'ప్రపంచం');
};

// Memoized cluster icon creation function to prevent re-renders
const clusterIconCreateFunction = (cluster) => {
  // Get all child markers and determine dominant event type
  const childMarkers = cluster.getAllChildMarkers();
  let biblicalCount = 0;
  let worldCount = 0;
  
  childMarkers.forEach((marker, idx) => {
    // Try multiple ways to access the event type
    const eventType = marker._eventType || marker.options?.eventType || marker.options?.eventData?.type;
    console.log(`Marker ${idx}:`, {_eventType: marker._eventType, eventType, marker});
    if (eventType === 'biblical') biblicalCount++;
    else if (eventType === 'world') worldCount++;
  });
  
  console.log('Cluster color determination:', {biblicalCount, worldCount, totalMarkers: childMarkers.length});
  
  // Determine color based on dominant event type
  const color = biblicalCount > worldCount ? '#7c3aedCC' : '#ff8800CC'; // Purple for biblical, Orange for world
  
  return L.divIcon({
    className: 'marker-cluster-custom',
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;font-size:15px;box-shadow:0 1px 8px #0002;opacity:0.85;">${cluster.getChildCount()}</div>`
  });
};

// Memoized EventMarker component with hover and click handlers
const EventMarker = React.memo(({ event, language, onMarkerHover, onMarkerClick, mapRef }) => {
  const markerRef = React.useRef(null);

  React.useEffect(() => {
    // Attach event type directly to the Leaflet marker instance for cluster detection
    if (markerRef.current) {
      const marker = markerRef.current.leafletElement || markerRef.current;
      marker._eventType = event.type;
      marker._event = event;
      console.log('Attaching event type to marker:', event.type, marker);
    }
  }, [event]);

  const handleMouseOver = () => {
    if (mapRef?.current) {
      const containerPoint = mapRef.current.latLngToContainerPoint([event.lat, event.lon]);
      onMarkerHover({
        event,
        position: { x: containerPoint.x + 50, y: containerPoint.y }
      });
    }
  };

  const handleMouseOut = () => {
    onMarkerHover(null);
  };

  return (
    <Marker
      ref={markerRef}
      position={[event.lat, event.lon]}
      icon={getMarkerIcon(event.type)}
      options={{ eventData: event, eventType: event.type }}
      eventHandlers={{
        mouseover: handleMouseOver,
        mouseout: handleMouseOut
      }}
    >
      <Popup>
        <div className="event-title">{language === "en" ? event.name_en : event.name_te}</div>
        <div className="event-desc">{language === "en" ? event.desc_en : event.desc_te}</div>
        <div className="event-year">{event.startYear < 0 ? `${Math.abs(event.startYear)} BC` : `${event.startYear} AD`}</div>
      </Popup>
    </Marker>
  );
}, (prevProps, nextProps) => {
  return prevProps.event.key === nextProps.event.key && 
         prevProps.language === nextProps.language;
});

function MapViewComponent({
  events,
  language
}) {
  // State for overlay only - needs to update UI
  const [hoveredCluster, setHoveredCluster] = React.useState(null); // { latlng, markers }
  const [hoveredMarker, setHoveredMarker] = React.useState(null); // { event, position }
  const [overlayPosition, setOverlayPosition] = React.useState({ x: 0, y: 0 });
  const [overlayLocationName, setOverlayLocationName] = React.useState('');
  const [zoomTarget, setZoomTarget] = React.useState(null); // { lat, lng, zoom }
  const [showAboutModal, setShowAboutModal] = React.useState(false); // About/Credit modal
  
  // Refs for map persistence
  const defaultCenter = [20, 0];
  const defaultZoom = 2;
  const mapCenterRef = React.useRef(defaultCenter);
  const mapZoomRef = React.useRef(defaultZoom);
  const mapRef = React.useRef();
  const clusterGroupRef = React.useRef();
  const mouseoutTimeoutRef = React.useRef(null);
  const isFirstMountRef = React.useRef(true); // Track first mount vs re-renders
  const overlayRefForHeight = React.useRef(null); // Track overlay height for centering
  const isRestoringRef = React.useRef(false); // Prevent saving position while restoring
  const prevEventsCountRef = React.useRef(0); // Track if events changed
  
  // Update refs on first mount only
  React.useEffect(() => {
    // Store initial values in refs so they never get reset
    if (!mapCenterRef.current) {
      mapCenterRef.current = defaultCenter;
    }
    if (!mapZoomRef.current) {
      mapZoomRef.current = defaultZoom;
    }
  }, []);

  // Calculate polygon coords from hoveredCluster instead of storing separately
  const polygonCoords = React.useMemo(() => {
    if (!hoveredCluster || !hoveredCluster.markers) return null;
    const coords = hoveredCluster.markers.map(m => [m.latlng.lat, m.latlng.lng]);
    return coords.length > 2 ? coords : null;
  }, [hoveredCluster]);

  // Calculate polygon color based on dominant event type in cluster
  const polygonColor = React.useMemo(() => {
    if (!hoveredCluster || !hoveredCluster.markers) return '#7c3aed';
    let biblicalCount = 0;
    let worldCount = 0;
    
    hoveredCluster.markers.forEach(marker => {
      const eventType = marker.eventData?.type;
      if (eventType === 'biblical') biblicalCount++;
      else if (eventType === 'world') worldCount++;
    });
    
    return biblicalCount > worldCount ? '#7c3aed' : '#ff8800'; // Purple for biblical, Orange for world
  }, [hoveredCluster]);

  // Initialize refs on mount
  React.useEffect(() => {
    // Just ensure refs are initialized
    console.log('[MapView] Component mounted, isFirstMount:', isFirstMountRef.current);
    return () => {
      console.log('[MapView] Component unmounting');
    };
  }, []);
  
  // Log when events change but don't reset map - preserve user's zoom/pan
  React.useEffect(() => {
    console.log('[MapView] EVENTS CHANGED - count:', events.length, 'prev:', prevEventsCountRef.current);
    prevEventsCountRef.current = events.length;
    // NOTE: We deliberately do NOT reset isFirstMountRef or map position here
    // Users should be able to zoom to a location (like India) and then change the year range
    // without the map jumping back to the default view
  }, [events]);

  // Use a callback ref to properly track cluster group changes
  const handleClusterRef = React.useCallback((ref) => {
    console.log('Cluster ref callback triggered:', !!ref);
    
    if (!ref) {
      console.log('Cluster ref is null');
      clusterGroupRef.current = null;
      return;
    }
    
    clusterGroupRef.current = ref;
    console.log('Cluster ref set, attaching listeners');
    
    const handleClusterMouseover = (e) => {
      console.log('Cluster mouseover event fired');
      const cluster = e.layer;
      const markers = cluster.getAllChildMarkers();
      const clusterLatLng = cluster.getLatLng();
      
      console.log('Cluster markers count:', markers.length);
      
      // Clear any pending mouseout timeout when re-hovering
      if (mouseoutTimeoutRef.current) {
        clearTimeout(mouseoutTimeoutRef.current);
        mouseoutTimeoutRef.current = null;
      }
      
      // Use current language from closure
      const locationName = getLocationName(clusterLatLng.lat, clusterLatLng.lng, language);
      setOverlayLocationName(locationName);
      
      setHoveredCluster({
        latlng: clusterLatLng,
        markers: markers.map(m => {
          // EventData is stored in options.options.eventData due to react-leaflet wrapping
          const eventData = m.options.options?.eventData || m.options.eventData;
          const title = eventData 
            ? (language === 'en' ? eventData.name_en : eventData.name_te)
            : 'Marker';
          return {
            latlng: m.getLatLng(),
            title: title,
            eventData: eventData
          };
        })
      });
      
      // Calculate overlay position - will be centered vertically via CSS transform
      if (mapRef.current) {
        const containerPoint = mapRef.current.latLngToContainerPoint(clusterLatLng);
        let x = containerPoint.x + 50;
        let y = containerPoint.y;
        
        // Get map container bounds for bounds checking
        const mapContainer = mapRef.current.getContainer();
        const mapBounds = mapContainer.getBoundingClientRect();
        const mapWidth = mapBounds.width;
        const mapHeight = mapBounds.height;
        
        // Estimate overlay dimensions
        const overlayWidth = 320;
        const overlayHeight = 300;
        
        // Adjust x to keep overlay within bounds
        if (x + overlayWidth > mapWidth) {
          x = mapWidth - overlayWidth - 10;
        }
        if (x < 10) {
          x = 10;
        }
        
        // Adjust y to keep overlay within bounds
        if (y + overlayHeight > mapHeight) {
          y = mapHeight - overlayHeight - 10;
        }
        if (y < 10) {
          y = 10;
        }
        
        setOverlayPosition({
          x: x,
          y: y
        });
      }
    };
    
    const handleClusterMouseout = () => {
      console.log('Cluster mouseout event fired');
      // Clear any existing timeout
      if (mouseoutTimeoutRef.current) {
        clearTimeout(mouseoutTimeoutRef.current);
      }
      
      // Hide overlay after 1200ms delay so user can interact with it
      // This gives more time to move from cluster to overlay
      mouseoutTimeoutRef.current = setTimeout(() => {
        setHoveredCluster(null);
      }, 1200);
    };
    
    ref.on('clustermouseover', handleClusterMouseover);
    ref.on('clustermouseout', handleClusterMouseout);
    console.log('Cluster listeners attached via callback ref');
    
    return () => {
      console.log('Cleaning up cluster listeners');
      ref.off('clustermouseover', handleClusterMouseover);
      ref.off('clustermouseout', handleClusterMouseout);
    };
  }, [language]);

  // Handle zoom when zoomTarget is set
  React.useEffect(() => {
    console.log('Zoom effect triggered, zoomTarget:', zoomTarget);
    if (zoomTarget && mapRef.current) {
      console.log('Zooming to:', zoomTarget);
      // Set restoring flag so moveend doesn't interfere
      isRestoringRef.current = true;
      try {
        mapRef.current.setView([zoomTarget.lat, zoomTarget.lng], zoomTarget.zoom, { 
          animate: true, 
          duration: 0.5 
        });
        console.log('View set successfully');
        // Allow moveend saves again after zoom animation completes
        setTimeout(() => {
          isRestoringRef.current = false;
          console.log('Zoom complete, allowing position saves again');
        }, 600);
      } catch (err) {
        console.error('Error setting view:', err);
        isRestoringRef.current = false;
      }
      setZoomTarget(null);
      setTimeout(() => setHoveredCluster(null), 500);
    }
  }, [zoomTarget]);

  function MapEventHandler() {
    const map = useMap();
    
    React.useEffect(() => {
      mapRef.current = map;
      if (!map || !isFirstMountRef.current) return;

      isFirstMountRef.current = false;
      const center = [map.getCenter().lat, map.getCenter().lng];
      const zoom = map.getZoom();
      mapCenterRef.current = center;
      mapZoomRef.current = zoom;
    }, [map]);

    React.useEffect(() => {
      if (!map) return;
      const zoomToWorldButton = L.control({ position: 'topleft' });
      zoomToWorldButton.onAdd = () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', '', container);
        button.href = '#';
        button.title = 'Zoom to World';
        button.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="M5.6 5.6l2.8 2.8" />
            <path d="M15.6 15.6l2.8 2.8" />
          </svg>
        `;
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.width = '28px';
        button.style.height = '28px';
        button.style.margin = '0';
        button.style.padding = '0';
        button.style.borderRadius = '0 0 0 0';
        button.style.border = '2px solid rgba(0,0,0,0.2)';
        button.style.backgroundColor = '#fff';
        button.style.cursor = 'pointer';
        button.style.userSelect = 'none';
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, 'click', (e) => {
          L.DomEvent.preventDefault(e);
          map.setView([20, 0], 2, { animate: true, duration: 0.5 });
        });
        return container;
      };
      zoomToWorldButton.addTo(map);

      // Add credit control
      const creditControl = L.control({ position: 'bottomleft' });
      creditControl.onAdd = () => {
        const container = L.DomUtil.create('div', '');
        container.innerHTML = `
          <div style="background-color: rgba(255, 255, 255, 0.9); padding: 8px 12px; border-radius: 4px; font-size: 10px; border: 1px solid rgba(0, 0, 0, 0.1); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; cursor: pointer; transition: all 0.2s ease;">
            <span id="wt-credit-title" style="font-weight:bold; color:#222; cursor:pointer;">World Timeline</span> Designed and developed by <span id="wt-credit-author" style="font-weight:bold; color:#4f46e5; cursor:pointer;">Jeevan Prabhath</span>
          </div>
        `;
        L.DomEvent.disableClickPropagation(container);
        const creditDiv = container.querySelector('div');
        creditDiv.style.cursor = 'pointer';
        creditDiv.onmouseover = () => {
          creditDiv.style.backgroundColor = 'rgba(255, 255, 255, 1)';
          creditDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        };
        creditDiv.onmouseout = () => {
          creditDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          creditDiv.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        };
        // Add click handlers for title and author
        const titleSpan = creditDiv.querySelector('#wt-credit-title');
        const authorSpan = creditDiv.querySelector('#wt-credit-author');
        if (titleSpan) {
          titleSpan.onclick = (e) => {
            e.stopPropagation();
            setShowAboutModal(true);
          };
        }
        if (authorSpan) {
          authorSpan.onclick = (e) => {
            e.stopPropagation();
            window.open('https://nivedh-cloud.github.io/jeevan-resume/', '_blank', 'noopener');
          };
        }
        return container;
      };
      creditControl.addTo(map);

      return () => {
        zoomToWorldButton.remove();
        creditControl.remove();
      };
    }, [map]);

    useMapEvents({
      moveend: (e) => {
        if (isRestoringRef.current) return;
        const map = e.target;
        mapCenterRef.current = [map.getCenter().lat, map.getCenter().lng];
        mapZoomRef.current = map.getZoom();
      },
      zoomend: (e) => {
        if (isRestoringRef.current) return;
        mapZoomRef.current = e.target.getZoom();
      }
    });
    return null;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      scrollWheelZoom
      className="map-section"
      style={{ width: '100%', height: '100%', minHeight: 0 }}
      key="map-container"
    >
      <MapEventHandler />
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {polygonCoords && hoveredCluster && (
        <Polygon key={`poly-${hoveredCluster.latlng.lat}-${hoveredCluster.latlng.lng}`} positions={polygonCoords} pathOptions={{ color: polygonColor, weight: 2, fillOpacity: 0.1 }} />
      )}
      <MarkerClusterGroup
        ref={handleClusterRef}
        chunkedLoading
        showCoverageOnHover={false}
        maxClusterRadius={40}
        iconCreateFunction={clusterIconCreateFunction}
      >
        {events.map(ev => (
          <EventMarker
            key={ev.key}
            event={ev}
            language={language}
            onMarkerHover={(data) => {
              if (data) {
                setHoveredMarker(data);
                setOverlayPosition(data.position);
              } else {
                setHoveredMarker(null);
              }
            }}
            onMarkerClick={(target) => setZoomTarget(target)}
            mapRef={mapRef}
          />
        ))}
      </MarkerClusterGroup>
      </MapContainer>
      {hoveredCluster && (
        <div
          onMouseEnter={() => {
            if (mouseoutTimeoutRef.current) {
              clearTimeout(mouseoutTimeoutRef.current);
              mouseoutTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            if (mouseoutTimeoutRef.current) {
              clearTimeout(mouseoutTimeoutRef.current);
            }
            mouseoutTimeoutRef.current = setTimeout(() => {
              setHoveredCluster(null);
            }, 200);
          }}
          ref={overlayRefForHeight}
          className="cluster-overlay"
          style={{
            left: `${overlayPosition.x}px`,
            top: `${overlayPosition.y}px`,
            borderColor: polygonColor
          }}
        >
          {/* Header */}
          <div 
            className="cluster-overlay-header"
            style={{
              background: polygonColor === '#7c3aed' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #ff8800 0%, #ff6600 100%)'
            }}
          >
            <span>📍 Events in {overlayLocationName} ({hoveredCluster.markers.length})</span>
            <button
              onClick={() => setHoveredCluster(null)}
              className="cluster-overlay-close"
            >
              ✕
            </button>
          </div>
          
          {/* List */}
          <ul className="cluster-overlay-list">
            {hoveredCluster.markers.map((m, i) => (
              <li
                key={i}
                className="cluster-overlay-item"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.log('Clicked marker:', m.title, m.latlng);
                  if (m.latlng) {
                    const lat = m.latlng.lat;
                    const lng = m.latlng.lng;
                    console.log('Setting zoom target to:', lat, lng);
                    console.log('mapRef exists?', !!mapRef.current);
                    setZoomTarget({ lat, lng, zoom: 8 });
                  }
                }}
              >
                <span className="cluster-overlay-icon">
                  {m.eventData?.type === 'biblical' ? '📖' : '🌍'}
                </span>
                <span>{m.title}</span>
                <span className="cluster-overlay-arrow">
                  →
                </span>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="cluster-overlay-footer">
            Click any item to zoom to that location
          </div>
        </div>
      )}

      {/* About/Credit Modal */}
      {showAboutModal && (
        <>
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}
          </style>
          {/* Transparent Overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeIn 0.3s ease'
            }}
            onClick={() => setShowAboutModal(false)}
          >
            {/* Modal Content */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 32,
                maxWidth: 700,
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                animation: 'slideUp 0.3s ease',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                zIndex: 10000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1f2937' }}>About This Project</h2>
                <button
                  onClick={() => setShowAboutModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 28,
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: 0,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Description Option 2 */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Project Overview</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#4b5563', margin: 0 }}>
                  <strong>World Timeline</strong> — An interactive web application that visualizes historical events across multiple time periods and geographic regions. Built with React and Vite, the application renders 4000+ events (World history) on an interactive Leaflet map with advanced features including marker clustering, geolocation detection, and event notifications. Implemented responsive design using TailwindCSS and created a multilingual interface supporting English and Telugu. The application uses efficient JSON-based data loading with 100-year interval segmentation and includes features such as year-based timeline controls, real-time event filtering, zoom functionality, and visual event clustering. Deployed on GitHub Pages with automated CI/CD pipeline using GitHub Actions.
                </p>
              </div>

              {/* Description Option 4 */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Technical Stack</h3>
                <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.8 }}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Frontend:</strong> React 19, Vite 7, TailwindCSS 4, React Leaflet 5
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Features:</strong> Interactive mapping with marker clustering, real-time event filtering, timeline controls, multilingual interface
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Data:</strong> 4000+ events organized in JSON format with geospatial coordinates
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>DevOps:</strong> Automated CI/CD with GitHub Actions, GitHub Pages deployment
                  </div>
                  <div>
                    <strong>Key Accomplishments:</strong> Optimized performance with event data lazy loading, implemented custom UI components for event management and visualization, created responsive design for cross-device compatibility
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: 10, color: '#9ca3af' }}>
                <span style={{ fontWeight: 600, color: '#222', cursor: 'pointer' }} onClick={() => setShowAboutModal(true)}>
                  World Timeline
                </span>
                {' '}Designed and developed by{' '}
                <span style={{ color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => window.open('https://nivedh-cloud.github.io/jeevan-resume/', '_blank', 'noopener')}
                >
                  Jeevan Prabhath
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(MapViewComponent, (prevProps, nextProps) => {
  // Only re-render if events array length or language changes
  // Don't re-render just because events array reference changed
  return prevProps.language === nextProps.language && 
         prevProps.events.length === nextProps.events.length;
});
