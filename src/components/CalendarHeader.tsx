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
    const yearScrollRef = React.useRef<HTMLDivElement>(null);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Generate years from 1900 to 2100
    const years = React.useMemo(() => {
        return Array.from({ length: 201 }, (_, i) => 1900 + i);
    }, []);

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

    // Scroll to current year when picker opens
    React.useEffect(() => {
        if (showPicker && yearScrollRef.current) {
            const currentYearIndex = years.indexOf(currentYear);
            if (currentYearIndex !== -1) {
                const yearButton = yearScrollRef.current.children[currentYearIndex] as HTMLElement;
                if (yearButton) {
                    yearButton.scrollIntoView({ block: 'center' });
                }
            }
        }
    }, [showPicker, currentYear, years]);

    const handlePickerSelect = (year: number, month: number) => {
        onMonthYearChange(year, month);
        setShowPicker(false);
    };

    // Format date as "yyyy mm"
    const formatDate = () => {
        const year = currentYear;
        const month = String(currentMonth + 1).padStart(2, '0');
        return `${year} ${month}`;
    };

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
                        {formatDate()}
                    </button>
                    {showPicker && (
                        <div className="calendar-month-picker">
                            <div className="calendar-year-selector" ref={yearScrollRef}>
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
                                        className={`calendar-month-option ${index === currentMonth ? 'active' : ''}`}
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
