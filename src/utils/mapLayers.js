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
    if (!data || !data.features) return; 
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
    if (!data || !data.features) return; 
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
    if (!data || !data.features) return; 
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
    if (!data || !data.features) return; 
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

  _getBadge: (val, thresholds, labels, classes) => {
    for (let i = 0; i < thresholds.length; i++) {
      if (val < thresholds[i]) return `<span class="badge ${classes[i]}">${labels[i]}</span>`;
    }
    return `<span class="badge ${classes[classes.length - 1]}">${labels[labels.length - 1]}</span>`;
  },

  getPopupContent: (d) => {
    if (d.layerType === 'zhkh') {
      const details = [
        d.flats > 0 ? `Квартир: <b>${d.flats}</b>` : '',
        d.floors > 0 ? `Этажей: <b>${d.floors}</b>` : '',
        d.blocks > 0 ? `Секций: <b>${d.blocks}</b>` : '',
      ].filter(Boolean).join(' &nbsp;·&nbsp; ');

      return `
        <div style="padding: 10px; min-width: 320px; font-family: sans-serif; line-height: 1.5; text-align:left;">
          <div style="font-weight: bold; font-size: 15px; color: #333; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
            <span style="font-size: 18px;">🏠</span> 
            <span>${d.name}</span>
          </div>
          
          <div style="margin-bottom: 12px;">
            <span style="background: #E3F2FD; color: #1565C0; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">
              МЖК / Жилой дом
            </span>
          </div>

          <div style="font-size: 13px; color: #333; margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
            <span style="color: #d32f2f;">📍</span>
            <b>${d.district}</b> ${d.address ? ' · ' + d.address : ''}
          </div>

          <div style="font-size: 13px; color: #555; margin-bottom: 4px;">
            ${details}
          </div>

          ${d.deadline ? `
            <div style="font-size: 13px; color: #333; margin-bottom: 8px;">
              Срок сдачи: <b>${d.deadline}</b>
            </div>
          ` : ''}

          <div style="font-size: 11px; color: #aaa; border-top: 1px solid #eee; pt-2; margin-top: 8px;">
            Реестр МЖКХ г. Алматы
          </div>
        </div>`;
    }

    if (d.layerType === 'planned') {
      const workTypeColors = {
        'Строительство':      '#1565C0',
        'Реконструкция':      '#6A1B9A',
        'Капитальный ремонт': '#E65100',
        'Сейсмоусиление':     '#BF360C',
        'Пристройка':         '#4527A0',
        'Экспертиза/ПСД':     '#37474F',
      };
      
      // Определяем цвет по статусу или типу работ
      const wtLabel = d.status || d.work_type || 'Объект';
      const wtColor = workTypeColors[wtLabel] || '#1565C0';
      const phaseColor = '#E65100'; // Для фазы/статуса из фото

      return `
        <div style="padding: 10px; min-width: 350px; font-family: sans-serif; line-height: 1.4;  text-align:left;">
          <div style="font-weight: bold; font-size: 15px; color: #333; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 8px;">
            <span style="font-size: 18px;">🏥</span> 
            <span>${d.name}</span>
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
            <span style="background: ${wtColor}22; color: ${wtColor}; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: bold;">
              ${wtLabel}
            </span>
            <span style="background: ${phaseColor}22; color: ${phaseColor}; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: bold;">
              ${d.phase || 'В планах'}
            </span>
            <span style="background: #eceff1; color: #546e7a; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: bold;">
              ${d.obj_type}
            </span>
          </div>

          <div style="font-size: 13px; color: #333; margin-bottom: 6px;">
            <b>${d.district}</b> ${d.address ? ' · ' + d.address : ''}
          </div>

          ${d.capacity ? `<div style="font-size: 13px; color: #333; margin-bottom: 4px;">Мощность: <b>${d.capacity} посещений/смену</b></div>` : ''}
          ${d.year ? `<div style="font-size: 13px; color: #333; margin-bottom: 6px;">Год завершения: <b>${d.year}</b></div>` : ''}

          ${d.addresses_deficit || d.is_pmsp ? `
            <div style="font-size: 12px; color: #333; margin-top: 8px;">
              <b>Решает дефицит ПМСП:</b> <span style="color: #2e7d32; font-weight: bold;">Да — новая ПМСП в новом мкр.</span>
            </div>
          ` : ''}

          <div style="font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px;">
            Источник: ${d.source || 'МБ'} · Бюджет города Алматы
          </div>
        </div>`;
    }

    if (d.cap_load !== undefined) {
      const nurseDiff = (d.norm_nurses || 0) - (d.nurse_fact || 0);
      
      const gapValue = Math.abs((d.doctor_load || 0) - d.cap_load);
      const gapBlock = gapValue >= 30 ? `
        <div style="background:#FFF3E0; border:1px solid #FFB74D; border-radius:6px; padding:8px; margin-bottom:10px; font-size:11px; color:#E65100;">
          <div style="display:flex; align-items:center; gap:5px;">
            <span>⚠️</span> <b>Разрыв: ${gapValue.toFixed(0)}%</b> — 
            ${d.doctor_load > d.cap_load ? 'Нагрузка на врачей выше посещаемости' : 'Посещаемость выше нагрузки на врачей'}
            (+${gapValue.toFixed(0)}%)
          </div>
        </div>
      ` : '';

      const demoBars = d.demo_stats?.bars ? `
        <div style="margin-top:10px;">
          <div style="display:flex; align-items:center; gap:5px; font-size:11px; margin-bottom:5px;">
            <span>👥</span> <b>Демография:</b> дети ${d.demo_stats.pct_children}% · ${d.demo_stats.pct_elderly}% пожилых
          </div>
          <div style="display:flex; align-items:flex-end; gap:2px; height:30px; background:#f9f9f9; padding:2px; border-radius:4px;">
            ${d.demo_stats.bars.map((bar, i) => {
              const colors = ['#81C784', '#81C784', '#64B5F6', '#64B5F6', '#64B5F6', '#FFB74D', '#FFB74D', '#E57373', '#E57373'];
              return `<div title="Группа ${i}: ${bar}%" style="flex:1; height:${bar}%; background:${colors[i] || '#ccc'}; border-radius:1px 1px 0 0;"></div>`;
            }).join('')}
          </div>
          <div style="display:flex; justify-content:space-between; font-size:8px; color:#aaa; margin-top:2px;">
            <span>0</span><span>20</span><span>40</span><span>60</span><span>80+</span>
          </div>
        </div>
      ` : '';

      const corpusBadge = d.total_locs > 1
        ? `<div style="font-size:11px;background:#E3F2FD;border-radius:4px;padding:3px 8px;margin-bottom:5px;color:#1565C0">
                Корпус МО · точек на карте: <b>${d.total_locs}</b>
               ${d.bld_count>1 ? ` · зданий в точке: <b>${d.bld_count}</b>`:''}
           </div>`
        : d.bld_count > 1
        ? `<div style="font-size:11px;color:#888;margin-bottom:4px"> ${d.bld_count} зданий в этой точке</div>`
        : ''
      ;

      const visBadge = MapLayersManager._getBadge(d.cap_load, [90, 110, 130, 150, 999], 
        ['Хорошо','Норма','Выше нормы','Перегруз','КРИТИЧНО'], ['bg-green','bg-lightgreen','bg-yellow','bg-orange','bg-red']);

      const docBadge = MapLayersManager._getBadge(d.doctor_load, [80, 100, 115, 130, 999], 
        ['Хорошо','Норма','Умеренно','Высокая','ПЕРЕГРУЗ'], ['bg-green','bg-lightgreen','bg-yellow','bg-orange','bg-red']);

      return `
        <div style="padding:5px; min-width:300px; font-family:sans-serif; line-height:1.4; text-align:left;">
          <div style="font-weight:bold; font-size:15px; color:#333;">${d.name}</div>
          <div style="font-size:12px; color:#888;">${d.district} | ${d.ownership}</div>
          ${corpusBadge}
          ${gapBlock}

          <div style="margin-bottom:8px; border-top:1px solid #eee; pt-2;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:13px; font-weight:semibold">Посещаемость:</span>
              ${visBadge}
              <span style="font-weight:bold; font-size:13px;">${d.cap_load}%</span>
            </div>
            <div style="font-size:11px; color:#666;">Пл. мощность: ${d.cap_planned} | Факт: ${Math.round(d.visits_fact / 250)}</div>
          </div>

          <div style="margin-bottom:8px; border-top:1px solid #eee; pt-2;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:13px; font-weight:semibold">Нагрузка врачей:</span>
              ${docBadge}
              <span style="font-weight:bold; font-size:13px;">${d.doctor_load}%</span>
            </div>
            <div style="font-size:11px; color:#666;">РПН: <b>${(d.population||0).toLocaleString()}</b> / Норматив: <b>${(d.norm_capacity||0).toLocaleString()}</b></div>
            <div style="font-size:10px; color:#999; margin-top:2px;">ВОП ${d.vop}×1700 | Тер. ${d.therapist}×2200 | Пед. ${d.pediatr}×900</div>
          </div>

          <div style="font-size:12px; margin-bottom:8px;">
            🩺 Медсёстры: норма ${d.norm_nurses} / факт ${d.nurse_fact}
            ${nurseDiff > 0 ? `<span style="color:#E65100; font-weight:bold;"> ⚠️ нехватка: ${nurseDiff}</span>` : `<span style="color:#2E7D32;"> ✓</span>`}
          </div>

          <div style="font-size:11px; color:#666; padding:6px; background:#f5f5f5; border-radius:6px;">
            🏗 Гл. здание — износ: <b>${d.bld_main_wear || '-'}%</b> 
            <span style="background:${d.bld_main_priority === 'норма' ? '#2E7D32' : '#C62828'}; color:white; padding:1px 6px; border-radius:10px; font-size:9px; text-transform:uppercase; margin-left:5px;">
              ${d.bld_main_priority}
            </span>
          </div>

          ${demoBars}
        </div>
      `;
    }
    return `<div style="padding:10px">Объект: ${d.name}</div>`;
  },

  updatePlannedObjects: (map, data, isVisible) => {
    if (!data || !data.features) return; 
    updateIconPointLayer(map, data, isVisible, 'planned-objs', '#f97316', true);
  },

  updateZhkPoints: (map, data, isVisible) => {
    if (!data || !data.features) return; 
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
    if (!data || !data.features) return; 
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
    if (!data || !data.features) return; 
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
            'критично', '#C62828',
            'риск', '#EF6C00',
            'норма', '#2E7D32',
            '#9E9E9E'
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
  }, 

  updateGridLayer: (map, data, isVisible) => {
    if (!data || !data.features) return; 
    if (!map.getSource('grid-source')) {
      map.addSource('grid-source', { type: 'geojson', data });
      map.addLayer({
        id: 'grid-layer-fill',
        type: 'fill',
        source: 'grid-source',
        paint: {
          'fill-color': [
            'match', ['get', 'pmsp_access_cat'],
            'g10', '#2E7D32',
            'g15', '#66BB6A',
            'ylw', '#FDD835',
            'red', '#C62828',
            '#9E9E9E'
          ],
          'fill-opacity': 0.4
        }
      });
    } else {
      map.getSource('grid-source').setData(data);
    }
    const val = isVisible ? 'visible' : 'none';
    map.setLayoutProperty('grid-layer-fill', 'visibility', val);
  },

  updateGeoMarkers: (map, data, isVisible) => {
    if (!data || !data.features) return; 
    if (!map.getSource('geo-markers-source')) {
      map.addSource('geo-markers-source', { type: 'geojson', data });
      map.addLayer({
        id: 'geo-markers-layer',
        type: 'circle',
        source: 'geo-markers-source',
        paint: {
          'circle-radius': 5,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });
    } else {
      map.getSource('geo-markers-source').setData(data);
    }
    map.setLayoutProperty('geo-markers-layer', 'visibility', isVisible ? 'visible' : 'none');
  }, 

  updateHeatmapLayer: (map, data, isVisible, id, colorScheme) => {
    if (!data || !data.features) return; 
    const sourceId = `${id}-source`;
    const layerId = `${id}-heat`;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, { type: 'geojson', data });
      
      const beforeId = map.getLayer('city-layer') ? 'city-layer' : undefined;

      map.addLayer({
        id: layerId,
        type: 'heatmap',
        source: sourceId,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 6, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, colorScheme[0],
            0.6, colorScheme[1],
            1, colorScheme[2]
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
          'heatmap-opacity': 0.7
          // 'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
        }
      }, beforeId);
    } else {
      map.getSource(sourceId).setData(data);
    }
    
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
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
