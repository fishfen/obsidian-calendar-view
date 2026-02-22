import * as React from 'react';
import { App, TFolder } from 'obsidian';
import { NoteEvent, FolderCalendarSettings, CardRect } from '../types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { NotePreview } from './NotePreview';

interface CalendarViewProps {
    events: NoteEvent[];
    settings: FolderCalendarSettings;
    app: App;
    onDateClick: (date: Date) => void;
    onNoteClick: (filePath: string) => void;
    onFolderChange: (folder: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
    events,
    settings,
    app,
    onDateClick,
    onNoteClick,
    onFolderChange
}) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [currentFolder, setCurrentFolder] = React.useState(settings.sourceFolder);
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
    const [previewNote, setPreviewNote] = React.useState<{ path: string; cardRect: CardRect } | null>(null);

    // Update current folder when settings change
    React.useEffect(() => {
        setCurrentFolder(settings.sourceFolder);
    }, [settings.sourceFolder]);

    // Extract all unique tags from events
    const allTags = React.useMemo(() => {
        const tagSet = new Set<string>();
        events.forEach(event => {
            if (event.properties.tags) {
                const tags = Array.isArray(event.properties.tags)
                    ? event.properties.tags
                    : [event.properties.tags];
                tags.forEach((tag: any) => tagSet.add(String(tag)));
            }
        });
        return Array.from(tagSet).sort();
    }, [events]);

    // Filter events by selected tags
    const filteredEvents = React.useMemo(() => {
        if (selectedTags.length === 0) return events;

        return events.filter(event => {
            if (!event.properties.tags) return false;
            const eventTags = Array.isArray(event.properties.tags)
                ? event.properties.tags
                : [event.properties.tags];
            return selectedTags.some(tag => eventTags.includes(tag));
        });
    }, [events, selectedTags]);

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

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleFolderSelect = (folder: string) => {
        setCurrentFolder(folder);
        onFolderChange(folder);
    };

    const getFolderList = (): string[] => {
        const folders: string[] = [''];
        const rootFolder = app.vault.getRoot();

        const traverse = (folder: TFolder) => {
            for (const child of folder.children) {
                if (child instanceof TFolder) {
                    folders.push(child.path);
                    traverse(child);
                }
            }
        };

        traverse(rootFolder);
        return folders;
    };

    const handlePreviewNote = (filePath: string, cardRect: CardRect | null) => {
        if (!cardRect) {
            setPreviewNote(null);
        } else {
            setPreviewNote({ path: filePath, cardRect });
        }
    };

    const handleClosePreview = () => {
        setPreviewNote(null);
    };

    // Close preview when clicking on the calendar
    const handleCalendarClick = () => {
        if (previewNote) {
            setPreviewNote(null);
        }
    };

    return (
        <div className="folder-calendar" onClick={handleCalendarClick}>
            <CalendarHeader
                currentDate={currentDate}
                onPrevious={goToPreviousMonth}
                onNext={goToNextMonth}
                onToday={goToToday}
                onMonthYearChange={handleMonthYearChange}
                currentFolder={currentFolder}
                onFolderSelect={handleFolderSelect}
                getFolderList={getFolderList}
                allTags={allTags}
                selectedTags={selectedTags}
                toggleTag={toggleTag}
                clearTags={() => setSelectedTags([])}
            />
            <CalendarGrid
                currentDate={currentDate}
                events={filteredEvents}
                settings={settings}
                app={app}
                onDateClick={onDateClick}
                onNoteClick={onNoteClick}
                onPreviewNote={handlePreviewNote}
            />
            {previewNote && (
                <NotePreview
                    filePath={previewNote.path}
                    app={app}
                    cardRect={previewNote.cardRect}
                    onClose={handleClosePreview}
                />
            )}
        </div>
    );
};
