"use client";

import { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMapInitialization } from '../../hooks/useMapInitialization';
import { useMapData } from '../../hooks/useMapData';
import { MapLayersManager } from '../../utils/mapLayers';
import { MapControls } from '../comps/MapControls';
import { LoadingOverlay } from '../comps/LoadingOverlay';
import { HealthcareService } from '../../services/apiService';
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
  geoMode = "",
  mode = "load",
}, ref) => {
  const mapContainer = useRef(null);
  const { mapRef, isLoading: mapLoading, zoomIn, zoomOut, resetView } = useMapInitialization(mapContainer);
  const {filterData, isLoading: dataLoading, isReady, data: rawCacheData } = useMapData(mode); 
  const activePopupRef = useRef(null);
  const showFullLoader = mapLoading || !isReady;

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
    if (!mapRef.current || !isReady) return;

    const updateMap = async () => {
      const map = mapRef.current;
      
      const data = filterData({
        districts: selectedDistrict,
        visits: selectedVisits,
        layers: selectedLayers,
        affiliations: selectedAffiliations
      });

      if (!data || !data.city) return;
      if (onDataUpdate) onDataUpdate(data);

      MapLayersManager.setupCityBoundary(map, data.city);
      MapLayersManager.updateDistricts(map, data.districts);

      

      const isAll = selectedLayers.includes("Все слои");

      const showTransit = isAll || selectedLayers.includes("Зоны обслуживания МО");
      // MapLayersManager.updateServiceZones(map, data.serviceZones, showTransit);

      const showGenplan = isAll || selectedLayers.includes("Зоны здравоохранения (генплан)");
      // MapLayersManager.updatePlannedZones(map, data.plannedZones, showGenplan);

      const showPlannedObjs = isAll || selectedLayers.includes("Планируемые объекты здравоохранения");
      // MapLayersManager.updatePlannedObjects(map, data.plannedObjs, showPlannedObjs);

      const showZhk = isAll || selectedLayers.includes("Планируемые жилые объекты (ЖКХ)");
      // MapLayersManager.updateZhkPoints(map, data.zhk, showZhk);
      if (data.serviceZones) {
        MapLayersManager.updateServiceZones(map, data.serviceZones, showTransit);
      }
      if (data.plannedZones) {
        MapLayersManager.updatePlannedZones(map, data.plannedZones, showGenplan);
      }
      if (data.plannedObjs) {
        MapLayersManager.updatePlannedObjects(map, data.plannedObjs, showPlannedObjs);
      }
      if (data.zhk) {
        MapLayersManager.updateZhkPoints(map, data.zhk, showZhk);
      }

      if (mode === "geo-analysis") {
        MapLayersManager.hideServiceZones(map);
        const isWalk = geoMode === "walkaccess";
        const isDeficit = geoMode === "deficit";

        if (data.grid) {
          MapLayersManager.updateGridLayer(map, data.grid, isWalk);
        }

        if (data.heatDeficit && data.heatCoverage) {
          MapLayersManager.updateHeatmapLayer(map, data.heatDeficit, isDeficit, 'deficit', ['#FDD835', '#EF6C00', '#C62828']);
          MapLayersManager.updateHeatmapLayer(map, data.heatCoverage, isDeficit, 'coverage', ['#A5D6A7', '#43A047', '#1B5E20']);
        }

        MapLayersManager.updateGeoMarkers(map, data.pmsp, true);
      }

      if (mode === "infrastructure") {
        MapLayersManager.updateInfrastructureLayers(map, data.pmsp, true);
        MapLayersManager.hideServiceZones(map);
        if (map.getLayer('pmsp-layer')) map.setLayoutProperty('pmsp-layer', 'visibility', 'none');
      } else if (mode !== "geo-analysis") {
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

      const onMapClick = async (e) => {
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
          const { id, unified_id } = feature.properties;
          const layerId = feature.layer.id;
          const targetId = unified_id || id;
          removeExistingPopup();
          // const loadingPopup = new maplibregl.Popup({ offset: 10, closeButton: true })
          //   .setLngLat(e.lngLat)
          //   .setHTML('<div style="padding:20px; text-align:center;">Загрузка данных...</div>')
          //   .addTo(map);
          const popup = new maplibregl.Popup({ 
            offset: 10, 
            closeButton: true, 
            maxWidth: '450px'
          })
            .setLngLat(e.lngLat)
            .setHTML(MapLayersManager.getPopupContent(props)) // Сначала базовый контент
            .addTo(map);
          activePopupRef.current = popup;
          if (layerId === 'pmsp-layer' || layerId === 'infra-points') {
            try {
              popup.setHTML(MapLayersManager.getPopupContent(props) + 
                '<div style="text-align:center; color:#1565C0; font-size:10px; padding:5px;">⌛ Загрузка деталей...</div>');

              const detailedData = await HealthcareService.getPmspDetail(targetId);
              
              popup.setHTML(MapLayersManager.getPopupContent(detailedData));
              
              // Синхронизируем с правой карточкой
              // setBuildingData(detailedData);
              // setShowDetailCard(true);

            } catch (err) {
              console.error("Ошибка загрузки:", err);
              popup.setHTML(MapLayersManager.getPopupContent(props)); // Оставляем базовые если ошибка
            }
          }
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

  }, [selectedDistrict, selectedVisits, selectedLayers, selectedAffiliations, mode, geoMode, filterData, isReady, rawCacheData]);

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

      <LoadingOverlay isLoading={showFullLoader} />
    </div>
  );
});

export default MapView;
