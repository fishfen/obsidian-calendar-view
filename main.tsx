import { Plugin, WorkspaceLeaf } from 'obsidian';
import { FolderCalendarSettings, DEFAULT_SETTINGS } from './src/types';
import { FolderCalendarSettingTab } from './src/settings';
import { CalendarViewType, VIEW_TYPE_CALENDAR } from './src/CalendarViewType';

export default class FolderCalendarPlugin extends Plugin {
    settings: FolderCalendarSettings;
    private refreshTimeout: NodeJS.Timeout | null = null;

    async onload() {
        await this.loadSettings();

        // Register the calendar view
        this.registerView(
            VIEW_TYPE_CALENDAR,
            (leaf) => new CalendarViewType(leaf, this)
        );

        // Add ribbon icon
        this.addRibbonIcon('calendar', 'Open Calendar View', () => {
            this.activateView();
        });

        // Add command to open calendar
        this.addCommand({
            id: 'open-calendar-view',
            name: 'Open Calendar View',
            callback: () => {
                this.activateView();
            }
        });

        // Add settings tab
        this.addSettingTab(new FolderCalendarSettingTab(this.app, this));

        // Listen for file changes to refresh the view with debouncing
        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                this.debouncedRefresh();
            })
        );

        this.registerEvent(
            this.app.vault.on('create', (file) => {
                this.debouncedRefresh();
            })
        );

        this.registerEvent(
            this.app.vault.on('delete', (file) => {
                this.debouncedRefresh();
            })
        );

        this.registerEvent(
            this.app.vault.on('rename', (file, oldPath) => {
                this.debouncedRefresh();
            })
        );

        // Listen for metadata changes (important for frontmatter updates)
        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                this.debouncedRefresh();
            })
        );
    }

    onunload() {
        // Cleanup: detach all calendar views
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_CALENDAR);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_CALENDAR);

        if (leaves.length > 0) {
            // A calendar view is already open, use it
            leaf = leaves[0];
        } else {
            // Create a new leaf in the main editor area
            leaf = workspace.getLeaf(true);
            if (leaf) {
                await leaf.setViewState({
                    type: VIEW_TYPE_CALENDAR,
                    active: true,
                });
            }
        }

        // Reveal the leaf
        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }

    debouncedRefresh() {
        // Clear existing timeout
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }

        // Set new timeout to refresh after 300ms
        this.refreshTimeout = setTimeout(() => {
            this.refreshViews();
            this.refreshTimeout = null;
        }, 300);
    }

    refreshViews() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR);
        for (const leaf of leaves) {
            const view = leaf.view;
            if (view instanceof CalendarViewType) {
                view.refresh();
            }
        }
    }
}
