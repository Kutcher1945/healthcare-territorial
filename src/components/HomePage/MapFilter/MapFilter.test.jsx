import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapFilter from './MapFilter';

jest.mock('./Indicators', () => ({ totalCount }) => (
  <div data-testid="indicators-mock">
    Indicators: {totalCount}
  </div>
));

jest.mock('./Analytics', () => ({ onReset }) => (
  <div data-testid="analytics-mock">
    <button data-testid="reset-button" onClick={onReset}>Reset</button>
  </div>
));

describe('MapFilter Component', () => {
  const mockProps = {
    setSelectedDistrict: jest.fn(),
    setSelectedVisits: jest.fn(),
    setSelectedLayers: jest.fn(),
    setSelectedAffiliations: jest.fn(),
    selectedDistrict: ['Все районы'],
    selectedVisits: ['Все посещения'],
    selectedLayers: ['Все слои'],
    selectedAffiliations: ['all'],
    totalCount: 100,
    totalPopulation: 1000,
    avgVisit: 50,
    avgPerson: 10,
    setActiveModal: jest.fn(),
    activeModal: null,
  };

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('рендерится без ошибок и отображает заголовок "Фильтры"', () => {
    render(<MapFilter {...mockProps} />);
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
  });

  test('переключает видимость фильтров при клике на кнопку-стрелку', () => {
    render(<MapFilter {...mockProps} />);
    
    const buttons = screen.getAllByRole('button');
    const toggleBtn = buttons[0]; 
    
    const indicatorsMock = screen.getByTestId('indicators-mock');
    const collapsibleContainer = indicatorsMock.closest('.transition-all');
    
    expect(collapsibleContainer).toHaveClass('max-h-screen');

    fireEvent.click(toggleBtn);
    expect(collapsibleContainer).toHaveClass('max-h-0');
  });

  test('открывает выпадающий список районов при клике', () => {
    render(<MapFilter {...mockProps} />);
    
    fireEvent.click(screen.getByText('Все районы'));
    expect(screen.getByLabelText('Алатауский')).toBeInTheDocument();
  });

  test('handleDistrictChange: корректно вызывает setSelectedDistrict', () => {
    render(<MapFilter {...mockProps} />);
    
    fireEvent.click(screen.getByText('Все районы'));
    fireEvent.click(screen.getByLabelText('Алатауский'));

    expect(mockProps.setSelectedDistrict).toHaveBeenCalled();
    
    const updateFn = mockProps.setSelectedDistrict.mock.calls[0][0];
    const newState = updateFn(['Все районы']); 
    expect(newState).toContain('Алатауский');
    expect(newState).not.toContain('Все районы');
  });

  test('handleAffiliationChange: корректно обрабатывает выбор', () => {
    render(<MapFilter {...mockProps} />);
    
    fireEvent.click(screen.getByText('Все принадлежности'));
    fireEvent.click(screen.getByLabelText('Частная'));

    expect(mockProps.setSelectedAffiliations).toHaveBeenCalled();
    
    const updateFn = mockProps.setSelectedAffiliations.mock.calls[0][0];
    const newState = updateFn(['all']); 
    expect(newState).toContain('Частная');
    expect(newState).not.toContain('all');
  });

  test('кнопка Reset сбрасывает все фильтры', () => {
    render(<MapFilter {...mockProps} />);
    
    fireEvent.click(screen.getByTestId('reset-button'));

    expect(mockProps.setSelectedDistrict).toHaveBeenCalledWith(['Все районы']);
    expect(mockProps.setSelectedVisits).toHaveBeenCalledWith(['Все посещения']);
    expect(mockProps.setSelectedLayers).toHaveBeenCalledWith(['Все слои']);
    expect(mockProps.setSelectedAffiliations).toHaveBeenCalledWith(['all']);
  });

  test('useEffect: устанавливает "Все районы", если список пуст', () => {
    render(<MapFilter {...mockProps} selectedDistrict={[]} />);
    
    expect(mockProps.setSelectedDistrict).toHaveBeenCalledWith(['Все районы']);
  });

  test('закрывает один список при открытии другого', () => {
    render(<MapFilter {...mockProps} />);
    
    fireEvent.click(screen.getByText('Все районы'));
    expect(screen.getByLabelText('Алатауский')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Все посещения'));
    
    expect(screen.queryByLabelText('Алатауский')).not.toBeInTheDocument();
    expect(screen.getByLabelText('>150% критично')).toBeInTheDocument();
  });
});