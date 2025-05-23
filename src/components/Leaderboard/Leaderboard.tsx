import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  username: string;
  points: number;
  rank: number;
}

const Leaderboard = () => {
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to format time remaining
  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days} days ${hours} hours ${minutes} minutes`;
  };

  // Calculate end of current period
  const calculatePeriodEnd = () => {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return endDate;
  };

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      const { data: leaderboardData, error } = await supabase
        .from('leaderboard')
        .select(`
          id,
          user_id,
          points,
          profiles:user_id (username)
        `)
        .gte('points', 10) // Minimum 10 points to appear
        .order('points', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      
      if (leaderboardData) {
        const formattedData = leaderboardData
          .map((item: any, index: number) => ({
            id: item.user_id,
            username: item.profiles?.username || 'Unknown User',
            points: item.points,
            rank: index + 1
          }));
        
        setLeaderboardUsers(formattedData);
      }
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error fetching leaderboard",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update time until reset
  useEffect(() => {
    const updateTimeRemaining = () => {
      const endDate = calculatePeriodEnd();
      setTimeUntilReset(formatTimeRemaining(endDate));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch leaderboard data periodically
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);
  
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Award className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getUserRank = () => {
    if (!user) return null;
    return leaderboardUsers.find(entry => entry.id === user.id);
  };
  
  const userRank = getUserRank();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-spdm-green mb-1">Monthly Leaderboard</h2>
          <p className="text-sm text-gray-400">
            Resets in {timeUntilReset}. Top winners get rewards!
          </p>
        </div>
        
        {userRank && (
          <div className="bg-spdm-dark border border-spdm-green/20 rounded-lg px-4 py-2 flex items-center gap-3">
            <div className="text-sm text-gray-400">Your rank:</div>
            <div className="font-bold text-white">#{userRank.rank}</div>
            <div className="text-spdm-green font-semibold">{userRank.points} points</div>
          </div>
        )}
      </div>
      
      <div className="bg-spdm-gray rounded-lg p-4 border border-spdm-green/20">
        <div className="grid grid-cols-12 gap-2 py-2 px-4 border-b border-spdm-green/10 text-gray-400">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-8 sm:col-span-9">User</div>
          <div className="col-span-3 sm:col-span-2 text-right">Points</div>
        </div>
        
        {loading ? (
          <div className="py-8 text-center text-gray-400">
            Loading leaderboard...
          </div>
        ) : leaderboardUsers.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            No users have reached 10 points yet
          </div>
        ) : (
          <div className="space-y-1 pt-2 max-h-96 overflow-y-auto">
            {leaderboardUsers.map((entry, index) => {
              const isCurrentUser = user?.id === entry.id;
              const isTopThree = entry.rank <= 3;
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`grid grid-cols-12 gap-2 py-2.5 px-4 rounded-md ${
                    isCurrentUser 
                      ? 'bg-spdm-green/10 border border-spdm-green/30' 
                      : isTopThree
                        ? 'bg-spdm-dark/50'
                        : 'hover:bg-spdm-dark/30'
                  }`}
                >
                  <div className="col-span-1 flex justify-center items-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="col-span-8 sm:col-span-9 font-medium truncate">
                    {entry.username}
                    {isCurrentUser && <span className="ml-2 text-xs text-spdm-green">(You)</span>}
                  </div>
                  <div className={`col-span-3 sm:col-span-2 text-right font-semibold ${
                    isTopThree ? 'text-spdm-green' : 'text-white'
                  }`}>
                    {entry.points}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="text-yellow-400 font-medium mb-2">Monthly Rewards</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              <span className="text-white">1st Place</span>
            </div>
            <span className="text-spdm-green font-bold">1,000 coins</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gray-300" />
              <span className="text-white">2nd Place</span>
            </div>
            <span className="text-spdm-green font-bold">500 coins</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-amber-600" />
              <span className="text-white">3rd Place</span>
            </div>
            <span className="text-spdm-green font-bold">100 coins</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Minimum 10 points required to appear on leaderboard. Points are earned from all coin-earning activities.
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;