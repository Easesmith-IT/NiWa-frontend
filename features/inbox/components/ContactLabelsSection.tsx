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
      <div className="flex flex-wrap gap-2">
        {contactLabels.map((label) => (
          <button
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm"
            disabled={isRemovingLabel}
            key={label._id}
            onClick={() => onRemoveLabel(label._id)}
            style={{ backgroundColor: label.color, color: "#1b2521" }}
            type="button"
          >
            {label.name}
            <X className="h-3.5 w-3.5" />
          </button>
        ))}
        {contactLabels.length === 0 ? (
          <p className="text-sm text-[#7a8b82]">No labels assigned.</p>
        ) : null}
      </div>
      <div className="mt-4 flex gap-2">
        <select
          className="h-10 flex-1 rounded-lg border border-[#ddd2c3] bg-white px-3 text-sm text-[#25342f] outline-none"
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
          className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
          disabled={!selectedLabelId || isAddingLabel}
          onClick={onAddLabel}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Tags className="h-4 w-4" />
        </Button>
      </div>
    </PanelSection>
  );
}
