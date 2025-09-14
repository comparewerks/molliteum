// src/components/TiptapEditor.tsx
"use client";

import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, List, ListOrdered, Heading2 } from 'lucide-react';
import { Toggle } from './ui/toggle';
import { useState } from 'react'; // ✨ 1. Import useState
import { useEditor, EditorContent, type Editor } from '@tiptap/react';

export default function TiptapEditor({
  name,
  initialContent = '',
}: {
  name: string;
  initialContent?: string;
}) {
  // ✨ 2. Create state to hold the HTML content
  const [html, setHtml] = useState(initialContent);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none border rounded-md p-4 min-h-[200px]',
      },
    },
    // ✨ 3. Add `immediatelyRender: false` to prevent SSR hydration errors
    immediatelyRender: false,
    // ✨ 4. Listen for updates and sync the state
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
    },
  });

  return (
    <div className="space-y-2">
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} />
      {/* ✨ 5. Use the `html` state for the textarea's value */}
      <textarea
        name={name}
        value={html}
        readOnly
        className="hidden"
      />
    </div>
  );
}

// (TiptapToolbar component remains the same)
const TiptapToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md p-1 flex gap-1">
      <Toggle pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Toggle>
      <Toggle pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Toggle>
      <Toggle pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Toggle>
      <Toggle pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Toggle>
      <Toggle pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Toggle>
      <Toggle pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Toggle>
    </div>
  );
};