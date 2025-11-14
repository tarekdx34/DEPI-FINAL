// src/components/dashboard/admin/users/UsersTab.tsx
import { useState } from "react";
import { SearchBar } from "../shared/SearchBar";
import { UsersTable } from "./UsersTable";
import type { UserProfile } from "../../../../api";

interface UsersTabProps {
  users: UserProfile[];
  formatDate: (date: string) => string;
  getStatusColor: (status: string | boolean) => string;
  onBan: (userId: number, userName: string) => void;
  onUnban: (userId: number, userName: string) => void;
}

export function UsersTab({
  users,
  formatDate,
  getStatusColor,
  onBan,
  onUnban,
}: UsersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#2B2B2B]">
          Manage Users ({users.length})
        </h2>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users..."
        />
      </div>

      <UsersTable
        users={users}
        searchQuery={searchQuery}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        onBan={onBan}
        onUnban={onUnban}
      />
    </div>
  );
}
