import { useState } from "react";

export const useMessageStudioLocationState = () => {
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  return {
    locationName, setLocationName,
    locationAddress, setLocationAddress,
    latitude, setLatitude,
    longitude, setLongitude,
  };
};
