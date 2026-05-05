'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-red-500/20 transition-colors w-full"
    >
      <LogOut size={18} className="shrink-0" />
      <span className="font-bengali-sans text-sm hidden md:block">লগআউট</span>
    </button>
  )
}
