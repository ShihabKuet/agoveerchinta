'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, ImageIcon,
  Link2, Minus, Undo, Redo,
  Save, Eye, Send,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { cn, toBengaliNumerals } from '@/lib/utils'

// Slugify Bengali: removes diacritics, replaces spaces with hyphens
// For Bengali we keep Unicode chars but collapse to URL-safe format
function makeSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0980-\u09FF\u0041-\u007A0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

const CATEGORIES = [
  { value: '', label: 'বিভাগ নির্বাচন করুন' },
  { value: 'sahitya',    label: 'সাহিত্য' },
  { value: 'rajneeti',  label: 'রাজনীতি' },
  { value: 'biggan',    label: 'বিজ্ঞান' },
  { value: 'projukti',  label: 'প্রযুক্তি' },
  { value: 'kheladhula',label: 'খেলাধুলা' },
  { value: 'binodon',   label: 'বিনোদন' },
  { value: 'bhromon',   label: 'ভ্রমণ' },
  { value: 'kobita',    label: 'কবিতা' },
  { value: 'golpo',     label: 'গল্প' },
  { value: 'boi-review',label: 'বই রিভিউ' },
]

const POST_TYPES = [
  { value: 'article',     label: 'নিবন্ধ' },
  { value: 'poem',        label: 'কবিতা' },
  { value: 'story',       label: 'গল্প' },
  { value: 'novel',       label: 'উপন্যাস' },
  { value: 'book_review', label: 'বই রিভিউ' },
  { value: 'download',    label: 'ডাউনলোড' },
]

