// src/components/dashboard/OwnerSettings.tsx
import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '../../../hooks/useProfile';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../../../api';

interface OwnerSettingsProps {
  profile: UserProfile | null;
}

export function OwnerSettings({ profile: initialProfile }: OwnerSettingsProps) {
  const { profile, updateProfile, uploadAvatar, changePassword } = useProfile();
  const [activeSection, setActiveSection] = useState<'profile' | 'business' | 'security'>('profile');
  const [uploading, setUploading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState<UpdateProfileRequest>({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    bio: profile?.bio || '',
    governorate: profile?.governorate || '',
    city: profile?.city || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully!');
    } catch (error) {
      // Error is handled by useProfile hook
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await changePassword(passwordForm);
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      // Error is handled by useProfile hook
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setUploading(true);
      await uploadAvatar(file);
    } catch (error) {
      // Error is handled by useProfile hook
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#00BFA6] mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-6">Account Settings</h2>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveSection('profile')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeSection === 'profile'
              ? 'border-[#00BFA6] text-[#00BFA6] font-semibold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveSection('business')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeSection === 'business'
              ? 'border-[#00BFA6] text-[#00BFA6] font-semibold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Business Info
        </button>
        <button
          onClick={() => setActiveSection('security')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeSection === 'security'
              ? 'border-[#00BFA6] text-[#00BFA6] font-semibold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Security
        </button>
      </div>

      {/* Profile Section */}
      {activeSection === 'profile' && (
        <Card className="p-6 max-w-2xl">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                  {profile.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-500">
                      {profile.firstName?.charAt(0)}
                      {profile.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-[#00BFA6] text-white p-2 rounded-full cursor-pointer hover:bg-[#00A890] transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <div>
                <h3 className="font-semibold text-[#2B2B2B]">Profile Photo</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upload a professional photo. Max 5MB.
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#2B2B2B]">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={profile.email} disabled className="bg-gray-50" />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phoneNumber}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Phone number cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                  rows={3}
                  placeholder="Tell guests about yourself..."
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#2B2B2B]">Location</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="governorate">Governorate</Label>
                  <Input
                    id="governorate"
                    value={profileForm.governorate}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, governorate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, city: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              Save Changes
            </Button>
          </form>
        </Card>
      )}

      {/* Business Info Section */}
      {activeSection === 'business' && (
        <Card className="p-6 max-w-2xl">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-[#2B2B2B]">Business Information</h3>
              
              <div>
                <Label htmlFor="businessName">Business/Host Name</Label>
                <Input
                  id="businessName"
                  defaultValue={`${profile.firstName} ${profile.lastName}`}
                  placeholder="Your business name"
                />
              </div>

              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Select defaultValue="individual">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Host</SelectItem>
                    <SelectItem value="company">Property Management Company</SelectItem>
                    <SelectItem value="agency">Real Estate Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="taxId">Tax ID / Business Registration (Optional)</Label>
                <Input id="taxId" placeholder="Enter your tax ID" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-[#2B2B2B]">Contact Preferences</h3>
              
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
                <Input id="whatsapp" placeholder="+20 123 456 7890" />
                <p className="text-xs text-gray-500 mt-1">
                  Guests can contact you via WhatsApp
                </p>
              </div>

              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input id="website" type="url" placeholder="https://yourwebsite.com" />
              </div>
            </div>

            <Button className="w-full md:w-auto">
              Save Business Info
            </Button>
          </div>
        </Card>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <Card className="p-6 max-w-2xl">
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-[#2B2B2B]">Change Password</h3>
              
              <div>
                <Label htmlFor="currentPassword">Current Password *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="newPassword">New Password *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              Change Password
            </Button>
          </form>

          {/* Account Status */}
          <div className="mt-8 pt-8 border-t space-y-4">
            <h3 className="font-semibold text-[#2B2B2B]">Account Status</h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Email Verification</p>
                <p className="text-xs text-gray-600">
                  {profile.emailVerified ? 'Verified ✓' : 'Not verified'}
                </p>
              </div>
              {!profile.emailVerified && (
                <Button variant="outline" size="sm">
                  Verify Email
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Phone Verification</p>
                <p className="text-xs text-gray-600">
                  {profile.phoneVerified ? 'Verified ✓' : 'Not verified'}
                </p>
              </div>
              {!profile.phoneVerified && (
                <Button variant="outline" size="sm">
                  Verify Phone
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">National ID Verification</p>
                <p className="text-xs text-gray-600">
                  {profile.nationalIdVerified ? 'Verified ✓' : 'Not verified'}
                </p>
              </div>
              {!profile.nationalIdVerified && (
                <Button variant="outline" size="sm">
                  Submit ID
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}