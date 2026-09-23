"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import {
  listTaxConfigurations,
  getTaxConfiguration,
  createTaxConfiguration,
  updateTaxConfiguration,
  deactivateTaxConfiguration,
  deleteTaxConfiguration,
  financeApi,
} from "./finance.api";
import type {
  CreateTaxConfigurationPayload,
  UpdateTaxConfigurationPayload,
} from "./finance.types";

// ==========================================
// Tax Configuration Queries & Mutations
// ==========================================

export const useTaxConfigurationsQuery = (params?: { isActive?: boolean }) =>
  useQuery({
    queryKey: [...queryKeys.finance.taxConfigurations, params?.isActive],
    queryFn: async () => {
      const res = await listTaxConfigurations(params);
      return res.data;
    },
  });

export const useTaxConfigurationQuery = (id: string) =>
  useQuery({
    queryKey: queryKeys.finance.taxConfiguration(id),
    queryFn: async () => {
      const res = await getTaxConfiguration(id);
      return res.data;
    },
    enabled: Boolean(id),
  });

export const useCreateTaxConfigurationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaxConfigurationPayload) => createTaxConfiguration(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.taxConfigurations });
    },
  });
};

export const useUpdateTaxConfigurationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaxConfigurationPayload }) =>
      updateTaxConfiguration(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.taxConfigurations });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.taxConfiguration(id) });
    },
  });
};

export const useDeactivateTaxConfigurationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateTaxConfiguration(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.taxConfigurations });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.taxConfiguration(id) });
    },
  });
};

export const useDeleteTaxConfigurationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTaxConfiguration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.taxConfigurations });
    },
  });
};

// ==========================================
// Core Finance Queries
// ==========================================

export const useAccountsQuery = (params?: Record<string, any>) =>
  useQuery({
    queryKey: [...queryKeys.finance.accounts, params],
    queryFn: async () => {
      const res = await financeApi.getAccounts(params);
      return res.data;
    },
  });

export const useFinanceSettingsQuery = () =>
  useQuery({
    queryKey: queryKeys.finance.settings,
    queryFn: async () => {
      const res = await financeApi.getSettings();
      return res.data;
    },
  });

export const useTaxSummaryReportQuery = (params?: Record<string, any>) =>
  useQuery({
    queryKey: queryKeys.finance.reports.taxSummary(params),
    queryFn: async () => {
      const res = await financeApi.getTaxSummary(params);
      return res.data;
    },
  });
