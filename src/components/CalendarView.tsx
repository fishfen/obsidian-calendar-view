import * as React from 'react';
import { App, TFolder } from 'obsidian';
import { NoteEvent, FolderCalendarSettings } from '../types';
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
    const [showFolderPicker, setShowFolderPicker] = React.useState(false);
    const [previewNote, setPreviewNote] = React.useState<{ path: string; position: { x: number; y: number } } | null>(null);

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

    const handleFolderClick = () => {
        setShowFolderPicker(!showFolderPicker);
    };

    const handleFolderSelect = (folder: string) => {
        setCurrentFolder(folder);
        setShowFolderPicker(false);
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

    const handlePreviewNote = (filePath: string, position: { x: number; y: number }) => {
        setPreviewNote({ path: filePath, position });
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
            />
            <div className="calendar-toolbar">
                <div className="calendar-folder-display">
                    <span className="calendar-folder-label">Folder:</span>
                    <button
                        className="calendar-folder-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFolderClick();
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
                                    onClick={() => handleFolderSelect(folder)}
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
                                        setSelectedTags([]);
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
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
                    position={previewNote.position}
                    onClose={handleClosePreview}
                />
            )}
        </div>
    );
};
