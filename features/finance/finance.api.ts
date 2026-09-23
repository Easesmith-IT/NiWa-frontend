import { financeApi } from "../../lib/api/finance-api";
import type {
  CreateTaxConfigurationPayload,
  UpdateTaxConfigurationPayload,
} from "./finance.types";

// Tax Configurations
export const listTaxConfigurations = async (params?: { isActive?: boolean }) => {
  return financeApi.getTaxConfigurations(params);
};

export const getTaxConfiguration = async (id: string) => {
  return financeApi.getTaxConfigurationById(id);
};

export const createTaxConfiguration = async (payload: CreateTaxConfigurationPayload) => {
  return financeApi.createTaxConfiguration(payload);
};

export const updateTaxConfiguration = async (id: string, payload: UpdateTaxConfigurationPayload) => {
  return financeApi.updateTaxConfiguration(id, payload);
};

export const deactivateTaxConfiguration = async (id: string) => {
  return financeApi.deactivateTaxConfiguration(id);
};

export const deleteTaxConfiguration = async (id: string) => {
  return financeApi.deleteTaxConfiguration(id);
};

// Re-export full financeApi for direct consumption
export { financeApi };
