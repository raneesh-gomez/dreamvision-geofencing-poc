import type { FSP, NGO } from "@/types";
import { fetchTable } from "./database.service";
import type { PostgrestError } from "@supabase/supabase-js";

export const getNgos = async (): Promise<{ data: NGO[]; error: PostgrestError | null }> => {
  const { data, error } = await fetchTable<NGO>("ngo", "id, name");
  return { data, error };
};

export const getFsps = async (): Promise<{ data: FSP[]; error: PostgrestError | null }> => {
  const { data, error } = await fetchTable<FSP>("fsp", "id, name");
  return { data, error };
};