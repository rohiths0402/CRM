import { useEffect, useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import {
  AttributionControl,
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from "react-leaflet";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "../../styles/map.css";
import { useGeoJson } from "../../hooks/useGeoJson";
import { useTheme } from "../../context/ThemeContext";
import { GEO_URLS } from "../../api/endpoints";
import { EVENT_STATUS } from "../../constants/eventStatus";
import { STATE_NAMES, getStateSlug } from "../../constants/indiaStates";
import { readThemeColors } from "../../utils/themeColors";

const INDIA_BOUNDS = L.latLngBounds([6.5, 67.5], [37.5, 98]);
const PALETTE = [
  "#f59e0b",
  "#10b981",
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
  "#fb7185",
  "#34d399",
  "#fbbf24",
];
const LIVE_STATUSES = ["TICKETS_LIVE", "ONGOING"];

const colorFor = (key) => {
  let hash = 0;
  for (const char of String(key)) hash += char.charCodeAt(0);
  return PALETTE[hash % PALETTE.length];
};

const buildPinIcon = (color, active, live) =>
  L.divIcon({
    className: "loop-pin",
    html: renderToStaticMarkup(
      <div
        className={`pin-wrap${active ? " is-active" : ""}${live ? " is-live" : ""}`}
        style={{ "--pin": color }}
      >
        <span className="pin-pulse" />
        <FaMapMarkerAlt className="pin-icon" />
      </div>,
    ),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    tooltipAnchor: [0, -38],
  });

const PIN_ICONS = Object.fromEntries(
  Object.entries(EVENT_STATUS).map(([status, { color }]) => {
    const live = LIVE_STATUSES.includes(status);
    return [
      status,
      {
        normal: buildPinIcon(color, false, live),
        active: buildPinIcon(color, true, live),
      },
    ];
  }),
);

const FitBounds = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [32, 32],
        duration: 0.9,
        maxZoom: 10,
      });
    }
  }, [bounds, map]);

  return null;
};

const IndiaLegend = () => (
  <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] space-y-2 rounded-2xl border border-line bg-elevated/90 px-3.5 py-3 text-xs backdrop-blur">
    <p className="flex items-center gap-2">
      <span className="h-3 w-5 rounded-sm bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500" />
      Bright state has events
    </p>
    <p className="flex items-center gap-2">
      <span className="h-3 w-5 rounded-sm bg-muted/40" />
      Faded state has no events yet
    </p>
    <p className="flex items-center gap-2">
      <span className="grid size-5 place-items-center rounded-full bg-[#111215] text-[10px] font-bold text-white">
        3
      </span>
      Number of events in the state
    </p>
  </div>
);

const StatusLegend = ({ statuses }) => (
  <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] space-y-2 rounded-2xl border border-line bg-elevated/90 px-3.5 py-3 text-xs backdrop-blur">
    {statuses.map((status) => (
      <p key={status} className="flex items-center gap-2">
        <span
          className="size-3 rounded-full"
          style={{ background: EVENT_STATUS[status].color }}
        />
        {EVENT_STATUS[status].label}
      </p>
    ))}
  </div>
);

