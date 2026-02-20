import * as React from 'react';
import { NoteEvent, FolderCalendarSettings } from '../types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';

interface CalendarViewProps {
    events: NoteEvent[];
    settings: FolderCalendarSettings;
    onDateClick: (date: Date) => void;
    onNoteClick: (filePath: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
    events,
    settings,
    onDateClick,
    onNoteClick
}) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleMonthYearChange = (year: number, month: number) => {
        setCurrentDate(new Date(year, month, 1));
    };

    return (
        <div className="folder-calendar">
            <CalendarHeader
                currentDate={currentDate}
                onPrevious={goToPreviousMonth}
                onNext={goToNextMonth}
                onToday={goToToday}
                onMonthYearChange={handleMonthYearChange}
            />
            <CalendarGrid
                currentDate={currentDate}
                events={events}
                settings={settings}
                onDateClick={onDateClick}
                onNoteClick={onNoteClick}
            />
        </div>
    );
};
