"use client";

import { useEffect, useRef } from 'react';
import { useMapInitialization } from '../../hooks/useMapInitialization';
import { useRecomendationsData } from '../../hooks/useRecomendationsData';
import { MapControls } from '../comps/MapControls';
import { MapLegend } from './MapLegend';
import { LoadingOverlay } from '../comps/LoadingOverlay';
import {
  clearFeatureStates,
  setupPolygonLayers,
  setupPointLayers,
  createPopup,
  updateFeatureStates,
} from '../../utils/mapLayers';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapViewRecomendations({
  moData,
  setMoData,
  selectedDistrict,
}) {
  const mapContainer = useRef(null);
  const { mapRef, isLoading: mapLoading, zoomIn, zoomOut, resetView } = useMapInitialization(mapContainer);
  const { fetchHealthcareData, isLoading: dataLoading } = useRecomendationsData();

  const selectedMarkerRef = useRef(null); 
  const polygonMappingRef = useRef({});
  const popupRef = useRef(null);

  const allPointsRef = useRef([]);

  const isLoading = mapLoading || dataLoading;

  useEffect(() => {
    if (!mapRef.current) return;

    const fetchAndRender = async () => {
      selectedMarkerRef.current = null;

      try {
        const data = await fetchHealthcareData("Все районы");

        allPointsRef.current = data.points.features;

        const addOrUpdateLayers = () => {
          const map = mapRef.current;

          const oldPolygonMapping = { ...polygonMappingRef.current };

          polygonMappingRef.current = data.polygonMapping;

          clearFeatureStates(map, oldPolygonMapping);

          setupPolygonLayers(map, data.polygons);
          setupPointLayers(map, data.points);

          const handlePointClick = (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            if (popupRef.current) {
              popupRef.current.remove();
            }

            popupRef.current = createPopup(map, feature, e.lngLat);

            const newMarkerId = feature.properties.id;

            updateFeatureStates(
              map,
              selectedMarkerRef.current,
              newMarkerId,
              polygonMappingRef.current
            );

            selectedMarkerRef.current = newMarkerId;

            setMoData(feature.properties);

            map.flyTo({
              center: feature.geometry.coordinates,
              zoom: Math.max(map.getZoom(), 13),
              duration: 1000,
            });
          };

          const handleMouseEnter = () => {
            map.getCanvas().style.cursor = 'pointer';
          };

          const handleMouseLeave = () => {
            map.getCanvas().style.cursor = '';
          };

          map.off('click', 'policlinic-points-circle', handlePointClick);
          map.off('mouseenter', 'policlinic-points-circle', handleMouseEnter);
          map.off('mouseleave', 'policlinic-points-circle', handleMouseLeave);

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
  }, [selectedDistrict, fetchHealthcareData, setMoData, mapRef]);


  useEffect(() => {
    const map = mapRef.current;
    if (!map ) return;

    if (!moData) {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      
      clearFeatureStates(map, polygonMappingRef.current);
      selectedMarkerRef.current = null;

      resetView(); 
      return;
    }

    const feature = allPointsRef.current.find(f => f.properties.id === moData.id);
    
    if (feature) {
      const coords = feature.geometry.coordinates;
      if (popupRef.current) popupRef.current.remove();

      popupRef.current = createPopup(map, feature, { lng: coords[0], lat: coords[1] });

      updateFeatureStates(
        map,
        selectedMarkerRef.current,
        moData.id,
        polygonMappingRef.current
      );
      selectedMarkerRef.current = moData.id;

      map.flyTo({
        center: coords,
        zoom: 15,
        duration: 1500,
        essential: true
      });
    }
  }, [moData, mapRef, resetView]);

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
