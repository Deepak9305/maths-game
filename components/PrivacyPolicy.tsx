import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-['Lexend'] text-slate-800 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-fade-in-up">
        {/* Header */}
        <div className="bg-indigo-900 p-6 text-white flex items-center gap-4 sticky top-0 z-10 shadow-md">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-400" /> Privacy Policy
          </h1>
        </div>
        
        {/* Content */}
        <div className="p-6 md:p-10 space-y-6 overflow-y-auto max-h-[70vh] bg-slate-50/50">
          <section>
            <h2 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Overview
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Math Quest ('we') is committed to protecting your privacy. This Privacy Policy explains how we handle information in our application. We believe in keeping your data safe and simple.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Data Collection & Storage
            </h2>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
              <p className="text-slate-600 text-sm md:text-base">
                <strong>Local Storage:</strong> We do not collect personal data on external servers. All game progress, including coins, levels, XP, and unlocked items, is stored locally on your device using your browser's Local Storage.
              </p>
              <p className="text-slate-600 text-sm md:text-base">
                <strong>User Input:</strong> The "Pilot Name" you enter is stored only on your device to personalize your experience.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Children's Privacy
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Our app is designed for users of all ages, including children. We do not knowingly collect personally identifiable information from children under 13. Since all data is stored locally, no personal data is transmitted to us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
              Third-Party Services
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              This app may simulate or display advertisements. In a production environment utilizing advertising networks (like Google AdMob), standard data collection for ad personalization would apply, subject to their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">5</span>
              Contact Us
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:rizzmasterhelpteam@gmail.com" className="text-indigo-600 font-bold hover:underline">rizzmasterhelpteam@gmail.com</a>.
            </p>
          </section>
          
          <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400 font-mono uppercase tracking-widest">
            Last Updated: Current Version
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;