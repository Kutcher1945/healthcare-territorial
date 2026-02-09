import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import DistrictHistogram from './DistrictHistogramV';

/**
 * 1. MOCK DATA
 * Simulating the API response from admin.smartalmaty.kz
 */
const mockHistoData = [
  { district: "Алмалинский район", count: 12 },
  { district: "Бостандыкский район", count: 8 },
];

/**
 * 2. MOCK GLOBAL FETCH
 */
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockHistoData),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

/**
 * 3. MOCK RECHARTS
 * We replace SVG components with simple HTML/SVG tags and data-testids 
 * to avoid JSDOM compatibility errors.
 */
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <div data-testid="responsive-container" style={{ width: '800px', height: '400px' }}>
        {children}
      </div>
    ),
    BarChart: ({ children }) => <svg data-testid="bar-chart">{children}</svg>,
    Bar: () => <g data-testid="bar-element" />,
    XAxis: () => <g data-testid="x-axis" />,
    YAxis: () => <g data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    CartesianGrid: () => <g data-testid="grid" />,
    Cell: () => <rect data-testid="cell" />,
    LabelList: () => <g data-testid="labels" />,
  };
});

/**
 * 4. SUPPRESS JSDOM SVG WARNINGS
 * This cleans up the console from "unrecognized tag <linearGradient>" 
 * errors which are safe to ignore in this test environment.
 */
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && (
      args[0].includes('unrecognized in this browser') || 
      args[0].includes('incorrect casing')
    )) return;
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

/**
 * 5. THE TESTS
 */
describe('DistrictHistogram Component Integration Tests', () => {
  
  test('renders the title correctly', async () => {
    await act(async () => {
      render(<DistrictHistogram selectedDistrict="" onDistrictSelect={() => {}} />);
    });
    
    const titleElement = screen.getByText(/Количество поликлиник по районам/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('calls API on mount and renders chart components', async () => {
    await act(async () => {
      render(<DistrictHistogram selectedDistrict="" onDistrictSelect={() => {}} />);
    });

    // Check if fetch was called with the correct URL
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("healthcare/territorial-division-map/count_by_district")
      );
    });

    // Confirm the chart wrapper is rendered
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toBeInTheDocument();
  });

  test('handles API failure gracefully and logs error', async () => {
    const errorMessage = "Network Error";
    global.fetch.mockImplementationOnce(() => Promise.reject(errorMessage));
    
    // Spy on console.error to check if the component handles the catch block
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<DistrictHistogram selectedDistrict="" onDistrictSelect={() => {}} />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch histo data", errorMessage);
    });
    
    consoleSpy.mockRestore();
  });
});