import { Plugin, WorkspaceLeaf } from 'obsidian';
import { FolderCalendarSettings, DEFAULT_SETTINGS } from './src/types';
import { FolderCalendarSettingTab } from './src/settings';
import { CalendarViewType, VIEW_TYPE_CALENDAR } from './src/CalendarViewType';

export default class FolderCalendarPlugin extends Plugin {
    settings: FolderCalendarSettings;

    async onload() {
        await this.loadSettings();

        // Register the calendar view
        this.registerView(
            VIEW_TYPE_CALENDAR,
            (leaf) => new CalendarViewType(leaf, this)
        );

        // Add ribbon icon
        this.addRibbonIcon('calendar', 'Open Folder Calendar', () => {
            this.activateView();
        });

        // Add command to open calendar
        this.addCommand({
            id: 'open-folder-calendar',
            name: 'Open Folder Calendar',
            callback: () => {
                this.activateView();
            }
        });

        // Add settings tab
        this.addSettingTab(new FolderCalendarSettingTab(this.app, this));

        // Listen for file changes to refresh the view
        this.registerEvent(
            this.app.vault.on('modify', () => {
                this.refreshViews();
            })
        );

        this.registerEvent(
            this.app.vault.on('create', () => {
                this.refreshViews();
            })
        );

        this.registerEvent(
            this.app.vault.on('delete', () => {
                this.refreshViews();
            })
        );

        this.registerEvent(
            this.app.vault.on('rename', () => {
                this.refreshViews();
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
            // Create a new leaf in the right sidebar
            leaf = workspace.getRightLeaf(false);
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
