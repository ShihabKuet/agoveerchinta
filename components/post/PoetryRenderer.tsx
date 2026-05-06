'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

// Special read-only renderer for কবিতা (poetry)
// Preserves line breaks, uses serif font with generous line height
// and applies centered layout with narrower max-width for poetic feel
export default function PoetryRenderer({ content }: { content: Record<string, unknown> }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: 'poetry-body focus:outline-none',
        lang: 'bn',
      },
    },
  })

  useEffect(() => {
    if (editor && content) editor.commands.setContent(content)
  }, [editor, content])

  if (!editor) return null

  return (
    <div className="max-w-xl mx-auto">
      <EditorContent editor={editor} />
    </div>
  )
}
