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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Zap,
  Save,
  Upload,
  Camera,
} from "lucide-react";
import { useState } from "react";

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
    autoConnect: false,
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Settings</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Customize your Canopy experience and manage your account preferences.
        </p>
      </div>

      <Tabs defaultValue="public-profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="public-profile">Public Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Public Profile Tab */}
        <TabsContent value="public-profile" className="space-y-6">
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
                  Recommended size: 1400x400px. JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your public profile information</CardDescription>
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
                  Your username may appear around Canopy where you contribute or
                  are mentioned.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a little bit about yourself"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, bio: e.target.value }))
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
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  defaultValue="user@canopy.com"
                />
                <p className="text-xs text-muted-foreground">
                  Your email address is used for account notifications and
                  recovery.
                </p>
              </div>
            </CardContent>
          </Card>

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
                    setNotifications((prev) => ({ ...prev, email: checked }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Browser push notifications
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, push: checked }))
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
                    setNotifications((prev) => ({ ...prev, trading: checked }))
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
                    setNotifications((prev) => ({ ...prev, security: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

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
                      setPreferences((prev) => ({ ...prev, theme: value }))
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
                      setPreferences((prev) => ({ ...prev, language: value }))
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
                    setPreferences((prev) => ({ ...prev, currency: value }))
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

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-connect">Auto-connect Wallet</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically connect your wallet on page load
                  </p>
                </div>
                <Switch
                  id="auto-connect"
                  checked={preferences.autoConnect}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      autoConnect: checked,
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                >
                  <Shield className="h-4 w-4" />
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                >
                  <Zap className="h-4 w-4" />
                  Enable Two-Factor Authentication
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                >
                  <Database className="h-4 w-4" />
                  Export Account Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Advanced
              </CardTitle>
              <CardDescription>
                Advanced configuration options for power users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rpc-endpoint">Custom RPC Endpoint</Label>
                <Input
                  id="rpc-endpoint"
                  placeholder="https://mainnet.infura.io/v3/..."
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use default endpoints
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gas-price">Default Gas Price (Gwei)</Label>
                <Input
                  id="gas-price"
                  type="number"
                  placeholder="20"
                  defaultValue="20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slippage">Default Slippage Tolerance (%)</Label>
                <Input
                  id="slippage"
                  type="number"
                  placeholder="0.5"
                  defaultValue="0.5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save All Settings */}
          <div className="flex justify-end">
            <Button size="lg" className="gap-2">
              <Save className="h-4 w-4" />
              Save Account Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}
