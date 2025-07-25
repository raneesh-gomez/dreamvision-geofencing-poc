import { supabase } from "@/lib/supabase/client";
import type { SignUpOptions } from "@/types";
import type { AuthChangeEvent, AuthError, AuthResponse, AuthTokenResponsePassword, Session, User } from "@supabase/supabase-js";

export const getSession = async () => {
    return await supabase.auth.getSession();
};

export const onSignUp = async (email: string, password: string, options: SignUpOptions): Promise<AuthResponse> => {
    const { firstName, lastName, phoneNumber, ngoId, fspId } = options;
    return await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
                ngo_id: ngoId,
                fsp_id: fspId
            },
        },
    });
};

export const onLogin = async (email: string, password: string): Promise<AuthTokenResponsePassword> => {
    return await supabase.auth.signInWithPassword({ email, password })
};

export const onLogout = async (): Promise<AuthError | null> => {
    const { error } = await supabase.auth.signOut();
    return error;
};

export const onAuthStateChange = (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
};

export const updateUserMetadata = async (
    metadata: Partial<{
        first_name: string;
        last_name: string;
        phone_number: string | null;
        ngo_id: string;
        fsp_id: string;
        [key: string]: any;
    }>
): Promise<{ user: User | null; error: AuthError | null }> => {
    const { data, error } = await supabase.auth.updateUser({
        data: metadata,
    });
    const user = data?.user ?? null;
    return { user, error };
};