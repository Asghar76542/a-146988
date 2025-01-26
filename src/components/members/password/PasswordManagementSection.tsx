import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BatteryFull, BatteryMedium, BatteryLow, BatteryWarning,
  Lock, LockKeyhole, Key, RefreshCw, Shield 
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AdminPasswordResetDialog from '@/components/auth/AdminPasswordResetDialog';
import MagicLinkButton from '@/components/auth/password/MagicLinkButton';

interface PasswordManagementSectionProps {
  memberId: string;
  memberNumber: string;
  memberName: string;
  passwordSetAt: Date | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  passwordResetRequired: boolean;
}

const PasswordManagementSection = ({
  memberId,
  memberNumber,
  memberName,
  passwordSetAt,
  failedLoginAttempts,
  lockedUntil,
  passwordResetRequired,
}: PasswordManagementSectionProps) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  // Calculate password age and security indicators
  const passwordAgeInDays = passwordSetAt 
    ? Math.floor((Date.now() - passwordSetAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const passwordAgeStatus = passwordAgeInDays > 90 ? 'warning' : 'success';

  // Battery icon based on failed attempts
  const BatteryIcon = () => {
    if (failedLoginAttempts === 0) return <BatteryFull className="w-4 h-4 text-green-500" />;
    if (failedLoginAttempts <= 2) return <BatteryMedium className="w-4 h-4 text-yellow-500" />;
    if (failedLoginAttempts <= 4) return <BatteryLow className="w-4 h-4 text-orange-500" />;
    return <BatteryWarning className="w-4 h-4 text-red-500" />;
  };

  // Lock countdown timer
  useEffect(() => {
    if (!lockedUntil) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = lockedUntil.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(timer);
  }, [lockedUntil]);

  const handleUnlockAccount = async () => {
    try {
      console.log('Unlocking account for member:', {
        memberNumber,
        memberName,
        timestamp: new Date().toISOString()
      });

      setIsUnlocking(true);
      const { error } = await supabase.rpc('reset_failed_login', {
        member_number: memberNumber
      });

      if (error) {
        console.error('Error unlocking account:', {
          error,
          memberNumber,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      toast.success("Account has been unlocked", {
        description: `Successfully unlocked account for ${memberName}`
      });

    } catch (error: any) {
      console.error('Failed to unlock account:', {
        error,
        memberNumber,
        timestamp: new Date().toISOString()
      });
      
      toast.error("Failed to unlock account", {
        description: error.message
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      {/* Status Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-dashboard-accent1">Password Status</h4>
          <div className="flex items-center gap-2">
            {/* Password Set Status */}
            <Badge variant="outline" className={`bg-${passwordAgeStatus === 'warning' ? 'yellow' : 'green'}-500/10 text-${passwordAgeStatus === 'warning' ? 'yellow' : 'green'}-500`}>
              <LockKeyhole className="w-3 h-3 mr-1" />
              {passwordSetAt ? `Set ${formatDistanceToNow(passwordSetAt)} ago` : 'No Password'}
            </Badge>
            
            {/* Lock Status */}
            {lockedUntil && new Date(lockedUntil) > new Date() && (
              <Badge variant="outline" className="bg-red-500/10 text-red-500">
                <Lock className="w-3 h-3 mr-1" />
                {timeRemaining ? `Locked for ${timeRemaining}` : 'Locked'}
              </Badge>
            )}
            
            {/* Reset Required Status */}
            {passwordResetRequired && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                <RefreshCw className="w-3 h-3 mr-1" />
                Reset Required
              </Badge>
            )}
          </div>
        </div>

        {/* Security Health */}
        <div className="flex items-center gap-2">
          <BatteryIcon />
          <span className="text-sm text-dashboard-muted">
            Failed attempts: {failedLoginAttempts}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {lockedUntil && new Date(lockedUntil) > new Date() && (
          <Button 
            variant="outline"
            size="sm"
            onClick={handleUnlockAccount}
            disabled={isUnlocking}
            className="bg-dashboard-card hover:bg-dashboard-cardHover"
          >
            <Lock className="w-4 h-4 mr-2" />
            {isUnlocking ? 'Unlocking...' : 'Unlock'}
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowResetDialog(true)}
          className="bg-dashboard-card hover:bg-dashboard-cardHover"
        >
          <Key className="w-4 h-4 mr-2" />
          Reset Password
        </Button>
      </div>

      {/* Magic Link Button */}
      <MagicLinkButton 
        memberNumber={memberNumber}
        memberName={memberName}
      />

      {/* Reset Dialog */}
      <AdminPasswordResetDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        memberNumber={memberNumber}
        memberName={memberName}
      />
    </div>
  );
};

export default PasswordManagementSection;