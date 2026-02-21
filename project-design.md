
# 项目名称：Obsidian Calendar View (Notion-Style)

## 1. 项目概述 (Project Overview)
开发一个 Obsidian 插件，提供一个基于**特定文件夹**的**月视图日历**。
该插件的核心目标是模仿 Notion 的日历视图体验，允许用户以可视化的方式管理特定项目或日记文件夹中的笔记。笔记将以”卡片”形式显示在日历网格中，并支持显示元数据（如标签、状态）。

## 2. 核心功能需求 (Functional Requirements)

### 2.1 视图与导航
*   **入口**：
    *   在 Obsidian 侧边栏/Ribbon 添加图标打开日历视图。
    *   支持命令面板命令：`Open Calendar View`。
*   **位置要求 (Location Requirement)**:
    *   主编辑器区域 (Main Editor Area): 当用户打开日历时，它在 Obsidian 的中间主编辑区域作为一页新的 Tab 打开（就像打开一个普通的 Markdown 笔记一样）。
*   **日历网格**：
    *   默认显示当前月份的网格视图（7列 x 5/6行）。
    *   显示星期表头（周一至周日，可配置起始日）。
    *   当前日期需高亮显示。
*   **导航控制**：
    *   顶部显示当前年份和月份（格式：yyyy mm，如 “2026 02”），固定宽度按钮。点击它可以在选择面板中快速切换年月。
    *   年份选择器支持滚动选择（1900-2100年范围）。
    *   提供 `<` (上一月) 和 `>` (下一月) 按钮。
    *   提供紫色的 `Today` 按钮快速跳转回当月。

### 2.2 数据源与过滤 (Data Source)
*   **文件夹绑定**：
    *   在插件设置中，用户必须选择一个**目标文件夹**（例如 `”Projects/”` 或 `”Daily Notes/”`）。
    *   插件仅读取该文件夹（及其子文件夹）下的 Markdown 文件。
    *   **工具栏文件夹显示**：在日历上方工具栏显示当前使用的文件夹路径，点击可临时修改文件夹（不保存到设置）。
*   **标签筛选 (Tag Filter)**：
    *   工具栏提供标签筛选器，自动提取所有笔记的标签。
    *   用户可点击标签进行筛选，只显示包含选中标签的笔记。
    *   支持多标签筛选和清除筛选。
*   **日期映射逻辑 (关键)**：
    *   插件需要知道每个笔记属于哪一天。优先级逻辑如下：
        1.  **YAML Frontmatter 属性**：读取用户指定的日期字段（默认为 `date` 或 `created`）。

### 2.3 笔记卡片显示 (UI Card Design)
参考 Notion 样式，每个日历格内的笔记应显示为一个”卡片”：
*   **图标 (Icon)**：如果笔记定义了 icon (通过 Frontmatter 或其他插件)，显示在标题前。
*   **标题 (Title)**：显示笔记文件名或 YAML 中的 `title` 别名。
*   **属性/标签 (Properties/Tags)**：
    *   支持在设置中配置**显示哪些 Frontmatter 属性**。
    *   **样式**：如参考图中的 “Code” 标签，需带有浅色背景和有色文字（Pill shape）。
*   **溢出处理**：如果某天笔记过多，显示 “Show X more” 按钮。
*   **悬停预览 (Hover Preview)**：
    *   鼠标悬停在卡片上指定时间后（默认500ms，可在设置中配置），弹出预览窗格。
    *   预览窗格显示笔记的前300字符（去除Frontmatter）。
    *   预览窗格浮动在日历上方，点击日历其他位置可关闭预览。
    *   单击卡片仍然打开完整笔记。

### 2.4 交互操作 (Interactions)
*   **点击卡片**：在当前窗格或新标签页中打开该笔记。
*   **悬停卡片**：延迟显示笔记预览窗格。
*   **新建笔记**：
    *   鼠标悬停在某个日期格子上时，右上角显示 `+` 号。
    *   点击 `+` 号，在该日期并在目标文件夹内创建新笔记。
    *   **自动填充**：新笔记应自动在 Frontmatter 中写入该日期的值。

