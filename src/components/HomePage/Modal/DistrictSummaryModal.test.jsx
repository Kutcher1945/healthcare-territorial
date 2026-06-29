import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DistrictSummaryModal from './DistrictSummaryModal';
import { HealthcareService } from '../../../services/apiService';

// 1. Мокаем API сервис
jest.mock('../../../services/apiService', () => ({
    HealthcareService: {
        getDistrictSummary: jest.fn()
    }
}));

const mockRawData = [
    { district: "Алатауский район", count: 2, pop: 150000, avg_cap_load: "130.0", avg_doc_load: "110.0" },
    { district: "Алатауский", count: 1, pop: 50000, avg_cap_load: "70.0", avg_doc_load: "80.0" },
    { district: "Медеуский район", count: 1, pop: 180000, avg_cap_load: "95.5", avg_doc_load: "92.0" },
];

describe('DistrictSummaryModal Component', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        // Устанавливаем мок по умолчанию (пустой массив), 
        // чтобы тесты, не связанные с данными, не падали на .forEach()
        HealthcareService.getDistrictSummary.mockResolvedValue([]);
    });

    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    test('отображает состояние загрузки при монтировании', async () => {
        // Оставляем промис в состоянии ожидания
        HealthcareService.getDistrictSummary.mockReturnValue(new Promise(() => {}));
        
        render(<DistrictSummaryModal onClose={mockOnClose} />);
        expect(screen.getByText(/Загрузка данных.../i)).toBeInTheDocument();
        
        // Очищаем промис, чтобы не было утечки памяти в тесте
        cleanup();
    });

    test('корректно обрабатывает, объединяет и отображает данные', async () => {
        HealthcareService.getDistrictSummary.mockResolvedValue(mockRawData);
        
        render(<DistrictSummaryModal onClose={mockOnClose} />);

        await waitFor(() => {
            expect(screen.queryByText(/Загрузка данных.../i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('Алатауский')).toBeInTheDocument();
        expect(screen.getByText('200K')).toBeInTheDocument();
        expect(screen.getByText('110.0%')).toBeInTheDocument();
    });

    test('применяет правильные CSS классы в зависимости от нагрузки', async () => {
        HealthcareService.getDistrictSummary.mockResolvedValue(mockRawData);
        render(<DistrictSummaryModal onClose={mockOnClose} />);

        const capLoadCell = await screen.findByText('110.0%');
        expect(capLoadCell).toHaveClass('text-orange-600');
    });

    test('отображает ошибку при сбое API', async () => {
        // Скрываем ошибку консоли для чистоты вывода
        jest.spyOn(console, 'error').mockImplementation(() => {});
        HealthcareService.getDistrictSummary.mockRejectedValue(new Error('API Error'));

        render(<DistrictSummaryModal onClose={mockOnClose} />);

        await waitFor(() => {
            expect(screen.getByText('Не удалось загрузить данные')).toBeInTheDocument();
        });
        
        console.error.mockRestore();
    });

    test('вызывает onClose при клике на кнопку закрытия', async () => {
        await act(async () => {
            render(<DistrictSummaryModal onClose={mockOnClose} />);
        });
        
        const closeBtn = screen.getByRole('button', { name: '' }); 
        fireEvent.click(closeBtn);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});