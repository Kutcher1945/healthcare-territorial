import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import Diagram from './DiagramV';

const mockDistrictsData = {
  results: [
    { id: 1, district: "Almaly" },
    { id: 2, district: "Bostandyk" }
  ]
};

const mockBuildingsData = {
  results: [
    { min: 1, ownership_right: "На балансе (Государственная)", year: 1975 },
    { min: 2, ownership_right: "Частная собственность", year: 1995 },
    { min: 1, ownership_right: "Арендуемое помещение", year: 2005 }
  ]
};


beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes("territorial-division-map")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockDistrictsData) });
    }
    if (url.includes("buildings-analysis")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockBuildingsData) });
    }
    return Promise.reject(new Error("Unknown API"));
  });
});

afterEach(() => {
  jest.clearAllMocks();
});


jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    PieChart: ({ children }) => <svg data-testid="pie-chart">{children}</svg>,
    Pie: ({ data }) => (
      <g data-testid="pie-segments">
        {data.map((d, i) => <rect key={i} data-testid={`segment-${d.name}`} />)}
      </g>
    ),
    Cell: () => null,
    Tooltip: () => null,
    Legend: () => <div data-testid="chart-legend" />,
  };
});

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && (args[0].includes('unrecognized') || args[0].includes('incorrect casing'))) return;
    originalConsoleError(...args);
  };
});
afterAll(() => { console.error = originalConsoleError; });

describe('Diagram Component (Pie Chart) Tests', () => {

  test('renders the main title', async () => {
    await act(async () => {
      render(<Diagram selectedDistrict="" selectedDecade="Все" />);
    });
    expect(screen.getByText(/Распределение медицинских организаций/i)).toBeInTheDocument();
  });

  test('filters data correctly for "До 1980-х"', async () => {
    await act(async () => {
      render(<Diagram selectedDistrict="" selectedDecade="До 1980-х" />);
    });

    expect(screen.getByText(/Период: до 1980 г./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('segment-Государственные')).toBeInTheDocument();
      expect(screen.queryByTestId('segment-Частные')).not.toBeInTheDocument();
    });
  });

  test('filters data correctly for a specific decade (1990)', async () => {
    await act(async () => {
      render(<Diagram selectedDistrict="" selectedDecade="1990" />);
    });

    expect(screen.getByText(/Период: 1990–1999 гг./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('segment-Частные')).toBeInTheDocument();
      expect(screen.queryByTestId('segment-Государственные')).not.toBeInTheDocument();
    });
  });

  test('filters by District correctly', async () => {
    await act(async () => {
      render(<Diagram selectedDistrict="Almaly" selectedDecade="Все" />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('segment-Государственные')).toBeInTheDocument();
      expect(screen.getByTestId('segment-Смешанные')).toBeInTheDocument();
      expect(screen.queryByTestId('segment-Частные')).not.toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject("Fetch failed"));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<Diagram selectedDistrict="" selectedDecade="Все" />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch buildings data", "Fetch failed");
    });
    consoleSpy.mockRestore();
  });
});