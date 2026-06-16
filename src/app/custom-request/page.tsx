import CustomRequestForm from "@/components/CustomRequestForm";

export default function CustomRequestPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 pt-12 pb-20">
      <span className="section-eyebrow">CUSTOM REQUEST</span>
      <h1 className="font-display text-6xl mt-4 leading-[0.95]">
        TELL US ABOUT YOUR <span className="gradient-text">VISION.</span>
      </h1>
      <p className="mt-4 text-cream/80 max-w-2xl">
        Upload your artwork or describe the idea — Cosette Productions will get back within 1–2 business days
        with a quote, mockups, and a launch plan.
      </p>

      <div className="card p-6 md:p-10 mt-10">
        <CustomRequestForm />
      </div>
    </div>
  );
}
