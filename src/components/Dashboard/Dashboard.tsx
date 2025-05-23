
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "./WalletDisplay";
import RewardLinks from "../Rewards/RewardLinks";
import SpinWheel from "../SpinWheel/SpinWheel";
import Shop from "../Shop/Shop";
import AfkFarm from "../AFK/AfkFarm";
import Leaderboard from "../Leaderboard/Leaderboard";
import PromoCodeForm from "../PromoCode/PromoCodeForm";

interface DashboardProps {
  activeTab?: 'rewards' | 'spin' | 'shop' | 'afk' | 'leaderboard';
}

const Dashboard = ({ activeTab = 'rewards' }: DashboardProps) => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'rewards' | 'spin' | 'shop' | 'afk' | 'leaderboard'>(activeTab);
  
  // Update tab when activeTab prop changes
  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);
  
  if (!user) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-spdm-green mb-4 glow-text">Please Login to Access Dashboard</h2>
          <p className="text-gray-400">Create an account or login to access exclusive features.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-spdm-green glow-text">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <WalletDisplay />
          </div>
          <div className="md:col-span-1">
            <PromoCodeForm />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex overflow-x-auto pb-2 space-x-2">
            <TabButton 
              active={currentTab === 'rewards'} 
              onClick={() => setCurrentTab('rewards')}
              label="Free Coins"
            />
            <TabButton 
              active={currentTab === 'spin'} 
              onClick={() => setCurrentTab('spin')}
              label="Spin Wheel"
            />
            <TabButton 
              active={currentTab === 'shop'} 
              onClick={() => setCurrentTab('shop')}
              label="Shop"
            />
            <TabButton 
              active={currentTab === 'afk'} 
              onClick={() => setCurrentTab('afk')}
              label="AFK Farm"
            />
            <TabButton 
              active={currentTab === 'leaderboard'} 
              onClick={() => setCurrentTab('leaderboard')}
              label="Leaderboard"
            />
          </div>
        </div>
        
        <div className="mt-6 animate-fade-in">
          {currentTab === 'rewards' && <RewardLinks />}
          {currentTab === 'spin' && <SpinWheel />}
          {currentTab === 'shop' && <Shop />}
          {currentTab === 'afk' && <AfkFarm />}
          {currentTab === 'leaderboard' && <Leaderboard />}
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const TabButton = ({ active, onClick, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
      active 
        ? 'bg-spdm-green text-black shadow-md shadow-spdm-green/20' 
        : 'bg-spdm-gray text-gray-300 hover:bg-spdm-green/20 hover:text-spdm-green'
    }`}
  >
    {label}
  </button>
);

export default Dashboard;
