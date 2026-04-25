export const metadata = {
  title: 'Terms of Service | Zen Exhibition',
  description: 'The terms governing your use of the Zen Exhibition platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-5xl font-black tracking-tighter mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">Terms of Service</h1>
      
      <div className="prose dark:prose-invert prose-slate max-w-none space-y-12">
        <section>
          <h2 className="text-3xl font-black tracking-tight mb-4">1. Use of Content</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            All projects, images, and documentation displayed on Zen Exhibition are the property of their respective creators. You may view and interact with the content for personal and educational purposes. Redistribution or commercial use is prohibited without explicit authorization.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-black tracking-tight mb-4">2. Technical Experiments</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            This platform showcases technical experiments and creative work. While we strive for precision, we provide the platform "as-is" without warranty of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-black tracking-tight mb-4">3. Conduct</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Users are expected to interact with the platform and its members with professional courtesy. Any attempt to exploit or disrupt the service will result in permanent blacklisting.
          </p>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 font-medium">Last Updated: April 25, 2026</p>
        </section>
      </div>
    </div>
  );
}
