'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon: string | null
  sort_order: number
}

const PRESET_COLORS = [
  '#c0392b', '#8e44ad', '#2980b9', '#16a085',
  '#27ae60', '#e67e22', '#1abc9c', '#9b59b6',
  '#e74c3c', '#f39c12', '#2c3e50', '#d35400',
]

function makeSlug(name: string): string {
  return name.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0980-\u09FF\u0041-\u007A0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

export default function CategoriesPage() {
  const supabase = createSupabaseBrowserClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  // New category form state
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newColor, setNewColor] = useState('#c0392b')
  const [newIcon, setNewIcon] = useState('')
  const [newOrder, setNewOrder] = useState('')
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Edit state
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editOrder, setEditOrder] = useState('')

  useEffect(() => { loadCategories() }, [])

  async function loadCategories() {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories((data as Category[]) || [])
    setLoading(false)
  }

  function flash(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  async function handleAdd() {
    if (!newName.trim()) { flash('নাম দিন।'); return }
    setAdding(true)
    const { error } = await supabase.from('categories').insert({
      name: newName.trim(),
      slug: newSlug || makeSlug(newName),
      color: newColor,
      icon: newIcon.trim() || null,
      sort_order: parseInt(newOrder) || categories.length + 1,
    })
    if (error) { flash('✗ ' + error.message); setAdding(false); return }
    flash('✓ বিভাগ যোগ হয়েছে।')
    setNewName(''); setNewSlug(''); setNewIcon(''); setNewOrder(''); setShowForm(false)
    setAdding(false)
    loadCategories()
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditColor(cat.color)
    setEditIcon(cat.icon || '')
    setEditOrder(String(cat.sort_order))
  }

  async function saveEdit(id: string) {
    const { error } = await supabase.from('categories').update({
      name: editName.trim(),
      color: editColor,
      icon: editIcon.trim() || null,
      sort_order: parseInt(editOrder) || 0,
    }).eq('id', id)
    if (error) { flash('✗ ' + error.message); return }
    flash('✓ আপডেট হয়েছে।')
    setEditingId(null)
    loadCategories()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" বিভাগটি মুছে ফেলবেন? এই বিভাগের পোস্টগুলো বিভাগহীন হয়ে যাবে।`)) return
    setDeleting(id)
    await supabase.from('categories').delete().eq('id', id)
    setDeleting(null)
    flash('✓ মুছে ফেলা হয়েছে।')
    loadCategories()
  }

  return (
    <div className="px-4 md:px-6 py-6 md:py-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bengali-serif text-2xl font-bold text-ink">বিভাগসমূহ</h1>
          <p className="font-bengali-sans text-sm text-ink-muted mt-0.5">পোস্টের বিভাগ যোগ, সম্পাদনা ও মুছুন</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-bengali-sans text-sm font-semibold hover:bg-accent-dark transition-colors"
        >
          <Plus size={16} />
          নতুন বিভাগ
        </button>
      </div>

      {/* Flash message */}
      {message && (
        <div className={cn('mb-4 px-4 py-2.5 rounded-lg text-sm font-bengali-sans', message.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
          {message}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="mb-6 p-5 bg-white border border-[var(--color-border)] rounded-xl">
          <h3 className="font-bengali-sans font-bold text-sm text-ink mb-4 uppercase tracking-wider">নতুন বিভাগ যোগ করুন</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5">বিভাগের নাম *</label>
              <input
                value={newName}
                onChange={e => { setNewName(e.target.value); setNewSlug(makeSlug(e.target.value)) }}
                placeholder="যেমন: ইতিহাস"
                lang="bn"
                className="w-full px-3 py-2 text-sm font-bengali-sans border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5">URL স্লাগ</label>
              <input
                value={newSlug}
                onChange={e => setNewSlug(e.target.value)}
                placeholder="auto-generated"
                className="w-full px-3 py-2 text-sm font-bengali-sans border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5">আইকন (ইমোজি)</label>
              <input
                value={newIcon}
                onChange={e => setNewIcon(e.target.value)}
                placeholder="📚"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-1.5">ক্রমিক নম্বর</label>
              <input
                value={newOrder}
                onChange={e => setNewOrder(e.target.value)}
                type="number"
                placeholder={String(categories.length + 1)}
                className="w-full px-3 py-2 text-sm font-bengali-sans border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Color picker */}
          <div className="mt-4">
            <label className="block text-xs font-bengali-sans font-semibold text-ink-muted mb-2">রঙ</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={cn('w-8 h-8 rounded-full border-2 transition-transform', newColor === c ? 'border-ink scale-110' : 'border-transparent hover:scale-105')}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-8 h-8 rounded-full cursor-pointer border border-[var(--color-border)]" title="কাস্টম রঙ" />
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={handleAdd} disabled={adding} className="px-5 py-2 bg-accent text-white rounded-lg font-bengali-sans text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50">
              {adding ? 'যোগ হচ্ছে...' : 'যোগ করুন'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 border border-[var(--color-border)] rounded-lg font-bengali-sans text-sm text-ink hover:bg-paper-dark transition-colors">
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Categories list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-paper-dark rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          {categories.length === 0 ? (
            <p className="text-center py-10 font-bengali-sans text-ink-muted">কোনো বিভাগ নেই।</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper-dark border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 font-bengali-sans font-semibold text-ink-muted text-xs uppercase tracking-wider">বিভাগ</th>
                  <th className="text-left px-4 py-3 font-bengali-sans font-semibold text-ink-muted text-xs uppercase tracking-wider hidden sm:table-cell">স্লাগ</th>
                  <th className="text-center px-4 py-3 font-bengali-sans font-semibold text-ink-muted text-xs uppercase tracking-wider hidden md:table-cell">ক্রম</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-paper-dark/50 transition-colors">
                    <td className="px-4 py-3">
                      {editingId === cat.id ? (
                        <div className="flex items-center gap-2">
                          <input value={editName} onChange={e => setEditName(e.target.value)} lang="bn" className="flex-1 px-2 py-1 text-sm font-bengali-sans border border-[var(--color-border)] rounded focus:outline-none focus:border-accent" />
                          <input type="text" value={editIcon} onChange={e => setEditIcon(e.target.value)} className="w-10 px-2 py-1 text-sm border border-[var(--color-border)] rounded focus:outline-none" placeholder="🏷️" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          {cat.icon && <span>{cat.icon}</span>}
                          <span className="font-bengali-sans font-semibold text-ink">{cat.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <code className="text-xs text-ink-muted bg-paper-dark px-2 py-0.5 rounded">{cat.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      {editingId === cat.id ? (
                        <input type="number" value={editOrder} onChange={e => setEditOrder(e.target.value)} className="w-16 px-2 py-1 text-sm text-center border border-[var(--color-border)] rounded focus:outline-none" />
                      ) : (
                        <span className="text-xs text-ink-muted font-bengali-sans">{cat.sort_order}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {editingId === cat.id ? (
                          <>
                            {/* Color picker inline */}
                            <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-[var(--color-border)]" title="রঙ" />
                            <button onClick={() => saveEdit(cat.id)} className="p-1.5 rounded text-green-600 hover:bg-green-50 transition-colors"><Check size={15} /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded text-ink-muted hover:bg-paper-dark transition-colors"><X size={15} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(cat)} className="p-1.5 rounded text-ink-muted hover:text-accent hover:bg-paper-dark transition-colors"><Edit3 size={15} /></button>
                            <button onClick={() => handleDelete(cat.id, cat.name)} disabled={deleting === cat.id} className="p-1.5 rounded text-ink-muted hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"><Trash2 size={15} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
