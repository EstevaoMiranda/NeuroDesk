import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get('neurodesk-token')?.value

  if (!token) {
    redirect('/login')
  }

  let userName = 'Usuário'
  let userEmail = ''
  let userRole = ''

  try {
    const payload = await verifyToken(token)
    userName = (payload as { name?: string }).name || 'Usuário'
    userEmail = payload.email || ''
    userRole = payload.role || ''
  } catch {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar userName={userName} userEmail={userEmail} userRole={userRole} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        {children}
      </main>
    </div>
  )
}
