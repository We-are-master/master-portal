"use client";

import { useEffect } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Slide-in right drawer used by Job and Property detail panels.
 * Backdrop click + Esc close. Body scroll is locked while open.
 */
export function Drawer({ open, onClose, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="dbg" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function DrawerHeader({
  title,
  meta,
  onClose,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="dh">
      <div>
        <h2>{title}</h2>
        {meta && <div className="meta">{meta}</div>}
      </div>
      <button
        onClick={onClose}
        style={{ width: 30, height: 30, borderRadius: 5, border: "1px solid var(--ln)", background: "#fff", fontSize: 13 }}
      >
        ✕
      </button>
    </div>
  );
}

export function DrawerBody({ children }: { children: React.ReactNode }) {
  return <div className="db">{children}</div>;
}

export function DrawerFooter({ children }: { children: React.ReactNode }) {
  return <div className="df">{children}</div>;
}

export function DrawerTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; count?: string | number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="dtabs">
      {tabs.map((t) => (
        <div key={t.id} className={`dtab${active === t.id ? " on" : ""}`} onClick={() => onChange(t.id)}>
          {t.label}
          {t.count !== undefined && <span className="c">{t.count}</span>}
        </div>
      ))}
    </div>
  );
}
