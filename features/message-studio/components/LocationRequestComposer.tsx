import React from "react";
import { Textarea } from "../../../components/ui/textarea";
import { LocationRequestComposerProps } from "../message-studio.types";

export const LocationRequestComposer: React.FC<LocationRequestComposerProps> = ({
  locationRequestBody,
  onLocationRequestBodyChange,
}) => {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">Location Request Message Body *</label>
      <Textarea
        className="min-h-24 text-xs"
        onChange={(event) => onLocationRequestBodyChange(event.target.value)}
        placeholder="Please share your current location with us..."
        value={locationRequestBody}
      />
    </div>
  );
};
