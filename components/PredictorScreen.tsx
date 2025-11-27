
import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { usePrediction } from '../services/authService';
import Sidebar from './Sidebar';
import TestPostbackScreen from './TestPostbackScreen';
import GuideModal from './GuideModal';
import AdminAuthModal from './AdminAuthModal';
import { useLanguage } from '../contexts/LanguageContext';

interface PredictorScreenProps {
  user: User;
  onLogout: () => void;
}

// --- Icons ---

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const GuideIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
  </svg>
);

const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l13.96 7.376c1.268.67 1.268 2.514 0 3.184l-13.96 7.376c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

// Custom Star Icon
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-sm">
    <path 
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
        fill="#fbbf24" 
        stroke="none"
    />
  </svg>
);

// --- Limit Reached View ---

const LimitReachedView = React.memo(({ handleDepositRedirect }: { handleDepositRedirect: () => void; }) => {
  const { t } = useLanguage();

  return (
     <div 
        className="w-full h-screen flex flex-col font-poppins relative overflow-hidden items-center justify-center p-4"
      >
        {/* Gradient Background matching reference */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8] to-[#0284c7] z-0"></div>

        <div className="w-full max-w-sm bg-[#0b2545] rounded-2xl p-8 border-b-4 border-[#06162d] text-center shadow-2xl z-10">
            <h1 className="text-2xl font-russo uppercase text-[#38bdf8] mb-4 tracking-wide">
                {t('reDepositMessageTitle')}
            </h1>
            <p className="text-gray-300 font-poppins text-sm leading-relaxed mb-8">{t('limitReachedText')}</p>
            
            <button 
                onClick={handleDepositRedirect}
                className="w-full py-4 bg-gradient-to-r from-[#4ade80] to-[#16a34a] text-[#064e3b] font-russo text-xl uppercase rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg border-b-4 border-[#14532d] active:border-b-0 active:translate-y-1"
            >
                {t('depositNow')}
            </button>
        </div>
    </div>
  );
});

type GridItemType = 'empty' | 'star' | 'mine';

const PredictorView = React.memo((props: {
    onOpenSidebar: () => void;
    onOpenGuide: () => void;
    gridState: GridItemType[];
    selectedTraps: number;
    setSelectedTraps: (val: number) => void;
    isSignalActive: boolean;
    onGetSignal: () => void;
    onRefresh: () => void;
    confidence: number | null;
    isLoading: boolean;
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { t } = useLanguage();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div className="w-full min-h-screen flex flex-col relative font-poppins overflow-hidden bg-[#0ea5e9]">
            {/* Enhanced Blue Background to match reference */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8] to-[#0284c7] z-0"></div>

            {/* Top Bar */}
            <header className="w-full flex justify-between items-center p-5 z-10">
                <div className="bg-[#0b2545] border-2 border-[#06162d] rounded-xl px-4 py-2 shadow-lg backdrop-blur-sm bg-opacity-80">
                    <div className="text-[10px] text-[#38bdf8] font-russo uppercase tracking-widest leading-none mb-1">{t('realTime')}</div>
                    <div className="text-white font-mono font-bold text-lg leading-none tracking-wide">
                        {formattedTime}
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button onClick={props.onOpenGuide} className="p-2 rounded-full bg-black/10 text-[#001e3c] hover:bg-black/20 transition active:scale-90">
                        <GuideIcon className="w-7 h-7" />
                    </button>
                    <button onClick={props.onOpenSidebar} className="p-2 rounded-full bg-black/10 text-[#001e3c] hover:bg-black/20 transition active:scale-90">
                        <MenuIcon className="w-7 h-7" />
                    </button>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center w-full max-w-md mx-auto px-4 z-10 relative -mt-8">
                
                {/* Title Area - Dark text matching reference */}
                <div className="mb-6 mt-8 text-center">
                    <h1 className="font-russo text-5xl text-[#001e3c] tracking-wide leading-none drop-shadow-sm opacity-90">
                        MINES
                    </h1>
                    <h2 className="font-russo text-3xl md:text-4xl text-[#001e3c] tracking-wide leading-none drop-shadow-sm opacity-90">
                        PREDICTOR VIP
                    </h2>
                </div>

                {/* 5x5 Grid - Dark squares with blue dots */}
                <div className="p-2 rounded-2xl w-full aspect-square max-w-[350px] mb-6">
                    <div className="grid grid-cols-5 grid-rows-5 gap-3 w-full h-full">
                        {props.gridState.map((item, index) => (
                            <div 
                                key={index}
                                className={`
                                    relative w-full h-full rounded-lg flex items-center justify-center overflow-visible
                                    transition-all duration-300
                                    bg-[#0b2545]
                                    shadow-[0_4px_0_#06162d]
                                `}
                            >
                                {/* Standard State: Blue Dot */}
                                {(item === 'empty' || item === 'mine') && (
                                    <div className="w-4 h-4 rounded-full bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.6)]"></div>
                                )}
                                
                                {/* Signal State: Star */}
                                {item === 'star' && (
                                    <div className="w-[70%] h-[70%] flex items-center justify-center animate-pop-in z-10">
                                        <StarIcon />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trap Selection Buttons - Blue Pill Shape */}
                <div className="flex justify-between w-full max-w-[350px] gap-3 mb-6">
                    {[1, 3, 5].map((traps) => (
                        <button
                            key={traps}
                            onClick={() => !props.isSignalActive && props.setSelectedTraps(traps)}
                            disabled={props.isSignalActive}
                            className={`
                                flex-1 py-2.5 rounded-full font-russo text-lg tracking-wider transition-all duration-200 border-b-4
                                ${props.selectedTraps === traps 
                                    ? 'bg-[#0284c7] border-[#075985] text-white shadow-lg translate-y-[1px]' 
                                    : 'bg-[#38bdf8] border-[#0284c7] text-[#0c4a6e] hover:brightness-110'}
                                ${props.isSignalActive ? 'opacity-80 cursor-not-allowed' : 'active:scale-95 active:border-b-0 active:translate-y-1'}
                            `}
                        >
                            {traps} {t('traps')}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="w-full max-w-[350px] flex gap-3 mb-6 h-[60px]">
                    {/* Refresh Button - Circular Blue */}
                    <button
                        onClick={props.onRefresh}
                        disabled={!props.isSignalActive} 
                        className={`
                            h-full aspect-square rounded-full flex items-center justify-center border-b-4 transition-all
                            ${props.isSignalActive 
                                ? 'bg-[#38bdf8] border-[#0284c7] text-[#0c4a6e] shadow-lg active:border-b-0 active:translate-y-1 hover:brightness-110 cursor-pointer' 
                                : 'bg-[#64748b] border-[#475569] text-gray-400 cursor-not-allowed'}
                        `}
                    >
                        <RefreshIcon className={`w-8 h-8 ${props.isSignalActive ? 'animate-spin-once' : ''}`} />
                    </button>

                    {/* Get Signal Button - Green Pill */}
                    <button
                        onClick={props.onGetSignal}
                        disabled={props.isSignalActive || props.isLoading}
                        className={`
                            flex-1 h-full rounded-full flex items-center justify-center gap-2 font-russo text-2xl tracking-wide border-b-4 transition-all shadow-xl
                            ${!props.isSignalActive && !props.isLoading
                                ? 'bg-gradient-to-r from-[#4ade80] to-[#16a34a] border-[#14532d] text-[#064e3b] hover:brightness-110 active:border-b-0 active:translate-y-1'
                                : 'bg-[#334155] border-[#1e293b] text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        {props.isLoading ? (
                            <div className="flex space-x-1">
                                <div className="w-3 h-3 bg-current rounded-full animate-bounce delay-0"></div>
                                <div className="w-3 h-3 bg-current rounded-full animate-bounce delay-150"></div>
                                <div className="w-3 h-3 bg-current rounded-full animate-bounce delay-300"></div>
                            </div>
                        ) : (
                            <>
                                <PlayIcon className="w-8 h-8" />
                                {t('getSignal')}
                            </>
                        )}
                    </button>
                </div>

                {/* Confidence Meter - Dark Blue Pill */}
                <div className="w-full max-w-[350px] bg-[#0284c7] border-b-4 border-[#075985] rounded-full py-3 px-6 text-center shadow-lg">
                    <p className="font-russo text-xl text-white tracking-widest">
                        {t('confidence')}:- <span className="text-white filter drop-shadow-sm">
                            {props.confidence ? `${props.confidence}%` : '80%'}
                        </span>
                    </p>
                </div>

            </main>
            
            <style>{`
                @keyframes pop-in {
                    0% { transform: scale(0); opacity: 0; }
                    60% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); }
                }
                .animate-pop-in {
                    animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes spin-once {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-once {
                    animation: spin-once 0.5s ease-out;
                }
            `}</style>
        </div>
    );
});

const PredictorScreen: React.FC<PredictorScreenProps> = ({ user, onLogout }) => {
  const [predictionsLeft, setPredictionsLeft] = useState(user.predictionsLeft);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('predictor');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { t } = useLanguage();

  // Mines Specific State
  const [selectedTraps, setSelectedTraps] = useState<number>(1); 
  const [gridState, setGridState] = useState<GridItemType[]>(Array(25).fill('empty'));
  const [isSignalActive, setIsSignalActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const storedPic = localStorage.getItem(`profile_pic_${user.playerId}`);
    if (storedPic) {
      setProfilePic(storedPic);
    } else {
      setProfilePic(null);
    }
  }, [user.playerId]);
  
  const handleProfilePictureChange = useCallback((newPicUrl: string) => {
    setProfilePic(newPicUrl);
  }, []);

  const handleGetSignal = useCallback(async () => {
    if (isSignalActive || predictionsLeft <= 0 || isLoading) return;

    setIsLoading(true);

    try {
      const result = await usePrediction(user.playerId);
      if (!result.success) {
        alert(`${t('errorLabel')}: ${result.message || t('couldNotUsePrediction')}`);
        setIsLoading(false);
        return;
      }
      
      setPredictionsLeft(prev => prev - 1);

      const randomConfidence = Math.floor(Math.random() * (99 - 70 + 1)) + 70;
      const totalCells = 25;
      let newGrid: GridItemType[] = Array(totalCells).fill('empty');

      if (selectedTraps === 1) {
        const allIndices = Array.from({ length: totalCells }, (_, i) => i);
        for (let i = allIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
        }
        const selectedIndices = allIndices.slice(0, 5);
        newGrid = newGrid.map((_, index) => {
          if (selectedIndices.includes(index)) return 'star';
          return 'empty';
        });
      } else {
        const numberOfMines = selectedTraps;
        const allIndices = Array.from({ length: totalCells }, (_, i) => i);
        for (let i = allIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
        }
        const mineIndices = allIndices.slice(0, numberOfMines);
        newGrid = newGrid.map((_, index) => {
          if (mineIndices.includes(index)) return 'mine';
          return 'star';
        });
      }

      setTimeout(() => {
          setGridState(newGrid);
          setConfidence(randomConfidence);
          setIsSignalActive(true);
          setIsLoading(false);
      }, 600);

    } catch (error) {
       console.error("Failed to get signal:", error);
       alert(t('unexpectedErrorSignal'));
       setIsLoading(false);
    }
  }, [user.playerId, isSignalActive, predictionsLeft, isLoading, t, selectedTraps]);
  
  const handleRefresh = useCallback(() => {
    setGridState(Array(25).fill('empty'));
    setIsSignalActive(false);
    setConfidence(null);
  }, []);

  const handleDepositRedirect = useCallback(async () => {
    try {
        const response = await fetch('/api/get-affiliate-link');
        const data = await response.json();
        if (response.ok && data.success) {
            if (window.top) {
                window.top.location.href = data.link;
            } else {
                window.location.href = data.link;
            }
        } else {
            alert(data.message || t('depositLinkNotAvailable'));
        }
    } catch (error) {
        console.error('Failed to fetch deposit link:', error);
        alert(t('unexpectedErrorOccurred'));
    }
  }, [t]);
  
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const handleNavigate = useCallback((view: string) => { setCurrentView(view); setIsSidebarOpen(false); }, []);
  const handleTestPostbackClick = useCallback(() => { setIsSidebarOpen(false); setShowAdminModal(true); }, []);
  const handleAdminSuccess = useCallback(() => { setShowAdminModal(false); setCurrentView('testPostback'); }, []);
  const handleAdminClose = useCallback(() => setShowAdminModal(false), []);
  const handleBackToPredictor = useCallback(() => setCurrentView('predictor'), []);

  if (predictionsLeft <= 0 && !isLoading) {
    return <LimitReachedView handleDepositRedirect={handleDepositRedirect} />;
  }
  
  return (
    <div className="w-full min-h-screen bg-transparent">
      {isGuideOpen && <GuideModal onClose={() => setIsGuideOpen(false)} />}
      {showAdminModal && <AdminAuthModal onSuccess={handleAdminSuccess} onClose={handleAdminClose} />}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        isLoggedIn={true}
        playerId={user.playerId}
        onProfilePictureChange={handleProfilePictureChange}
        onTestPostbackClick={handleTestPostbackClick}
      />
      {currentView === 'predictor' && (
        <PredictorView 
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            gridState={gridState}
            selectedTraps={selectedTraps}
            setSelectedTraps={setSelectedTraps}
            isSignalActive={isSignalActive}
            onGetSignal={handleGetSignal}
            onRefresh={handleRefresh}
            confidence={confidence}
            isLoading={isLoading}
        />
      )}
      {currentView === 'testPostback' && 
        <TestPostbackScreen onBack={handleBackToPredictor} />
      }
    </div>
  );
};

export default React.memo(PredictorScreen);
