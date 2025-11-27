
import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Icons
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

// Diamond Asset
const Diamond = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 md:w-16 md:h-16 drop-shadow-md animate-pulse">
    <path 
        d="M12 2L2 12l10 10 10-10L12 2z" 
        fill="#ef4444" 
        stroke="#b91c1c"
        strokeWidth="1"
    />
    <path 
        d="M12 2L7 12h10L12 2z" 
        fill="rgba(255,255,255,0.3)" 
    />
  </svg>
);

// Limit Reached View
const LimitReachedView = React.memo(({ handleDepositRedirect }: { handleDepositRedirect: () => void; }) => {
  const { t } = useLanguage();

  return (
     <div 
        className="w-full h-screen flex flex-col font-poppins relative overflow-hidden items-center justify-center p-4 bg-[#0b2545]"
      >
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

// Thimble Game Component
const ThimbleGame = React.memo((props: {
    onOpenSidebar: () => void;
    onOpenGuide: () => void;
    onStart: () => void;
    gameState: 'idle' | 'shuffling' | 'revealed';
    resultPosition: number | null; // 0, 1, 2
    isLoading: boolean;
}) => {
    // 0: Left, 1: Center, 2: Right
    // We track where each thimble (by ID 0,1,2) is currently located (position 0,1,2)
    const [positions, setPositions] = useState([0, 1, 2]); 
    const shuffleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const THIMBLE_IMAGE = "https://i.postimg.cc/7YqkHzBM/Untitled-design-(1).jpg";

    useEffect(() => {
        if (props.gameState === 'shuffling') {
            // Start shuffle animation loop
            const shuffle = () => {
                setPositions(prev => {
                    const newPos = [...prev];
                    // Random swap
                    const idx1 = Math.floor(Math.random() * 3);
                    let idx2 = Math.floor(Math.random() * 3);
                    while (idx1 === idx2) idx2 = Math.floor(Math.random() * 3);
                    
                    // Swap values
                    const temp = newPos[idx1];
                    newPos[idx1] = newPos[idx2];
                    newPos[idx2] = temp;
                    return newPos;
                });
            };

            // Shuffle every 300ms
            shuffleIntervalRef.current = setInterval(shuffle, 300);
            
            return () => {
                if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
            };
        } else if (props.gameState === 'revealed' || props.gameState === 'idle') {
            if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
            // Reset to clean positions for visual clarity
            setPositions([0, 1, 2]);
        }
    }, [props.gameState]);

    // Position calc
    const getPositionStyles = (posIndex: number) => {
        // Assume container is flex centered.
        // We use translate X relative to center.
        // 0 -> -110px, 1 -> 0px, 2 -> 110px
        const spacing = 110; 
        const xOffset = (posIndex - 1) * spacing; 
        return { transform: `translateX(${xOffset}px)` };
    };

    const getResultText = () => {
        if (props.gameState !== 'revealed' || props.resultPosition === null) return null;
        if (props.resultPosition === 0) return "LEFT";
        if (props.resultPosition === 1) return "CENTER";
        if (props.resultPosition === 2) return "RIGHT";
        return "";
    };

    return (
        <div className="w-full min-h-screen flex flex-col relative font-poppins overflow-hidden">
            {/* Glossy Yellow-Orange Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24] via-[#f59e0b] to-[#ea580c] z-0"></div>
            
            {/* Header */}
            <header className="w-full flex justify-between items-center p-5 z-20">
                <div className="w-10"></div> {/* Spacer for centering if needed, or keep buttons */}
                <div className="flex items-center gap-3 ml-auto">
                    <button onClick={props.onOpenGuide} className="p-2 rounded-full bg-black/10 text-white/80 hover:bg-black/20 transition active:scale-90">
                        <GuideIcon className="w-7 h-7" />
                    </button>
                    <button onClick={props.onOpenSidebar} className="p-2 rounded-full bg-black/10 text-white/80 hover:bg-black/20 transition active:scale-90">
                        <MenuIcon className="w-7 h-7" />
                    </button>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center w-full max-w-lg mx-auto px-4 z-10 relative pb-20">
                
                {/* Result Text */}
                <div className="h-16 mb-8 flex items-center justify-center">
                    {props.gameState === 'revealed' && (
                        <h1 className="font-russo text-5xl text-white tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] animate-fade-in-up">
                            {getResultText()}
                        </h1>
                    )}
                </div>

                {/* Game Area */}
                <div className="relative w-full h-64 flex items-center justify-center mb-12">
                     {/* Diamond Container - Absolute centered */}
                     {/* We position the diamond based on the RESULT position. */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[330px] h-full pointer-events-none">
                        {props.resultPosition !== null && (
                            <div 
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                                style={{ 
                                    transform: `translate(calc(-50% + ${(props.resultPosition - 1) * 110}px), -30%)`,
                                    opacity: props.gameState === 'revealed' ? 1 : 0
                                }}
                            >
                                <Diamond />
                            </div>
                        )}
                     </div>

                     {/* Thimbles Container */}
                     <div className="relative w-[330px] h-32 flex items-center justify-center">
                        {[0, 1, 2].map((id) => {
                            // Current visual slot (0, 1, 2) for this thimble ID
                            const currentSlot = positions[id];
                            
                            // Check if this thimble should lift.
                            const isWinner = props.gameState === 'revealed' && currentSlot === props.resultPosition;

                            return (
                                <div
                                    key={id}
                                    className="absolute transition-transform duration-300 ease-in-out w-28 h-28 flex items-center justify-center z-20"
                                    style={{
                                        ...getPositionStyles(currentSlot),
                                        // Add lift effect if winner
                                        marginTop: isWinner ? '-70px' : '0px',
                                    }}
                                >
                                    <img 
                                        src={THIMBLE_IMAGE} 
                                        alt="Thimble" 
                                        className="w-full h-full object-contain drop-shadow-2xl"
                                        style={{ 
                                            filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.4))',
                                            mixBlendMode: 'multiply' 
                                        }} 
                                    />
                                </div>
                            );
                        })}
                     </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={props.onStart}
                    disabled={props.isLoading || props.gameState === 'shuffling'}
                    className={`
                        relative w-48 h-16 rounded-full font-russo text-2xl tracking-wider text-white shadow-[0_6px_0_rgba(0,0,0,0.3)] transition-all
                        ${props.gameState === 'shuffling' || props.isLoading
                            ? 'bg-gray-500 cursor-not-allowed opacity-80' 
                            : 'bg-gradient-to-b from-red-500 to-red-700 hover:brightness-110 active:shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-1'}
                    `}
                >
                    {props.gameState === 'shuffling' ? '...' : 'START'}
                </button>

            </main>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
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

  // Thimble Game State
  const [gameState, setGameState] = useState<'idle' | 'shuffling' | 'revealed'>('idle');
  const [resultPosition, setResultPosition] = useState<number | null>(null); // 0, 1, 2
  const [isLoading, setIsLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const storedPic = localStorage.getItem(`profile_pic_${user.playerId}`);
    if (storedPic) setProfilePic(storedPic);
  }, [user.playerId]);
  
  const handleProfilePictureChange = useCallback((newPicUrl: string) => {
    setProfilePic(newPicUrl);
  }, []);

  const handleStart = useCallback(async () => {
    if (gameState === 'shuffling' || predictionsLeft <= 0 || isLoading) return;

    // Reset for restart interaction
    setGameState('idle');
    setResultPosition(null);

    setIsLoading(true);

    try {
      const result = await usePrediction(user.playerId);
      if (!result.success) {
        alert(`${t('errorLabel')}: ${result.message || t('couldNotUsePrediction')}`);
        setIsLoading(false);
        return;
      }
      
      setPredictionsLeft(prev => prev - 1);

      // Start Shuffle Phase
      setIsLoading(false);
      setGameState('shuffling');

      // Determine result randomly
      const winPos = Math.floor(Math.random() * 3); // 0, 1, 2

      // Wait for shuffle animation to finish (e.g., 2 seconds)
      setTimeout(() => {
          setResultPosition(winPos);
          setGameState('revealed');
      }, 2000);

    } catch (error) {
       console.error("Failed to start game:", error);
       alert(t('unexpectedErrorSignal'));
       setIsLoading(false);
    }
  }, [user.playerId, gameState, predictionsLeft, isLoading, t]);
  
  const handleDepositRedirect = useCallback(async () => {
    try {
        const response = await fetch('/api/get-affiliate-link');
        const data = await response.json();
        if (response.ok && data.success) {
            if (window.top) window.top.location.href = data.link;
            else window.location.href = data.link;
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
        <ThimbleGame 
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            onStart={handleStart}
            gameState={gameState}
            resultPosition={resultPosition}
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
