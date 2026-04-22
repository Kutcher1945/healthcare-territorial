import maplibregl from 'maplibre-gl';

const updateIconPointLayer = (map, data, isVisible, id, color, showPlus = true) => {
  const sourceId = `${id}-source`;
  const clusterCircleId = `${id}-cluster-circle`;
  const clusterCountId = `${id}-cluster-count`;
  const unclusteredCircleId = `${id}-unclustered-circle`;
  const unclusteredPlusId = `${id}-unclustered-plus`;

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'geojson',
      data: data,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 40 
    });

    map.addLayer({
      id: clusterCircleId,
      type: 'circle',
      source: sourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': color,
        'circle-radius': ['step', ['get', 'point_count'], 12, 10, 18, 30, 25],
        'circle-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    map.addLayer({
      id: clusterCountId,
      type: 'symbol',
      source: sourceId,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count}',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: { 'text-color': '#fff' }
    });

    map.addLayer({
      id: unclusteredCircleId,
      type: 'circle',
      source: sourceId,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': color,
        'circle-radius': ['coalesce', ['get', 'radius'], 10],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.85
      }
    });

    if (showPlus) {
      map.addLayer({
        id: unclusteredPlusId,
        type: 'symbol',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': '+',
          'text-size': 18,
          'text-font': ['Open Sans Bold'],
          'text-allow-overlap': true,
          'text-offset': [0, 0]
        },
        paint: { 'text-color': '#ffffff' }
      });
    }
  } else {
    map.getSource(sourceId).setData(data);
  }

  const visibility = isVisible ? 'visible' : 'none';
  [clusterCircleId, clusterCountId, unclusteredCircleId, unclusteredPlusId].forEach(layer => {
    if (map.getLayer(layer)) {
      map.setLayoutProperty(layer, 'visibility', visibility);
    }
  });
};

