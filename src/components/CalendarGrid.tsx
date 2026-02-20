import * as React from 'react';
import { NoteEvent, FolderCalendarSettings } from '../types';
import { DateCell } from './DateCell';

interface CalendarGridProps {
    currentDate: Date;
    events: NoteEvent[];
    settings: FolderCalendarSettings;
    onDateClick: (date: Date) => void;
    onNoteClick: (filePath: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
    currentDate,
    events,
    settings,
    onDateClick,
    onNoteClick
}) => {
    const weekDays = settings.startOfWeek === 'monday'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (year: number, month: number): Date[] => {
        const days: Date[] = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
        let firstDayOfWeek = firstDay.getDay();

        // Adjust for start of week setting
        if (settings.startOfWeek === 'monday') {
            firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        }

        // Add empty days for the previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            days.push(new Date(year, month - 1, prevMonthLastDay - i));
        }

        // Add all days of current month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push(new Date(year, month, day));
        }

        // Add days from next month to complete the grid
        const remainingDays = 42 - days.length; // 6 weeks * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            days.push(new Date(year, month + 1, day));
        }

        return days;
    };

    const getEventsForDate = (date: Date): NoteEvent[] => {
        return events.filter(event => {
            return (
                event.date.getFullYear() === date.getFullYear() &&
                event.date.getMonth() === date.getMonth() &&
                event.date.getDate() === date.getDate()
            );
        });
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getDaysInMonth(year, month);
    const today = new Date();

    return (
        <div className="calendar-grid-container">
            <div className="calendar-weekdays">
                {weekDays.map(day => (
                    <div key={day} className="calendar-weekday">
                        {day}
                    </div>
                ))}
            </div>
            <div className="calendar-grid">
                {days.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === month;
                    const isToday = (
                        day.getFullYear() === today.getFullYear() &&
                        day.getMonth() === today.getMonth() &&
                        day.getDate() === today.getDate()
                    );
                    const dateEvents = getEventsForDate(day);

                    return (
                        <DateCell
                            key={index}
                            date={day}
                            isCurrentMonth={isCurrentMonth}
                            isToday={isToday}
                            events={dateEvents}
                            settings={settings}
                            onDateClick={onDateClick}
                            onNoteClick={onNoteClick}
                        />
                    );
                })}
            </div>
        </div>
    );
};
