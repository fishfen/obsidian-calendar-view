import * as React from 'react';

interface CalendarHeaderProps {
    currentDate: Date;
    onPrevious: () => void;
    onNext: () => void;
    onToday: () => void;
    onMonthYearChange: (year: number, month: number) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    onPrevious,
    onNext,
    onToday,
    onMonthYearChange
}) => {
    const [showPicker, setShowPicker] = React.useState(false);
    const pickerRef = React.useRef<HTMLDivElement>(null);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Close picker when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    const handlePickerSelect = (year: number, month: number) => {
        onMonthYearChange(year, month);
        setShowPicker(false);
    };

    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
        <div className="calendar-header">
            <div className="calendar-header-left">
                <button
                    className="calendar-nav-button"
                    onClick={onPrevious}
                    aria-label="Previous month"
                >
                    &lt;
                </button>
                <div className="calendar-month-year" ref={pickerRef}>
                    <button
                        className="calendar-month-year-button"
                        onClick={() => setShowPicker(!showPicker)}
                    >
                        {monthNames[currentMonth]} {currentYear}
                    </button>
                    {showPicker && (
                        <div className="calendar-month-picker">
                            <div className="calendar-year-selector">
                                {years.map(year => (
                                    <button
                                        key={year}
                                        className={`calendar-year-option ${year === currentYear ? 'active' : ''}`}
                                        onClick={() => handlePickerSelect(year, currentMonth)}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                            <div className="calendar-month-grid">
                                {monthNames.map((month, index) => (
                                    <button
                                        key={month}
                                        className={`calendar-month-option ${index === currentMonth && currentYear === currentYear ? 'active' : ''}`}
                                        onClick={() => handlePickerSelect(currentYear, index)}
                                    >
                                        {month.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    className="calendar-nav-button"
                    onClick={onNext}
                    aria-label="Next month"
                >
                    &gt;
                </button>
            </div>
            <button
                className="calendar-today-button"
                onClick={onToday}
            >
                Today
            </button>
        </div>
    );
};
