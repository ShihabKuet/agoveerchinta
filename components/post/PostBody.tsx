'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

interface PostBodyProps {
  content: Record<string, unknown>
}

export default function PostBody({ content }: PostBodyProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: 'post-body focus:outline-none',
        lang: 'bn',
      },
    },
  })

  // Update content if it changes
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  if (!editor) return null

  return <EditorContent editor={editor} />
}
