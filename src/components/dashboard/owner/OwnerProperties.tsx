// src/components/dashboard/owner/OwnerProperties.tsx - Normalized with PropertyCard
import { useState } from "react";
import {
  Home,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import api, { PropertyResponse } from "../../../../api";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { PropertyCard } from "../../PropertyCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

interface OwnerPropertiesProps {
  properties: PropertyResponse[];
  onPropertyDeleted: () => void;
  onEditProperty?: (property: PropertyResponse) => void;
}

export function OwnerProperties({
  properties,
  onPropertyDeleted,
  onEditProperty,
}: OwnerPropertiesProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] =
    useState<PropertyResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedPropertyImages, setSelectedPropertyImages] = useState<any[]>(
    []
  );

  const handleDeleteClick = (property: PropertyResponse) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    try {
      setDeleting(true);
      console.log("🗑️ Deleting property:", propertyToDelete.propertyId);

      await api.deleteProperty(propertyToDelete.propertyId);

      toast.success("Property deleted successfully");
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);

      setTimeout(() => {
        onPropertyDeleted();
      }, 500);
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      toast.error(error.message || "Failed to delete property");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (property: PropertyResponse) => {
    if (onEditProperty) {
      onEditProperty(property);
    } else {
      toast.error("Edit functionality not configured");
    }
  };

  const handleViewImages = async (property: PropertyResponse) => {
    try {
      const images = await api.getPropertyImages(property.propertyId);
      setSelectedPropertyImages(images);
      setImageDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load images");
    }
  };

  const handleNavigate = (page: string, id?: string) => {
    if (page === "property-details" && id) {
      window.open(`/property/${id}`, "_blank");
    }
  };

  const getStatusBadge = (property: PropertyResponse) => {
    const status = property.status || property.approvalStatus || "inactive";

    const statusConfig: Record<string, { label: string; className: string }> = {
      active: { label: "Active", className: "bg-green-100 text-green-700" },
      pending_approval: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-700",
      },
      inactive: { label: "Inactive", className: "bg-gray-100 text-gray-700" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPropertyImages = (property: PropertyResponse) => {
    if (property.images && Array.isArray(property.images)) {
      return property.images.map((img: any) =>
        typeof img === "string" ? img : img.imageUrl || img
      );
    }
    if (property.coverImage) return [property.coverImage];
    return [];
  };

  // ✅ Normalize property data for PropertyCard
  const normalizeProperty = (property: PropertyResponse): PropertyResponse => {
    return {
      ...property,
      // Ensure title fields exist
      titleEn: property.titleEn || property.title || "Untitled Property",
      titleAr: property.titleAr || property.title || "عقار بدون عنوان",
      // Ensure other required fields
      averageRating: property.averageRating || 0,
      totalReviews: property.totalReviews || 0,
      pricePerNight: property.pricePerNight || 0,
      // Ensure location fields
      city: property.city || "Unknown",
      governorate: property.governorate || "Unknown",
    };
  };

  if (!properties || !Array.isArray(properties)) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: Invalid properties data</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#2B2B2B]">
            My Properties
          </h2>
        </div>
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center">
            <Home className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No properties yet
            </h3>
            <p className="text-gray-500 mb-6">
              Click "Add Property" to list your first property
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[#2B2B2B]">
          My Properties ({properties.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => {
          const images = getPropertyImages(property);
          const normalizedProperty = normalizeProperty(property);

          return (
            <div key={property.propertyId} className="relative">
              {/* Status Badge Overlay */}
              <div className="absolute top-3 left-3 z-10 flex gap-2">
                {getStatusBadge(property)}
                {images.length > 1 && (
                  <Badge
                    className="bg-black/70 text-white cursor-pointer hover:bg-black"
                    onClick={() => handleViewImages(property)}
                  >
                    <ImageIcon className="w-3 h-3 mr-1" />
                    {images.length}
                  </Badge>
                )}
              </div>

              {/* Actions Dropdown */}
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm hover:bg-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(
                          `/property/${property.propertyId}`,
                          "_blank"
                        )
                      }
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    {images.length > 0 && (
                      <DropdownMenuItem
                        onClick={() => handleViewImages(property)}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        View Images ({images.length})
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleEditClick(property)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(property)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* PropertyCard Component */}
              <PropertyCard
                property={normalizedProperty}
                onNavigate={handleNavigate}
                language="en"
                showFavorite={false}
              />
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {propertyToDelete?.titleEn || propertyToDelete?.titleAr}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Images Gallery Dialog */}
      <AlertDialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Property Images</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {selectedPropertyImages.map((image, index) => (
              <div
                key={image.imageId || index}
                className="relative aspect-video"
              >
                <img
                  src={image.imageUrl}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                {image.isCover && (
                  <Badge className="absolute top-2 left-2 bg-[#00BFA6]">
                    Cover
                  </Badge>
                )}
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
