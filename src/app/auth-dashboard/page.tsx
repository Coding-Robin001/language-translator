import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AuthDashboardClient from '../../components/auth-dashboard-client'

export default async function AuthDashboardPage() {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/auth")
    }

    return (
        <AuthDashboardClient session={session} />
    )
}
