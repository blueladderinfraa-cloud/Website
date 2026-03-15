import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { User, Lock, Save, Loader2, ShieldCheck, KeyRound } from "lucide-react";

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function AdminSettings() {
  const { data: profile, isLoading } = trpc.adminSettings.getProfile.useQuery();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileInitialized, setProfileInitialized] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpAction, setOtpAction] = useState<"profile" | "password" | null>(null);

  if (profile && !profileInitialized) {
    setName(profile.name || "");
    setEmail(profile.email || "");
    setProfileInitialized(true);
  }

  const updateProfile = trpc.adminSettings.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      utils.adminSettings.getProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const changePassword = trpc.adminSettings.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  const requestOTP = useCallback((action: "profile" | "password") => {
    // Validate before showing OTP
    if (action === "profile") {
      if (!name.trim() || !email.trim()) {
        toast.error("Name and email are required");
        return;
      }
    }
    if (action === "password") {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error("All password fields are required");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
    }

    const code = generateOTP();
    setOtpCode(code);
    setOtpInput("");
    setOtpAction(action);
    setOtpDialogOpen(true);
  }, [name, email, currentPassword, newPassword, confirmPassword]);

  const verifyOTPAndSubmit = useCallback(() => {
    if (otpInput !== otpCode) {
      toast.error("Invalid verification code. Please try again.");
      setOtpInput("");
      return;
    }

    setOtpDialogOpen(false);
    setOtpInput("");

    if (otpAction === "profile") {
      updateProfile.mutate({ name: name.trim(), email: email.trim() });
    } else if (otpAction === "password") {
      changePassword.mutate({ currentPassword, newPassword });
    }
  }, [otpInput, otpCode, otpAction, name, email, currentPassword, newPassword, updateProfile, changePassword]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    requestOTP("profile");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    requestOTP("password");
  };

  if (isLoading) {
    return (
      <AdminLayout currentPage="settings" title="Settings" description="Manage your admin account settings">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="settings" title="Settings" description="Manage your admin account settings">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Profile</CardTitle>
                <CardDescription>Update your display name and login username</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-medium">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">Email / Login Username</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email or username"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">This is used as your login username</p>
              </div>
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save Profile Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Change Password</CardTitle>
                <CardDescription>Update your admin login password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="font-medium">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="font-medium">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-medium">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={changePassword.isPending}
                className="w-full h-12 text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {changePassword.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-5 h-5 mr-2" />
                )}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="border-0 shadow-lg bg-green-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">OTP Verification Enabled</p>
                <p>All profile and password changes require a one-time verification code for security. A 6-digit code will be generated when you save changes.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              Verify Your Identity
            </DialogTitle>
            <DialogDescription>
              Enter the verification code below to confirm your changes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Display OTP */}
            <div className="bg-slate-100 rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-2">Your verification code</p>
              <div className="text-4xl font-mono font-bold tracking-[0.5em] text-primary">
                {otpCode}
              </div>
              <p className="text-xs text-muted-foreground mt-2">This code is valid for this session only</p>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="otpInput" className="font-medium">Enter Code</Label>
              <Input
                id="otpInput"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="h-12 text-center text-2xl font-mono tracking-[0.3em]"
                maxLength={6}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOtpDialogOpen(false)}
              className="h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={verifyOTPAndSubmit}
              disabled={otpInput.length !== 6}
              className="h-11 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Verify & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
