export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM Prospectos (Leads)</h1>
          <p className="text-sm text-muted-foreground">Administra los contactos que llegan a través del catálogo web.</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border/60 bg-white dark:bg-background p-8 text-center text-muted-foreground">
        <p className="text-sm">El módulo de Gestión de Leads está en construcción.</p>
        <p className="text-xs mt-2">Pronto podrás visualizar una vista estilo Kanban (Nuevos, Contactados, Descartados, Convertidos).</p>
      </div>
    </div>
  )
}
