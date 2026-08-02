import type {
  ActivityRecordV1,
  ContactRecordV1,
  ConversationRecordV1,
  MessageRecordV1,
  NoteRecordV1,
} from "../../lib/api/v1-types";

export interface SearchContactResultV1 {
  contact: Pick<
    ContactRecordV1,
    "_id" | "company" | "displayName" | "phoneNumber" | "profileName" | "waId"
  >;
}

export interface SearchConversationResultV1 {
  contact: SearchContactResultV1["contact"] | null;
  conversation: ConversationRecordV1 & {
    awaitingReplyFrom?: "business" | "customer" | "none";
    pinnedAt?: string | null;
    starred?: boolean;
  };
}

export interface SearchMessageResultV1 {
  contact: SearchContactResultV1["contact"] | null;
  conversation: SearchConversationResultV1["conversation"] | null;
  message: MessageRecordV1 & {
    from?: string;
    to?: string;
  };
}

export interface SearchNoteResultV1 {
  contact: SearchContactResultV1["contact"] | null;
  conversation: SearchConversationResultV1["conversation"] | null;
  note: NoteRecordV1;
}

export interface GlobalSearchResponseV1 {
  data: {
    contacts: SearchContactResultV1[];
    conversations: SearchConversationResultV1[];
    messages: SearchMessageResultV1[];
    notes: SearchNoteResultV1[];
    totals: {
      contacts: number;
      conversations: number;
      messages: number;
      notes: number;
    };
  };
}

export interface InboxSearchResponseV1 {
  data: Array<{
    contact: {
      _id: string;
      avatarUrl?: string | null;
      company?: string | null;
      displayName: string;
      phoneNumber: string;
      profileName?: string | null;
    } | null;
    conversation: SearchConversationResultV1["conversation"];
  }>;
  metadata: {
    query: string;
    total: number;
  };
}

export interface DashboardSummaryResponseV1 {
  data: {
    automations: {
      active: number;
      failedRunsToday: number;
      waitingRuns: number;
    };
    hotThreads: Array<{
      contact: SearchContactResultV1["contact"] | null;
      conversation: SearchConversationResultV1["conversation"];
    }>;
    inbox: {
      archivedConversations: number;
      awaitingBusinessReply: number;
      awaitingCustomerReply: number;
      expiringServiceWindows: number;
      starredConversations: number;
    };
    recentActivity: Array<{
      activity: ActivityRecordV1;
      contact: SearchContactResultV1["contact"] | null;
    }>;
    schedules: {
      failed: number;
      paused: number;
      queued: number;
      upcoming: number;
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
