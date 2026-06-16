import Link from "next/link";

const FAQ = [
  {
    q: "How long does a typical order take?",
    a: "Single shirts and small runs ship in 5–10 business days. Bulk runs of 25+ usually take 10–14 days. Rush options available.",
  },
  {
    q: "Can I supply my own artwork?",
    a: "Absolutely — upload it on the Custom Request page. There’s a small setup fee if the file needs prepping for print. We’ll tell you up front.",
  },
  {
    q: "Do you do designs from scratch?",
    a: "Yes. Full custom design creation starts at $75 and includes 2 rounds of revisions. We specialize in bold, culture-rooted concepts.",
  },
  {
    q: "Pickup or shipping?",
    a: "Both — pickup is free in our service area; shipping is calculated at checkout. Each campaign sets its own pickup/ship options.",
  },
  {
    q: "Can I pay manually (Cash App / Zelle / cash)?",
    a: "Yes, if the campaign organizer has manual payment enabled. You’ll get an order number and pickup info, and we’ll confirm payment offline.",
  },
  {
    q: "Do you offer the QR + flyer for my campaign?",
    a: "Yes — every Cosette campaign comes with a QR code, branded flyer, and order page auto-themed from your artwork.",
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 pt-12 pb-20">
      <span className="section-eyebrow">CONTACT · FAQ</span>
      <h1 className="font-display text-6xl mt-4 leading-[0.95]">
        QUESTIONS? <span className="gradient-text">LET’S TALK.</span>
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div className="card p-6">
          <div className="font-display text-3xl">Reach out</div>
          <p className="text-cream/80 mt-2">
            For new projects, partnerships, and press — start at the Custom Request page so we have the
            specifics, or email us directly.
          </p>
          <ul className="mt-4 space-y-2">
            <li><span className="text-sun">Email:</span> hello@cosetteproductions.com</li>
            <li><span className="text-sun">Studio:</span> Available by appointment</li>
            <li><span className="text-sun">Response time:</span> 1–2 business days</li>
          </ul>
          <div className="mt-6">
            <Link href="/custom-request" className="btn-pop">START A REQUEST</Link>
          </div>
        </div>

        <div className="card p-6">
          <div className="font-display text-3xl">Looking for a specific drop?</div>
          <p className="text-cream/80 mt-2">
            Each campaign has its own order page, deadline, and pickup options. Browse all current drops
            in the shop.
          </p>
          <div className="mt-6">
            <Link href="/shop" className="btn-ghost">BROWSE OPEN CAMPAIGNS</Link>
          </div>
        </div>
      </div>

      <h2 className="font-display text-4xl mt-14">FAQ</h2>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {FAQ.map((item) => (
          <div key={item.q} className="card p-5">
            <div className="font-display text-xl text-sun">{item.q}</div>
            <p className="text-cream/85 mt-2 text-sm">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
