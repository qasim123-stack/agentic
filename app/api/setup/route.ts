import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

const staff = [
  { name: "Dr. Sarah Chen",  role: "Attending Physician",  training: "Overdue 14d", access: "Active",        risk: "amber", last_access: "Today, 09:14" },
  { name: "James Ortega",    role: "Nurse Practitioner",   training: "Current",     access: "Active",        risk: "green", last_access: "Today, 11:02" },
  { name: "Linda Park",      role: "Medical Records",      training: "Overdue 32d", access: "Active",        risk: "red",   last_access: "Yesterday" },
  { name: "Tom Reyes",       role: "IT Administrator",     training: "Current",     access: "Active",        risk: "green", last_access: "Today, 08:45" },
  { name: "Maria Santos",    role: "Billing Coordinator",  training: "Overdue 7d",  access: "Active",        risk: "amber", last_access: "3 days ago" },
  { name: "Eric Drummond",   role: "Radiologist",          training: "Current",     access: "Terminated ⚠️", risk: "red",   last_access: "2 days ago" },
];

const systems = [
  { name: "Epic EHR",          type: "EHR Platform",    mfa: true,  encrypted: true,  baa: true,  last_audit: "12 days ago", risk: "green", issue: null },
  { name: "ChatGPT (OpenAI)",  type: "AI Tool",         mfa: false, encrypted: false, baa: false, last_audit: "Never",       risk: "red",   issue: "Staff using with patient notes — no BAA exists. Instant HIPAA violation." },
  { name: "Microsoft Copilot", type: "AI Tool",         mfa: true,  encrypted: true,  baa: false, last_audit: "Never",       risk: "red",   issue: "BAA not confirmed. PHI may be processed outside HIPAA scope." },
  { name: "AWS S3 (Patient)",  type: "Cloud Storage",   mfa: true,  encrypted: true,  baa: true,  last_audit: "31 days ago", risk: "green", issue: null },
  { name: "Staff Laptops",     type: "Endpoint",        mfa: false, encrypted: true,  baa: false, last_audit: "47 days ago", risk: "amber", issue: "MFA not enforced on 12 of 34 laptops. Audit logs not reviewed." },
  { name: "Zoom (Telehealth)", type: "Communications",  mfa: true,  encrypted: true,  baa: true,  last_audit: "5 days ago",  risk: "green", issue: null },
];

const vendors = [
  { name: "Amazon Web Services",   type: "Cloud Infra",       baa_expiry: "2025-12-01", breach_clause: false, subcontractors: true,  risk: "amber", exposure: "$950K" },
  { name: "Epic Systems",          type: "EHR Platform",      baa_expiry: "2026-06-15", breach_clause: true,  subcontractors: true,  risk: "green", exposure: "$0" },
  { name: "Zoom Video Comms",      type: "Telehealth",        baa_expiry: "2025-11-30", breach_clause: true,  subcontractors: false, risk: "green", exposure: "$0" },
  { name: "Veeva Systems",         type: "Clinical Data",     baa_expiry: "2024-08-01", breach_clause: false, subcontractors: false, risk: "red",   exposure: "$1.9M" },
  { name: "Nuance (Microsoft)",    type: "AI Transcription",  baa_expiry: "2026-01-10", breach_clause: true,  subcontractors: true,  risk: "green", exposure: "$0" },
  { name: "Clearwater Compliance", type: "Risk Consulting",   baa_expiry: "2025-09-01", breach_clause: false, subcontractors: false, risk: "amber", exposure: "$450K" },
];

const incidents = [
  { date: "2025-04-21", type: "Unauthorized Access", desc: "Dr. Chen accessed 12 records outside her patients — flagged by audit log review.", status: "Resolved", severity: "amber" },
  { date: "2025-03-08", type: "Lost Device",         desc: "Staff laptop reported missing — encryption confirmed, remote wipe executed.",       status: "Resolved", severity: "green" },
  { date: "2025-01-15", type: "Email Misdirection",  desc: "PHI sent to wrong email address. 1 patient affected. OCR notified.",               status: "Closed",   severity: "amber" },
];

export async function POST() {
  try {
    // Upsert all seed data — safe to call multiple times
    const [s, sy, v, i] = await Promise.all([
      supabase.from("staff").upsert(staff, { onConflict: "name" }),
      supabase.from("systems").upsert(systems, { onConflict: "name" }),
      supabase.from("vendors").upsert(vendors, { onConflict: "name" }),
      supabase.from("incidents").upsert(incidents, { onConflict: "date,type" }),
    ]);

    const errors = [s.error, sy.error, v.error, i.error].filter(Boolean);
    if (errors.length) {
      return NextResponse.json({ ok: false, errors: errors.map(e => e?.message) }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Seed complete" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
