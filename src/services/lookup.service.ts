import type { FSP, NGO } from "@/types";
import { fetchRows } from "./database.service";
import type { PostgrestError } from "@supabase/supabase-js";

export const getNgos = async (): Promise<{ data: NGO[]; error: PostgrestError | null }> => fetchRows<NGO>("ngo", "id, name");

export const getNgoById = async (ngo_id: string): Promise<{ data: NGO | null; error: PostgrestError | null }> => {
  const { data, error } = await fetchRows<NGO>("ngo", "id, name", [{ column: "id", operator: "eq", value: ngo_id }]);
  return { data: data?.[0] ?? null, error };
};

export const getFsps = async (): Promise<{ data: FSP[]; error: PostgrestError | null }> => fetchRows<FSP>("fsp", "id, name");

export const getFspById = async (fsp_id: string): Promise<{ data: FSP | null; error: PostgrestError | null }> => {
  const { data, error } = await fetchRows<FSP>("fsp", "id, name", [{ column: "id", operator: "eq", value: fsp_id }]);
  return { data: data?.[0] ?? null, error };
};