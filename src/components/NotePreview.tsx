import * as React from 'react';
import { App, TFile } from 'obsidian';

interface NotePreviewProps {
    filePath: string;
    app: App;
    onClose: () => void;
    position: { x: number; y: number };
}

export const NotePreview: React.FC<NotePreviewProps> = ({ filePath, app, onClose, position }) => {
    const [content, setContent] = React.useState<string>('');
    const [loading, setLoading] = React.useState(true);
    const previewRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const loadContent = async () => {
            const file = app.vault.getAbstractFileByPath(filePath);
            if (file instanceof TFile) {
                const text = await app.vault.read(file);
                // Extract first 300 characters, remove frontmatter
                const withoutFrontmatter = text.replace(/^---[\s\S]*?---\n/, '');
                const preview = withoutFrontmatter.slice(0, 300);
                setContent(preview + (withoutFrontmatter.length > 300 ? '...' : ''));
            }
            setLoading(false);
        };

        loadContent();
    }, [filePath, app]);

    // Calculate position to stay within viewport
    const [adjustedPosition, setAdjustedPosition] = React.useState(position);

    React.useEffect(() => {
        if (previewRef.current) {
            const rect = previewRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let x = position.x;
            let y = position.y;

            // Adjust if preview goes off right edge
            if (x + rect.width > viewportWidth - 20) {
                x = viewportWidth - rect.width - 20;
            }

            // Adjust if preview goes off bottom edge
            if (y + rect.height > viewportHeight - 20) {
                y = viewportHeight - rect.height - 20;
            }

            // Ensure not off left or top edge
            x = Math.max(20, x);
            y = Math.max(20, y);

            setAdjustedPosition({ x, y });
        }
    }, [position, content]);

    return (
        <div
            ref={previewRef}
            className="calendar-note-preview"
            style={{
                left: `${adjustedPosition.x}px`,
                top: `${adjustedPosition.y}px`,
            }}
        >
            <div className="calendar-note-preview-header">
                <span className="calendar-note-preview-title">
                    {filePath.split('/').pop()?.replace('.md', '')}
                </span>
            </div>
            <div className="calendar-note-preview-content">
                {loading ? (
                    <div className="calendar-note-preview-loading">Loading...</div>
                ) : (
                    <div className="calendar-note-preview-text">{content}</div>
                )}
            </div>
        </div>
    );
};
