export interface Customer360Data {
  recordType: "Person" | "Company";
  record: Record<string, any>;
  linkedEntities: {
    people: any[];
    companies: any[];
    contacts: any[];
  };
  deals: {
    items: any[];
    totalOpenValue: number;
    openCount: number;
    wonCount: number;
    lostCount: number;
  };
  leads: {
    items: any[];
    totalCount: number;
    openCount: number;
  };
  tasks: {
    items: any[];
    pendingCount: number;
    overdueCount: number;
  };
  timeline: {
    activities: any[];
    totalCount: number;
  };
  communication: {
    conversations: any[];
    totalUnreadCount: number;
    lastContactedAt: string | null;
    activeChannels: string[];
  };
}

/**
 * Safely unwraps `{ success: true, data: Customer360Data }` or direct `Customer360Data`
 * responses and guarantees all nested arrays and counters are initialized.
 */
export function normalizeCustomer360Response(
  raw: unknown,
  fallbackRecordType: "Person" | "Company" = "Person",
): Customer360Data {
  const unwrapped: Record<string, any> =
    raw &&
    typeof raw === "object" &&
    "data" in (raw as Record<string, any>) &&
    (raw as Record<string, any>).data &&
    typeof (raw as Record<string, any>).data === "object" &&
    !Array.isArray((raw as Record<string, any>).data)
      ? (raw as Record<string, any>).data
      : (raw as Record<string, any>) || {};

  const recordType: "Person" | "Company" =
    unwrapped.recordType === "Company" || unwrapped.recordType === "Person"
      ? unwrapped.recordType
      : fallbackRecordType;

  const record =
    unwrapped.record && typeof unwrapped.record === "object" ? unwrapped.record : {};

  const rawLinked =
    unwrapped.linkedEntities && typeof unwrapped.linkedEntities === "object"
      ? unwrapped.linkedEntities
      : {};

  const rawDeals =
    unwrapped.deals && typeof unwrapped.deals === "object" ? unwrapped.deals : {};

  const rawLeads =
    unwrapped.leads && typeof unwrapped.leads === "object" ? unwrapped.leads : {};

  const rawTasks =
    unwrapped.tasks && typeof unwrapped.tasks === "object" ? unwrapped.tasks : {};

  const rawTimeline =
    unwrapped.timeline && typeof unwrapped.timeline === "object" ? unwrapped.timeline : {};

  const rawComm =
    unwrapped.communication && typeof unwrapped.communication === "object"
      ? unwrapped.communication
      : {};

  return {
    recordType,
    record,
    linkedEntities: {
      people: Array.isArray(rawLinked.people) ? rawLinked.people : [],
      companies: Array.isArray(rawLinked.companies) ? rawLinked.companies : [],
      contacts: Array.isArray(rawLinked.contacts) ? rawLinked.contacts : [],
    },
    deals: {
      items: Array.isArray(rawDeals.items) ? rawDeals.items : [],
      totalOpenValue: Number(rawDeals.totalOpenValue) || 0,
      openCount: Number(rawDeals.openCount) || 0,
      wonCount: Number(rawDeals.wonCount) || 0,
      lostCount: Number(rawDeals.lostCount) || 0,
    },
    leads: {
      items: Array.isArray(rawLeads.items) ? rawLeads.items : [],
      totalCount: Number(rawLeads.totalCount) || 0,
      openCount: Number(rawLeads.openCount) || 0,
    },
    tasks: {
      items: Array.isArray(rawTasks.items) ? rawTasks.items : [],
      pendingCount: Number(rawTasks.pendingCount) || 0,
      overdueCount: Number(rawTasks.overdueCount) || 0,
    },
    timeline: {
      activities: Array.isArray(rawTimeline.activities) ? rawTimeline.activities : [],
      totalCount: Number(rawTimeline.totalCount) || 0,
    },
    communication: {
      conversations: Array.isArray(rawComm.conversations) ? rawComm.conversations : [],
      totalUnreadCount: Number(rawComm.totalUnreadCount) || 0,
      lastContactedAt:
        typeof rawComm.lastContactedAt === "string" ? rawComm.lastContactedAt : null,
      activeChannels: Array.isArray(rawComm.activeChannels) ? rawComm.activeChannels : [],
    },
  };
}