export default function EditorPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [title, setTitle]             = useState('')
  const [excerpt, setExcerpt]         = useState('')
  const [slug, setSlug]               = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [postType, setPostType]       = useState('article')
  const [featureImage, setFeatureImage] = useState('')
  const [isFeatured, setIsFeatured]   = useState(false)
  const [isBreaking, setIsBreaking]   = useState(false)
  const [saving, setSaving]           = useState(false)
  const [status, setStatus]           = useState<'draft' | 'published'>('draft')
  const [message, setMessage]         = useState('')

  // ---- Tiptap editor ----
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'এখানে আপনার লেখা শুরু করুন...',
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        class: 'post-body min-h-[400px] focus:outline-none px-1',
        lang: 'bn',
      },
    },
  })

  // Auto-generate slug from title
  const handleTitleChange = useCallback((value: string) => {
    setTitle(value)
    setSlug(makeSlug(value))
  }, [])

  async function getCategoryId(slug: string): Promise<string | null> {
    if (!slug) return null
    const { data } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()
    return data?.id || null
  }

  async function handleSave(saveStatus: 'draft' | 'published') {
    if (!title.trim()) {
      setMessage('শিরোনাম দিন।')
      return
    }
    if (!editor) return

    setSaving(true)
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('লগইন করুন।')
        setSaving(false)
        return
      }

      const categoryId = await getCategoryId(categorySlug)
      const bodyJSON   = editor.getJSON()
      const bodyText   = editor.getText()

      const payload = {
        title:             title.trim(),
        slug:              slug || makeSlug(title),
        excerpt:           excerpt.trim() || null,
        body:              bodyJSON,
        body_text:         bodyText,
        feature_image_url: featureImage.trim() || null,
        category_id:       categoryId,
        author_id:         user.id,
        status:            saveStatus,
        post_type:         postType,
        is_featured:       isFeatured,
        is_breaking:       isBreaking,
        published_at:      saveStatus === 'published' ? new Date().toISOString() : null,
      }

      const { data, error } = await supabase
        .from('posts')
        .insert(payload)
        .select('slug')
        .single()

      if (error) throw error

      setMessage(saveStatus === 'published' ? '✓ প্রকাশিত হয়েছে!' : '✓ খসড়া সংরক্ষিত।')
      setStatus(saveStatus)

      if (saveStatus === 'published' && data?.slug) {
        setTimeout(() => router.push(`/${data.slug}`), 1200)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'সংরক্ষণ ব্যর্থ হয়েছে।'
      setMessage(`✗ ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  if (!editor) return null

  const wordCount = editor.storage.characterCount?.words?.() || 0

  return (
    <div className="flex flex-col h-screen bg-paper">

      {/* ---- TOP BAR ---- */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-bengali-serif font-bold text-lg text-ink">নতুন লেখা</h1>
          {message && (
            <span className={cn(
              'text-xs font-bengali-sans px-2 py-1 rounded',
              message.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}>
              {message}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted font-bengali-sans hidden sm:block">
            {toBengaliNumerals(wordCount)} শব্দ
          </span>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bengali-sans font-medium border border-[var(--color-border)] rounded-lg text-ink hover:bg-paper-dark transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            খসড়া
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bengali-sans font-semibold bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            <Send size={15} />
            {saving ? 'সংরক্ষণ...' : 'প্রকাশ করুন'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ---- MAIN EDITOR AREA ---- */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">

            {/* Title */}
            <textarea
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="শিরোনাম লিখুন..."
              rows={2}
              className="w-full font-bengali-serif text-3xl font-extrabold text-ink bg-transparent border-none outline-none resize-none placeholder:text-ink-muted/40 mb-2 leading-snug"
              lang="bn"
            />

            {/* Slug (editable) */}
            <div className="flex items-center gap-2 mb-4 text-xs text-ink-muted font-bengali-sans">
              <span className="shrink-0">URL:</span>
              <span className="text-ink-muted opacity-60">agoveerchinta.com/</span>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="flex-1 bg-transparent border-b border-dashed border-[var(--color-border)] focus:outline-none focus:border-accent text-ink"
                placeholder="url-slug"
              />
            </div>

            {/* Excerpt */}
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="সারসংক্ষেপ লিখুন (ঐচ্ছিক) — পোস্ট কার্ডে দেখাবে..."
              rows={2}
              className="w-full font-bengali-sans text-base text-ink-muted bg-paper-dark/60 border border-dashed border-[var(--color-border)] rounded-lg px-4 py-3 outline-none resize-none placeholder:text-ink-muted/50 mb-6 focus:border-accent"
              lang="bn"
            />

            {/* Tiptap toolbar */}
            <div className="flex flex-wrap gap-0.5 mb-3 p-2 bg-paper-dark rounded-lg border border-[var(--color-border)]">
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="বোল্ড"><Bold size={15} /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="ইটালিক"><Italic size={15} /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="আন্ডারলাইন"><UnderlineIcon size={15} /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="স্ট্রাইকথ্রু"><Strikethrough size={15} /></ToolbarBtn>
              <div className="w-px h-6 bg-[var(--color-border)] mx-1 self-center" />
              <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="শিরোনাম ১"><Heading1 size={15} /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="শিরোনাম ২"><Heading2 size={15} /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="শিরোনাম ৩"><Heading3 size={15} /></ToolbarBtn>
              <div className="w-px h-6 bg-[var(--color-border)] mx-1 self-center" />
              <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="বাম"><AlignLeft size={15} /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="মাঝ"><AlignCenter size={15} /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="ডান"><AlignRight size={15} /></ToolbarBtn>
              <div className="w-px h-6 bg-[var(--color-border)] mx-1 self-center" />
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="বুলেট তালিকা"><List size={15} /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="ক্রমিক তালিকা"><ListOrdered size={15} /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="উদ্ধৃতি"><Quote size={15} /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="বিভাজক"><Minus size={15} /></ToolbarBtn>
              <div className="w-px h-6 bg-[var(--color-border)] mx-1 self-center" />
              <ToolbarBtn
                onClick={() => {
                  const url = window.prompt('ছবির URL দিন:')
                  if (url) editor.chain().focus().setImage({ src: url }).run()
                }}
                title="ছবি যোগ করুন"
              >
                <ImageIcon size={15} />
              </ToolbarBtn>
              <ToolbarBtn
                onClick={() => {
                  const url = window.prompt('লিংক URL দিন:')
                  if (url) editor.chain().focus().setLink({ href: url }).run()
                  else editor.chain().focus().unsetLink().run()
                }}
                active={editor.isActive('link')}
                title="লিংক"
              >
                <Link2 size={15} />
              </ToolbarBtn>
              <div className="w-px h-6 bg-[var(--color-border)] mx-1 self-center" />
              <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="পূর্বাবস্থা"><Undo size={15} /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="পুনরায়"><Redo size={15} /></ToolbarBtn>
            </div>

            {/* Editor body */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 min-h-[500px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* ---- SETTINGS PANEL (right side) ---- */}
        <div className="w-72 shrink-0 border-l border-[var(--color-border)] bg-white overflow-y-auto">
          <div className="p-5 space-y-5">
            <h3 className="font-bengali-sans font-bold text-sm uppercase tracking-wider text-ink-muted">পোস্ট সেটিংস</h3>

            {/* Status */}
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5">অবস্থা</label>
              <div className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-bengali-sans',
                status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              )}>
                <div className={cn('w-1.5 h-1.5 rounded-full', status === 'published' ? 'bg-green-500' : 'bg-amber-500')} />
                {status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5">বিভাগ</label>
              <select
                value={categorySlug}
                onChange={e => setCategorySlug(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bengali-sans border border-[var(--color-border)] rounded-lg bg-paper focus:outline-none focus:border-accent"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Post type */}
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5">লেখার ধরন</label>
              <select
                value={postType}
                onChange={e => setPostType(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bengali-sans border border-[var(--color-border)] rounded-lg bg-paper focus:outline-none focus:border-accent"
              >
                {POST_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Feature image */}
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5">ফিচার ছবির URL</label>
              <input
                type="url"
                value={featureImage}
                onChange={e => setFeatureImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm font-bengali-sans border border-[var(--color-border)] rounded-lg bg-paper focus:outline-none focus:border-accent"
              />
              {featureImage && (
                <div className="mt-2 rounded-lg overflow-hidden border border-[var(--color-border)] aspect-video bg-paper-dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featureImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
                <div>
                  <p className="text-sm font-bengali-sans font-medium text-ink">ফিচার্ড পোস্ট</p>
                  <p className="text-xs text-ink-muted">হোম পেজের হিরোতে দেখাবে</p>
                </div>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={e => setIsBreaking(e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
                <div>
                  <p className="text-sm font-bengali-sans font-medium text-ink">ব্রেকিং নিউজ</p>
                  <p className="text-xs text-ink-muted">হেডারের টিকারে দেখাবে</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Toolbar button sub-component ----
function ToolbarBtn({
  onClick, active = false, children, title
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors text-sm',
        active
          ? 'bg-accent text-white'
          : 'text-ink-muted hover:bg-[var(--color-border)] hover:text-ink'
      )}
    >
      {children}
    </button>
  )
}
