import { supabase } from "@/lib/supabase/client";
import type { DbFetchFilter, JoinOptions } from "@/types";
import type { PostgrestError } from "@supabase/supabase-js";

export const fetchRows = async <T>(
  table: string,
  columns: string,
  filters?: Array<DbFetchFilter>,
  join?: JoinOptions
): Promise<{ data: T[]; error: PostgrestError | null }> => {
  let select = columns;

  if (join) {
    const joinSelect = join.joinColumns?.join(", ") || "*";
    const joinType = join.joinType ?? "inner";
    select += `, ${join.joinTable}!${joinType}(${joinSelect})`;
  }

  let query = supabase.from(table).select(select);
  if (filters) {
    for (const filter of filters) {
      if (filter.operator === "eq") {
        query = query.eq(filter.column, filter.value);
      } else if (filter.operator === "ilike") {
        query = query.ilike(filter.column, filter.value as string);
      }
    }
  }
  const { data, error } = await query;
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