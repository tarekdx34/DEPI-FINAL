import { LucideIcon } from "lucide-react";
import { Card } from "../../../ui/card";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-[#2B2B2B]">{value}</p>
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </Card>
  );
}