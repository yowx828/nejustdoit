
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw, Copy, CheckCircle, XCircle } from 'lucide-react';

import PromoCodeManager from "@/components/Admin/PromoCodeManager";

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCoins: 0,
  });
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const [updateUserId, setUpdateUserId] = useState('');
  const [updateAmount, setUpdateAmount] = useState('');

  useEffect(() => {
    if (!user?.isAdmin && !user?.isOwner) {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      });
      return;
    }
    fetchUsers();
    fetchStats();
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('username', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: totalUsersData } = await supabase
        .from('profiles')
        .select('count', { count: 'exact' });

      const { data: activeUsersData } = await supabase.rpc('get_active_user_ids');

      const { data: walletsData } = await supabase
        .from('wallets' as any)
        .select('balance');

      let totalCoins = 0;
      if (walletsData) {
        totalCoins = walletsData.reduce((acc: number, wallet: any) => acc + wallet.balance, 0);
      }

      setStats({
        totalUsers: totalUsersData ? totalUsersData[0].count : 0,
        activeUsers: activeUsersData ? activeUsersData.length : 0,
        totalCoins: totalCoins,
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch statistics.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshUsers = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const updateUserRole = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isAdmin })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated successfully.`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBalance = async () => {
    if (!updateUserId || !updateAmount) {
      toast({
        title: "Error",
        description: "Please enter both user ID and amount.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingBalance(true);
    try {
      const amount = parseInt(updateAmount, 10);
      if (isNaN(amount)) {
        throw new Error("Invalid amount. Please enter a number.");
      }

      const { error } = await supabase.rpc('update_user_balance', {
        target_user_id: updateUserId,
        amount_change: amount
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User balance updated successfully.",
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user balance.",
        variant: "destructive",
      });
    } finally {
      setUpdatingBalance(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "User ID copied to clipboard.",
    });
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Render the admin dashboard content
  const renderAdminDashboard = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-spdm-green mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-spdm-dark p-6 rounded-lg border border-spdm-green/20">
          <h2 className="text-xl font-semibold text-spdm-green mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="bg-spdm-gray p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Total Users</div>
              <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
            </div>
            <div className="bg-spdm-gray p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Active Users (24h)</div>
              <div className="text-2xl font-bold">{stats.activeUsers || 0}</div>
            </div>
            <div className="bg-spdm-gray p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Total Coins in Circulation</div>
              <div className="text-2xl font-bold">{stats.totalCoins?.toLocaleString() || 0}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-spdm-dark p-6 rounded-lg border border-spdm-green/20">
          <h2 className="text-xl font-semibold text-spdm-green mb-4">User Management</h2>
          <div className="flex justify-between mb-4">
            <Input 
              placeholder="Search users..." 
              className="max-w-xs bg-spdm-gray border-spdm-green/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleRefreshUsers} variant="outline" className="border-spdm-green/30 text-spdm-green">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">User ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">Loading users...</TableCell>
                  </TableRow>
                ) : currentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">No users found.</TableCell>
                  </TableRow>
                ) : (
                  currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(user.id)} className="mr-2 h-auto w-auto p-1">
                            <Copy className="h-3 w-3" />
                          </Button>
                          {user.id.substring(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={user.is_admin ? "bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30" : "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"}
                          onClick={() => updateUserRole(user.id, user.is_admin)}
                        >
                          {user.is_admin ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                          {user.is_admin ? 'Admin' : 'User'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {/* Add any additional actions here */}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 flex justify-center">
            <div className="join">
              <Button
                className="join-item"
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
              >
                «
              </Button>
              {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => i + 1).map(number => (
                <Button
                  key={number}
                  className={`join-item ${currentPage === number ? 'btn-active' : ''}`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </Button>
              ))}
              <Button
                className="join-item"
                disabled={currentPage === Math.ceil(users.length / usersPerPage)}
                onClick={() => paginate(currentPage + 1)}
              >
                »
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Code Manager Section */}
      <div className="mb-8">
        <PromoCodeManager />
      </div>

      {/* Additional Admin Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-spdm-dark p-6 rounded-lg border border-spdm-green/20">
          <h2 className="text-xl font-semibold text-spdm-green mb-4">Update User Balance</h2>
          <div className="space-y-4">
            <Input
              placeholder="User ID"
              className="bg-spdm-gray border-spdm-green/20"
              value={updateUserId}
              onChange={(e) => setUpdateUserId(e.target.value)}
            />
            <Input
              placeholder="Amount"
              type="number"
              className="bg-spdm-gray border-spdm-green/20"
              value={updateAmount}
              onChange={(e) => setUpdateAmount(e.target.value)}
            />
            <Button onClick={handleUpdateBalance} disabled={updatingBalance}>
              {updatingBalance ? "Updating..." : "Update Balance"}
            </Button>
          </div>
        </div>
        
        <div className="bg-spdm-dark p-6 rounded-lg border border-spdm-green/20">
          <h2 className="text-xl font-semibold text-spdm-green mb-4">Admin Actions</h2>
          <div>
            {/* Add any additional admin actions here */}
            <p className="text-gray-400">More admin actions can be added here.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {user?.isAdmin || user?.isOwner ? (
        renderAdminDashboard()
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-spdm-green">Unauthorized</h1>
            <p className="text-gray-400">You do not have permission to view this page.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
