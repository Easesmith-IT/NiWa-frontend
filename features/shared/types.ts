import type {
  ActivityRecordV1,
  ContactRecordV1,
  ConversationRecordV1,
  LabelRecordV1,
  MessageRecordV1,
  NoteRecordV1,
  V1CursorPagination,
  V1RecordBase,
} from "../../lib/api/v1-types";

export type FeatureRecordBase = V1RecordBase;
export type FeatureCursorPagination = V1CursorPagination;
export type FeatureActivityRecord = ActivityRecordV1;
export type FeatureContactRecord = ContactRecordV1;
export type FeatureConversationRecord = ConversationRecordV1;
export type FeatureLabelRecord = LabelRecordV1;
export type FeatureMessageRecord = MessageRecordV1;
export type FeatureNoteRecord = NoteRecordV1;
