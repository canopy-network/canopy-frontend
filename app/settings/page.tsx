"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { User, Bell, Palette, Save, Upload, Camera } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function SettingsContent() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    trading: true,
    security: true,
  });

  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "en",
    currency: "usd",
  });

  const [profile, setProfile] = useState({
    username: "canopy_user",
    bio: "Blockchain enthusiast and DeFi trader",
    profileImage: "https://picsum.photos/seed/user1/400/400",
    bannerImage: "https://picsum.photos/seed/banner2/1400/400",
  });

  const [socialLinks, setSocialLinks] = useState({
    website: "",
    twitter: "",
    github: "",
    telegram: "",
  });

  const [backupEmail, setBackupEmail] = useState("");

  const [activeSection, setActiveSection] = useState("public-profile");

  const navigationItems = [
    { id: "public-profile", label: "Public profile", icon: User },
    { id: "account", label: "Account", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen px-4">
      {/* Top Header */}
      <div className="border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="container py-8 mx-auto">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors",
                      activeSection === item.id
                        ? "bg-gray-800 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-gray-800/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 max-w-4xl">
            {activeSection === "public-profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Public profile</h2>
                  <p className="text-muted-foreground">
                    Manage your public profile information
                  </p>
                </div>

                {/* Profile Picture */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>
                      Upload a profile picture to personalize your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-500">
                          <img
                            src={profile.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline" className="gap-2">
                          <Upload className="h-4 w-4" />
                          Upload New Picture
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or GIF. Max size 2MB.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Banner Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Banner Image</CardTitle>
                    <CardDescription>
                      Customize your profile with a banner image
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500">
                        <img
                          src={profile.bannerImage}
                          alt="Banner"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute bottom-4 right-4 gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Change Banner
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 1400x400px. JPG, PNG or GIF. Max size
                        5MB.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Your public profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter username"
                        value={profile.username}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Your username may appear around Canopy where you
                        contribute or are mentioned.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us a little bit about yourself"
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        rows={4}
                        className="resize-none border-gray-700 focus-visible:border-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        Brief description for your profile.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Networks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Social Networks</CardTitle>
                    <CardDescription>
                      Connect your social media accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={socialLinks.website}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        placeholder="@username"
                        value={socialLinks.twitter}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({
                            ...prev,
                            twitter: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub</Label>
                      <Input
                        id="github"
                        placeholder="username"
                        value={socialLinks.github}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({
                            ...prev,
                            github: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram</Label>
                      <Input
                        id="telegram"
                        placeholder="@username"
                        value={socialLinks.telegram}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({
                            ...prev,
                            telegram: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button size="lg" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Public Profile
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "account" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Account</h2>
                  <p className="text-muted-foreground">
                    Manage your account information
                  </p>
                </div>

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                    <CardDescription>
                      Manage your account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue="user@canopy.com"
                        disabled
                        className="opacity-60 cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your primary email address cannot be changed.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup-email">Backup Email</Label>
                      <Input
                        id="backup-email"
                        type="email"
                        placeholder="Enter backup email"
                        value={backupEmail}
                        onChange={(e) => setBackupEmail(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Used for account recovery and additional notifications.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button size="lg" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Account Settings
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Notifications</h2>
                  <p className="text-muted-foreground">
                    Configure how you receive updates and alerts
                  </p>
                </div>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </CardTitle>
                    <CardDescription>
                      Configure how you receive updates and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates via email
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={notifications.email}
                        onCheckedChange={(checked) =>
                          setNotifications((prev) => ({
                            ...prev,
                            email: checked,
                          }))
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Browser push notifications
                        </p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={notifications.push}
                        onCheckedChange={(checked) =>
                          setNotifications((prev) => ({
                            ...prev,
                            push: checked,
                          }))
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="trading-alerts">Trading Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Price movements and trade confirmations
                        </p>
                      </div>
                      <Switch
                        id="trading-alerts"
                        checked={notifications.trading}
                        onCheckedChange={(checked) =>
                          setNotifications((prev) => ({
                            ...prev,
                            trading: checked,
                          }))
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="security-alerts">Security Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Login attempts and security events
                        </p>
                      </div>
                      <Switch
                        id="security-alerts"
                        checked={notifications.security}
                        onCheckedChange={(checked) =>
                          setNotifications((prev) => ({
                            ...prev,
                            security: checked,
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button size="lg" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Notification Settings
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Appearance</h2>
                  <p className="text-muted-foreground">
                    Customize the look and feel of your interface
                  </p>
                </div>

                {/* Appearance Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Appearance
                    </CardTitle>
                    <CardDescription>
                      Customize the look and feel of your interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select
                          value={preferences.theme}
                          onValueChange={(value) =>
                            setPreferences((prev) => ({
                              ...prev,
                              theme: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={preferences.language}
                          onValueChange={(value) =>
                            setPreferences((prev) => ({
                              ...prev,
                              language: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Display Currency</Label>
                      <Select
                        value={preferences.currency}
                        onValueChange={(value) =>
                          setPreferences((prev) => ({
                            ...prev,
                            currency: value,
                          }))
                        }
                      >
                        <SelectTrigger className="md:w-1/2">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                          <SelectItem value="btc">BTC (₿)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button size="lg" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Appearance Settings
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}
4;
