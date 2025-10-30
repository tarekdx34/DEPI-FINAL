// src/components/dashboard/renter/profile/ProfileTab.tsx
import { Card } from "../ui/card";
import { ProfileHeader } from "./ProfileHeader";
import { AvatarUpload } from "./AvatarUpload";
import { ProfileForm } from "./ProfileForm";
import { PasswordChange } from "./PasswordChange";
import { useProfile } from "./../../hooks/useProfile";
import { Loader2 } from "lucide-react";
import { UpdateProfileRequest } from "../../../api";

export function ProfileTab() {
  const { profile, loading, updateProfile, uploadAvatar, changePassword } = useProfile();

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#00BFA6] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-600">Failed to load profile</p>
      </Card>
    );
  }

  const getInitials = () => {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  };

  // Wrapper function to match AvatarUpload expected type
  const handleUploadAvatar = async (file: File): Promise<void> => {
    await uploadAvatar(file);
  };

  // Wrapper function to match ProfileForm expected type
  const handleUpdateProfile = async (data: UpdateProfileRequest): Promise<void> => {
    await updateProfile(data);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <ProfileHeader profile={profile} />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#2B2B2B] mb-6">Profile Photo</h3>
        <AvatarUpload
          currentPhoto={profile.profilePhoto}
          initials={getInitials()}
          onUpload={handleUploadAvatar}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#2B2B2B] mb-6">Personal Information</h3>
        <ProfileForm
          profile={profile}
          onSubmit={handleUpdateProfile}
          loading={loading}
        />
      </Card>

      <PasswordChange
        onSubmit={changePassword}
        loading={loading}
      />
    </div>
  );
}