## 3. 技术架构建议 (Technical Architecture)

### 3.1 技术栈
*   **语言**：TypeScript
*   **UI 框架**：使用 **React 18**（处理复杂的日历状态和DOM渲染比原生JS更高效）。
*   **Obsidian API**：
    *   `Vault.getFiles()`: 获取文件列表。
    *   `MetadataCache`: 获取 Frontmatter 数据（高性能，避免频繁读盘）。
    *   `MetadataCache.on('changed')`: 监听Frontmatter变化实现实时更新。
    *   `WorkspaceLeaf`: 管理视图容器。
    *   `Vault.on('modify/create/delete/rename')`: 监听文件变化。

### 3.2 关键设置选项 (Settings Schema)
开发人员需实现以下设置页面：
1.  **Source Folder**: (Dropdown) 选择要监控的文件夹。
2.  **Date Field**: (Text input) 指定用于定位日期的 YAML 属性名（默认为 `date`）。
3.  **Display Properties**: (Multi-select/Text area) 在卡片上显示哪些额外的 YAML 属性（如参考图中的 `tags` 或 `category`）。
4.  **Start of Week**: (Dropdown) Monday 或 Sunday。
5.  **Hover Preview Delay**: (Number input) 悬停预览延迟时间（毫秒，默认500ms）。

### 3.3 数据流逻辑
1.  **初始化**：插件加载 -> 读取设置 -> 扫描目标文件夹 -> 解析所有文件的 Metadata -> 构建内存中的事件对象列表。
2.  **渲染**：根据当前月份，过滤出对应的事件对象 -> 渲染 React 组件网格。
3.  **实时更新**：
    *   监听 `vault.on('modify/create/delete/rename')` 和 `metadataCache.on('changed')`。
    *   使用防抖（300ms）避免频繁刷新。
    *   当文件发生变更时，重新渲染整个日历视图。

### 3.4 组件架构
*   **CalendarView**: 主容器组件，管理状态（当前日期、筛选标签、临时文件夹）。
*   **CalendarHeader**: 导航头部，包含月份选择器、导航按钮、Today按钮。
*   **CalendarToolbar**: 工具栏，包含文件夹显示和标签筛选器（内嵌在CalendarView中）。
*   **CalendarGrid**: 日历网格容器。
*   **DateCell**: 单个日期单元格，包含日期数字和笔记卡片列表。
*   **NoteCard**: 笔记卡片，支持悬停预览。
*   **NotePreview**: 预览窗格组件。

## 4. UI 设计规范 (Visual Specs)

*   **配色方案**：必须适配 Obsidian 的 **Light Mode** 和 **Dark Mode**（使用 CSS Variables: `--background-primary`, `--text-normal`, `--interactive-accent` 等）。
*   **Today按钮**：使用紫色背景（#9333ea），悬停时变为深紫色（#7c3aed）。
*   **日期按钮**：固定宽度（min-width: 120px），居中显示”yyyy mm”格式。
*   **年份选择器**：竖向滚动列表，支持1900-2100年选择，带滚动条样式。
*   **工具栏**：位于日历网格上方，包含文件夹显示和标签筛选器，自适应换行。
*   **预览窗格**：固定宽度400px，最大高度500px，带阴影和边框，自动调整位置避免超出视口。

---

### 给开发者的特别提示 (Note to Developer)
> **关于性能：**
> 1. 请务必使用 `app.metadataCache` 而不是直接读取文件内容来获取 Frontmatter，否则当文件夹内有数百个笔记时，渲染会非常卡顿。
> 2. 使用防抖机制处理vault事件，避免频繁刷新。
> 3. 监听 `metadataCache.on('changed')` 事件确保Frontmatter修改后实时更新日历。

