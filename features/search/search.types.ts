import type {
  ActivityRecord,
  ContactRecord,
  ConversationRecord,
  MessageRecord,
  NoteRecord,
} from "../../lib/api/api-types";

export interface SearchContactResult {
  contact: Pick<
    ContactRecord,
    "_id" | "company" | "displayName" | "phoneNumber" | "profileName" | "waId"
  >;
}

export interface SearchConversationResult {
  contact: SearchContactResult["contact"] | null;
  conversation: ConversationRecord & {
    awaitingReplyFrom?: "business" | "customer" | "none";
    pinnedAt?: string | null;
    starred?: boolean;
  };
}

export interface SearchMessageResult {
  contact: SearchContactResult["contact"] | null;
  conversation: SearchConversationResult["conversation"] | null;
  message: MessageRecord & {
    from?: string;
    to?: string;
  };
}

export interface SearchNoteResult {
  contact: SearchContactResult["contact"] | null;
  conversation: SearchConversationResult["conversation"] | null;
  note: NoteRecord;
}

export interface GlobalSearchResponse {
  data: {
    contacts: SearchContactResult[];
    conversations: SearchConversationResult[];
    messages: SearchMessageResult[];
    notes: SearchNoteResult[];
    totals: {
      contacts: number;
      conversations: number;
      messages: number;
      notes: number;
    };
  };
}

export interface InboxSearchResponse {
  data: Array<{
    contact: {
      _id: string;
      avatarUrl?: string | null;
      company?: string | null;
      displayName: string;
      phoneNumber: string;
      profileName?: string | null;
    } | null;
    conversation: SearchConversationResult["conversation"];
  }>;
  metadata: {
    query: string;
    total: number;
  };
}

export interface DashboardSummaryResponse {
  data: {
    automations: {
      active: number;
      failedRunsToday: number;
      waitingRuns: number;
    };
    hotThreads: Array<{
      contact: SearchContactResult["contact"] | null;
      conversation: SearchConversationResult["conversation"];
    }>;
    inbox: {
      archivedConversations: number;
      awaitingBusinessReply: number;
      awaitingCustomerReply: number;
      expiringServiceWindows: number;
      starredConversations: number;
    };
    recentActivity: Array<{
      activity: ActivityRecord;
      contact: SearchContactResult["contact"] | null;
    }>;
    schedules: {
      failed: number;
      paused: number;
      queued: number;
      upcoming: number;
    };
    metaAnalytics?: {
      accountStatus: string;
      deliveryRate: number;
      messagingTier: string;
      messagingTierLimit: string;
      qualityRating: string;
      readRate: number;
      totalDelivered: number;
      totalFailed: number;
      totalRead: number;
      totalSent: number;
    };
    snapshot: {
      activeAutomations: number;
      contactsTotal: number;
      messagesToday: number;
      openConversations: number;
      openTasks: number;
      overdueTasks: number;
      upcomingScheduled: number;
      unreadConversations: number;
    };
    tasks: {
      dueToday: number;
      open: number;
      overdue: number;
    };
  };
}
