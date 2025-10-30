// src/components/dashboard/renter/shared/EmptyState.tsx
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-[#00BFA6] hover:bg-[#00A890]"
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}