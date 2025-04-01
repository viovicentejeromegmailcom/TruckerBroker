import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface ShipmentCardProps {
  id: number;
  shipmentNumber: string;
  route: string;
  status: "in-transit" | "delivered" | "pending";
  companyName: string;
  eta: Date;
  deliveredDate?: Date;
  onTrackClick?: () => void;
}

export default function ShipmentCard({
  id,
  shipmentNumber,
  route,
  status,
  companyName,
  eta,
  deliveredDate,
  onTrackClick
}: ShipmentCardProps) {
  const statusColor = {
    "in-transit": "bg-blue-100 text-blue-800",
    "delivered": "bg-green-100 text-green-800",
    "pending": "bg-yellow-100 text-yellow-800"
  };
  
  const statusText = {
    "in-transit": "In Transit",
    "delivered": "Delivered",
    "pending": "Pending"
  };
  
  const dateText = status === "delivered" && deliveredDate 
    ? `Delivered: ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(deliveredDate))}`
    : `ETA: ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(eta))}`;
  
  const buttonText = status === "delivered" ? "View Details" : "Track";

  const handleTrackClick = () => {
    if (onTrackClick) {
      onTrackClick();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary-500 truncate">
              {shipmentNumber} - {route}
            </p>
            <div className="ml-2 flex-shrink-0 flex">
              <Badge className={statusColor[status]}>
                {statusText[status]}
              </Badge>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <div className="flex items-center text-sm text-secondary-500">
                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />
                <p>{companyName}</p>
              </div>
              <div className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0 sm:ml-6">
                <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />
                <p>{dateText}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-secondary-50 px-4 py-3 text-right sm:px-6 border-t border-secondary-200">
          <Button 
            variant={status === "delivered" ? "outline" : "default"}
            size="sm"
            className="space-x-1"
            asChild={!onTrackClick}
            onClick={onTrackClick ? handleTrackClick : undefined}
          >
            {onTrackClick ? (
              <>
                <span>{buttonText}</span>
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <Link href={`/shipments/${id}`}>
                <a className="flex items-center">
                  <span>{buttonText}</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
