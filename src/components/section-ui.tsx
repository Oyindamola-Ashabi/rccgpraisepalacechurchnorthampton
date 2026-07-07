import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-brand opacity-90" />
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-40"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-32 text-center text-white">
        {eyebrow && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-1 text-xs uppercase tracking-[0.25em]">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display font-black text-4xl md:text-6xl leading-tight">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl text-white/90 text-base md:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
}

export function Section({
  children,
  className = "",
  id,
}: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-6 py-16 md:py-24 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  center = true,
}: { eyebrow?: string; title: ReactNode; subtitle?: string; center?: boolean }) {
  return (
    <div className={`${center ? "text-center mx-auto" : ""} max-w-2xl mb-12`}>
      {eyebrow && (
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#E13495]">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display font-bold text-3xl md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function BrandButton({
  to,
  href,
  children,
  variant = "primary",
  external = false,
}: {
  to?: string;
  href?: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "gold";
  external?: boolean;
}) {
  const base = "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition";
  const styles = {
    primary: "gradient-brand text-white shadow-elegant hover:opacity-95",
    outline: "border-2 border-white/70 text-white hover:bg-white hover:text-[#E13495]",
    gold: "bg-[#F0DE51] text-[#3a2b00] hover:brightness-105",
  }[variant];

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={`${base} ${styles}`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={to!} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
