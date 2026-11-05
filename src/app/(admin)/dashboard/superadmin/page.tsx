import { getSuperAdminMetrics, getTenantsList } from '@/actions/superadmin'
import { redirect } from 'next/navigation'
import { requireTenantSession } from '@/lib/tenant'
import { SuperAdminClient } from '@/components/superadmin/superadmin-client'

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
  const session = await requireTenantSession()
  if (session.role !== 'SUPERADMIN') redirect('/dashboard')

  const [metricsRes, tenantsRes] = await Promise.all([
    getSuperAdminMetrics(),
    getTenantsList()
  ])

  const defaultMetrics = {
    tenantsCount: 0,
    usersCount: 0,
    vehiclesCount: 0,
    leadsCount: 0
  }

  const metrics = metricsRes.success && metricsRes.data ? metricsRes.data : defaultMetrics
  const tenants = tenantsRes.success && tenantsRes.data ? tenantsRes.data : []

  return (
    <SuperAdminClient
      metrics={metrics}
      tenants={tenants as any}
      currentTenantId={session.tenantId}
    />
  )
}
