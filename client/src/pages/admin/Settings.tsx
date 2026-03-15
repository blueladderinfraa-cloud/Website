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
import { User, Lock, Save, Loader2, ShieldCheck, KeyRound, Smartphone } from "lucide-react";

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
  const [otpInput, setOtpInput] = useState("");
  const [otpAction, setOtpAction] = useState<"profile" | "password" | null>(null);
  const [otpPhone, setOtpPhone] = useState("");
  const [otpSending, setOtpSending] = useState(false);

  if (profile && !profileInitialized) {
    setName(profile.name || "");
    setEmail(profile.email || "");
    setProfileInitialized(true);
  }

  const sendOTP = trpc.adminSettings.sendOTP.useMutation();
  const verifyOTP = trpc.adminSettings.verifyOTP.useMutation();

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

  const requestOTP = useCallback(async (action: "profile" | "password") => {
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

    setOtpAction(action);
    setOtpInput("");
    setOtpSending(true);

    try {
      const result = await sendOTP.mutateAsync({ action });
      setOtpPhone(result.phone);
      if (result.sent) {
        setOtpDialogOpen(true);
      } else {
        toast.error("Failed to send OTP. Please check your phone number configuration.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  }, [name, email, currentPassword, newPassword, confirmPassword, sendOTP]);

  const handleVerifyAndSubmit = useCallback(async () => {
    try {
      await verifyOTP.mutateAsync({ code: otpInput });
      setOtpDialogOpen(false);
      setOtpInput("");

      if (otpAction === "profile") {
        updateProfile.mutate({ name: name.trim(), email: email.trim() });
      } else if (otpAction === "password") {
        changePassword.mutate({ currentPassword, newPassword });
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP code");
      setOtpInput("");
    }
  }, [otpInput, otpAction, name, email, currentPassword, newPassword, verifyOTP, updateProfile, changePassword]);

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
                disabled={updateProfile.isPending || otpSending}
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {(updateProfile.isPending || otpSending) ? (
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
                disabled={changePassword.isPending || otpSending}
                className="w-full h-12 text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {(changePassword.isPending || otpSending) ? (
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
                <p>All changes require a one-time verification code sent to your registered mobile number.</p>
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
              OTP Verification
            </DialogTitle>
            <DialogDescription>
              A 6-digit OTP has been sent to your registered mobile number.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <Smartphone className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-green-800">OTP Sent Successfully</p>
              <p className="text-sm text-green-600 mt-1">Sent to {otpPhone}</p>
              <p className="text-xs text-muted-foreground mt-2">Code expires in 5 minutes</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otpInput" className="font-medium">Enter OTP</Label>
              <Input
                id="otpInput"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="_ _ _ _ _ _"
                className="h-14 text-center text-3xl font-mono tracking-[0.5em] border-2"
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
              onClick={handleVerifyAndSubmit}
              disabled={otpInput.length !== 6 || verifyOTP.isPending}
              className="h-11 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {verifyOTP.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              Verify & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
