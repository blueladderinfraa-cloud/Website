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
import { User, Lock, Save, Loader2, ShieldCheck, KeyRound, Phone, SendHorizonal } from "lucide-react";

export default function AdminSettings() {
  const { data: profile, isLoading } = trpc.adminSettings.getProfile.useQuery();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileInitialized, setProfileInitialized] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpAction, setOtpAction] = useState<"profile" | "password" | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpFallbackCode, setOtpFallbackCode] = useState<string | null>(null);
  const [otpPhone, setOtpPhone] = useState("");
  const [otpSending, setOtpSending] = useState(false);

  if (profile && !profileInitialized) {
    setName(profile.name || "");
    setEmail(profile.email || "");
    setPhone(profile.phone || "");
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
    // Validate before sending OTP
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
    setOtpFallbackCode(null);
    setOtpSent(false);

    try {
      const result = await sendOTP.mutateAsync({ action });
      setOtpPhone(result.phone);
      if (result.sent) {
        setOtpSent(true);
        setOtpFallbackCode(null);
      } else {
        setOtpSent(false);
        setOtpFallbackCode(result.fallbackCode || null);
      }
      setOtpDialogOpen(true);
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
        updateProfile.mutate({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined });
      } else if (otpAction === "password") {
        changePassword.mutate({ currentPassword, newPassword });
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
      setOtpInput("");
    }
  }, [otpInput, otpAction, name, email, phone, currentPassword, newPassword, verifyOTP, updateProfile, changePassword]);

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
                <CardDescription>Update your display name, login username, and phone</CardDescription>
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
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-medium">Phone Number (for OTP)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 7778870070"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">OTP verification codes will be sent to this number</p>
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
                <p>All profile and password changes require a one-time verification code sent to your registered phone number for security.</p>
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
              {otpSent
                ? `A 6-digit OTP has been sent to ${otpPhone}`
                : "Enter the verification code below to confirm your changes."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Show OTP status */}
            {otpSent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <SendHorizonal className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">OTP sent to your phone</p>
                <p className="text-xs text-green-600 mt-1">{otpPhone}</p>
                <p className="text-xs text-muted-foreground mt-2">Code expires in 5 minutes</p>
              </div>
            ) : otpFallbackCode ? (
              <div className="bg-slate-100 rounded-xl p-5 text-center">
                <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Your verification code</p>
                <div className="text-4xl font-mono font-bold tracking-[0.5em] text-primary">
                  {otpFallbackCode}
                </div>
                <p className="text-xs text-amber-600 mt-3">SMS not configured. Set SMS_API_KEY in Railway to enable SMS delivery.</p>
              </div>
            ) : null}

            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="otpInput" className="font-medium">Enter OTP Code</Label>
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
