"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Volume2,
  FileText,
  User,
  Bot,
  Search,
  Filter,
  ArrowRight,
  Download,
  Calendar,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Radio,
  ExternalLink,
} from "lucide-react";
import {
  getAICalls,
  getAICall,
  getAICallTranscript,
  getAICallRecordingBlob,
  downloadAICallRecordingFile,
  AICallItem,
  TranscriptTurn,
} from "lib/api/ai-calling-api";
import { queryKeys } from "lib/api/query-keys";

export default function AICallingPage() {
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  // 1. Fetch Calls
  const { data: callsData, isLoading: isLoadingCalls, error: callsError } = useQuery({
    queryKey: queryKeys.aiCalling.calls,
    queryFn: () => getAICalls({ limit: 50 }),
  });

  const calls = callsData?.calls || [];

  // Filtered Calls
  const filteredCalls = calls.filter((c) => {
    if (directionFilter !== "ALL" && c.direction !== directionFilter.toLowerCase()) {
      return false;
    }
    if (statusFilter !== "ALL" && c.status !== statusFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchFrom = c.fromNumber?.toLowerCase().includes(q);
      const matchTo = c.toNumber?.toLowerCase().includes(q);
      const matchSummary = c.summary?.toLowerCase().includes(q);
      const matchDispo = c.disposition?.toLowerCase().includes(q);
      if (!matchFrom && !matchTo && !matchSummary && !matchDispo) {
        return false;
      }
    }
    return true;
  });

  // 2. Fetch Selected Call Detail
  const { data: activeCallData, isLoading: isLoadingActiveCall } = useQuery({
    queryKey: selectedCallId ? queryKeys.aiCalling.call(selectedCallId) : ["null-call"],
    queryFn: () => (selectedCallId ? getAICall(selectedCallId) : null),
    enabled: !!selectedCallId,
  });

  const activeCall = activeCallData?.call;

  // 3. Fetch Selected Call Transcript
  const { data: transcriptData, isLoading: isLoadingTranscript, error: transcriptError } = useQuery({
    queryKey: selectedCallId ? queryKeys.aiCalling.transcript(selectedCallId) : ["null-transcript"],
    queryFn: () => (selectedCallId ? getAICallTranscript(selectedCallId) : null),
    enabled: !!selectedCallId,
  });

  const turns: TranscriptTurn[] = transcriptData?.turns || [];

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    let url: string | null = null;

    if (activeCall?._id && activeCall.recording?.status === "ready") {
      setIsLoadingAudio(true);
      setAudioError(null);
      getAICallRecordingBlob(activeCall._id)
        .then((blob) => {
          if (!active) return;
          url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setIsLoadingAudio(false);
        })
        .catch(() => {
          if (!active) return;
          setAudioError("Unable to load audio recording");
          setIsLoadingAudio(false);
        });
    } else {
      setAudioUrl(null);
      setIsLoadingAudio(false);
      setAudioError(null);
    }

    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [activeCall?._id, activeCall?.recording?.status]);

  async function handleDownloadRecording() {
    if (!activeCall?._id) return;
    try {
      setIsDownloading(true);
      await downloadAICallRecordingFile(activeCall._id);
    } catch (err: any) {
      console.error("Failed to download recording:", err);
    } finally {
      setIsDownloading(false);
    }
  }

  function formatDuration(seconds?: number | null) {
    if (!seconds || seconds <= 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const remainingSecs = Math.floor(seconds % 60);
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case "in_progress":
      case "answered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Radio className="w-3 h-3 animate-pulse text-blue-500" />
            Live
          </span>
        );
      case "ringing":
      case "initiating":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            Ringing
          </span>
        );
      case "failed":
      case "canceled":
      case "busy":
      case "no_answer":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3" />
            {status.replace("_", " ")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  }

  function getSentimentBadge(sentiment?: string | null) {
    if (!sentiment) return null;
    switch (sentiment.toLowerCase()) {
      case "positive":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Smile className="w-3 h-3" /> Positive
          </span>
        );
      case "negative":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            <Frown className="w-3 h-3" /> Negative
          </span>
        );
      case "neutral":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Meh className="w-3 h-3" /> Neutral
          </span>
        );
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-blue-600" />
            AI Voice Calling
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Voice session history, audio recording playback, live transcripts, and human handoffs.
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <span className="text-slate-400 mr-1.5">Total:</span>
            <span className="font-bold text-slate-900 dark:text-white">{calls.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <span className="text-slate-400 mr-1.5">Completed:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {calls.filter((c) => c.status === "completed").length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search phone number, topic, summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Directions</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">Live / In Progress</option>
            <option value="failed">Failed</option>
            <option value="busy">Busy / No Answer</option>
          </select>
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Caller / Recipient</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Sentiment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoadingCalls ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading call records...
                  </td>
                </tr>
              ) : callsError ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-rose-500">
                    Failed to load call sessions: {(callsError as any)?.message || "Unknown error"}
                  </td>
                </tr>
              ) : filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <PhoneCall className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    No call sessions found
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr
                    key={call._id}
                    onClick={() => setSelectedCallId(call._id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {call.direction === "inbound" ? (
                          <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            <PhoneIncoming className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                            <PhoneOutgoing className="w-4 h-4" />
                          </span>
                        )}
                        <span className="text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">
                          {call.direction}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      <div>
                        {call.direction === "inbound" ? call.fromNumber : call.toNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        Via: {call.direction === "inbound" ? call.toNumber : call.fromNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {new Date(call.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {formatDuration(call.durationSeconds)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(call.status)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getSentimentBadge(call.sentiment)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCallId(call._id);
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Transcript & Audio"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {selectedCallId && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-blue-600" />
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                    {activeCall?.direction?.toUpperCase()} Call Session
                  </span>
                  {activeCall && getStatusBadge(activeCall.status)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Started {activeCall ? new Date(activeCall.createdAt).toLocaleString() : ""} •
                  Duration: {formatDuration(activeCall?.durationSeconds)}
                </div>
              </div>
              <button
                onClick={() => setSelectedCallId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingActiveCall || !activeCall ? (
                <div className="py-12 text-center text-sm text-slate-400">Loading call details...</div>
              ) : (
                <>
                  {/* Participant Info */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl grid grid-cols-2 gap-4 border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1">From Number</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {activeCall.fromNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">To Number</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {activeCall.toNumber}
                      </div>
                    </div>
                  </div>

                  {/* Audio Recording Player */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-blue-600" />
                        Call Audio Recording
                      </div>
                      {activeCall.recording?.status === "ready" && (
                        <button
                          type="button"
                          onClick={handleDownloadRecording}
                          disabled={isDownloading}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {isDownloading ? "Downloading..." : "Download"}
                        </button>
                      )}
                    </div>

                    {activeCall.recording?.status === "ready" ? (
                      isLoadingAudio ? (
                        <div className="py-4 text-center text-xs text-slate-400">Loading audio stream...</div>
                      ) : audioUrl ? (
                        <audio
                          controls
                          className="w-full mt-2"
                          src={audioUrl}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        <div className="py-2 text-center text-xs text-rose-500">
                          {audioError || "Failed to load audio recording."}
                        </div>
                      )
                    ) : (
                      <div className="py-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                        {activeCall.recording?.status === "pending"
                          ? "Audio recording is processing..."
                          : "No audio recording available for this call."}
                      </div>
                    )}
                  </div>

                  {/* AI Summary & Disposition */}
                  {activeCall.summary && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI Call Summary
                        </div>
                        {getSentimentBadge(activeCall.sentiment)}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {activeCall.summary}
                      </p>
                      {activeCall.disposition && (
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium pt-1">
                          Disposition: {activeCall.disposition}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Human Intervention / Transfer Alert */}
                  {activeCall.humanIntervention?.required && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs space-y-1 text-amber-800 dark:text-amber-300">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Human Follow-up Required
                      </div>
                      <div>
                        Status: <span className="font-medium">{activeCall.humanIntervention.status}</span> •
                        Priority: <span className="font-medium capitalize">{activeCall.humanIntervention.priority}</span>
                      </div>
                      {activeCall.humanIntervention.reason && (
                        <div>Reason: {activeCall.humanIntervention.reason}</div>
                      )}
                    </div>
                  )}

                  {/* Transcript Viewer */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Conversation Transcript ({turns.length} turns)
                    </div>

                    {isLoadingTranscript ? (
                      <div className="py-8 text-center text-xs text-slate-400">Loading transcript...</div>
                    ) : transcriptError ? (
                      <div className="p-6 text-center text-xs text-rose-500 border border-rose-200 dark:border-rose-900 rounded-xl bg-rose-50/50 dark:bg-rose-950/20">
                        Failed to load conversation transcript.
                      </div>
                    ) : turns.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                        No transcript turns captured for this call.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {turns.map((turn, idx) => {
                          const isAssistant = turn.role === "assistant";
                          return (
                            <div
                              key={idx}
                              className={`flex gap-3 text-xs ${
                                isAssistant ? "justify-start" : "justify-end"
                              }`}
                            >
                              {isAssistant && (
                                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                  <Bot className="w-4 h-4" />
                                </div>
                              )}
                              <div
                                className={`p-3 rounded-2xl max-w-[80%] space-y-1 ${
                                  isAssistant
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    : "bg-blue-600 text-white rounded-tr-xs"
                                }`}
                              >
                                <div
                                  className={`text-[10px] font-semibold uppercase ${
                                    isAssistant ? "text-slate-500" : "text-blue-100"
                                  }`}
                                >
                                  {isAssistant ? "AI Agent" : "Customer"}
                                </div>
                                <div className="leading-relaxed">{turn.text}</div>
                              </div>
                              {!isAssistant && (
                                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                                  <User className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
