import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import InfraTable from './InfraTableV';

const mockOrgCapacity = [
  { id: 101, name: "Clinic A", index: 0.85, total_population: 5000 }
];
const mockBuildings = [
  { min: 101, building_volume_cubic_m_field: 1200, total_area_sq_m_field: 400, used_part_of_the_building: "Full", ownership_right: "State", year: 1995 }
];
const mockDistricts = {
  results: [{ id: 101, district: "Almaly" }]
};
const mockVisits = [
  { id: 101, visit: 300 }
];

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes("org-capacity")) return Promise.resolve({ json: () => Promise.resolve(mockOrgCapacity) });
    if (url.includes("buildings-analysis")) return Promise.resolve({ json: () => Promise.resolve(mockBuildings) });
    if (url.includes("territorial-division-map")) return Promise.resolve({ json: () => Promise.resolve(mockDistricts) });
    if (url.includes("clinic-visit-5month")) return Promise.resolve({ json: () => Promise.resolve(mockVisits) });
    return Promise.reject("Unknown API");
  });
});

afterEach(() => { jest.clearAllMocks(); });


describe('InfraTable Component Tests', () => {

  test('merges data from all 4 APIs and renders rows', async () => {
    await act(async () => {
      render(<InfraTable selectedDistrict="" selectedDecade="" />);
    });

    await waitFor(() => {
      expect(screen.getByText("Clinic A")).toBeInTheDocument();
      expect(screen.getByText("Full")).toBeInTheDocument();
      expect(screen.getByText("5 000")).toBeInTheDocument();
    });
  });

  test('filters rows based on search input', async () => {
    global.fetch.mockImplementation((url) => {
        if (url.includes("org-capacity")) return Promise.resolve({ json: () => Promise.resolve([
            { id: 101, name: "Clinic A" },
            { id: 102, name: "Hospital B" }
        ])});
        return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    await act(async () => {
      render(<InfraTable selectedDistrict="" selectedDecade="" />);
    });

    const searchInput = screen.getByPlaceholderText(/Поиск по названию/i);
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Hospital' } });
    });

    expect(screen.getByText("Hospital B")).toBeInTheDocument();
    expect(screen.queryByText("Clinic A")).not.toBeInTheDocument();
  });

  test('sorting changes the order of data', async () => {
    global.fetch.mockImplementation((url) => {
        if (url.includes("org-capacity")) return Promise.resolve({ json: () => Promise.resolve([
            { id: 101, name: "A", index: 0.5 },
            { id: 102, name: "B", index: 0.9 }
        ])});
        return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    await act(async () => {
      render(<InfraTable selectedDistrict="" selectedDecade="" />);
    });

    const indexHeader = screen.getByText(/Индекс/i);
    
    await act(async () => { fireEvent.click(indexHeader); });
    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent("A");

    await act(async () => { fireEvent.click(indexHeader); });
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent("B");
  });

  test('correctly applies decade filter from props', async () => {
    await act(async () => {
      render(<InfraTable selectedDistrict="" selectedDecade="1980" />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Clinic A")).not.toBeInTheDocument();
    });
  });
});