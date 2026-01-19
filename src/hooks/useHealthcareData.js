import { useState, useCallback } from 'react';
import wellknown from 'wellknown';

// const API_BASE_URL = 'https://admin.smartalmaty.kz/api/v1/healthcare/territorial-division-map/';

const PROXY_URL = '/api_proxy/v1/healthcare/territorial-division-map/';
const DIRECT_URL = 'https://admin.smartalmaty.kz/api/v1/healthcare/territorial-division-map/';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE_URL = isLocal ? DIRECT_URL : PROXY_URL;

const getCoverageColor = (ratio) => {
  // Convert to number if string
  let numRatio = typeof ratio === 'string' ? parseFloat(ratio) : ratio;

  // Handle invalid values
  if (isNaN(numRatio) || numRatio === null || numRatio === undefined) {
    console.warn('Invalid coverage ratio:', ratio);
    return '#808080'; // Gray for invalid/missing data
  }

  // If the value is > 10, it's likely a percentage (e.g., 96.48 instead of 0.9648)
  // Convert percentage to decimal: 96.48 → 0.9648
  if (numRatio > 10) {
    numRatio = numRatio / 100;
  }

  // High load (overutilized) - ratio > 1.00 (>100%)
  if (numRatio > 1.0) {
    return '#ef4444'; // Red (red-500) - Высокая загруженность
  }

  // Low load (underutilized) - ratio < 0.90 (<90%)
  if (numRatio < 0.9) {
    return '#eab308'; // Yellow (yellow-500) - Низкая загруженность
  }

  // Optimal load - ratio between 0.90 and 1.00 (90-100%)
  return '#22c55e'; // Green (green-500) - Оптимальная загруженность
};

export const useHealthcareData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealthcareData = useCallback(async (selectedDistrict) => {
    setIsLoading(true);
    setError(null);

    // const districtFilter = selectedDistrict !== 'Все районы'
    //   ? `districts=${selectedDistrict}&`
    //   : '';
    const validDistricts = Array.isArray(selectedDistrict)
      ? selectedDistrict.filter((d) => d !== "Все районы")
      : [];

    const districtQuery =
      validDistricts.length > 0
        ? `districts=${encodeURIComponent(validDistricts.join(","))}&`
        : "";



    try {
      const response = await fetch(
        `${API_BASE_URL}?${districtQuery}limit=1000`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data?.results) {
        throw new Error('Invalid API response format');
      }

      const processedData = processHealthcareData(data);

      return {
        points: processedData.points,
        polygons: processedData.polygons,
        polygonMapping: processedData.polygonMapping,
        stats: {
          totalCount: new Set(data.results.map((item) => item.id)).size,
          totalPopulation: data.total_population,
          avgVisit: data.avg_overall_coverage_ratio,
          avgPerson: data.avg_per_1_person,
          vopNeeded: data.vop_needed,
          vopCount: data.vop_count,
        },
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchHealthcareData, isLoading, error };
};

const processHealthcareData = (data) => {
  const groups = {};
  let polygonIdCounter = 0;
  const polygonMapping = {};

  data.results.forEach((item) => {
    if (!groups[item.id]) {
      groups[item.id] = {
        point: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              parseFloat(item.longitude),
              parseFloat(item.latitude),
            ],
          },
          id: item.id,
          properties: {
            id: item.id,
            name: item.name,
            address: item.full_address,
            district: item.district,
            photo: item.photo,
            color: getCoverageColor(item.overall_coverage_ratio),
            coverage_ratio: item.overall_coverage_ratio,
          },
        },
        polygons: [],
        polygonIds: [],
      };
    }

    const geo = item.geometry ? wellknown.parse(item.geometry) : null;
    if (geo) {
      const uniquePolygonId = polygonIdCounter++;
      groups[item.id].polygons.push({
        type: 'Feature',
        geometry: geo,
        id: uniquePolygonId,
        properties: {
          parentId: item.id,
          id: item.id,
          name: item.name,
          address: item.full_address,
          color: ['#DCDCDC'], 
          original_color: ['#DCDCDC'],
        },
      });
      groups[item.id].polygonIds.push(uniquePolygonId);
    }
  });

  Object.keys(groups).forEach((parentId) => {
    polygonMapping[parentId] = groups[parentId].polygonIds;
  });

  return {
    points: {
      type: 'FeatureCollection',
      features: Object.values(groups).map((g) => g.point),
    },
    polygons: {
      type: 'FeatureCollection',
      features: Object.values(groups).flatMap((g) => g.polygons),
    },
    polygonMapping,
  };
};
