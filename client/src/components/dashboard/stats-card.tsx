import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  footer?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export default function StatsCard({ 
  title, 
  value, 
  footer,
  className,
  icon
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            {icon && <div className="mr-4 text-secondary-400">{icon}</div>}
            <div>
              <dt className="text-sm font-medium text-secondary-500 truncate">{title}</dt>
              <dd className="mt-1 text-3xl font-semibold text-secondary-900">{value}</dd>
            </div>
          </div>
        </div>
        {footer && (
          <div className="bg-secondary-50 px-4 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