const EventsMap = ({
  events,
  selectedState,
  selectedEventId,
  onSelectState,
  onSelectEvent,
}) => {
  const { theme } = useTheme();
  const colors = useMemo(() => readThemeColors(), [theme]);

  const indiaGeo = useGeoJson(GEO_URLS.india);
  const stateGeo = useGeoJson(
    selectedState ? GEO_URLS.state(selectedState) : null,
  );

  const stateStats = useMemo(() => {
    const totals = {};
    events.forEach(({ stateSlug, lat, lng }) => {
      const entry = totals[stateSlug] || { count: 0, lat: 0, lng: 0 };
      totals[stateSlug] = {
        count: entry.count + 1,
        lat: entry.lat + lat,
        lng: entry.lng + lng,
      };
    });
    return Object.entries(totals).map(([slug, value]) => ({
      slug,
      count: value.count,
      center: [value.lat / value.count, value.lng / value.count],
    }));
  }, [events]);

  const countBySlug = useMemo(
    () => Object.fromEntries(stateStats.map((item) => [item.slug, item.count])),
    [stateStats],
  );

  const stateEvents = useMemo(
    () => events.filter((event) => event.stateSlug === selectedState),
    [events, selectedState],
  );

  const stateStatuses = useMemo(
    () => [...new Set(stateEvents.map((event) => event.status))],
    [stateEvents],
  );

  const stateBounds = useMemo(
    () => (stateGeo.data ? L.geoJSON(stateGeo.data).getBounds() : null),
    [stateGeo.data],
  );

  const eventsBounds = useMemo(
    () =>
      stateEvents.length
        ? L.latLngBounds(
            stateEvents.map((event) => [event.lat, event.lng]),
          ).pad(0.8)
        : null,
    [stateEvents],
  );

  let bounds = INDIA_BOUNDS;
  if (selectedState)
    bounds = stateBounds || (stateGeo.error ? eventsBounds : null);

  const indiaStyle = (feature) => {
    const slug = getStateSlug(feature.properties);
    const hasEvents = Boolean(slug && countBySlug[slug]);
    return {
      color: colors.elevated,
      weight: 1.2,
      fillColor: colorFor(slug || indiaGeo.data.features.indexOf(feature)),
      fillOpacity: hasEvents ? 0.85 : 0.3,
    };
  };

  const onEachIndiaFeature = (feature, layer) => {
    const slug = getStateSlug(feature.properties);
    if (!slug) return;
    const count = countBySlug[slug] || 0;
    const label = count
      ? `${STATE_NAMES[slug]} · ${count} event${count > 1 ? "s" : ""}`
      : `${STATE_NAMES[slug]} · no events yet`;
    const baseStyle = indiaStyle(feature);

    layer.bindTooltip(label, { sticky: true, className: "loop-tooltip" });
    layer.on({
      click: () => onSelectState(slug),
      mouseover: (event) =>
        event.target.setStyle({
          weight: 2.5,
          color: colors.foreground,
          fillOpacity: 1,
        }),
      mouseout: (event) => event.target.setStyle(baseStyle),
    });
  };

  const districtStyle = (feature) => ({
    color: colors.foreground,
    weight: 0.8,
    opacity: 0.45,
    fillColor:
      PALETTE[stateGeo.data.features.indexOf(feature) % PALETTE.length],
    fillOpacity: 0.26,
  });

  const activeGeo = selectedState ? stateGeo : indiaGeo;
  const tileStyle = theme === "dark" ? "dark_all" : "light_all";

  return (
    <div className="relative isolate h-full overflow-hidden rounded-2xl bg-elevated">
      <MapContainer
        bounds={INDIA_BOUNDS}
        zoomSnap={0.25}
        minZoom={3}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <ZoomControl position="bottomright" />
        <AttributionControl position="bottomright" prefix={false} />
        <FitBounds bounds={bounds} />

        {selectedState && (
          <TileLayer
            key={tileStyle}
            url={`https://{s}.basemaps.cartocdn.com/${tileStyle}/{z}/{x}/{y}{r}.png`}
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          />
        )}

        {!selectedState && indiaGeo.data && (
          <GeoJSON
            key={`india-${theme}-${events.length}`}
            data={indiaGeo.data}
            style={indiaStyle}
            onEachFeature={onEachIndiaFeature}
          />
        )}

        {!selectedState &&
          stateStats.map((item) => (
            <CircleMarker
              key={item.slug}
              center={item.center}
              radius={15}
              pathOptions={{
                color: "#ffffff",
                weight: 2.5,
                fillColor: "#111215",
                fillOpacity: 1,
              }}
              eventHandlers={{ click: () => onSelectState(item.slug) }}
            >
              <Tooltip permanent direction="center" className="loop-count">
                {item.count}
              </Tooltip>
            </CircleMarker>
          ))}

        {selectedState && stateGeo.data && (
          <GeoJSON
            key={`state-${selectedState}-${theme}`}
            data={stateGeo.data}
            style={districtStyle}
            interactive={false}
          />
        )}

        {selectedState &&
          stateEvents.map((event) => {
            const active = event.id === selectedEventId;
            const icons = PIN_ICONS[event.status];
            return (
              <Marker
                key={event.id}
                position={[event.lat, event.lng]}
                icon={active ? icons.active : icons.normal}
                zIndexOffset={active ? 1000 : 0}
                eventHandlers={{ click: () => onSelectEvent(event.id) }}
              >
                <Tooltip
                  key={active ? "open" : "closed"}
                  direction="top"
                  permanent={active}
                  className="loop-tooltip"
                >
                  {event.title}
                </Tooltip>
              </Marker>
            );
          })}
      </MapContainer>

      <p className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-full border border-line bg-elevated/90 px-3.5 py-2 text-xs font-medium backdrop-blur">
        {selectedState
          ? "Click a pin to see the event details"
          : "Click a bright state to see its events"}
      </p>

      {selectedState ? (
        <StatusLegend statuses={stateStatuses} />
      ) : (
        <IndiaLegend />
      )}

      {activeGeo.loading && (
        <p className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-full border border-line bg-elevated/90 px-3 py-1.5 text-xs font-medium backdrop-blur">
          <Loader2 className="size-3.5 animate-spin text-primary" />
          Loading map
        </p>
      )}

      {activeGeo.error && (
        <p className="absolute right-3 top-3 z-[1000] rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500">
          {activeGeo.error}
        </p>
      )}
    </div>
  );
};

export default EventsMap;
