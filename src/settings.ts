import { App, PluginSettingTab, Setting, TFolder } from 'obsidian';
import FolderCalendarPlugin from '../main';

export class FolderCalendarSettingTab extends PluginSettingTab {
    plugin: FolderCalendarPlugin;

    constructor(app: App, plugin: FolderCalendarPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Folder Calendar Settings' });

        // Source Folder Setting
        new Setting(containerEl)
            .setName('Source Folder')
            .setDesc('Select the folder to display in the calendar view')
            .addDropdown(dropdown => {
                const folders = this.getFolderList();
                folders.forEach(folder => {
                    dropdown.addOption(folder, folder || '(Root)');
                });
                dropdown
                    .setValue(this.plugin.settings.sourceFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.sourceFolder = value;
                        await this.plugin.saveSettings();
                        this.plugin.refreshViews();
                    });
            });

        // Date Field Setting
        new Setting(containerEl)
            .setName('Date Field')
            .setDesc('The YAML frontmatter field to use for date (e.g., "date" or "created")')
            .addText(text => text
                .setPlaceholder('date')
                .setValue(this.plugin.settings.dateField)
                .onChange(async (value) => {
                    this.plugin.settings.dateField = value || 'date';
                    await this.plugin.saveSettings();
                    this.plugin.refreshViews();
                }));

        // Display Properties Setting
        new Setting(containerEl)
            .setName('Display Properties')
            .setDesc('Comma-separated list of frontmatter properties to display on cards (e.g., "tags,category,status")')
            .addTextArea(text => text
                .setPlaceholder('tags,category,status')
                .setValue(this.plugin.settings.displayProperties.join(','))
                .onChange(async (value) => {
                    this.plugin.settings.displayProperties = value
                        .split(',')
                        .map(v => v.trim())
                        .filter(v => v);
                    await this.plugin.saveSettings();
                    this.plugin.refreshViews();
                }));

        // Start of Week Setting
        new Setting(containerEl)
            .setName('Start of Week')
            .setDesc('Choose which day the week starts on')
            .addDropdown(dropdown => dropdown
                .addOption('monday', 'Monday')
                .addOption('sunday', 'Sunday')
                .setValue(this.plugin.settings.startOfWeek)
                .onChange(async (value) => {
                    this.plugin.settings.startOfWeek = value as 'monday' | 'sunday';
                    await this.plugin.saveSettings();
                    this.plugin.refreshViews();
                }));
    }

    getFolderList(): string[] {
        const folders: string[] = [''];
        const rootFolder = this.app.vault.getRoot();

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
    }
}
