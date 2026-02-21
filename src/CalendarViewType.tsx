import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import FolderCalendarPlugin from '../main';
import { CalendarView } from './components/CalendarView';
import { NoteEvent } from './types';

export const VIEW_TYPE_CALENDAR = 'folder-calendar-view';

export class CalendarViewType extends ItemView {
    plugin: FolderCalendarPlugin;
    root: ReactDOM.Root | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: FolderCalendarPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_CALENDAR;
    }

    getDisplayText(): string {
        return 'Calendar View';
    }

    getIcon(): string {
        return 'calendar';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('folder-calendar-view');

        this.root = ReactDOM.createRoot(container);
        this.renderCalendar();
    }

    async onClose(): Promise<void> {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }

    renderCalendar(): void {
        if (!this.root) return;

        const events = this.getEventsFromVault();

        this.root.render(
            React.createElement(CalendarView, {
                events,
                settings: this.plugin.settings,
                app: this.app,
                onDateClick: this.handleDateClick.bind(this),
                onNoteClick: this.handleNoteClick.bind(this),
                onFolderChange: this.handleFolderChange.bind(this),
            })
        );
    }

    handleFolderChange(folder: string): void {
        // Temporarily change the folder for this view only
        // This doesn't save to settings
        this.renderCalendar();
    }

    getEventsFromVault(folder?: string): NoteEvent[] {
        const events: NoteEvent[] = [];
        const { sourceFolder, dateField } = this.plugin.settings;
        const targetFolder = folder !== undefined ? folder : sourceFolder;

        const files = this.app.vault.getMarkdownFiles();

        for (const file of files) {
            // Filter by folder
            if (targetFolder && !file.path.startsWith(targetFolder)) {
                continue;
            }

            const cache = this.app.metadataCache.getFileCache(file);
            if (!cache?.frontmatter) continue;

            const dateValue = cache.frontmatter[dateField];
            if (!dateValue) continue;

            const date = this.parseDate(dateValue);
            if (!date) continue;

            const title = cache.frontmatter.title || file.basename;
            const icon = cache.frontmatter.icon;

            const properties: Record<string, any> = {};
            for (const prop of this.plugin.settings.displayProperties) {
                if (cache.frontmatter[prop]) {
                    properties[prop] = cache.frontmatter[prop];
                }
            }

            events.push({
                file: file.path,
                title,
                date,
                icon,
                properties
            });
        }

        return events;
    }

    parseDate(value: any): Date | null {
        if (!value) return null;

        try {
            if (value instanceof Date) {
                return value;
            }

            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return null;
            }

            return date;
        } catch {
            return null;
        }
    }

    async handleDateClick(date: Date): Promise<void> {
        const { sourceFolder, dateField } = this.plugin.settings;
        const folder = sourceFolder || '';

        const dateStr = this.formatDate(date);
        const fileName = `${dateStr}.md`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        // Check if file already exists
        const existingFile = this.app.vault.getAbstractFileByPath(filePath);
        if (existingFile) {
            if (existingFile instanceof TFile) {
                await this.app.workspace.getLeaf(false).openFile(existingFile);
            }
            return;
        }

        // Create new file with frontmatter
        const content = `---\n${dateField}: ${dateStr}\n---\n\n`;

        const file = await this.app.vault.create(filePath, content);
        await this.app.workspace.getLeaf(false).openFile(file);

        // Refresh the view
        this.renderCalendar();
    }

    async handleNoteClick(filePath: string): Promise<void> {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (file instanceof TFile) {
            await this.app.workspace.getLeaf(false).openFile(file);
        }
    }

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    refresh(): void {
        this.renderCalendar();
    }
}
