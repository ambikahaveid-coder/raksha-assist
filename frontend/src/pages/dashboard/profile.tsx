import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Lock, Phone, Mail, ShieldAlert, Camera, Info, Loader2, Save, Key, Calendar, RefreshCw, Edit, Eye, EyeOff, CheckCircle } from "lucide-react";
import { FaceCapture } from "@/components/FaceCapture";
import { AadharUpload } from "@/components/forms/AadharUpload";
import { useAuth } from "@/hooks/use-auth";
import { fetchWithCsrf } from "@/lib/csrf";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, membership, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [nameEditOpen, setNameEditOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [bloodGroup, setBloodGroup] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfilePhoto(user.photoUrl || null);
      setBloodGroup(user.bloodGroup || "");
      setEmail(user.email || "");
      setName(user.name || "");
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { profilePhoto?: string; bloodGroup?: string; email?: string; name?: string }) => {
      const res = await fetchWithCsrf("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update profile");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast({ title: "Profile updated successfully" });
      setNameEditOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Failed to update profile", variant: "destructive" });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await fetchWithCsrf("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to change password");
      }
      return result;
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Failed to change password", variant: "destructive" });
    }
  });

  const handlePhotoCapture = async (imageData: string) => {
    setProfilePhoto(imageData);
    setPhotoDialogOpen(false);
    await updateProfileMutation.mutateAsync({ profilePhoto: imageData });
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ bloodGroup, email });
  };

  const handleSaveName = () => {
    updateProfileMutation.mutate({ name });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const getDaysUntilExpiry = () => {
    if (!membership?.expiryDate) return null;
    const expiry = new Date(membership.expiryDate);
    const today = new Date();
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysUntilExpiry();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AuthNavbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-muted-foreground mb-8">Manage your personal information and account security.</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={profilePhoto || ""} />
                      <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                        {getInitials(user?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
                      <DialogTrigger asChild>
                        <button 
                          className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-slate-100 transition-colors"
                          data-testid="button-change-photo"
                        >
                          <Camera className="h-4 w-4 text-slate-600" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Update Profile Photo</DialogTitle>
                        </DialogHeader>
                        <FaceCapture 
                          onCapture={handlePhotoCapture} 
                          currentImage={profilePhoto}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900" data-testid="profile-name">
                    {user?.name || "Member"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4" data-testid="profile-member-id">
                    Member ID: {membership?.membershipNumber || "Pending"}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={membership ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}
                    data-testid="profile-status"
                  >
                    {membership ? "Active Member" : "Pending Activation"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-100 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-1">Photo Guidelines</p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Use the camera button to take a clear photo. On mobile, position your face in the circle and it will auto-capture when aligned.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Membership Renewal Card */}
              {membership && (
                <Card className={`border-none shadow-sm ${daysRemaining && daysRemaining <= 30 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className={`h-5 w-5 ${daysRemaining && daysRemaining <= 30 ? 'text-amber-600' : 'text-green-600'}`} />
                      <p className="font-bold text-slate-900">Membership Status</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium">{membership.planType || 'Standard'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valid Until:</span>
                        <span className="font-medium">
                          {membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      {daysRemaining !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Days Remaining:</span>
                          <Badge variant={daysRemaining <= 30 ? "destructive" : "secondary"}>
                            {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    {daysRemaining !== null && daysRemaining <= 60 && (
                      <div className="mt-4 space-y-2">
                        <Link href="/plans">
                          <Button className="w-full" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {daysRemaining <= 0 ? 'Renew Now - View Plans' : 'Renew Early - View Plans'}
                          </Button>
                        </Link>
                        <p className="text-xs text-center text-muted-foreground">
                          Choose from our available membership plans
                        </p>
                      </div>
                    )}
                    {(daysRemaining === null || daysRemaining > 60) && membership && (
                      <div className="mt-4">
                        <Link href="/plans">
                          <Button variant="outline" className="w-full" size="sm">
                            View All Plans
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Account Security */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Key className="h-5 w-5 text-slate-600" />
                    <p className="font-bold text-slate-900">Account Security</p>
                  </div>
                  <div className="space-y-2">
                    <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>Enter your current password and a new password.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Current Password</Label>
                            <div className="relative">
                              <Input 
                                type={showCurrentPassword ? "text" : "password"} 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                              >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>New Password</Label>
                            <div className="relative">
                              <Input 
                                type={showNewPassword ? "text" : "password"} 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min 6 chars)"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                              >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <Input 
                              type="password" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
                          <Button 
                            onClick={handleChangePassword}
                            disabled={changePasswordMutation.isPending}
                          >
                            {changePasswordMutation.isPending ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                              'Change Password'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Link href="/forgot-password">
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Forgot Password?
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Your primary identification details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Full Name 
                        <Dialog open={nameEditOpen} onOpenChange={setNameEditOpen}>
                          <DialogTrigger asChild>
                            <button className="text-primary hover:text-primary/80">
                              <Edit className="h-3 w-3" />
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Name</DialogTitle>
                              <DialogDescription>Update your display name</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input 
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  placeholder="Enter your full name"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setNameEditOpen(false)}>Cancel</Button>
                              <Button 
                                onClick={handleSaveName}
                                disabled={updateProfileMutation.isPending}
                              >
                                {updateProfileMutation.isPending ? (
                                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                ) : (
                                  'Save Name'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </Label>
                      <Input 
                        value={user?.name || ""} 
                        disabled 
                        className="bg-slate-50" 
                        data-testid="input-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Aadhar Number 
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </Label>
                      <Input 
                        value={user?.aadharNumber ? `XXXX XXXX ${user.aadharNumber.slice(-4)}` : "Not provided"} 
                        disabled 
                        className="bg-slate-50" 
                        data-testid="input-aadhar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Date of Birth
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </Label>
                      <Input 
                        value={user?.dateOfBirth || "Not provided"} 
                        disabled 
                        className="bg-slate-50" 
                        data-testid="input-dob"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Group</Label>
                      <Input 
                        value={bloodGroup} 
                        onChange={(e) => setBloodGroup(e.target.value)}
                        placeholder="e.g., O+, A-, B+"
                        data-testid="input-blood-group"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Phone className="h-3 w-3" /> Mobile Number
                        </Label>
                        <Input 
                          value={user?.mobile || ""} 
                          disabled 
                          className="bg-slate-50" 
                          data-testid="input-mobile"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Mail className="h-3 w-3" /> Email Address
                        </Label>
                        <Input 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          data-testid="input-email"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      {updateProfileMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <AadharUpload 
                aadharNumber={user?.aadhar || ""}
                aadharFrontUrl={user?.aadharFrontUrl || ""}
                aadharBackUrl={user?.aadharBackUrl || ""}
                aadharVerified={user?.aadharVerified || false}
                onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ["auth"] })}
              />

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Family Members</CardTitle>
                  <CardDescription>
                    Members covered under your family floater plan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {membership?.familyMembers && membership.familyMembers.length > 0 ? (
                      membership.familyMembers.map((member: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg" data-testid={`family-member-${i}`}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{member.name?.[0] || "M"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-sm text-slate-900">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.relation}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-white text-slate-500 hover:bg-white border">
                            Covered
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No family members added yet</p>
                    )}
                    
                    <Button variant="outline" className="w-full border-dashed text-muted-foreground" disabled>
                      <Lock className="mr-2 h-3 w-3" /> Contact Support to Add Member
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
