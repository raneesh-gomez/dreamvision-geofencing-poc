import type { FSP, NGO } from "@/types";
import { fetchRows } from "./database.service";
import type { PostgrestError } from "@supabase/supabase-js";

export const getNgos = async (): Promise<{ data: NGO[]; error: PostgrestError | null }> => {
  const { data, error } = await fetchRows<NGO>("ngo", "id, name");
  return { data, error };
};

export const getFsps = async (): Promise<{ data: FSP[]; error: PostgrestError | null }> => {
  const { data, error } = await fetchRows<FSP>("fsp", "id, name");
  return { data, error };
};