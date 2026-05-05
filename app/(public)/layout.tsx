import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Sidebar from '@/components/sidebar/Sidebar'

// We fetch breaking news headlines here to pass to the header ticker
// In production this would come from the DB (is_breaking = true posts)
async function getBreakingHeadlines(): Promise<string[]> {
  // TODO: fetch from DB in v1.5 — hardcoded for now
  return []
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const breakingNews = await getBreakingHeadlines()

  return (
    <div className="min-h-screen flex flex-col">
      <Header breakingNews={breakingNews} />

      {/* Main content area: left content (wider) + right sidebar (narrower) */}
      <main className="flex-1 max-w-site mx-auto w-full px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* Content column — takes ~70% on large screens */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

          {/* Sidebar — sticky on large screens, stacked below on mobile */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="lg:sticky lg:top-4">
              <Sidebar />
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
