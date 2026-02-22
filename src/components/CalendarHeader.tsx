import * as React from 'react';

interface CalendarHeaderProps {
    currentDate: Date;
    onPrevious: () => void;
    onNext: () => void;
    onToday: () => void;
    onMonthYearChange: (year: number, month: number) => void;
    currentFolder: string;
    onFolderSelect: (folder: string) => void;
    getFolderList: () => string[];
    allTags: string[];
    selectedTags: string[];
    toggleTag: (tag: string) => void;
    clearTags: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    onPrevious,
    onNext,
    onToday,
    onMonthYearChange,
    currentFolder,
    onFolderSelect,
    getFolderList,
    allTags,
    selectedTags,
    toggleTag,
    clearTags
}) => {
    const [showPicker, setShowPicker] = React.useState(false);
    const [showFolderPicker, setShowFolderPicker] = React.useState(false);
    const pickerRef = React.useRef<HTMLDivElement>(null);
    const folderRef = React.useRef<HTMLDivElement>(null);
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
            if (folderRef.current && !folderRef.current.contains(event.target as Node)) {
                setShowFolderPicker(false);
            }
        };

        if (showPicker || showFolderPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker, showFolderPicker]);

    // Scroll to current year when picker opens
    React.useEffect(() => {
        if (showPicker) {
            if (yearScrollRef.current) {
                const currentYearIndex = years.indexOf(currentYear);
                if (currentYearIndex !== -1) {
                    const yearButton = yearScrollRef.current.children[currentYearIndex] as HTMLElement;
                    if (yearButton) {
                        yearButton.scrollIntoView({ block: 'center' });
                    }
                }
            }
        }
    }, [showPicker, currentYear, years]);

    const handlePickerSelect = (year: number, month: number) => {
        onMonthYearChange(year, month);
        setShowPicker(false);
    };

    const handleFolderClick = (folder: string) => {
        onFolderSelect(folder);
        setShowFolderPicker(false);
    };

    // Format date as "yyyy mm"
    const formatDate = () => {
        const year = currentYear;
        const month = String(currentMonth + 1).padStart(2, '0');
        return `${year} ${month}`;
    };

    return (
        <div className="calendar-header">
            <div className="calendar-header-controls">
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
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowPicker(!showPicker);
                        }}
                    >
                        {formatDate()}
                    </button>
                    {showPicker && (
                        <div className="calendar-month-picker" onClick={(e) => e.stopPropagation()}>
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
                            <div className="calendar-month-selector">
                                {monthNames.map((month, index) => (
                                    <button
                                        key={month}
                                        className={`calendar-month-option ${index === currentMonth ? 'active' : ''}`}
                                        onClick={() => handlePickerSelect(currentYear, index)}
                                    >
                                        {month}
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
                <button
                    className="calendar-today-button"
                    onClick={onToday}
                >
                    Today
                </button>
                <div className="calendar-folder-display" ref={folderRef}>
                    <span className="calendar-folder-label">Folder:</span>
                    <button
                        className="calendar-folder-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowFolderPicker(!showFolderPicker);
                        }}
                    >
                        {currentFolder || '(Root)'}
                    </button>
                    {showFolderPicker && (
                        <div className="calendar-folder-picker" onClick={(e) => e.stopPropagation()}>
                            {getFolderList().map(folder => (
                                <button
                                    key={folder || 'root'}
                                    className={`calendar-folder-option ${folder === currentFolder ? 'active' : ''}`}
                                    onClick={() => handleFolderClick(folder)}
                                >
                                    {folder || '(Root)'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {allTags.length > 0 && (
                    <div className="calendar-tag-filter">
                        <span className="calendar-filter-label">Filter:</span>
                        <div className="calendar-filter-tags">
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    className={`calendar-filter-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTag(tag);
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                            {selectedTags.length > 0 && (
                                <button
                                    className="calendar-filter-clear"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearTags();
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
