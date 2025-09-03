

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, School, Users, Bell, Shield, Palette } from 'lucide-react';
import { HelpButton } from '@/components/tutorial/HelpButton';
import { useTutorial } from '@/contexts/TutorialProvider';

const settingsTutorials = [
  {
    id: 'settings-overview',
    title: 'Settings Overview',
    description: 'Learn how to configure your school\'s system settings',
    target: '[data-tutorial="settings-overview"]',
    content: 'This is your admin settings dashboard. Here you can configure school information, user preferences, notifications, and system settings.',
    position: 'bottom' as const,
    tip: 'Use the tabs to navigate between different setting categories'
  },
  {
    id: 'school-settings',
    title: 'School Information',
    description: 'Configure basic school details',
    target: '[data-tutorial="school-settings"]',
    content: 'Update your school\'s basic information including name, address, contact details, and description. This information appears throughout the system.',
    position: 'right' as const,
    tip: 'Keep your school information up to date for accurate communication'
  },
  {
    id: 'notification-settings',
    title: 'Notification Settings',
    description: 'Manage system notifications',
    target: '[data-tutorial="notification-settings"]',
    content: 'Configure how and when the system sends notifications to users. You can enable/disable different types of notifications.',
    position: 'left' as const,
    tip: 'Balance keeping users informed without overwhelming them'
  }
];

export default function AdminSettings() {
  const [schoolSettings, setSchoolSettings] = useState({
    name: 'Maes y Morfa Primary School',
    address: '123 School Lane, Cardiff, CF1 1AA',
    phone: '029 2000 0000',
    email: 'admin@maesymorfa.edu',
    website: 'https://maesymorfa.edu',
    description: 'A welcoming primary school in the heart of Cardiff'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    parentUpdates: true,
    staffUpdates: true,
    systemAlerts: true
  });
  
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    requireApproval: true,
    sessionTimeout: 30
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { startTutorial } = useTutorial();

  const handleSaveSchoolSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Settings saved',
        description: 'School settings have been updated successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Notifications updated',
        description: 'Notification settings have been saved.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification settings.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'System settings updated',
        description: 'System configuration has been saved.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save system settings.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-8 py-16" data-tutorial="settings-overview">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Settings</h1>
          <p className="text-muted-foreground">Configure your school's system settings and preferences</p>
        </div>
        <HelpButton 
          tutorials={settingsTutorials}
          onStartTutorial={() => startTutorial(settingsTutorials)}
        />
      </div>

      <Tabs defaultValue="school" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="school" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            School
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="space-y-6">
          <Card data-tutorial="school-settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>
                Update your school's basic information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">School Name</Label>
                  <Input
                    id="school-name"
                    value={schoolSettings.name}
                    onChange={(e) => setSchoolSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-phone">Phone Number</Label>
                  <Input
                    id="school-phone"
                    value={schoolSettings.phone}
                    onChange={(e) => setSchoolSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="school-address">Address</Label>
                <Input
                  id="school-address"
                  value={schoolSettings.address}
                  onChange={(e) => setSchoolSettings(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-email">Email</Label>
                  <Input
                    id="school-email"
                    type="email"
                    value={schoolSettings.email}
                    onChange={(e) => setSchoolSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-website">Website</Label>
                  <Input
                    id="school-website"
                    value={schoolSettings.website}
                    onChange={(e) => setSchoolSettings(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="school-description">Description</Label>
                <Textarea
                  id="school-description"
                  value={schoolSettings.description}
                  onChange={(e) => setSchoolSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <Button onClick={handleSaveSchoolSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save School Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card data-tutorial="notification-settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how and when the system sends notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Parent Updates</Label>
                    <p className="text-sm text-muted-foreground">Notify parents of important updates</p>
                  </div>
                  <Switch
                    checked={notificationSettings.parentUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, parentUpdates: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Staff Updates</Label>
                    <p className="text-sm text-muted-foreground">Notify staff of system changes</p>
                  </div>
                  <Switch
                    checked={notificationSettings.staffUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, staffUpdates: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Critical system notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))
                    }
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveNotificationSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and security options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => 
                      setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={systemSettings.allowRegistration}
                    onCheckedChange={(checked) => 
                      setSystemSettings(prev => ({ ...prev, allowRegistration: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Approval</Label>
                    <p className="text-sm text-muted-foreground">New registrations require admin approval</p>
                  </div>
                  <Switch
                    checked={systemSettings.requireApproval}
                    onCheckedChange={(checked) => 
                      setSystemSettings(prev => ({ ...prev, requireApproval: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 30 }))}
                    min="5"
                    max="480"
                  />
                  <p className="text-sm text-muted-foreground">How long users stay logged in when inactive</p>
                </div>
              </div>
              
              <Button onClick={handleSaveSystemSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save System Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your admin interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Appearance customization options will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
