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

  const connectionsQuery = useQuery({
    queryKey: ["whatsapp-connections"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/whatsapp-connections");
      return data;
    }
  });

  const templatesQuery = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/templates");
      return data;
    }
  });
  const createMutation = useCreateCampaign();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !connectionId || !templateId) return;

    try {
      const result = await createMutation.mutateAsync({
        name,
        description,
        connectionId,
        templateId,
        // For Phase D, audience and schedule are fixed/simplified in the initial wizard
        audience: { source: "filter" },
        schedule: { type: "now" }
      });
      
      router.push(`/campaigns/${result.campaign._id}`);
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center border-b px-4 lg:px-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-medium">Create New Campaign</h1>
      </header>

      <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Campaign Name <span className="text-red-500">*</span></label>
              <Input
                id="name"
                placeholder="e.g., Summer Promotion 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description</label>
              <Input
                id="description"
                placeholder="Internal notes about this campaign"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="connection" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">WhatsApp Connection <span className="text-red-500">*</span></label>
              <select
                id="connection"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={connectionId}
                onChange={(e) => setConnectionId(e.target.value)}
                required
              >
                <option value="" disabled>Select a connection</option>
                {connectionsQuery.data?.connections?.map((conn: any) => (
                  <option key={conn._id} value={conn._id}>{conn.name || conn.phoneNumber}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="template" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Message Template <span className="text-red-500">*</span></label>
              <select
                id="template"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                required
              >
                <option value="" disabled>Select an APPROVED template</option>
                {templatesQuery.data?.templates?.filter((t: any) => t.status === "APPROVED" && t.isSendable).map((tpl: any) => (
                  <option key={tpl._id} value={tpl._id}>{tpl.name} ({tpl.language})</option>
                ))}
              </select>
              <p className="text-xs text-slate-500">Only APPROVED and sendable templates without variable mapping are allowed in Phase D.</p>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || !name || !connectionId || !templateId}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create & Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
