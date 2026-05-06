'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  Save, Send, Settings, X, ArrowLeft,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { cn, toBengaliNumerals } from '@/lib/utils'

function makeSlug(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\u0980-\u09FF\u0041-\u007A0-9-]/g, '').replace(/-+/g, '-').slice(0, 100)
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const supabase = createSupabaseBrowserClient()

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [slug, setSlug] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [postType, setPostType] = useState('article')
  const [featureImage, setFeatureImage] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isBreaking, setIsBreaking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [message, setMessage] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'এখানে আপনার লেখা শুরু করুন...' }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount,
    ],
    editorProps: {
      attributes: { class: 'post-body min-h-[300px] focus:outline-none px-1', lang: 'bn' },
    },
  })

  // Load post data and categories on mount
  useEffect(() => {
    async function loadData() {
      // Load categories
      const { data: cats } = await supabase.from('categories').select('id, name, slug').order('sort_order')
      setCategories(cats || [])

      // Load post
      const { data: post, error } = await supabase
        .from('posts')
        .select('*, category:categories(slug)')
        .eq('id', postId)
        .single()

      if (error || !post) {
        setMessage('পোস্ট পাওয়া যায়নি।')
        setLoading(false)
        return
      }

      setTitle(post.title || '')
      setSlug(post.slug || '')
      setExcerpt(post.excerpt || '')
      setFeatureImage(post.feature_image_url || '')
      setIsFeatured(post.is_featured || false)
      setIsBreaking(post.is_breaking || false)
      setPostType(post.post_type || 'article')
      setStatus(post.status || 'draft')
      setCategorySlug(post.category?.slug || '')
      setLoading(false)

      // Set editor content after editor is ready
      if (editor && post.body && Object.keys(post.body).length > 0) {
        editor.commands.setContent(post.body)
      }
    }
    loadData()
  }, [postId, editor])

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value)
  }, [])

  async function getCategoryId(slug: string): Promise<string | null> {
    if (!slug) return null
    const cat = categories.find(c => c.slug === slug)
    return cat?.id || null
  }

  async function handleSave(saveStatus: 'draft' | 'published') {
    if (!title.trim()) { setMessage('শিরোনাম দিন।'); return }
    if (!editor) return
    setSaving(true)
    setMessage('')
    try {
      const categoryId = await getCategoryId(categorySlug)
      const { error } = await supabase
        .from('posts')
        .update({
          title: title.trim(),
          slug: slug || makeSlug(title),
          excerpt: excerpt.trim() || null,
          body: editor.getJSON(),
          body_text: editor.getText(),
          feature_image_url: featureImage.trim() || null,
          category_id: categoryId,
          status: saveStatus,
          post_type: postType,
          is_featured: isFeatured,
          is_breaking: isBreaking,
          published_at: saveStatus === 'published' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)

      if (error) throw error
      setStatus(saveStatus)
      setMessage(saveStatus === 'published' ? '✓ আপডেট ও প্রকাশিত!' : '✓ সংরক্ষিত হয়েছে।')
    } catch (err: unknown) {
      setMessage(`✗ ${err instanceof Error ? err.message : 'সংরক্ষণ ব্যর্থ।'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-bengali-sans text-sm text-ink-muted">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!editor) return null
  const wordCount = editor.storage.characterCount?.words?.() || 0

  const POST_TYPES = [
    { value: 'article', label: 'নিবন্ধ' },
    { value: 'poem', label: 'কবিতা' },
    { value: 'story', label: 'গল্প' },
    { value: 'novel', label: 'উপন্যাস' },
    { value: 'book_review', label: 'বই রিভিউ' },
    { value: 'download', label: 'ডাউনলোড' },
  ]

  return (
    <div className="flex flex-col h-screen bg-paper overflow-hidden">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-3 md:px-5 py-2.5 bg-white border-b border-[var(--color-border)] shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => router.push('/admin/manage')} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-dark transition-colors shrink-0">
            <ArrowLeft size={16} />
          </button>
          <h1 className="font-bengali-serif font-bold text-base md:text-lg text-ink shrink-0">পোস্ট সম্পাদনা</h1>
          {message && (
            <span className={cn('text-xs font-bengali-sans px-2 py-1 rounded hidden sm:block truncate', message.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
              {message}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-ink-muted font-bengali-sans hidden md:block">{toBengaliNumerals(wordCount)} শব্দ</span>
          <button onClick={() => setSettingsOpen(true)} className="lg:hidden p-2 rounded-lg border border-[var(--color-border)] text-ink-muted hover:text-accent transition-colors">
            <Settings size={16} />
          </button>
          <button onClick={() => handleSave('draft')} disabled={saving} className="flex items-center gap-1 px-2.5 md:px-4 py-2 text-xs md:text-sm font-bengali-sans font-medium border border-[var(--color-border)] rounded-lg text-ink hover:bg-paper-dark transition-colors disabled:opacity-50">
            <Save size={14} /><span className="hidden sm:inline">সংরক্ষণ</span>
          </button>
          <button onClick={() => handleSave('published')} disabled={saving} className="flex items-center gap-1 px-2.5 md:px-4 py-2 text-xs md:text-sm font-bengali-sans font-semibold bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50">
            <Send size={14} /><span>{saving ? '...' : 'আপডেট'}</span>
          </button>
        </div>
      </div>

      {message && <div className={cn('sm:hidden px-3 py-2 text-xs font-bengali-sans text-center', message.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>{message}</div>}

      <div className="flex flex-1 overflow-hidden relative">

        {/* EDITOR */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-3 md:px-6 py-4 md:py-8">
            <textarea value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="শিরোনাম লিখুন..." rows={2} className="w-full font-bengali-serif text-2xl md:text-3xl font-extrabold text-ink bg-transparent border-none outline-none resize-none placeholder:text-ink-muted/40 mb-2 leading-snug" lang="bn" />
            <div className="flex items-center gap-1 mb-4 text-xs text-ink-muted font-bengali-sans">
              <span className="shrink-0">URL:</span>
              <input value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 min-w-0 bg-transparent border-b border-dashed border-[var(--color-border)] focus:outline-none focus:border-accent text-ink" placeholder="url-slug" />
            </div>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="সারসংক্ষেপ (ঐচ্ছিক)..." rows={2} className="w-full font-bengali-sans text-sm text-ink-muted bg-paper-dark/60 border border-dashed border-[var(--color-border)] rounded-lg px-3 py-2.5 outline-none resize-none placeholder:text-ink-muted/50 mb-4 focus:border-accent" lang="bn" />

            {/* Toolbar */}
            <div className="flex flex-wrap gap-0.5 mb-3 p-1.5 bg-paper-dark rounded-lg border border-[var(--color-border)]">
              <TB onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold size={14} /></TB>
              <TB onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic size={14} /></TB>
              <TB onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><UnderlineIcon size={14} /></TB>
              <TB onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough size={14} /></TB>
              <Sep />
              <TB onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}><Heading1 size={14} /></TB>
              <TB onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 size={14} /></TB>
              <TB onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}><Heading3 size={14} /></TB>
              <Sep />
              <TB onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}><AlignLeft size={14} /></TB>
              <TB onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}><AlignCenter size={14} /></TB>
              <TB onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}><AlignRight size={14} /></TB>
              <Sep />
              <TB onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List size={14} /></TB>
              <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered size={14} /></TB>
              <TB onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}><Quote size={14} /></TB>
              <TB onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={14} /></TB>
              <Sep />
              <TB onClick={() => { const u = window.prompt('ছবির URL:'); if (u) editor.chain().focus().setImage({ src: u }).run() }}><ImageIcon size={14} /></TB>
              <TB onClick={() => { const u = window.prompt('লিংক URL:'); if (u) editor.chain().focus().setLink({ href: u }).run(); else editor.chain().focus().unsetLink().run() }} active={editor.isActive('link')}><Link2 size={14} /></TB>
              <Sep />
              <TB onClick={() => editor.chain().focus().undo().run()}><Undo size={14} /></TB>
              <TB onClick={() => editor.chain().focus().redo().run()}><Redo size={14} /></TB>
            </div>

            <div className="bg-white rounded-xl border border-[var(--color-border)] p-3 md:p-6 min-h-[300px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* SETTINGS PANEL */}
        {settingsOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-20" onClick={() => setSettingsOpen(false)} />}
        <div className={cn(
          'bg-white border-l border-[var(--color-border)] overflow-y-auto',
          'lg:relative lg:w-72 lg:shrink-0 lg:translate-x-0',
          'fixed top-0 right-0 h-full w-72 z-30 transition-transform duration-300',
          settingsOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] sticky top-0 bg-white z-10">
            <h3 className="font-bengali-sans font-bold text-xs uppercase tracking-wider text-ink-muted">পোস্ট সেটিংস</h3>
            <button onClick={() => setSettingsOpen(false)} className="lg:hidden p-1 rounded text-ink-muted hover:text-ink"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5 uppercase tracking-wider">অবস্থা</label>
              <div className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-bengali-sans', status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                <div className={cn('w-1.5 h-1.5 rounded-full', status === 'published' ? 'bg-green-500' : 'bg-amber-500')} />
                {status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5 uppercase tracking-wider">বিভাগ</label>
              <select value={categorySlug} onChange={e => setCategorySlug(e.target.value)} className="w-full px-3 py-2 text-sm font-bengali-sans border border-[var(--color-border)] rounded-lg bg-paper focus:outline-none focus:border-accent">
                <option value="">বিভাগ নির্বাচন করুন</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5 uppercase tracking-wider">লেখার ধরন</label>
              <select value={postType} onChange={e => setPostType(e.target.value)} className="w-full px-3 py-2 text-sm font-bengali-sans border border-[var(--color-border)] rounded-lg bg-paper focus:outline-none focus:border-accent">
                {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5 uppercase tracking-wider">ফিচার ছবির URL</label>
              <input type="url" value={featureImage} onChange={e => setFeatureImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 text-sm font-bengali-sans border border-[var(--color-border)] rounded-lg bg-paper focus:outline-none focus:border-accent" />
              {featureImage && (
                <div className="mt-2 rounded-lg overflow-hidden border border-[var(--color-border)] aspect-video bg-paper-dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featureImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 mt-0.5 accent-accent" />
                <div><p className="text-sm font-bengali-sans font-medium text-ink">ফিচার্ড পোস্ট</p><p className="text-xs text-ink-muted">হোম পেজের হিরোতে দেখাবে</p></div>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={isBreaking} onChange={e => setIsBreaking(e.target.checked)} className="w-4 h-4 mt-0.5 accent-accent" />
                <div><p className="text-sm font-bengali-sans font-medium text-ink">ব্রেকিং নিউজ</p><p className="text-xs text-ink-muted">হেডারের টিকারে দেখাবে</p></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TB({ onClick, active = false, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn('p-1.5 rounded transition-colors', active ? 'bg-accent text-white' : 'text-ink-muted hover:bg-[var(--color-border)] hover:text-ink')}>
      {children}
    </button>
  )
}
function Sep() { return <div className="w-px h-5 bg-[var(--color-border)] mx-0.5 self-center" /> }
