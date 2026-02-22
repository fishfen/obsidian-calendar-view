# Obsidian Folder Calendar View

A Notion-style calendar view plugin for Obsidian that displays notes from a specific folder in a monthly calendar grid.

## Features

- **Monthly Calendar View**: Clean, grid-based calendar layout with week navigation
- **Folder-based**: Display notes from any chosen folder in your vault
- **Date Mapping**: Uses YAML frontmatter date fields to place notes on calendar
- **Note Cards**: Display notes as cards with icons, titles, and custom properties
- **Hover Preview**: Hover over a note card to see a preview of its content; auto-dismisses when mouse leaves
- **Quick Actions**:
  - Click cards to open notes
  - Hover over dates and click '+' to create new notes
  - Navigate months with arrow buttons or quick month/year picker
- **Customizable**:
  - Choose source folder
  - Configure date field name
  - Select which properties to display on cards
  - Set week start day (Monday/Sunday)

## Installation

### For Development

1. Clone this repository to your local machine
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile the plugin
4. Create a symlink to your Obsidian vault's plugins folder:
   ```bash
   ln -s /path/to/obsidian-calendar /path/to/vault/.obsidian/plugins/folder-calendar-view
   ```
5. Enable the plugin in Obsidian settings

### For Development with Auto-rebuild

Run `npm run dev` to start the build watcher. Any changes to source files will automatically rebuild the plugin.

## Usage

1. **Open the Calendar**:
   - Click the calendar icon in the ribbon bar, or
   - Use command palette: "Open Folder Calendar"

2. **Configure Settings**:
   - Go to Settings → Folder Calendar View
   - Select your source folder (e.g., "Daily Notes" or "Projects")
   - Set the date field name (default: "date")
   - Choose which properties to display (e.g., "tags,status,category")
   - Set your preferred week start day

3. **Create Notes with Dates**:
   - Notes must have a date in their YAML frontmatter to appear on the calendar
   - Example:
     ```yaml
     ---
     date: 2026-02-20
     tags: [meeting, work]
     icon: 📝
     ---
     ```

4. **Navigate the Calendar**:
   - Use `<` and `>` buttons to move between months
   - Click on the month/year to open a quick picker
   - Click "Today" to jump to the current month
   - Hover over any date and click `+` to create a new note for that date

## Note Format

For best results, structure your notes like this:

```markdown
---
date: 2026-02-20
title: My Custom Title
icon: 🎯
tags: [project, important]
category: Work
status: In Progress
---

Your note content here...
```

- `date`: Required - the date this note belongs to
- `title`: Optional - display name (defaults to filename)
- `icon`: Optional - emoji or icon to show on the card
- Other properties: Will be displayed if included in "Display Properties" setting

## Development

### Project Structure

```
obsidian-calendar/
├── main.tsx                    # Main plugin entry point
├── src/
│   ├── types.ts                # TypeScript interfaces
│   ├── settings.ts             # Settings tab implementation
│   ├── CalendarViewType.tsx    # View registration and data loading
│   └── components/
│       ├── CalendarView.tsx    # Main calendar component
│       ├── CalendarHeader.tsx  # Month navigation header
│       ├── CalendarGrid.tsx    # Calendar grid layout
│       ├── DateCell.tsx        # Individual date cells
│       ├── NoteCard.tsx        # Note card display
│       └── NotePreview.tsx     # Hover preview popup (portal-rendered)
├── styles.css                  # Plugin styles
└── manifest.json               # Plugin metadata
```

### Building

- `npm run dev`: Watch mode for development
- `npm run build`: Production build
- `npm run version`: Bump version and update manifest

## Technical Details

- **Framework**: React 18
- **Build Tool**: esbuild
- **Language**: TypeScript
- **Performance**: Uses Obsidian's MetadataCache for fast frontmatter access

## License

MIT
