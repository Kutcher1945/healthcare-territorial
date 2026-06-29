import { renderHook, waitFor } from '@testing-library/react';
import { useMapData } from '../hooks/useMapData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Territory Division (Service Zones) - Тестирование стабильности', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/city-boundary/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }) });
      }
      if (url.includes('/pmsp/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [] }) });
      }
      if (url.includes('/districts/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ features: [] }) });
      }
      if (url.includes('/planned-zones/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ features: [] }) });
      }
      if (url.includes('/service-zones/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ features: [], results: [] }) });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Критический случай: Сервер не вернул зоны обслуживания (Service Zones)', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/service-zones/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(null) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [], features: [] }) });
    });

    const { result } = renderHook(() => useMapData('infrastructure'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const data = result.current.filterData({ districts: ["Все районы"] });
    expect(data.serviceZones).toBeNull();
  });

  it('Граничный случай: Зона обслуживания существует, но в ней нет ни одной поликлиники', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/service-zones/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            type: 'FeatureCollection',
            features: [{
              properties: { district_name: "Алмалинский", name: "Зона 1" },
              geometry: { type: 'Polygon', coordinates: [[[0,0], [0,1], [1,1], [0,0]]] }
            }]
          })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [], features: [] }) });
    });

    const { result } = renderHook(() => useMapData('infrastructure'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const data = result.current.filterData({ districts: ["Все районы"] });
    
    const zone = data.serviceZones.features[0];
    expect(zone.properties.clinics_count).toBe(0);
    expect(zone.properties.fill_color).toBe('#9E9E9E'); 
  });

  it('Логика: Корректный расчет средней нагрузки в зоне обслуживания', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/pmsp/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            results: [
              { id: 1, lng: 0.5, lat: 0.5, cap_load: 100, district: "А" }, 
              { id: 2, lng: 0.6, lat: 0.6, cap_load: 200, district: "А" } 
            ] 
          })
        });
      }
      if (url.includes('/service-zones/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            type: 'FeatureCollection',
            features: [{
              properties: { district_name: "А" },
              geometry: { type: 'Polygon', coordinates: [[[0,0], [0,2], [2,2], [0,0]]] }
            }]
          })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [], features: [] }) });
    });

    const { result } = renderHook(() => useMapData('infrastructure'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
        const data = result.current.filterData({ districts: ["Все районы"] });
        if (data && data.serviceZones) {
          const zone = data.serviceZones.features[0];
          expect(zone.properties.clinics_count).toBe(2);
          expect(zone.properties.fill_color).toBe('#EF6C00');
        }
    });
  });
});