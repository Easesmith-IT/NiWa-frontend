import { useMetaCredentialsState } from "./useMetaCredentialsState";
import { useOperatorProfileState } from "./useOperatorProfileState";
import { useSecuritySettingsState } from "./useSecuritySettingsState";

export function useSettingsOrchestration() {
  const profile = useOperatorProfileState();
  const security = useSecuritySettingsState();
  const meta = useMetaCredentialsState();

  return {
    profile,
    security,
    meta,
  };
}

export { useOperatorProfileState } from "./useOperatorProfileState";
export { useSecuritySettingsState } from "./useSecuritySettingsState";
export { useMetaCredentialsState } from "./useMetaCredentialsState";
