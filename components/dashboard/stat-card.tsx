"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  isLoading?: boolean;
  trend?: string;
}

export function StatCard({ title, value, icon: Icon, isLoading, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Spinner size="sm" className="text-primary" />
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{value}</span>
            {trend ? (
              <span className="text-xs text-emerald-600">{trend}</span>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}