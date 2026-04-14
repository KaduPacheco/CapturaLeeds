export const CRM_QUERY_KEYS = {
  leads: ["crm-leads"] as const,
  leadsTaskOverview: ["crm-leads-task-overview"] as const,
  lead: (leadId?: string) => ["crm-lead", leadId] as const,
  ownerIds: ["crm-owner-ids"] as const,
  leadNotes: (leadId?: string) => ["crm-lead-notes", leadId] as const,
  leadEvents: (leadId?: string) => ["crm-lead-events", leadId] as const,
  leadTasks: (leadId?: string) => ["crm-lead-tasks", leadId] as const,
  dashboardLeads: ["crm-dashboard", "leads"] as const,
  dashboardTasks: ["crm-dashboard", "tasks"] as const,
  dashboardEvents: ["crm-dashboard", "events"] as const,
  dashboardAnalytics: ["crm-dashboard", "analytics"] as const,
} as const;