export const MapLayersManager = {
  setupCityBoundary: (map, data) => {
    if (map.getSource('city-source')) return;
    map.addSource('city-source', { type: 'geojson', data });
    map.addLayer({
      id: 'city-layer',
      type: 'line',
      source: 'city-source',
      paint: { 'line-color': '#3b82f6', 'line-width': 2 }
    });
  },

  updateDistricts: (map, data) => {
    if (!map.getSource('districts-source')) {
      map.addSource('districts-source', { type: 'geojson', data });
      map.addLayer({
        id: 'districts-layer-line',
        type: 'line',
        source: 'districts-source',
        paint: { 'line-color': '#6ca3fa', 'line-width': 1 }
      });
    } else {
      map.getSource('districts-source').setData(data);
    }
  },

  updatePlannedZones: (map, data, isVisible) => {
    if (!map.getSource('planned-source')) {
      map.addSource('planned-source', { type: 'geojson', data });
      map.addLayer({
        id: 'planned-fill',
        type: 'fill',
        source: 'planned-source',
        paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.15 }
      });
      map.addLayer({
        id: 'planned-line',
        type: 'line',
        source: 'planned-source',
        paint: { 'line-color': '#b91c1c', 'line-width': 2, 'line-dasharray': [2, 2] }
      });
    }
    const visibility = isVisible ? 'visible' : 'none';
    map.setLayoutProperty('planned-fill', 'visibility', visibility);
    map.setLayoutProperty('planned-line', 'visibility', visibility);
  },

  updatePmspPoints: (map, data, isVisible) => {
    if (!map.getSource('pmsp-source')) {
      map.addSource('pmsp-source', { type: 'geojson', data });
      map.addLayer({
        id: 'pmsp-layer',
        type: 'circle',
        source: 'pmsp-source',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 6,
          'circle-stroke-width': ['get', 'stroke_width'],
          'circle-stroke-color': ['get', 'stroke_color'],
        }
      });
    } else {
      map.getSource('pmsp-source').setData(data);
    }
    map.setLayoutProperty('pmsp-layer', 'visibility', isVisible ? 'visible' : 'none');
  },

  getPopupContent: (props) => {

    if (props.bld_main_priority) {
      const color = props.bld_main_priority === 'критично' ? '#C62828' : 
                    props.bld_main_priority === 'риск' ? '#EF6C00' : '#2E7D32';
      
      return `
        <div style="padding: 10px; min-width: 200px; font-family: sans-serif;">
          <div style="font-weight: bold; font-size: 13px; margin-bottom: 5px; color: #333;">
            ${props.name || 'Медицинский объект'}
          </div>
          <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 8px;">
            <span style="background: ${color}; color: white; font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">
              ${props.bld_main_priority}
            </span>
          </div>
          <div style="font-size: 11px; color: #666; line-height: 1.4;">
            <div>Район: <b>${props.district || '—'}</b></div>
            <div>Площадь: <b>${props.total_area_sq_m_field || '—'} м²</b></div>
            ${props.bld_year_built ? `<div>Год постройки: <b>${props.bld_year_built}</b></div>` : ''}
          </div>
          ${props.priority_reason ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 10px; color: #C62828; font-weight: bold;">
              ⚠️ ${props.priority_reason}
            </div>
          ` : ''}
        </div>
      `;
    }
    
    if (props.layerType === 'zhkh') {
      return `
        <div style="padding: 8px; min-width: 200px;">
          <div style="font-weight: bold; color: #1565C0; margin-bottom: 4px;">🏠 ${props.name}</div>
          <div style="font-size: 10px; color: #666; margin-bottom: 6px;">📍 ${props.district}</div>
          <div style="font-size: 11px; line-height: 1.4;">
            ${props.flats ? `<div>Квартир: <b>${props.flats}</b></div>` : ''}
            ${props.floors ? `<div>Этажей: <b>${props.floors}</b></div>` : ''}
            ${props.deadline ? `<div style="margin-top:4px">Срок: <b>${props.deadline}</b></div>` : ''}
          </div>
        </div>`;
    }

    // 2. Попап для Планируемых объектов
    if (props.layerType === 'planned') {
      return `
        <div style="padding: 8px; min-width: 220px;">
          <div style="font-weight: bold; margin-bottom: 4px;">📋 ${props.name}</div>
          <div style="display: flex; gap: 4px; margin-bottom: 8px;">
            <span style="background: #e3f2fd; color: #1565c0; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
              ${props.work_type || 'Объект'}
            </span>
          </div>
          <div style="font-size: 11px;">
            <div>Район: <b>${props.district}</b></div>
            ${props.capacity ? `<div style="margin-top:2px text-blue-600">Мощность: <b>${props.capacity} пос/см.</b></div>` : ''}
          </div>
        </div>`;
    }

    // 3. Попап для PMSP (Текущие)
    return `
      <div style="padding: 8px; min-width: 180px;">
        <div style="font-weight: bold; font-size: 13px; margin-bottom: 2px;">${props.name}</div>
        <div style="font-size: 10px; color: #888; margin-bottom: 8px;">${props.district} район</div>
        <div style="display: grid; grid-cols: 2; gap: 10px; border-top: 1px solid #eee; pt-2;">
           <div>
             <div style="font-size: 9px; color: #aaa; text-transform: uppercase;">Посещ.</div>
             <div style="font-weight: bold; color: #C62828;">${props.cap_load}%</div>
           </div>
           <div>
             <div style="font-size: 9px; color: #aaa; text-transform: uppercase;">Врачи</div>
             <div style="font-weight: bold; color: #EF6C00;">${props.doctor_load}%</div>
           </div>
        </div>
      </div>`;
  },

  updatePlannedObjects: (map, data, isVisible) => {
    updateIconPointLayer(map, data, isVisible, 'planned-objs', '#f97316', true);
  },

  updateZhkPoints: (map, data, isVisible) => {
    updateIconPointLayer(map, data, isVisible, 'zhk-points', '#3b82f6', false);
  },

  setupClusterClicks: (map, id) => {
    const clusterLayerId = `${id}-cluster-circle`;
    const sourceId = `${id}-source`;

    map.on('click', clusterLayerId, async (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [clusterLayerId] });
      const clusterId = features[0].properties.cluster_id;
      
      const expansionZoom = await map.getSource(sourceId).getClusterExpansionZoom(clusterId);
      
      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: expansionZoom
      });
    });

    map.on('mouseenter', clusterLayerId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', clusterLayerId, () => { map.getCanvas().style.cursor = ''; });
  },

  updateServiceZones: (map, data, isVisible) => {
    if (!map.getSource('service-zones-source')) {
      map.addSource('service-zones-source', { type: 'geojson', data });
      map.addLayer({
        id: 'service-zones-fill',
        type: 'fill',
        source: 'service-zones-source',
        paint: {
          'fill-color': ['get', 'fill_color'],
          'fill-opacity': ['get', 'fill_opacity'],
          'fill-outline-color': ['get', 'stroke_color']
        }
      });
    } else {
      map.getSource('service-zones-source').setData(data);
    }
    map.setLayoutProperty('service-zones-fill', 'visibility', isVisible ? 'visible' : 'none');
  },

  updateInfrastructureLayers: (map, data, isVisible) => {
    const layerId = 'infra-points';
    const sourceId = 'infra-source';

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: data
      });

      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          // 1. Цвет круга в зависимости от состояния здания (priority)
          'circle-color': [
            'match',
            ['get', 'bld_main_priority'],
            'критично', '#C62828', // Красный
            'риск', '#EF6C00',     // Оранжевый
            'норма', '#2E7D32',    // Зеленый
            '#9E9E9E'              // Серый (если нет данных)
          ],
          
          // 2. Радиус круга в зависимости от площади здания (area)
          'circle-radius': [
            'step',
            ['coalesce', ['get', 'total_area_sq_m_field'], 0],
            6, 500,    // 6px если площадь < 500
            8, 2000,   // 8px если площадь < 2000
            11, 5000,  // 11px если площадь < 5000
            14         // 14px если площадь больше 5000
          ],
          
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.9
        }
      });
    } else {
      // Если источник уже есть, просто обновляем данные
      map.getSource(sourceId).setData(data);
    }

    // Управление видимостью
    const visibility = isVisible ? 'visible' : 'none';
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visibility);
    }
  },

  hideServiceZones: (map) => {
    if (map.getLayer('service-zones-fill')) {
      map.setLayoutProperty('service-zones-fill', 'visibility', 'none');
    }
  }
};

export const setupAdminLayers = (map, cityData, districtsData) => {
  if (cityData && !map.getSource('city-boundary')) {
    map.addSource('city-boundary', { type: 'geojson', data: cityData });
    map.addLayer({
      id: 'city-boundary-line',
      type: 'line',
      source: 'city-boundary',
      paint: {
        'line-color': '#3b82f6',
        'line-width': 3,
        'line-dasharray': [2, 1]
      }
    });
  }

  if (districtsData && !map.getSource('districts-layer')) {
    map.addSource('districts-layer', { type: 'geojson', data: districtsData });

    map.addLayer({
      id: 'districts-fill',
      type: 'fill',
      source: 'districts-layer',
      paint: {
        'fill-color': '#6b7280',
        'fill-opacity': 0.05
      }
    }, 'city-boundary-line');

    map.addLayer({
      id: 'districts-line',
      type: 'line',
      source: 'districts-layer',
      paint: {
        'line-color': '#9ca3af',
        'line-width': 1
      }
    }, 'city-boundary-line');
  }
};

export const clearFeatureStates = (map, polygonMapping) => {
  if (!map.getSource('policlinic-polygons')) return;

  Object.values(polygonMapping).flat().forEach((polygonId) => {
    try {
      map.removeFeatureState({
        source: 'policlinic-polygons',
        id: polygonId,
      });
    } catch (err) {
    }
  });

  Object.keys(polygonMapping).forEach((pointId) => {
    try {
      map.removeFeatureState({
        source: 'policlinic-points',
        id: parseInt(pointId),
      });
    } catch (err) {
    }
  });
};

export const setupPolygonLayers = (map, polygons) => {
  if (map.getSource('policlinic-polygons')) {
    map.getSource('policlinic-polygons').setData(polygons);
  } else {
    map.addSource('policlinic-polygons', {
      type: 'geojson',
      data: polygons,
    });

    map.addLayer({
      id: 'policlinic-polygons-fill',
      type: 'fill',
      source: 'policlinic-polygons',
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          '#22c55e',
          ['get', 'original_color'],
        ],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          0.5,
          0.1,
        ],
      },
    }); 

    map.addLayer({
      id: 'policlinic-polygons-outline',
      type: 'line',
      source: 'policlinic-polygons',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          '#16a34a',
          ['get', 'color'],
        ],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          3,
          1.5,
        ],
        'line-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          0.8,
          0.4,
        ],
      },
    });
  }
};

export const setupPointLayers = (map, points) => {
  if (map.getSource('policlinic-points')) {
    map.getSource('policlinic-points').setData(points);
  } else {
    map.addSource('policlinic-points', {
      type: 'geojson',
      data: points,
    });

    map.addLayer({
      id: 'policlinic-points-circle',
      type: 'circle',
      source: 'policlinic-points',
      paint: {
        'circle-radius': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          8,
          6,
        ],
        'circle-color': ['get', 'color'],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-opacity': 0.9,
      },
    });
  }
};

export const createPopup = (map, feature, lngLat) => {
  const photoUrl = feature.properties.photo;
  const popup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: true,
    className: 'custom-popup',
    maxWidth: '240px',
  })
    .setLngLat(lngLat)
    .setHTML(`
      <div class="p-2 w-[220px]">
        <img
          src="${photoUrl}"
          alt="${feature.properties.name}"
          class="w-full h-28 object-cover rounded-md mb-2 shadow-sm"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27100%27%3E%3Crect fill=%27%23ddd%27 width=%27200%27 height=%27100%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27%3ENo Image%3C/text%3E%3C/svg%3E'"
        />
        <h5 class="font-semibold text-[12px] mb-1 text-gray-800">${feature.properties.name}</h5>
        <p class="text-[10px] text-gray-600 mb-2 text-left pl-5"> <b class="text-black">Адрес:</b> ${feature.properties.address}</p>
      </div>
    `)
    .addTo(map);

  return popup;
};

export const updateFeatureStates = (
  map,
  previousMarkerId,
  newMarkerId,
  polygonMapping
) => {
  if (previousMarkerId !== null && previousMarkerId !== newMarkerId) {
    try {
      map.setFeatureState(
        { source: 'policlinic-points', id: previousMarkerId },
        { selected: false }
      );

      const previousPolygonIds = polygonMapping[previousMarkerId] || [];
      previousPolygonIds.forEach((polygonId) => {
        try {
          map.setFeatureState(
            { source: 'policlinic-polygons', id: polygonId },
            { selected: false }
          );
        } catch (err) {
        }
      });
    } catch (err) {
      console.warn('Error resetting previous marker:', err);
    }
  }

  try {
    map.setFeatureState(
      { source: 'policlinic-points', id: newMarkerId },
      { selected: true }
    );

    const newPolygonIds = polygonMapping[newMarkerId] || [];
    newPolygonIds.forEach((polygonId) => {
      try {
        map.setFeatureState(
          { source: 'policlinic-polygons', id: polygonId },
          { selected: true }
        );
      } catch (err) {
      }
    });
  } catch (err) {
    console.warn('Error setting new marker:', err);
  }
};
