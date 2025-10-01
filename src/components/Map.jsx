"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import wellknown from "wellknown"; 
const hospitalSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
    viewBox="0 0 24 24" fill="black">
    <path d="M12 7v4"/>
    <path d="M14 21v-3a2 2 0 0 0-4 0v3"/>
    <path d="M14 9h-4"/>
    <path d="M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/>
    <path d="M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16"/>
  </svg>`;

// Convert SVG string into image for maplibre
function svgToImage(svg) {
  const img = new Image(32, 32);
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  return img;
}

export default function MapView({setBuildingData, setShowDetailCard, showDetailCard, selectedDistrict, setTotalCount, setTotalPopulation, setAvgVisit, setAvgPerson}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";
  
  function getColor(id) {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA600", "#A29BFE",
      "#06D6A0", "#FFD166", "#EF476F", "#118AB2", "#073B4C",
      "#F78C6B", "#8D99AE", "#9D4EDD", "#3D348B", "#2A9D8F",
      "#E9C46A", "#F4A261", "#264653", "#D62828", "#457B9D",
      "#90BE6D", "#FFB5A7", "#6A4C93", "#00B4D8", "#E76F51",
      "#2D6A4F", "#FFCB77", "#8338EC", "#FF006E", "#3A86FF"
    ];

    return colors[id % colors.length];
  }

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      center: [76.886, 43.238],
      zoom: 11,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
  }, []);

  useEffect(() => {
      if (!map.current) return; // prevent re-init

      const fetchAndRender = async () => {
        const districtFilter =
          selectedDistrict !== "Все районы" ? `districts=${selectedDistrict}&` : "";

        const res = await fetch(
          `https://admin.smartalmaty.kz/api/v1/healthcare/territorial-division-map/?${districtFilter}limit=1000`
        );
        const data = await res.json();
        const uniqueIds = new Set(data.results.map(item => item.id));
        setTotalCount(uniqueIds.size);
        setTotalPopulation(data.total_population);
        setAvgVisit(data.avg_overall_coverage_ratio);
        setAvgPerson(data.avg_per_1_person);

        if (!data?.results) {
          console.error("Unexpected API data:", data);
          return;
        }
        
        const groups = {};
          data.results.forEach((item) => {
            if (!groups[item.id]) {
              groups[item.id] = {
                point: {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)],
                  },
                  properties: {
                    id: item.id,
                    name: item.name,
                    address: item.full_address,
                    district: item.district,
                    color: getColor(item.id),
                    coverage_ratio: item.overall_coverage_ratio,
                  },
                },
                polygons: [],
              };
            }

            const geo = item.geometry ? wellknown.parse(item.geometry) : null;
            if (geo) {
              groups[item.id].polygons.push({
                type: "Feature",
                geometry: geo,
                properties: {
                  id: item.id,
                  name: item.name,
                  address: item.full_address,
                  color: getColor(item.id),
                },
              });
            }
          });

            const points = {
              type: "FeatureCollection",
              features: Object.values(groups).map((g) => g.point),
            };

            const polygons = {
              type: "FeatureCollection",
              features: Object.values(groups).flatMap((g) => g.polygons),
            };

            const addOrUpdateLayers = () => {
              //Polygons
              if (map.current.getSource("policlinic-polygons")) {
                map.current.getSource("policlinic-polygons").setData(polygons);
              } else {
                map.current.addSource("policlinic-polygons", { type: "geojson", data: polygons });
                map.current.addLayer({
                  id: "policlinic-polygons-fill",
                  type: "fill",
                  source: "policlinic-polygons",
                  paint: {
                    "fill-color": ["get", "color"],
                    "fill-opacity": 0.4,
                  },
                });
                map.current.addLayer({
                  id: "policlinic-polygons-outline",
                  type: "line",
                  source: "policlinic-polygons",
                  paint: { "line-color": "#333", "line-width": 1 },
                });
              }

              //Points
              if (map.current.getSource("policlinic-points")) {
                map.current.getSource("policlinic-points").setData(points);
              } else {
                map.current.addSource("policlinic-points", { type: "geojson", data: points });
                map.current.addLayer({
                  id: "policlinic-points-circle",
                  type: "circle",
                  source: "policlinic-points",
                  paint: {
                    "circle-radius": 4,
                    "circle-color": "#4d7ac9ff",
                    "circle-stroke-color": "#fff",
                    "circle-stroke-width": 1.5,
                  },
                });
              // popup on click
              map.current.on("click", "policlinic-points-circle", (e) => {
                const feature = e.features?.[0];
                if (!feature) return;
                setBuildingData(feature.properties);
                setShowDetailCard(!showDetailCard);
              });
              // change cursor on hover
              map.current.on("mouseenter", "policlinic-points-circle", () => {
                map.current.getCanvas().style.cursor = "pointer";
              });
              map.current.on("mouseleave", "policlinic-points-circle", () => {
                map.current.getCanvas().style.cursor = "";
              });
            }
          };
          
          // ✅ Wait until style is ready before adding layers
          if (!map.current.isStyleLoaded()) {
            map.current.once("load", addOrUpdateLayers);
          } else {
            addOrUpdateLayers();
          }
      };
        fetchAndRender();
  }, [selectedDistrict]);

  return <div className="w-full h-full rounded-lg shadow" ref={mapContainer} />;
}
