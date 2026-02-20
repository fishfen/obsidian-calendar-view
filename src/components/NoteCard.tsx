import * as React from 'react';
import { NoteEvent, FolderCalendarSettings } from '../types';

interface NoteCardProps {
    event: NoteEvent;
    settings: FolderCalendarSettings;
    onClick: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ event, settings, onClick }) => {
    const renderProperty = (key: string, value: any) => {
        if (Array.isArray(value)) {
            return value.map((item, index) => (
                <span key={`${key}-${index}`} className="calendar-tag">
                    {String(item)}
                </span>
            ));
        }

        return (
            <span className="calendar-tag">
                {String(value)}
            </span>
        );
    };

    return (
        <div className="calendar-card" onClick={onClick}>
            <div className="calendar-card-header">
                {event.icon && <span className="calendar-card-icon">{event.icon}</span>}
                <span className="calendar-card-title">{event.title}</span>
            </div>
            {Object.keys(event.properties).length > 0 && (
                <div className="calendar-card-properties">
                    {Object.entries(event.properties).map(([key, value]) => (
                        <div key={key} className="calendar-card-property">
                            {renderProperty(key, value)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
