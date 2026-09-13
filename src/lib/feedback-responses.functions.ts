import { createServerFn } from "@tanstack/react-start";

const PRIMARY = "migrago2026";

export type NpsResponseRow = {
  id: string;
  session_id: string;
  score: number;
  comment: string | null;
  created_at: string;
};

export type CsatResponseRow = {
  id: string;
  session_id: string;
  positive: boolean;
  created_at: string;
};

export type FeedbackResponses = {
  nps: NpsResponseRow[];
  csat: CsatResponseRow[];
};

/** Owner-only: individual feedback rows (NPS scores, comments, timestamps). */
export const listFeedbackResponses = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }): Promise<FeedbackResponses> => {
    if (data.password !== PRIMARY) return { nps: [], csat: [] };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [nps, csat] = await Promise.all([
      supabaseAdmin
        .from("nps_responses")
        .select("id, session_id, score, comment, created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabaseAdmin
        .from("csat_responses")
        .select("id, session_id, positive, created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);
    if (nps.error) console.error("[listFeedbackResponses:nps]", nps.error);
    if (csat.error) console.error("[listFeedbackResponses:csat]", csat.error);
    return {
      nps: (nps.data ?? []) as NpsResponseRow[],
      csat: (csat.data ?? []) as CsatResponseRow[],
    };
  });
