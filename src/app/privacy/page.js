import configData from '../../data/config.json';

export const metadata = {
  title: `Privacy Policy | ${configData.siteTitle}`,
  description: 'Our commitment to your privacy and data security.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">Privacy Policy</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Data Collection</h2>
          <p>
            We collect basic telemetry data to improve our exhibition experience. This includes interaction metrics, 
            performance data, and generalized geographic information. We do not sell your data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Cookies</h2>
          <p>
            We use essential cookies to manage user sessions and store your preferences (such as dark mode and cookie consent). 
            You can manage these via our cookie banner or browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Security</h2>
          <p>
            Our data infrastructure uses Row-Level Security (RLS) to prevent unauthorized access. All telemetry 
            is stored securely in an encrypted Postgres environment.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Your Rights</h2>
          <p>
            You have the right to request a copy of the data we hold or ask for its deletion. 
            Contact us at {configData.contact?.email} for any privacy-related inquiries.
          </p>
        </section>

        <footer className="pt-12 border-t border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-400">
          Last updated: April 2026
        </footer>
      </div>
    </div>
  );
}
