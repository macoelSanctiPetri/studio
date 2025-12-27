"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { translations } from "@/lib/translations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type FormState = "idle" | "sending" | "success" | "error" | "invalid";

export default function ContactSection() {
  const { language } = useLanguage();
  const t = translations[language].contactSection;
  const [status, setStatus] = useState<FormState>("idle");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const openModal = () => setOpen(true);
    const clickHandler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href='#contact']");
      if (anchor) {
        e.preventDefault();
        openModal();
        // actualiza hash para accesibilidad / historial
        window.history.replaceState(null, "", "#contact");
      }
    };

    if (window.location.hash === "#contact") {
      openModal();
    }
    const onHash = () => {
      if (window.location.hash === "#contact") setOpen(true);
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", clickHandler, true);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", clickHandler, true);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      type: String(formData.get("type") || ""),
      message: String(formData.get("message") || "").trim(),
      honeypot: String(formData.get("company") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus("invalid");
      return;
    }

    try {
      setStatus("sending");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      {/* Ancla invisible para #contact; el modal se abre al navegar con hash */}
      <div id="contact" className="sr-only" aria-hidden />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-2xl bg-primary text-primary-foreground border border-border/50">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground">{t.title}</DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              {t.description}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-primary-foreground">
                {t.name}
                <input
                  name="name"
                  type="text"
                  className="rounded-lg border border-border/60 bg-white/90 px-3 py-2 text-neutral-900"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-primary-foreground">
                {t.email}
                <input
                  name="email"
                  type="email"
                  className="rounded-lg border border-border/60 bg-white/90 px-3 py-2 text-neutral-900"
                  required
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm text-primary-foreground sm:w-1/2">
              {t.type}
              <select
                name="type"
                className="rounded-lg border border-border/60 bg-white/90 px-3 py-2 text-neutral-900"
                defaultValue="general"
              >
                <option value="general">{t.typeOptions.general}</option>
                <option value="booking">{t.typeOptions.booking}</option>
                <option value="auditions">{t.typeOptions.auditions}</option>
                <option value="press">{t.typeOptions.press}</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-primary-foreground">
              {t.message}
              <textarea
                name="message"
                rows={5}
                className="rounded-lg border border-border/60 bg-white/90 px-3 py-2 text-neutral-900"
                required
              />
            </label>

            {/* Honeypot */}
            <input
              type="text"
              name="company"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-[#c4a850] px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:brightness-110 disabled:opacity-60"
              disabled={status === "sending"}
            >
              {status === "sending" ? t.sending : t.send}
            </button>

            {status === "success" && (
              <p className="text-sm text-emerald-400">{t.success}</p>
            )}
            {status === "error" && (
              <p className="text-sm text-rose-400">{t.error}</p>
            )}
            {status === "invalid" && (
              <p className="text-sm text-amber-300">{t.required}</p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
