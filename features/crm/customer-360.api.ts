import { apiClient } from "../../lib/api/api-client";
import { Customer360Data, normalizeCustomer360Response } from "./customer-360.utils";

export const fetchCustomer360 = async (
  recordType: "Person" | "Company",
  recordId: string,
): Promise<Customer360Data> => {
  const res = await apiClient.get<unknown>(
    `/api/crm/customer-360/${recordType}/${recordId}`,
  );
  return normalizeCustomer360Response(res.data, recordType);
};
