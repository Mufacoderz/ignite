"use client";

import { Home, Dumbbell, CalendarCheck2, ListChecks, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/exercises", label: "Exercise", icon: Dumbbell },
  { to: "/today", label: "Today", icon: CalendarCheck2 },
  { to: "/plans", label: "Plans", icon: ListChecks },
  { to: "/stats", label: "Stats", icon: BarChart3 },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <div className="md:hidden fixed bottom-5 inset-x-4 z-30">
      <nav className="rounded-3xl relative overflow-hidden" style={{
        background: "rgba(15,10,11,0.94)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div className="grid grid-cols-5 px-1 py-1.5 relative">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);

            return (
              <Link
                key={item.to}
                href={item.to}
                className="flex flex-col items-center justify-center gap-1 py-3 relative z-10 active:scale-95 transition-transform"
              >
                <Icon className="h-5 w-5" style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }} />
                <span className="text-[9px] font-semibold tracking-wide" style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Sliding Indicator */}
          <AnimatePresence mode="wait">
            {NAV.map((item, index) => {
              if (!isActive(item.to)) return null;
              return (
                <motion.div
                  key="indicator"
                  className="absolute top-1.5 bottom-1.5 bg-[#C41230] rounded-2xl"
                  initial={false}
                  animate={{ left: `${index * 20}%`, width: "20%" }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </nav>
    </div>
  );
}