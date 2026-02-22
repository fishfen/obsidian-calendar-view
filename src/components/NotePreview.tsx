import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App, TFile } from 'obsidian';
import { CardRect } from '../types';

const CARD_GAP = 8;
const VIEWPORT_MARGIN = 16;

function calculatePosition(
    cardRect: CardRect,
    previewWidth: number,
    previewHeight: number,
    viewportWidth: number,
    viewportHeight: number
): { x: number; y: number } {
    // Vertical: prefer below, fall back to above
    const spaceBelow = viewportHeight - VIEWPORT_MARGIN - (cardRect.bottom + CARD_GAP);
    const spaceAbove = cardRect.top - CARD_GAP - VIEWPORT_MARGIN;

    let y: number;
    if (spaceBelow >= previewHeight || spaceBelow >= spaceAbove) {
        y = cardRect.bottom + CARD_GAP;
    } else {
        y = cardRect.top - previewHeight - CARD_GAP;
    }

    // Horizontal: left-align with card, fall back to right-align
    let x = cardRect.left;
    if (x + previewWidth > viewportWidth - VIEWPORT_MARGIN) {
        x = cardRect.right - previewWidth;
    }

    // Final clamp to stay within viewport
    x = Math.max(VIEWPORT_MARGIN, Math.min(x, viewportWidth - previewWidth - VIEWPORT_MARGIN));
    y = Math.max(VIEWPORT_MARGIN, Math.min(y, viewportHeight - previewHeight - VIEWPORT_MARGIN));

    return { x, y };
}

interface NotePreviewProps {
    filePath: string;
    app: App;
    onClose: () => void;
    cardRect: CardRect;
}

export const NotePreview: React.FC<NotePreviewProps> = ({ filePath, app, onClose, cardRect }) => {
    const [content, setContent] = React.useState<string>('');
    const [loading, setLoading] = React.useState(true);
    const previewRef = React.useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = React.useState<{ x: number; y: number }>(
        { x: cardRect.left, y: cardRect.bottom + CARD_GAP }
    );

    React.useEffect(() => {
        const loadContent = async () => {
            const file = app.vault.getAbstractFileByPath(filePath);
            if (file instanceof TFile) {
                const text = await app.vault.read(file);
                const withoutFrontmatter = text.replace(/^---[\s\S]*?---\n/, '');
                const preview = withoutFrontmatter.slice(0, 300);
                setContent(preview + (withoutFrontmatter.length > 300 ? '...' : ''));
            }
            setLoading(false);
        };

        loadContent();
    }, [filePath, app]);

    React.useLayoutEffect(() => {
        if (!previewRef.current) return;
        const rect = previewRef.current.getBoundingClientRect();
        const pos = calculatePosition(
            cardRect,
            rect.width,
            rect.height,
            window.innerWidth,
            window.innerHeight
        );
        setAdjustedPosition(pos);
    }, [cardRect, content, loading]);

    return ReactDOM.createPortal(
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
        </div>,
        document.body
    );
};
