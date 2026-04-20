"use client";

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMapInitialization } from '../../hooks/useMapInitialization';
import { useMapData } from '../../hooks/useMapData';
import { MapLayersManager } from '../../utils/mapLayers';
import { useHealthcareData } from '../../hooks/useHealthcareData';
import { MapControls } from '../comps/MapControls';
import { MapLegend } from '../comps/MapLegend';
import { LoadingOverlay } from '../comps/LoadingOverlay';
import {
  clearFeatureStates,
  setupPolygonLayers,
  setupPointLayers,
  createPopup,
  updateFeatureStates,
  setupAdminLayers,
} from '../../utils/mapLayers';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapView({
  setBuildingData,
  setShowDetailCard,
  showDetailCard,
  selectedDistrict,
  selectedLayers,
  selectedVisits,
  selectedAffiliations, 
  setTotalCount,
  setTotalPopulation,
  setAvgVisit,
  setAvgPerson,
}) {
  const mapContainer = useRef(null);
  const { mapRef, isLoading: mapLoading, zoomIn, zoomOut, resetView } = useMapInitialization(mapContainer);
  const { loadInitialData, filterData, loading: dataLoading } = useMapData(); 

  const selectedMarkerRef = useRef(null);
  const polygonMappingRef = useRef({});
  const popupRef = useRef(null);

  const isLoading = mapLoading || dataLoading;

  useEffect(() => {
    if (!mapRef.current) return;

    const updateMap = async () => {
      const map = mapRef.current;
      
      await loadInitialData();
      
      const data = filterData({
        districts: selectedDistrict,
        visits: selectedVisits,
        layers: selectedLayers,
        affiliations: selectedAffiliations
      });

      if (!data) return;

      const isAll = selectedLayers.includes("Все слои");

      MapLayersManager.setupCityBoundary(map, data.city);
      
      MapLayersManager.updateDistricts(map, data.districts);

      const showTransit = isAll || selectedLayers.includes("Зоны обслуживания МО");
      MapLayersManager.updateServiceZones(map, data.serviceZones, showTransit);

      const showGenplan = isAll || selectedLayers.includes("Зоны здравоохранения (генплан)");
      MapLayersManager.updatePlannedZones(map, data.plannedZones, showGenplan);

      const showPlannedObjs = isAll || selectedLayers.includes("Планируемые объекты здравоохранения");
      MapLayersManager.updatePlannedObjects(map, data.plannedObjs, showPlannedObjs);

      const showZhk = isAll || selectedLayers.includes("Планируемые жилые объекты (ЖКХ)");
      MapLayersManager.updateZhkPoints(map, data.zhk, showZhk);

      MapLayersManager.updatePmspPoints(map, data.pmsp, true);

      if (map.getLayer('planned-objs-cluster-circle')) {
        MapLayersManager.setupClusterClicks(map, 'planned-objs');
      }
      if (map.getLayer('zhk-points-cluster-circle')) {
          MapLayersManager.setupClusterClicks(map, 'zhk-points');
      }

      setTotalCount(data.stats.totalCount);
      setTotalPopulation(data.stats.totalPopulation);
      setAvgVisit(data.stats.avgVisit);
      setAvgPerson(data.stats.avgPerson);

      const onMapClick = (e) => {
        const layers = [
          'pmsp-layer', 
          'zhk-points-unclustered-circle', 
          'planned-objs-unclustered-circle'
        ];

        const features = map.queryRenderedFeatures(e.point, { layers });

        if (features.length > 0) {
          const feature = features[0];
          const props = feature.properties;

          new maplibregl.Popup({ offset: 10, closeButton: false })
            .setLngLat(e.lngLat)
            .setHTML(MapLayersManager.getPopupContent(props))
            .addTo(map);

          if (feature.layer.id === 'pmsp-layer') {
            setBuildingData(props);
            setShowDetailCard(true);
          }
        }
      };

      map.off('click', onMapClick); 
      map.on('click', onMapClick);

      const onMouseEnter = () => { map.getCanvas().style.cursor = 'pointer'; };
      const onMouseLeave = () => { map.getCanvas().style.cursor = ''; };
      
      map.on('mouseenter', 'pmsp-layer', onMouseEnter);
      map.on('mouseleave', 'pmsp-layer', onMouseLeave);
    };

    if (mapRef.current.isStyleLoaded()) updateMap();
    else mapRef.current.once('load', updateMap);

  }, [selectedDistrict, selectedVisits, selectedLayers, selectedAffiliations, loadInitialData]);

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
