// src/components/dashboard/admin/users/UsersTable.tsx
import { Card } from "../../../ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { UserRow } from "./UserRow";
import type { UserProfile } from "../../../../api";

interface UsersTableProps {
  users: UserProfile[];
  searchQuery: string;
  formatDate: (date: string) => string;
  getStatusColor: (status: string | boolean) => string;
  onBan: (userId: number, userName: string) => void;
  onUnban: (userId: number, userName: string) => void;
}

export function UsersTable({
  users,
  searchQuery,
  formatDate,
  getStatusColor,
  onBan,
  onUnban,
}: UsersTableProps) {
  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <UserRow
              key={user.userId}
              user={user}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              onBan={onBan}
              onUnban={onUnban}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
