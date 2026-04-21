const BASE_URL = 'https://admin.smartalmaty.kz/api/v1';

export const HealthcareService = {
  getCityBoundary: async () => {
    const res = await fetch(`${BASE_URL}/healthcare/geo/city-boundary/`);
    return res.json();
  },

  getDistricts: async () => {
    const res = await fetch(`${BASE_URL}/address/districts/?city=1`);
    return res.json();
  },

  getPmsp: async (districts = []) => {
    const query = districts.length > 0 ? `district=${encodeURIComponent(districts.join(","))}&` : "";
    const res = await fetch(`${BASE_URL}/healthcare/pmsp/?${query}limit=500`);
    return res.json();
  },

  getPlannedZones: async () => {
    const res = await fetch(`${BASE_URL}/healthcare/geo/planned-zones/`);
    return res.json();
  },

  getPlannedObjects: async () => {
    const res = await fetch(`${BASE_URL}/healthcare/geo/planned-objects/`);
    return res.json();
  },

  getServiceZones: async () => {
    const res = await fetch(`${BASE_URL}/healthcare/geo/service-zones/`);
    return res.json();
  },

  getZhk: async () => {
    const res = await fetch(`${BASE_URL}/healthcare/analytics/zhk/`);
    return res.json();
  }, 

  getDistrictSummary: async () => {
    const res = await fetch(`${BASE_URL}/healthcare/pmsp/district-summary/`);
    if (!res.ok) throw new Error("Ошибка при получении сводки");
    return res.json();
  },

  getBuildingAgeStats: async () => {
    const res = await fetch(`${BASE_URL}/healthcare/analytics/buildings/age-stats/`);
    if (!res.ok) throw new Error("Ошибка при получении статистики зданий");
    return res.json();
  },
};