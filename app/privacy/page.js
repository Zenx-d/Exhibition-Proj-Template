export const metadata = {
  title: 'Privacy Policy | Zen Exhibition',
  description: 'How we handle your data and respect your privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-5xl font-black tracking-tighter mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert prose-slate max-w-none space-y-12">
        <section>
          <h2 className="text-3xl font-black tracking-tight mb-4">1. Data Collection</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            We collect anonymous telemetry data to understand how users interact with our exhibition. This includes page views, click interactions, and technical device information. We do not collect or store personally identifiable information (PII) like names or physical addresses without your explicit consent (e.g., newsletter signup).
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-black tracking-tight mb-4">2. Cookies</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            We use a single cookie to manage your privacy preferences and an anonymous session ID to group telemetry events. You can reject all non-essential tracking via our cookie consent banner.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-black tracking-tight mb-4">3. Data Ownership</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            All captured data is stored in our private Neon Database infrastructure. We do not sell your data to third parties.
          </p>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-black tracking-tight mb-2">Contact</h2>
          <p className="text-slate-500 font-medium">For any privacy-related inquiries, contact generalexhibition@proton.me</p>
        </section>
      </div>
    </div>
  );
}
