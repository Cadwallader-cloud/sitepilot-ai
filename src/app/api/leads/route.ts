import { getSupabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

/** POST — save early-access lead to Supabase `leads`. */
export async function POST(request: Request) {
  let body: { businessName?: unknown; email?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const businessName =
    typeof body.businessName === "string" ? body.businessName.trim() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("leads").insert({
    email,
    business_name: businessName || null,
  });

  if (error) {
    console.error("POST /api/leads:", error.message);
    return NextResponse.json(
      {
        error:
          "Could not save request. Run supabase/schema-leads.sql in Supabase.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
