import * as React from 'react';
import { NoteEvent, FolderCalendarSettings, CardRect } from '../types';

interface NoteCardProps {
    event: NoteEvent;
    settings: FolderCalendarSettings;
    onClick: () => void;
    onPreview: (cardRect: CardRect | null) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ event, settings, onClick, onPreview }) => {
    const [hoverTimeout, setHoverTimeout] = React.useState<NodeJS.Timeout | null>(null);
    const cardRef = React.useRef<HTMLDivElement>(null);

    const handleMouseEnter = (e: React.MouseEvent) => {
        const domRect = cardRef.current?.getBoundingClientRect();
        if (!domRect) return;

        const cardRect: CardRect = {
            top: domRect.top,
            bottom: domRect.bottom,
            left: domRect.left,
            right: domRect.right,
            width: domRect.width,
            height: domRect.height,
        };

        const timeout = setTimeout(() => {
            onPreview(cardRect);
        }, settings.hoverPreviewDelay);

        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        onPreview(null);
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        onClick();
    };

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
        <div
            ref={cardRef}
            className="calendar-card"
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
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
