import configData from '../../data/config.json';

export const metadata = {
  title: `Terms of Service | ${configData.siteTitle}`,
  description: 'The terms governing the use of our exhibition platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">Terms of Service</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Acceptance</h2>
          <p>
            By accessing {configData.siteTitle}, you agree to abide by these terms and all applicable laws and regulations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Usage License</h2>
          <p>
            Permission is granted to view the exhibition content for personal, non-commercial use. 
            You may not decompile or reverse engineer any software contained on the website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Content</h2>
          <p>
            The content displayed in this exhibition is the property of the respective members and {configData.siteTitle}. 
            Unauthorized reproduction is prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Disclaimer</h2>
          <p>
            The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, 
            and hereby disclaim all other warranties.
          </p>
        </section>

        <footer className="pt-12 border-t border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-400">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </footer>
      </div>
    </div>
  );
}
