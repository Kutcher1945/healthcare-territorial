import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import YearHistogram from './YearHistogramV';

const mockDistrictsData = {
  results: [
    { id: 1, district: "Almaly" },
    { id: 2, district: "Bostandyk" }
  ]
};

const mockBuildingsData = [
  { min: 1, year: 1970 },
  { min: 1, year: 1975 },
  { min: 1, year: 1985 },
  { min: 2, year: 1992 },
  { min: 2, year: 2015 },
];


beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes("territorial-division-map")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockDistrictsData) });
    }
    if (url.includes("buildings-analysis")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: mockBuildingsData }) });
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
    BarChart: ({ children, data }) => (
      <div data-testid="bar-chart" data-data={JSON.stringify(data)}>
        {children}
      </div>
    ),
    Bar: ({ children, onClick, dataKey }) => (
      <div data-testid="bar-group" onClick={() => onClick({ payload: { decade: "1980s" } })}>
        {children}
      </div>
    ),
    Cell: () => <div data-testid="bar-cell" />,
    XAxis: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
    LabelList: () => null,
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


describe('YearHistogram Component Tests', () => {

  test('renders the title correctly', async () => {
    await act(async () => {
      render(<YearHistogram selectedDistrict="" onDecadeSelect={() => {}} />);
    });
    expect(screen.getByText(/Годы постройки зданий/i)).toBeInTheDocument();
  });

  test('correctly groups years into decades', async () => {
    await act(async () => {
      render(<YearHistogram selectedDistrict="" onDecadeSelect={() => {}} />);
    });

    await waitFor(() => {
      const chart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(chart.getAttribute('data-data'));
      
      const pre1980 = chartData.find(d => d.decade === "До 1980-х");
      expect(pre1980.count).toBe(2);

      const decade1980 = chartData.find(d => d.decade === "1980s");
      expect(decade1980.count).toBe(1);
    });
  });

  test('filters data by selected district', async () => {
    await act(async () => {

      render(<YearHistogram selectedDistrict="Almaly" onDecadeSelect={() => {}} />);
    });

    await waitFor(() => {
      const chart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(chart.getAttribute('data-data'));
      
      const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);
      expect(totalCount).toBe(3);
      
      expect(chartData.find(d => d.decade === "1990s")).toBeUndefined();
    });
  });

  test('clicking a bar triggers onDecadeSelect callback', async () => {
    const mockOnSelect = jest.fn();
    await act(async () => {
      render(<YearHistogram selectedDistrict="" onDecadeSelect={mockOnSelect} />);
    });

    await waitFor(() => {
      const barGroup = screen.getByTestId('bar-group');
      fireEvent.click(barGroup);
    });

    expect(mockOnSelect).toHaveBeenCalledWith("1980s");
  });

  test('handles API errors gracefully', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject("Fetch error"));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<YearHistogram selectedDistrict="" onDecadeSelect={() => {}} />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch buildings data", "Fetch error");
    });
    consoleSpy.mockRestore();
  });
});