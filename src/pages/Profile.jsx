import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Lock, Globe, Camera, Edit2, Shield, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import Layout from '@/components/Layout/Layout';
import { useTranslation, languageNames } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

const Profile = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAuthChecking, updateProfile, setLanguage } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  const [mpinData, setMpinData] = useState({
    currentMpin: '',
    newMpin: '',
    confirmMpin: '',
  });

  // Sync user data to form when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.full_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  if (isAuthChecking) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // --- Handlers ---

  const handleProfileUpdate = async () => {
    if (formData.fullName.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    const result = await updateProfile({
      fullName: formData.fullName,
      // Email updates might require backend verification logic usually, 
      // but passing it if store supports it
    });

    if (result.success) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: user.fullName || user.full_name || '',
      email: user.email || '',
    });
    setIsEditing(false);
  };

  const handleMpinChange = async () => {
    if (mpinData.currentMpin !== user.mpin) {
      toast.error('Current MPIN is incorrect');
      return;
    }
    if (!/^\d{4,6}$/.test(mpinData.newMpin)) {
      toast.error('New MPIN must be 4-6 digits');
      return;
    }
    if (mpinData.newMpin !== mpinData.confirmMpin) {
      toast.error('MPINs do not match');
      return;
    }

    await updateProfile({ mpin: mpinData.newMpin });
    setMpinData({ currentMpin: '', newMpin: '', confirmMpin: '' });
    toast.success('MPIN changed successfully');
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    toast.success(`Language changed to ${languageNames[lang]}`);
  };

  // Safe user display name
  const displayName = user.fullName || user.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-5xl">

        {/* Header / Nav */}
        <div className="mb-8 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('profile')}</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Profile Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5"></div>
              <CardContent className="relative pt-0 text-center pb-8">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md mx-auto -mt-12 mb-4">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-xl font-bold mb-1">{displayName}</h2>
                <p className="text-sm text-muted-foreground mb-4">{user.email}</p>

                <div className="flex justify-center gap-2 mb-6">
                  <Badge variant="secondary" className="px-3 py-1 font-normal bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <Shield className="w-3 h-3 mr-1" /> Verified User
                  </Badge>
                </div>

                <div className="text-left text-sm space-y-3 px-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium capitalize">{user.role || 'User'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">{new Date().getFullYear()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Tabs Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
                <TabsTrigger value="personal" className="gap-2">
                  <User className="h-4 w-4" /> <span className="hidden sm:inline">Personal Info</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="h-4 w-4" /> <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="gap-2">
                  <Globe className="h-4 w-4" /> <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: Personal Info */}
              <TabsContent value="personal">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details here.</CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                        <Edit2 className="h-4 w-4" /> Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleCancelEdit} variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                          <X className="h-4 w-4" /> Cancel
                        </Button>
                        <Button onClick={handleProfileUpdate} size="sm" className="gap-2">
                          <Save className="h-4 w-4" /> Save
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/50 border-transparent" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          value={formData.email}
                          disabled
                          className="bg-muted/50"
                        />
                        <p className="text-[10px] text-muted-foreground">Email cannot be changed directly.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                          id="mobile"
                          value={user.mobile || ''}
                          disabled
                          className="bg-muted/50"
                          placeholder="Not set"
                        />
                        <p className="text-[10px] text-muted-foreground">Verified mobile number.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 2: Security (MPIN) */}
              <TabsContent value="security">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your MPIN and password.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 border rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/20 mb-4">
                      <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-500 mb-1 flex items-center gap-2">
                        <Lock className="h-3 w-3" /> MPIN Change
                      </h4>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        Your MPIN is used for quick access to sensitive actions. Keep it secure.
                      </p>
                    </div>

                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label>Current MPIN</Label>
                        <Input
                          type="password"
                          value={mpinData.currentMpin}
                          onChange={(e) => setMpinData(p => ({ ...p, currentMpin: e.target.value }))}
                          maxLength={6}
                          placeholder="Enter current MPIN"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>New MPIN</Label>
                          <Input
                            type="password"
                            value={mpinData.newMpin}
                            onChange={(e) => setMpinData(p => ({ ...p, newMpin: e.target.value }))}
                            maxLength={6}
                            placeholder="New (4-6 digits)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm MPIN</Label>
                          <Input
                            type="password"
                            value={mpinData.confirmMpin}
                            onChange={(e) => setMpinData(p => ({ ...p, confirmMpin: e.target.value }))}
                            maxLength={6}
                            placeholder="Confirm new"
                          />
                        </div>
                      </div>
                      <Button onClick={handleMpinChange} className="w-full mt-2">
                        Update MPIN
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 3: Preferences (Language) */}
              <TabsContent value="preferences">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Language Preferences</CardTitle>
                    <CardDescription>Choose your preferred language for the portal.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.keys(languageNames).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${user.language === lang
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                              : 'border-muted hover:border-primary/30 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${user.language === lang ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                <span className="text-xs font-bold">{lang.toUpperCase()}</span>
                              </div>
                              <span className="font-medium">{languageNames[lang]}</span>
                            </div>
                            {user.language === lang && (
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
