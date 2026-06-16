"use client";

import { useState } from "react";
import { formatUsd } from "@/lib/money";

type Row = {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  design: string;
  itemCount: number;
  total: number;
  status: string;
  paymentStatus: string;
  fulfillment: string;
};

const STATUSES = ["PENDING", "PAID", "INVOICED", "FULFILLED", "CANCELED"];

export default function OrdersTable({ orders }: { orders: Row[] }) {
  const [rows, setRows] = useState(orders);

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setRows(rows.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <table className="admin-table">
      <thead>
        <tr><th>When</th><th>Customer</th><th>Design</th><th>Qty</th><th>Fulfillment</th><th>Total</th><th>Payment</th><th>Status</th></tr>
      </thead>
      <tbody>
        {rows.length === 0 && <tr><td colSpan={8} className="text-cream/60">No orders yet.</td></tr>}
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{new Date(r.createdAt).toLocaleString()}</td>
            <td>{r.customerName}<br /><span className="text-xs text-cream/60">{r.customerEmail}</span></td>
            <td>{r.design}</td>
            <td>{r.itemCount}</td>
            <td>{r.fulfillment}</td>
            <td>{formatUsd(r.total)}</td>
            <td>{r.paymentStatus}</td>
            <td>
              <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} className="input py-1">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
