import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
