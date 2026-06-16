"use client";

import { useState } from "react";

export default function CustomRequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/custom-requests", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to submit request.");
      }
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div>
        <div className="font-display text-4xl text-sun">REQUEST SENT.</div>
        <p className="mt-3 text-cream/80">
          Cosette Productions will respond within 1–2 business days with a quote and next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="label">YOUR NAME</div>
          <input name="customerName" required className="input mt-1" />
        </div>
        <div>
          <div className="label">EMAIL</div>
          <input name="customerEmail" type="email" required className="input mt-1" />
        </div>
        <div>
          <div className="label">PHONE</div>
          <input name="customerPhone" className="input mt-1" />
        </div>
        <div>
          <div className="label">DEADLINE</div>
          <input name="deadline" type="date" className="input mt-1" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="label">SHIRT TYPE</div>
          <select name="shirtType" defaultValue="Unisex Tee" className="input mt-1">
            <option>Unisex Tee</option>
            <option>Heavyweight Tee</option>
            <option>Oversized Tee</option>
            <option>Crewneck Sweatshirt</option>
            <option>Hoodie</option>
            <option>Long Sleeve</option>
            <option>Tank Top</option>
          </select>
        </div>
        <div>
          <div className="label">QUANTITY</div>
          <select name="quantityRange" defaultValue="1-9" className="input mt-1">
            <option value="1-9">1–9 shirts</option>
            <option value="10-24">10–24 shirts</option>
            <option value="25-49">25–49 shirts</option>
            <option value="50+">50+ shirts</option>
          </select>
        </div>
      </div>

      <div>
        <div className="label">DO YOU HAVE A DESIGN?</div>
        <div className="flex gap-3 mt-2">
          <label className="flex items-center gap-2">
            <input type="radio" name="needsDesign" value="false" defaultChecked /> I have my own
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="needsDesign" value="true" /> Cosette, design it for me
          </label>
        </div>
      </div>

      <div>
        <div className="label">UPLOAD ARTWORK OR INSPIRATION (OPTIONAL)</div>
        <input type="file" name="upload" accept="image/*,application/pdf" className="input mt-1 file:bg-flame file:text-white file:border-0 file:py-2 file:px-3 file:rounded file:mr-3" />
      </div>

      <div>
        <div className="label">DESCRIBE YOUR SHIRT IDEA</div>
        <textarea name="description" required rows={6} className="input mt-1" placeholder="Vibe, audience, event, colors, anything specific..." />
      </div>

      {error && <div className="text-flame">{error}</div>}

      <button type="submit" className="btn-pop" disabled={submitting}>
        {submitting ? "SENDING…" : "SEND REQUEST"}
      </button>
    </form>
  );
}
