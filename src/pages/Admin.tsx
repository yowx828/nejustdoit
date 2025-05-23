import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import PromoCodeManager from '@/components/Admin/PromoCodeManager';

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [fakeUserCount, setFakeUserCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, is_owner')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin && !profile?.is_owner) {
      navigate('/');
      return;
    }

    setIsAdmin(profile.is_admin || false);
    setIsOwner(profile.is_owner || false);
  };

  const handleEmergencyMessage = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('emergency_messages')
        .insert({
          message: emergencyMessage,
          target_user_id: targetUserId || null,
        });

      if (error) throw error;

      toast.success('Emergency message created successfully');
      setEmergencyMessage('');
      setTargetUserId('');
    } catch (error) {
      toast.error('Failed to create emergency message');
      console.error('Error creating emergency message:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeEmergencyMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_messages')
        .update({ is_active: false })
        .eq('id', messageId);

      if (error) throw error;
      toast.success('Emergency message removed successfully');
    } catch (error) {
      toast.error('Failed to remove emergency message');
      console.error('Error removing emergency message:', error);
    }
  };

  const updateFakeUserCount = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('fake_users_config')
        .update({ fake_count: fakeUserCount })
        .eq('id', 1);

      if (error) throw error;
      toast.success('Fake user count updated successfully');
    } catch (error) {
      toast.error('Failed to update fake user count');
      console.error('Error updating fake user count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      
      {/* Emergency Message Section */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Emergency Message</h2>
        <div className="space-y-4">
          <Input
            placeholder="Emergency Message"
            value={emergencyMessage}
            onChange={(e) => setEmergencyMessage(e.target.value)}
          />
          <Input
            placeholder="Target User ID (optional)"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          />
          <Button 
            onClick={handleEmergencyMessage}
            disabled={loading || !emergencyMessage}
          >
            Create Emergency Message
          </Button>
        </div>
      </Card>

      {/* Promo Code Manager */}
      <PromoCodeManager />

      {/* Owner Panel */}
      {isOwner && (
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Owner Panel</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Fake User Count
              </label>
              <Input
                type="number"
                min="0"
                value={fakeUserCount}
                onChange={(e) => setFakeUserCount(parseInt(e.target.value) || 0)}
              />
            </div>
            <Button 
              onClick={updateFakeUserCount}
              disabled={loading}
            >
              Update Fake User Count
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Admin;