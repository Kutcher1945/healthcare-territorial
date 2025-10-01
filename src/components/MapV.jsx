"use client";

import { useEffect, useRef, useState } from 'react';
import { useMapInitialization } from '../hooks/useMapInitialization';
import { useHealthcareData } from '../hooks/useHealthcareData';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { LoadingOverlay } from './LoadingOverlay';
import {
  clearFeatureStates,
  setupPolygonLayers,
  setupPointLayers,
  createPopup,
  updateFeatureStates,
} from '../utils/mapLayers';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapView({
  setBuildingData,
  setShowDetailCard,
  showDetailCard,
  selectedDistrict,
  setTotalCount,
  setTotalPopulation,
  setAvgVisit,
  setAvgPerson,
}) {
  const mapContainer = useRef(null);
  const { mapRef, isLoading: mapLoading, zoomIn, zoomOut, resetView } = useMapInitialization(mapContainer);
  const { fetchHealthcareData, isLoading: dataLoading } = useHealthcareData();

  const [selectedMarker, setSelectedMarker] = useState(null);
  const selectedMarkerRef = useRef(null); // Track current selected marker
  const polygonMappingRef = useRef({});
  const popupRef = useRef(null);

  const isLoading = mapLoading || dataLoading;

  // Fetch and render data when district changes
  useEffect(() => {
    if (!mapRef.current) return;

    const fetchAndRender = async () => {
      // Reset selection when changing district
      setSelectedMarker(null);
      selectedMarkerRef.current = null;

      try {
        const data = await fetchHealthcareData(selectedDistrict);

        // Update stats
        setTotalCount(data.stats.totalCount);
        setTotalPopulation(data.stats.totalPopulation);
        setAvgVisit(data.stats.avgVisit);
        setAvgPerson(data.stats.avgPerson);

        const addOrUpdateLayers = () => {
          const map = mapRef.current;

          // Save old mapping before updating
          const oldPolygonMapping = { ...polygonMappingRef.current };

          // Update polygon mapping FIRST
          polygonMappingRef.current = data.polygonMapping;

          // Clear all feature states using old mapping
          clearFeatureStates(map, oldPolygonMapping);

          setupPolygonLayers(map, data.polygons);
          setupPointLayers(map, data.points);

          // Click handler
          const handlePointClick = (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            // Remove existing popup
            if (popupRef.current) {
              popupRef.current.remove();
            }

            // Create new popup
            popupRef.current = createPopup(map, feature, e.lngLat);

            const newMarkerId = feature.properties.id;

            // IMPORTANT: Use selectedMarkerRef.current which always has the latest value
            // selectedMarker state might be stale in the closure
            updateFeatureStates(
              map,
              selectedMarkerRef.current,
              newMarkerId,
              polygonMappingRef.current
            );

            // Update both state and ref
            setSelectedMarker(newMarkerId);
            selectedMarkerRef.current = newMarkerId;

            setBuildingData(feature.properties);
            setShowDetailCard(true);

            // Fly to location
            map.flyTo({
              center: feature.geometry.coordinates,
              zoom: Math.max(map.getZoom(), 13),
              duration: 1000,
            });
          };

          // Hover handlers
          const handleMouseEnter = () => {
            map.getCanvas().style.cursor = 'pointer';
          };

          const handleMouseLeave = () => {
            map.getCanvas().style.cursor = '';
          };

          // Remove existing listeners
          map.off('click', 'policlinic-points-circle', handlePointClick);
          map.off('mouseenter', 'policlinic-points-circle', handleMouseEnter);
          map.off('mouseleave', 'policlinic-points-circle', handleMouseLeave);

          // Attach new listeners
          map.on('click', 'policlinic-points-circle', handlePointClick);
          map.on('mouseenter', 'policlinic-points-circle', handleMouseEnter);
          map.on('mouseleave', 'policlinic-points-circle', handleMouseLeave);
        };

        if (!mapRef.current.isStyleLoaded()) {
          mapRef.current.once('load', addOrUpdateLayers);
        } else {
          addOrUpdateLayers();
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    };

    fetchAndRender();
  }, [selectedDistrict, fetchHealthcareData, setBuildingData, setShowDetailCard, setTotalCount, setTotalPopulation, setAvgVisit, setAvgPerson]);

  return (
    <div className="relative w-full h-full">
      <MapControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetView}
      />

      <div
        className="w-full h-full"
        ref={mapContainer}
      />

      <MapLegend />

      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
}
