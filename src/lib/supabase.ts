import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createAdminSupabaseClient() {
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!supabaseUrl || !serviceRoleKey) {
		throw new Error("Supabase server configuration is missing.");
	}
	if (serviceRoleKey === supabaseAnonKey) {
		throw new Error("SUPABASE_SERVICE_ROLE_KEY is using the anon key. Copy the service_role key from Supabase Project Settings > API.");
	}
	if (serviceRoleKey.startsWith("sb_publishable_")) {
		throw new Error("SUPABASE_SERVICE_ROLE_KEY is using a publishable key. Use the Supabase secret/service_role key instead.");
	}

	return createClient(supabaseUrl, serviceRoleKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
}
