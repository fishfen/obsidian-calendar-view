import * as React from 'react';
import { NoteEvent, FolderCalendarSettings } from '../types';
import { NoteCard } from './NoteCard';

interface DateCellProps {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: NoteEvent[];
    settings: FolderCalendarSettings;
    onDateClick: (date: Date) => void;
    onNoteClick: (filePath: string) => void;
}

export const DateCell: React.FC<DateCellProps> = ({
    date,
    isCurrentMonth,
    isToday,
    events,
    settings,
    onDateClick,
    onNoteClick
}) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [showAll, setShowAll] = React.useState(false);

    const maxVisibleEvents = 3;
    const visibleEvents = showAll ? events : events.slice(0, maxVisibleEvents);
    const hiddenCount = events.length - maxVisibleEvents;

    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDateClick(date);
    };

    const className = [
        'calendar-date-cell',
        !isCurrentMonth && 'other-month',
        isToday && 'today'
    ].filter(Boolean).join(' ');

    return (
        <div
            className={className}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="calendar-date-header">
                <span className="calendar-date-number">{date.getDate()}</span>
                {isHovered && (
                    <button
                        className="calendar-add-button"
                        onClick={handleAddClick}
                        aria-label="Add note"
                    >
                        +
                    </button>
                )}
            </div>
            <div className="calendar-date-content">
                {visibleEvents.map((event, index) => (
                    <NoteCard
                        key={`${event.file}-${index}`}
                        event={event}
                        settings={settings}
                        onClick={() => onNoteClick(event.file)}
                    />
                ))}
                {!showAll && hiddenCount > 0 && (
                    <button
                        className="calendar-show-more"
                        onClick={() => setShowAll(true)}
                    >
                        Show {hiddenCount} more
                    </button>
                )}
            </div>
        </div>
    );
};
