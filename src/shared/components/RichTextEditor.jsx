'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react';
import { useEffect } from 'react';

/**
 * RichTextEditor — TipTap-based rich text editor for case context.
 * 
 * Features:
 *  - Bold, Italic, Bullet List, Ordered List, Blockquote
 *  - Word count with max limit
 *  - Placeholder text
 *  - Dark-theme styled toolbar
 * 
 * Props:
 *   content: string (HTML)
 *   onUpdate: (html: string, wordCount: number) => void
 *   placeholder: string
 *   maxWords: number
 */
export default function RichTextEditor({
  content = '',
  onUpdate,
  placeholder = 'Poori baat batao... dono sides fairly',
  maxWords = 500,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,       // No headings — keep it simple
        codeBlock: false,     // No code blocks
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount.configure({
        // We'll use word counting manually
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[160px] max-h-[320px] overflow-y-auto px-4 py-3 text-sm leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      onUpdate?.(html, wordCount);
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const wordCount = editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0;
  const isOverLimit = wordCount > maxWords;

  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-all duration-150
        ${isActive
          ? 'bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'}`}
    >
      {children}
    </button>
  );

  return (
    <div className={`rounded-xl border transition-colors overflow-hidden
      ${editor.isFocused
        ? 'border-[var(--accent-purple)]'
        : 'border-[var(--border-subtle)]'}
      bg-[var(--bg-elevated)]`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarButton>

        <div className="w-px h-4 bg-[var(--border-subtle)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={14} />
        </ToolbarButton>

        <div className="w-px h-4 bg-[var(--border-subtle)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo size={14} />
        </ToolbarButton>

        {/* Word count — right-aligned */}
        <div className="ml-auto">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
            ${isOverLimit
              ? 'bg-red-500/15 text-red-400'
              : wordCount >= maxWords * 0.9
                ? 'bg-yellow-500/15 text-yellow-400'
                : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}
          >
            {wordCount}/{maxWords} words
          </span>
        </div>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
