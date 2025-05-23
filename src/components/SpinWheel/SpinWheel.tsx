
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCoins } from '@/hooks/useCoins';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SpinReward {
  value: number;
  probability: number;
  color: string;
}

const SpinWheel = () => {
  const { addCoins } = useCoins();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSpinning, setIsSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<SpinReward | null>(null);
  const [timeToNextSpin, setTimeToNextSpin] = useState<number | null>(null);
  
  const rewards: SpinReward[] = [
    { value: 1, probability: 0.5, color: '#4CAF50' }, // 50% chance - green
    { value: 10, probability: 0.25, color: '#2196F3' }, // 25% chance - blue
    { value: 50, probability: 0.15, color: '#FF9800' }, // 15% chance - orange
    { value: 100, probability: 0.1, color: '#F44336' }, // 10% chance - red
  ];

  // Set equal segments on the wheel
  const segments = rewards.map((reward, index) => {
    const segmentSize = 360 / rewards.length;
    const startAngle = index * segmentSize;
    const endAngle = (index + 1) * segmentSize;
    return {
      ...reward,
      startAngle,
      endAngle,
      midAngle: startAngle + segmentSize / 2
    };
  });

  // Check if spin is available based on time
  useEffect(() => {
    const lastSpinTime = localStorage.getItem('lastSpinTime');
    
    if (lastSpinTime) {
      const now = new Date().getTime();
      const lastSpin = parseInt(lastSpinTime, 10);
      const timeSinceLastSpin = now - lastSpin;
      const cooldownTime = 6 * 60 * 60 * 1000; // 6 hours in ms
      
      if (timeSinceLastSpin < cooldownTime) {
        setCanSpin(false);
        const remainingTime = cooldownTime - timeSinceLastSpin;
        setTimeToNextSpin(remainingTime);
        
        // Start countdown timer
        const timer = setInterval(() => {
          setTimeToNextSpin(prev => {
            if (prev !== null && prev <= 1000) {
              clearInterval(timer);
              setCanSpin(true);
              return null;
            }
            return prev !== null ? prev - 1000 : null;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      } else {
        setCanSpin(true);
      }
    } else {
      setCanSpin(true);
    }
  }, []);
  
  const spinWheel = () => {
    if (!canSpin || !user) return;
    
    setIsSpinning(true);
    setSpinResult(null);
    
    // Determine the reward based on probabilities
    const rand = Math.random();
    let cumulativeProbability = 0;
    let selectedReward: SpinReward | null = null;
    
    for (const reward of rewards) {
      cumulativeProbability += reward.probability;
      if (rand <= cumulativeProbability) {
        selectedReward = reward;
        break;
      }
    }
    
    if (!selectedReward) selectedReward = rewards[rewards.length - 1];
    
    // Find the segment index
    const segmentIndex = rewards.findIndex(reward => reward.value === selectedReward?.value);
    
    // Calculate the rotation angle to land on the selected segment
    // We add 5 full rotations (1800 degrees) plus the angle to the selected segment
    const segmentAngle = segments[segmentIndex].midAngle;
    const targetRotation = 1800 + (360 - segmentAngle);
    
    // Set CSS custom property for the rotation angle
    document.documentElement.style.setProperty('--rotation-angle', `${targetRotation}deg`);
    
    setRotation(prevRotation => prevRotation + targetRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(selectedReward);
      
      if (selectedReward) {
        addCoins(selectedReward.value, 'Spin Wheel');
      }
      
      // Set cooldown
      const now = new Date().getTime();
      localStorage.setItem('lastSpinTime', now.toString());
      setCanSpin(false);
      setTimeToNextSpin(6 * 60 * 60 * 1000); // 6 hours in ms
    }, 5000);
  };
  
  // Format the remaining time to HH:MM:SS
  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  if (!user) {
    return (
      <div className="p-6 bg-spdm-gray rounded-lg text-center">
        <h2 className="text-xl font-semibold text-spdm-green mb-3">Spin Wheel</h2>
        <p className="text-gray-400">Please login to use the Spin Wheel feature.</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-spdm-gray rounded-lg border border-spdm-green/20">
      <h2 className="text-xl font-semibold text-spdm-green text-center mb-6">Spin the Wheel</h2>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="relative w-64 h-64">
          {/* Wheel container */}
          <div className="absolute w-full h-full rounded-full overflow-hidden border-4 border-spdm-green glow-border">
            <div 
              className={`w-full h-full transition-transform duration-[5s] ease-out`}
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              {segments.map((segment, index) => (
                <div 
                  key={index}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    transform: `rotate(${segment.startAngle}deg)`,
                    transformOrigin: 'center',
                    clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)`,
                    backgroundColor: segment.color
                  }}
                >
                  <div 
                    className="absolute top-[15%] left-1/2 transform -translate-x-1/2 text-sm font-bold text-black"
                    style={{ transform: `translateX(-50%) rotate(${90}deg)` }}
                  >
                    {segment.value} Coins
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Center pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full z-10 border-2 border-gray-800"></div>
          
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-white z-10 clip-triangle"></div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="bg-spdm-dark p-4 rounded-lg border border-spdm-green/30 w-full max-w-xs">
            <h3 className="text-white font-medium mb-2">Possible Rewards</h3>
            <ul className="space-y-2">
              {rewards.map((reward, index) => (
                <li key={index} className="flex justify-between">
                  <span className="text-gray-300">{reward.value} Coins</span>
                  <span className="text-gray-400">{reward.probability * 100}% chance</span>
                </li>
              ))}
            </ul>
          </div>
          
          {spinResult && (
            <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-lg text-center animate-fade-in max-w-xs w-full">
              <h3 className="text-green-400 font-medium mb-1">You won!</h3>
              <p className="text-2xl font-bold text-white">
                <span className="text-spdm-green">{spinResult.value}</span> Coins
              </p>
            </div>
          )}
          
          <Button
            onClick={spinWheel}
            disabled={!canSpin || isSpinning}
            className={`${
              canSpin && !isSpinning
                ? 'bg-spdm-green hover:bg-spdm-darkGreen text-black'
                : 'bg-gray-700 cursor-not-allowed text-gray-300'
            } w-full max-w-xs font-medium`}
          >
            {isSpinning ? 'Spinning...' : canSpin ? 'Spin the Wheel' : 'On Cooldown'}
          </Button>
          
          {!canSpin && timeToNextSpin !== null && (
            <p className="text-sm text-gray-400">
              Next spin available in: <span className="text-spdm-green">{formatTimeRemaining(timeToNextSpin)}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;
