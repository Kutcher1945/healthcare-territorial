"use client";

import { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMapInitialization } from '../../hooks/useMapInitialization';
import { useMapData } from '../../hooks/useMapData';
import { MapLayersManager } from '../../utils/mapLayers';
import { useHealthcareData } from '../../hooks/useHealthcareData';
import { MapControls } from '../comps/MapControls';
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

const MapView = forwardRef(({
  setBuildingData = () => {},
  setShowDetailCard = () => {},
  showDetailCard,
  selectedDistrict = ["Все районы"],
  selectedLayers = ["Все слои"],
  selectedVisits = ["Все посещения"],
  selectedAffiliations = ["Все принадлежности"], 
  setTotalCount = () => {},
  setTotalPopulation = () => {},
  setAvgVisit = () => {},
  setAvgPerson = () => {},
  onDataUpdate = () => {},
  mode = "load",
}, ref) => {
  const mapContainer = useRef(null);
  const { mapRef, isLoading: mapLoading, zoomIn, zoomOut, resetView } = useMapInitialization(mapContainer);
  const { loadInitialData, filterData, loading: dataLoading } = useMapData(); 
  const activePopupRef = useRef(null);

  const selectedMarkerRef = useRef(null);
  const polygonMappingRef = useRef({});
  const popupRef = useRef(null);

  const isLoading = mapLoading || dataLoading;

  const removeExistingPopup = () => {
    if (activePopupRef.current) {
      activePopupRef.current.remove();
      activePopupRef.current = null;
    }
  };

  useImperativeHandle(ref, () => ({
    zoomToLocation: (item) => {
      if (!mapRef.current) return;

      const lng = parseFloat(item.lng || item.longitude);
      const lat = parseFloat(item.lat || item.latitude);

      if (isNaN(lng) || isNaN(lat)) return;

      removeExistingPopup();

      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        essential: true
      });

      activePopupRef.current = new maplibregl.Popup({ offset: 10, closeButton: true })
        .setLngLat([lng, lat])
        .setHTML(MapLayersManager.getPopupContent(item))
        .addTo(mapRef.current);
        
      if (item.unified_id || item.id) {
          setBuildingData(item);
          setShowDetailCard(true);
      }
    }
  }));

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
      if (onDataUpdate) onDataUpdate(data);

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

      if (mode === "infrastructure") {
        MapLayersManager.updateInfrastructureLayers(map, data.pmsp, true);
        MapLayersManager.hideServiceZones(map);
        if (map.getLayer('pmsp-layer')) map.setLayoutProperty('pmsp-layer', 'visibility', 'none');
      } else {
        MapLayersManager.updatePmspPoints(map, data.pmsp, true);
        if (map.getLayer('infra-points')) map.setLayoutProperty('infra-points', 'visibility', 'none');
      }

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
          'infra-points',
          'zhk-points-unclustered-circle', 
          'planned-objs-unclustered-circle'
        ];

        const activeLayers = layers.filter(layerId => map.getLayer(layerId));
        if (activeLayers.length === 0) return;

        // const features = map.queryRenderedFeatures(e.point, { layers });
        const features = map.queryRenderedFeatures(e.point, { layers: activeLayers });
        
        if (features.length > 0) {
          const feature = features[0];
          const props = feature.properties;

          removeExistingPopup();

          activePopupRef.current = new maplibregl.Popup({ offset: 10, closeButton: true })
            .setLngLat(e.lngLat)
            .setHTML(MapLayersManager.getPopupContent(props))
            .addTo(map);

          // if (feature.layer.id === 'pmsp-layer'|| feature.layer.id === 'infra-points') {
          //   setBuildingData(props);
          //   setShowDetailCard(true);
          // }
        }
      };

      map.off('click', onMapClick); 
      map.on('click', onMapClick);

      const onMouseEnter = () => { map.getCanvas().style.cursor = 'pointer'; };
      const onMouseLeave = () => { map.getCanvas().style.cursor = ''; };
      
      map.on('mouseenter', 'pmsp-layer', onMouseEnter);
      map.on('mouseleave', 'pmsp-layer', onMouseLeave);
      map.on('mouseenter', 'infra-points', onMouseEnter);
      map.on('mouseleave', 'infra-points', onMouseLeave);
      map.on('mouseenter', 'zhk-points-unclustered-circle', onMouseEnter);
      map.on('mouseleave', 'zhk-points-unclustered-circle', onMouseLeave);
      map.on('mouseenter', 'planned-objs-unclustered-circle', onMouseEnter);
      map.on('mouseleave', 'planned-objs-unclustered-circle', onMouseLeave);
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

      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
});

export default MapView;
