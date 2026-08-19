"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useCreateCampaign } from "../../../../features/campaigns";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../../lib/api/client";

export default function NewCampaignPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [templateId, setTemplateId] = useState("");
  
  const [audienceType, setAudienceType] = useState<"import" | "tags">("import");
  const [importId, setImportId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const connectionsQuery = useQuery({
    queryKey: ["whatsapp-connections"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ connections: Array<{ _id: string; name: string }> }>("/whatsapp-connections");
      return data;
    }
  });

  const templatesQuery = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ templates: Array<{ _id: string; name: string; components?: any[] }> }>("/templates");
      return data;
    }
  });

  const createMutation = useCreateCampaign();

  const selectedTemplate = templatesQuery.data?.templates?.find(t => t._id === templateId);
  const isTemplateInvalid = selectedTemplate ? (
    (selectedTemplate.components?.some(c => c.type === "BODY" && (c.example?.body_text?.length > 0 || c.text?.includes("{{1}}"))) || false) ||
    (selectedTemplate.components?.some(c => c.type === "HEADER" && (c.example?.header_text?.length > 0 || c.text?.includes("{{1}}") || c.format === "IMAGE" || c.format === "DOCUMENT" || c.format === "VIDEO")) || false) ||
    (selectedTemplate.components?.some(c => c.type === "BUTTONS" && c.buttons?.some((b: any) => b.type === "URL" && b.url?.includes("{{1}}"))) || false)
  ) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !connectionId || !templateId || isTemplateInvalid) return;

    try {
      const result = await createMutation.mutateAsync({
        name,
        description,
        connectionId,
        templateId,
        audience: audienceType === "import" 
          ? { importId } 
          : { tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean) },
        schedule: scheduleType === "now"
          ? { type: "now", timezone }
          : { type: "scheduled", scheduledAt: new Date(scheduledAt).toISOString(), timezone }
      });
      
      router.push(`/campaigns/${result.campaign._id}`);
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto bg-gray-50/30">
      <header className="flex h-14 shrink-0 items-center border-b bg-white px-4 lg:px-6">
        <Button variant="ghost" size="icon" className="mr-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">New Campaign</h1>
      </header>

      <div className="flex-1 p-4 lg:p-8">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border bg-white p-6 shadow-sm">
            
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Basic Details</h2>
              <div>
                <label className="mb-2 block text-sm font-medium">Campaign Name</label>
                <Input
                  required
                  placeholder="e.g. Summer Sale 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <Input
                  placeholder="Optional description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">Connection & Template</h2>
              <div>
                <label className="mb-2 block text-sm font-medium">WhatsApp Connection</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  required 
                  value={connectionId} 
                  onChange={e => setConnectionId(e.target.value)}
                >
                  <option value="" disabled>Select a connection</option>
                  {connectionsQuery.data?.connections?.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.phoneNumber} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Template</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  required 
                  value={templateId} 
                  onChange={e => setTemplateId(e.target.value)}
                >
                  <option value="" disabled>Select a template</option>
                  {templatesQuery.data?.templates?.map((t: any) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.language})</option>
                  ))}
                </select>
                {isTemplateInvalid && (
                  <p className="mt-2 text-sm text-red-500 font-medium">
                    Variable templates are not supported in Campaigns yet. Please select a static template.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">Audience</h2>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center space-x-2">
                  <input type="radio" checked={audienceType === "import"} onChange={() => setAudienceType("import")} />
                  <span>From Import</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" checked={audienceType === "tags"} onChange={() => setAudienceType("tags")} />
                  <span>From Tags</span>
                </label>
              </div>

              {audienceType === "import" ? (
                <div>
                  <label className="mb-2 block text-sm font-medium">Import ID</label>
                  <Input
                    required
                    placeholder="Enter the ID of a completed contact import"
                    value={importId}
                    onChange={(e) => setImportId(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-medium">Tags</label>
                  <Input
                    required
                    placeholder="tag1, tag2"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">Comma-separated tags to filter existing contacts.</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">Schedule</h2>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center space-x-2">
                  <input type="radio" checked={scheduleType === "now"} onChange={() => setScheduleType("now")} />
                  <span>Send Now</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" checked={scheduleType === "scheduled"} onChange={() => setScheduleType("scheduled")} />
                  <span>Schedule for Later</span>
                </label>
              </div>

              {scheduleType === "scheduled" && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Scheduled Date & Time</label>
                  <Input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || isTemplateInvalid}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Campaign
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
