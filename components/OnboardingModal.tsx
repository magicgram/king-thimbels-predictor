import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const HowToPlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const ChartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

interface OnboardingModalProps {
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-fade-in font-poppins text-white p-4 bg-black/60 backdrop-blur-sm" 
        aria-modal="true" role="dialog">
       
       <div className="relative z-10 flex flex-col h-full w-full items-center justify-center">
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in {
              animation: fade-in 0.3s ease-out forwards;
            }
          `}</style>
          
          <div className="bg-[#0b2545] w-full max-w-lg rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border-b-4 border-[#06162d] flex flex-col max-h-full overflow-hidden">
              <header className="w-full text-center pt-8 pb-4 flex-shrink-0 bg-[#06162d]/30">
                  <h1 className="text-2xl font-russo tracking-wide uppercase text-white">{t('welcomeGuide')}</h1>
              </header>

              <main className="flex-grow overflow-y-auto p-6 space-y-6">
                  <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 pt-1"><HowToPlayIcon /></div>
                      <div>
                          <h2 className="font-bold text-xl text-white">{t('onboardingTitle1')}</h2>
                          <p className="mt-1 text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: t('onboardingDesc1') }} />
                  </div>
              </div>

              <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1"><LinkIcon /></div>
                  <div>
                      <h2 className="font-bold text-xl text-white">{t('onboardingTitle2')}</h2>
                      <p className="mt-1 text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: t('onboardingDesc2') }} />
                  </div>
              </div>
              
              <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1"><ChartIcon /></div>
                  <div>
                      <h2 className="font-bold text-xl text-white">{t('onboardingTitle3')}</h2>
                      <p className="mt-1 text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: t('onboardingDesc3') }} />
                  </div>
              </div>
              
              <div className="text-center p-3 bg-[#38bdf8]/10 border border-[#38bdf8]/30 rounded-lg mt-4">
                  <p className="font-bold text-[#38bdf8] text-sm">{t('disclaimer')}</p>
                  <p className="text-xs text-[#38bdf8]/80">{t('disclaimerText')}</p>
              </div>
          </main>
          
          <footer className="w-full p-6 bg-[#06162d]/30">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-[#4ade80] to-[#16a34a] text-[#064e3b] font-poppins font-bold text-lg uppercase rounded-full transition-all hover:brightness-110 active:scale-95 shadow-lg border-b-4 border-[#14532d] active:border-b-0 active:translate-y-1"
                aria-label={t('closeWelcomeGuide')}
                >
                {t('iUnderstand')}
              </button>
          </footer>
         </div>
       </div>
    </div>
  );
};

export default React.memo(OnboardingModal);