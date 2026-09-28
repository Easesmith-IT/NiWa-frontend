import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { useCreateLeadMutation } from "../lead.queries";

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrimaryPersonId?: string | null;
  defaultCompanyId?: string | null;
  defaultTitle?: string;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  defaultPrimaryPersonId,
  defaultCompanyId,
  defaultTitle,
}) => {
  const [title, setTitle] = useState("");
  const [leadSource, setLeadSource] = useState("WHATSAPP");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const createMutation = useCreateLeadMutation();

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle || "");
      setLeadSource("WHATSAPP");
      setValue("");
      setCurrency("USD");
      setNotes("");
      setErrorMsg("");
    }
  }, [isOpen, defaultTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Lead title is required");
      return;
    }

    const parsedValue = value !== "" ? Number(value) : null;

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        leadSource: leadSource.trim() || undefined,
        value: parsedValue,
        currency,
        notes: notes.trim() || undefined,
        personId: defaultPrimaryPersonId || null,
        companyId: defaultCompanyId || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create lead");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="rounded-md bg-destructive/15 p-2.5 text-xs text-destructive">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Inbound Property Inquiry"
              className="text-xs"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Lead Source</label>
              <Input
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                placeholder="e.g. WHATSAPP"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Estimated Value</label>
              <div className="flex gap-1.5">
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0"
                  className="text-xs flex-1"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="AED">AED</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context or customer requirements..."
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
