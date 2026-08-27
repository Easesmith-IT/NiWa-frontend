import React from "react";
import { Input } from "../../../components/ui/input";
import { LocationMessageComposerProps } from "../message-studio.types";

export const LocationMessageComposer: React.FC<LocationMessageComposerProps> = ({
  locationName,
  onLocationNameChange,
  locationAddress,
  onLocationAddressChange,
  latitude,
  onLatitudeChange,
  longitude,
  onLongitudeChange,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Location Name</label>
        <Input
          className="text-xs"
          onChange={(event) => onLocationNameChange(event.target.value)}
          placeholder="e.g. Central Park"
          value={locationName}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Location Address</label>
        <Input
          className="text-xs"
          onChange={(event) => onLocationAddressChange(event.target.value)}
          placeholder="e.g. New York, NY 10024"
          value={locationAddress}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Latitude *</label>
          <Input
            className="text-xs font-mono"
            onChange={(event) => onLatitudeChange(event.target.value)}
            placeholder="e.g. 40.785091"
            value={latitude}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Longitude *</label>
          <Input
            className="text-xs font-mono"
            onChange={(event) => onLongitudeChange(event.target.value)}
            placeholder="e.g. -73.968285"
            value={longitude}
          />
        </div>
      </div>
    </div>
  );
};
