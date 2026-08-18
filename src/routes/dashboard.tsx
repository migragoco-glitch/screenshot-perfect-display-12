import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Building2, Lock, Pencil, Sparkles, Trash2 } from "lucide-react";
import { AppHeader, LanguageSwitch, SiteFooter } from "@/components/BrandHeader";
import { PenguinLoader } from "@/components/PenguinLoader";
import { localizeNumber, useI18n } from "@/lib/i18n";
import { analysisSummary, computeProfile } from "@/lib/scoring";
import { KNOWLEDGE_TABLE_VERSION, PHASE_TITLE_KEYS, generateRoadmap } from "@/lib/roadmap";
import { trackEvent, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Smart Integration Profile — MigraGo dashboard" },
      {
        name: "description",
        content:
          "Your Legal Status, Professional Skills and Psychological Readiness scores plus your evidence-based 12-week Finland roadmap.",
      },
      { property: "og:title", content: "Smart Integration Profile — MigraGo dashboard" },
      {
        property: "og:description",
        content: "Live-recalculated readiness scores and a 12-week roadmap traced to Finnish institutions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard;
});

function Dashboard() {
  return null;
}
