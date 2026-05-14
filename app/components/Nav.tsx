"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/people",    label: "People" },
  { href: "/systems",   label: "Systems" },
  { href: "/vendors",   label: "Vendors" },
  { href: "/documents", label: "Documents" },
  { href: "/incidents", label: "Incidents" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10,12,15,0.94)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      padding: "0.9rem 0",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none" }}>
          HIPAA Guard
        </Link>
        <ul style={{ display: "flex", gap: "1.6rem", listStyle: "none" }}>
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} style={{
                fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
                color: path.startsWith(l.href) ? "var(--accent)" : "var(--muted)",
                textDecoration: "none", transition: "color 0.2s",
              }}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
