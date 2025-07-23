import { supabase } from "@/lib/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";

export const fetchTable = async <T>(
  table: string,
  columns: string
): Promise<{ data: T[]; error: PostgrestError | null }> => {
  const { data, error } = await supabase.from(table).select(columns);
  return { data: (data ?? []) as T[], error };
};

export const insertRow = async <T>(
  table: string,
  row: T
): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase.from(table).insert(row);
  return { error };
};

export const updateRow = async <T>(
  table: string,
  match: Partial<T>,
  updates: Partial<T>
): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase.from(table).update(updates).match(match);
  return { error };
};

export const deleteRow = async <T>(
  table: string,
  match: Partial<T>
): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase.from(table).delete().match(match);
  return { error };
};