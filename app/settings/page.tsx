"use client";

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
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Zap,
  Save,
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Settings</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Customize your Canopy experience and manage your account preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Manage your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  defaultValue="canopy_user"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  defaultValue="user@canopy.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                placeholder="Tell us about yourself"
                defaultValue="Blockchain enthusiast and DeFi trader"
              />
            </div>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
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
                <Label htmlFor="email-notifications">Email Notifications</Label>
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
                  setPreferences((prev) => ({ ...prev, autoConnect: checked }))
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
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}
