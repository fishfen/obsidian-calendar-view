export interface FolderCalendarSettings {
    sourceFolder: string;
    dateField: string;
    displayProperties: string[];
    startOfWeek: 'monday' | 'sunday';
    hoverPreviewDelay: number; // in milliseconds
}

export const DEFAULT_SETTINGS: FolderCalendarSettings = {
    sourceFolder: '',
    dateField: 'date',
    displayProperties: ['tags'],
    startOfWeek: 'monday',
    hoverPreviewDelay: 500
};

export interface NoteEvent {
    file: string;
    title: string;
    date: Date;
    icon?: string;
    properties: Record<string, any>;
}
