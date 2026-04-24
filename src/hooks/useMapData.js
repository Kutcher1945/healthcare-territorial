import { useCallback, useMemo } from 'react';
import { useHealthcareQueries } from './useHealthcareQueries'; 

const isPointInPolygon = (point, geometry) => {
  if (!geometry) return false;
  const [lng, lat] = point;
  let inside = false;

  const coordinates = geometry.type === 'MultiPolygon' ? geometry.coordinates[0] : geometry.coordinates;

  for (let i = 0, j = coordinates[0].length - 1; i < coordinates[0].length; j = i++) {
    const xi = coordinates[0][i][0], yi = coordinates[0][i][1];
    const xj = coordinates[0][j][0], yj = coordinates[0][j][1];

    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

export const useMapData = (mode) => {

  const { data: cache, isLoading, isFetching } = useHealthcareQueries(mode);

  const normalize = (name) => {
    if (!name) return "";
    return name.toString().toLowerCase().replace(" район", "").trim();
  };

  const getVisitCategory = (load) => {
    const val = parseFloat(load);
    if (val > 150) return ">150% критично";
    if (val > 130) return "130-150% перегружено";
    if (val > 110) return "110-130% выше нормы";
    if (val >= 90) return "90–110% норма";
    return "90% хорошо";
  };

  const getCapLoadColor = (load) => {
    const val = parseFloat(load);
    if (isNaN(val)) return '#6b7280';

    if (val > 150) return '#C62828';
    if (val >= 130) return '#EF6C00';
    if (val >= 110) return '#FDD835';
    if (val >= 90) return '#66BB6A';
    if (val < 90) return '#2E7D32';
    
    return '#6b7280';
  };

  const calculateStrokeColor = (item) => {
    const dl = item.doctor_load;
    const cl = item.cap_load;
    if (dl !== null && cl > 0 && Math.abs((dl || 0) - cl) > 30) {
      return '#C62828';
    }
    return '#212121';
  };

  const calculateStrokeWidth = (dl) => {
    if (dl === null || dl === undefined) return 1;
    if (dl > 160) return 7;
    if (dl > 140) return 5.5;
    if (dl > 130) return 4.5;
    if (dl > 115) return 3;
    if (dl > 100) return 2;
    return 1;
  };

  const calculateZhkRadius = (flats) => {
    const f = parseInt(flats) || 0;
    return Math.min(10, Math.max(4, Math.round(4 + Math.sqrt(f) * 0.18)));
  };

  const filterData = useCallback((filters) => {
    if (!cache.city || !cache.pmsp || !cache.dists) return null;

    const { 
      districts = ["Все районы"], 
      visits = ["Все посещения"], 
      layers = ["Все слои"], 
      affiliations = ["Все принадлежности"] 
    } = filters;

    const isAllDistricts = districts.includes("Все районы");
    const normalizedSelectedDistricts = districts.map(d => normalize(d));

    const checkDistrict = (itemDistrict) => {
      if (isAllDistricts) return true;
      return normalizedSelectedDistricts.includes(normalize(itemDistrict));
    };

    const filteredDistricts = {
      ...cache.dists,
      features: cache.dists.features.filter(f => checkDistrict(f.properties.name_ru))
    };

    const filteredPmspRaw = cache.pmsp.results.filter(item => {
      const matchDist = checkDistrict(item.district);
      const matchVisit = visits.includes("Все посещения") || visits.includes(getVisitCategory(item.cap_load));
      const matchAffiliation = affiliations.includes("Все принадлежности") || affiliations.includes(item.ownership);
      return matchDist && matchVisit && matchAffiliation;
    });

    const filteredPmspFeatures = filteredPmspRaw.map(i => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [i.lng, i.lat] },
      properties: { 
        ...i, 
        color: getCapLoadColor(i.cap_load),
        stroke_color: calculateStrokeColor(i),
        stroke_width: calculateStrokeWidth(i.doctor_load)
      }
    }));

    const filteredServiceZones = cache.serviceZones ? {
      ...cache.serviceZones,
      features: cache.serviceZones.features
        .filter(f => checkDistrict(f.properties.district_name))
        .map(zone => {
          const clinicsInside = filteredPmspRaw.filter(clinic => 
            isPointInPolygon([clinic.lng, clinic.lat], zone.geometry)
          );
          let zoneColor = '#9E9E9E';
          let zoneOpacity = 0.05;
          if (clinicsInside.length > 0) {
            const avgLoad = clinicsInside.reduce((sum, c) => sum + (c.cap_load || 0), 0) / clinicsInside.length;
            zoneColor = getCapLoadColor(avgLoad);
            zoneOpacity = 0.25;
          }
          return {
            ...zone,
            properties: { ...zone.properties, fill_color: zoneColor, fill_opacity: zoneOpacity, stroke_color: zoneColor, clinics_count: clinicsInside.length }
          };
        })
    } : null;

    const filteredPlannedObjs = cache.plannedObjs ? {
      ...cache.plannedObjs,
      features: cache.plannedObjs.features.filter(f => checkDistrict(f.properties.district))
        .map(f => ({ ...f, properties: { ...f.properties, layerType: 'planned' } }))
    } : null;

    const filteredZhk = cache.zhk ? {
      type: 'FeatureCollection',
      features: cache.zhk.zhk_rows
        .filter(item => checkDistrict(item.district))
        .map((item, idx) => ({
          type: 'Feature',
          id: idx,
          geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
          properties: { ...item, radius: calculateZhkRadius(item.flats), layerType: 'zhkh' }
        }))
    } : null;

    const stats = {
      totalCount: filteredPmspFeatures.length,
      totalPopulation: filteredPmspFeatures.reduce((s, f) => s + (f.properties.population || 0), 0),
      avgVisit: filteredPmspFeatures.length > 0 
        ? (filteredPmspFeatures.reduce((s, f) => s + (f.properties.cap_load || 0), 0) / filteredPmspFeatures.length).toFixed(1)
        : 0,
      avgPerson: filteredPmspFeatures.length > 0
        ? (filteredPmspFeatures.reduce((s, f) => s + (f.properties.doctor_load || 0), 0) / filteredPmspFeatures.length).toFixed(1)
        : 0
    };

    return {
      city: cache.city,
      plannedZones: cache.plannedZones,
      districts: filteredDistricts,
      pmsp: { type: 'FeatureCollection', features: filteredPmspFeatures },
      plannedObjs: filteredPlannedObjs,
      serviceZones: filteredServiceZones,
      zhk: filteredZhk,
      grid: cache.grid,
      heatDeficit: cache.heatDeficit,
      heatCoverage: cache.heatCoverage,
      stats
    };
  }, [cache]);

  const isReady = useMemo(() => {
    if (!cache.city || !cache.pmsp || !cache.dists) return false;

    if (mode === 'geo-analysis') {
      return !!(cache.grid && cache.heatDeficit);
    }
    
    if (mode === 'infrastructure' || mode === 'load') {
      return !!(cache.plannedObjs || cache.zhk);
    }

    return true;
  }, [cache, mode]);

  return { filterData, isLoading, isFetching, isReady };
};