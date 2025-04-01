import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job } from "@shared/schema";
import { Link } from "wouter";
import {
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  ChevronRight,
  Snowflake,
  Package,
  Box,
  Ruler,
} from "lucide-react";

interface JobCardProps {
  job: Job;
  onApply?: () => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  const {
    id,
    title,
    companyName,
    originCity,
    originState,
    destinationCity,
    destinationState,
    distance,
    price,
    cargoType,
    loadType,
    pickupDate,
    weight,
  } = job;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(pickupDate));

  // Determine the icon based on cargo/load type
  const getIcon = () => {
    if (loadType.toLowerCase().includes("refrigerated") || cargoType.toLowerCase().includes("refrigerated")) {
      return <Snowflake className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />;
    } else if (loadType.toLowerCase().includes("flatbed")) {
      return <Ruler className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />;
    } else if (loadType.toLowerCase().includes("partial")) {
      return <Package className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />;
    } else {
      return <Box className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />;
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply();
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-secondary-900">{title}</h3>
                <p className="text-sm text-secondary-500">{companyName}</p>
              </div>
            </div>
            <div className="hidden md:block">
              <Badge className="bg-primary-100 text-primary-700">
                ${price.toLocaleString()}
              </Badge>
            </div>
          </div>
          <div className="mt-4 sm:flex sm:justify-between">
            <div className="sm:flex">
              <div className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0">
                <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />
                <p>
                  {originCity}, {originState} to {destinationCity},{" "}
                  {destinationState}
                </p>
              </div>
              <div className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0 sm:ml-6">
                {distance && (
                  <>
                    <Truck className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />
                    <p>~{distance} miles</p>
                  </>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0">
              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />
              <p>Pickup: {formattedDate}</p>
            </div>
          </div>
          <div className="mt-2 md:flex md:justify-between">
            <div className="flex items-center text-sm text-secondary-500">
              {getIcon()}
              <p>
                {loadType} - {weight ? `${weight.toLocaleString()} lbs` : ""}
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex items-center text-sm text-secondary-500 md:hidden">
              <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />
              <p>${price.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-secondary-50 px-4 py-3 sm:px-6 flex justify-end border-t border-secondary-200">
          {onApply ? (
            <Button onClick={handleApply}>Apply</Button>
          ) : (
            <Button asChild>
              <Link href={`/jobs/${id}`}>
                <a className="flex items-center">
                  View Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
