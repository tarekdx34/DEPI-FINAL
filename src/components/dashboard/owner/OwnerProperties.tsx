// src/components/dashboard/owner/OwnerProperties.tsx - FIXED WITH EDIT
import { useState } from 'react';
import { Home, MapPin, Bed, Users, Edit, Trash2, Eye, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../api';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';

interface OwnerPropertiesProps {
  properties: any[];
  onPropertyDeleted: () => void;
  onEditProperty?: (property: any) => void; // ✅ NEW: Added edit callback
}

export function OwnerProperties({ properties, onPropertyDeleted, onEditProperty }: OwnerPropertiesProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedPropertyImages, setSelectedPropertyImages] = useState<any[]>([]);

  const handleDeleteClick = (property: any) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    try {
      setDeleting(true);
      console.log('🗑️ Deleting property:', propertyToDelete.propertyId);
      
      await api.deleteProperty(propertyToDelete.propertyId);
      
      toast.success('Property deleted successfully');
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      
      setTimeout(() => {
        onPropertyDeleted();
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      toast.error(error.message || 'Failed to delete property');
    } finally {
      setDeleting(false);
    }
  };

  // ✅ NEW: Edit handler
  const handleEditClick = (property: any) => {
    if (onEditProperty) {
      onEditProperty(property);
    } else {
      toast.error('Edit functionality not configured');
    }
  };

  const handleViewImages = async (property: any) => {
    try {
      const images = await api.getPropertyImages(property.propertyId);
      setSelectedPropertyImages(images);
      setImageDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load images');
    }
  };

  const getStatusBadge = (property: any) => {
    const status = property.status || property.approvalStatus || 'inactive';
    
    const statusConfig: Record<string, { label: string; className: string }> = {
      active: { label: 'Active', className: 'bg-green-100 text-green-700' },
      pending_approval: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-700' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPropertyImages = (property: any) => {
    if (property.images && Array.isArray(property.images)) {
      return property.images.map((img: any) => 
        typeof img === 'string' ? img : img.imageUrl || img
      );
    }
    if (property.coverImage) return [property.coverImage];
    return [];
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
          <h2 className="text-2xl font-semibold text-[#2B2B2B]">My Properties</h2>
        </div>
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center">
            <Home className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties yet</h3>
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
          const coverImage = images[0];
          
          return (
            <Card key={property.propertyId} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={property.titleEn || property.titleAr}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute top-3 right-3 flex gap-2">
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
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg text-[#2B2B2B] mb-2 line-clamp-1">
                  {property.titleEn || property.titleAr}
                </h3>

                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">
                    {property.city}, {property.governorate}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms} beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{property.guestsCapacity} guests</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Price per night</p>
                    <p className="text-lg font-semibold text-[#00BFA6]">
                      {property.pricePerNight?.toLocaleString() ?? 0} EGP
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(`/property/${property.propertyId}`, '_blank')}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      {images.length > 0 && (
                        <DropdownMenuItem onClick={() => handleViewImages(property)}>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          View Images ({images.length})
                        </DropdownMenuItem>
                      )}
                      {/* ✅ FIXED: Edit button now works */}
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
              </div>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{propertyToDelete?.titleEn || propertyToDelete?.titleAr}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
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
              <div key={image.imageId || index} className="relative aspect-video">
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