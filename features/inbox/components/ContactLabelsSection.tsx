import { Tags, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { PanelSection } from "./PanelSection";

export interface LabelItem {
  _id: string;
  color?: string;
  name: string;
}

export interface ContactLabelsSectionProps {
  contactLabels: LabelItem[];
  availableLabels: LabelItem[];
  selectedLabelId: string;
  onSelectLabelId: (id: string) => void;
  onAddLabel: () => void;
  isAddingLabel: boolean;
  onRemoveLabel: (id: string) => void;
  isRemovingLabel: boolean;
}

export function ContactLabelsSection({
  contactLabels,
  availableLabels,
  selectedLabelId,
  onSelectLabelId,
  onAddLabel,
  isAddingLabel,
  onRemoveLabel,
  isRemovingLabel,
}: ContactLabelsSectionProps) {
  return (
    <PanelSection title="Labels">
      <div className="flex flex-wrap gap-1.5">
        {contactLabels.map((label) => (
          <button
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            disabled={isRemovingLabel}
            key={label._id}
            onClick={() => onRemoveLabel(label._id)}
            style={{ backgroundColor: label.color, color: "#1b2521" }}
            type="button"
          >
            {label.name}
            <X className="h-3 w-3" />
          </button>
        ))}
        {contactLabels.length === 0 ? (
          <p className="text-xs text-muted-foreground">No labels assigned.</p>
        ) : null}
      </div>
      <div className="mt-3 flex gap-2">
        <select
          className="h-8 flex-1 rounded-md border border-[#E4E4E7] bg-white px-2.5 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#17191B]"
          onChange={(event) => onSelectLabelId(event.target.value)}
          value={selectedLabelId}
        >
          <option value="">Add a label</option>
          {availableLabels.map((label) => (
            <option key={label._id} value={label._id}>
              {label.name}
            </option>
          ))}
        </select>
        <Button
          disabled={!selectedLabelId || isAddingLabel}
          onClick={onAddLabel}
          size="sm"
          type="button"
          variant="outline"
        >
          <Tags className="h-3.5 w-3.5" />
        </Button>
      </div>
    </PanelSection>
  );
}
