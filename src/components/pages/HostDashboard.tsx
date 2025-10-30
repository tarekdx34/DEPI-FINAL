// src/components/pages/HostDashboard.tsx
import {
  Plus,
  Home,
  Calendar,
  TrendingUp,
  Settings,
  Upload,
  Edit2,
  Trash2,
  Eye,
  Star,
  MessageSquare,
  DollarSign,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { usePropertyApi, PropertyFormData } from "../../hooks/usePropertyApi";

interface HostDashboardProps {
  onNavigate: (page: string) => void;
  showAddPropertyOnMount?: boolean;
}

export function HostDashboard({
  onNavigate,
  showAddPropertyOnMount = false,
}: HostDashboardProps) {
  // Use the custom hook
  const {
    loading: apiLoading,
    error: apiError,
    createProperty,
    uploadPropertyImages,
    getMyProperties,
    deleteProperty: deletePropertyApi,
  } = usePropertyApi();

  // Component state
  const [activeTab, setActiveTab] = useState("listings");
  const [showAddProperty, setShowAddProperty] = useState(
    showAddPropertyOnMount
  );
  const [addPropertyStep, setAddPropertyStep] = useState(1);
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Properties State
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Form State
  const [formData, setFormData] = useState<PropertyFormData>({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    propertyType: "",
    rentalType: "",
    governorate: "",
    city: "",
    neighborhood: "",
    bedrooms: 1,
    bathrooms: 1,
    guestsCapacity: 2,
    areaSqm: 0,
    furnished: false,
    petsAllowed: false,
    pricePerNight: 0,
    cleaningFee: 0,
    minRentalDays: 1,
  });

  // Image Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Sync API error with local error state
  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      const data = await getMyProperties();
      setProperties(data);
    } catch (err) {
      console.error("Error loading properties:", err);
      setError("Failed to load properties");
    } finally {
      setLoadingProperties(false);
    }
  };

  const resetForm = () => {
    setAddPropertyStep(1);
    setFormData({
      titleAr: "",
      titleEn: "",
      descriptionAr: "",
      descriptionEn: "",
      propertyType: "",
      rentalType: "",
      governorate: "",
      city: "",
      neighborhood: "",
      bedrooms: 1,
      bathrooms: 1,
      guestsCapacity: 2,
      areaSqm: 0,
      furnished: false,
      petsAllowed: false,
      pricePerNight: 0,
      cleaningFee: 0,
      minRentalDays: 1,
    });
    setSelectedFiles([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setError(null);
  };

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isImage && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError("Some files were skipped (must be images under 10MB)");
      setTimeout(() => setError(null), 3000);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setPreviewUrls((prev) => [...prev, url]);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    setError(null);

    switch (step) {
      case 1:
        if (!formData.titleAr || formData.titleAr.length < 10) {
          setError("Arabic title must be at least 10 characters");
          return false;
        }
        if (!formData.descriptionAr || formData.descriptionAr.length < 50) {
          setError("Arabic description must be at least 50 characters");
          return false;
        }
        if (!formData.propertyType) {
          setError("Please select a property type");
          return false;
        }
        break;
      case 2:
        if (!formData.governorate) {
          setError("Please select a governorate");
          return false;
        }
        if (!formData.city) {
          setError("Please enter a city");
          return false;
        }
        break;
      case 3:
        if (formData.bedrooms < 0 || formData.bathrooms < 0) {
          setError("Bedrooms and bathrooms must be positive numbers");
          return false;
        }
        if (formData.pricePerNight <= 0) {
          setError("Price per night must be greater than 0");
          return false;
        }
        break;
      case 4:
        if (selectedFiles.length < 5) {
          setError("Please upload at least 5 photos");
          return false;
        }
        break;
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep(addPropertyStep)) return;
    if (addPropertyStep < 4) {
      setAddPropertyStep(addPropertyStep + 1);
    }
  };

  const prevStep = () => {
    setError(null);
    if (addPropertyStep > 1) {
      setAddPropertyStep(addPropertyStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      setLoading(true);
      setError(null);

      // Step 1: Create Property
      console.log("Creating property with data:", formData);
      const property = await createProperty(formData);

      console.log("Property created:", property);

      // Step 2: Upload Images
      if (selectedFiles.length > 0) {
        console.log(`Uploading ${selectedFiles.length} images...`);
        setUploadProgress(20);

        await uploadPropertyImages(property.propertyId, selectedFiles);

        setUploadProgress(100);
        console.log("Images uploaded successfully");
      }

      setSuccess("Property created successfully! Awaiting admin approval.");

      // Reset form after success
      setTimeout(() => {
        setShowAddProperty(false);
        resetForm();
        setSuccess(null);
        loadProperties(); // Reload properties list
      }, 2000);
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "Failed to create property");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      setLoading(true);
      await deletePropertyApi(parseInt(id));
      await loadProperties(); // Reload from API
      setDeletePropertyId(null);
      setSuccess("Property deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete property");
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component stays the same

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      active: { color: "bg-green-500 hover:bg-green-600", label: "Active" },
      pending_approval: {
        color: "bg-yellow-500 hover:bg-yellow-600",
        label: "Pending",
      },
      inactive: { color: "bg-gray-500 hover:bg-gray-600", label: "Inactive" },
      rejected: { color: "bg-red-500 hover:bg-red-600", label: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#F9F6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-[#2B2B2B]">
            Host Dashboard
          </h1>
          {!showAddProperty && (
            <Button
              onClick={() => {
                setShowAddProperty(true);
                setAddPropertyStep(1);
                setError(null);
              }}
              className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Property
            </Button>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Add Property Form */}
        {showAddProperty ? (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#2B2B2B]">
                Add New Property
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddProperty(false);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Step {addPropertyStep} of 4
                </span>
                <span className="text-sm text-gray-600">
                  {(addPropertyStep / 4) * 100}% Complete
                </span>
              </div>
              <Progress value={(addPropertyStep / 4) * 100} className="h-2" />
              <div className="grid grid-cols-4 gap-2 mt-4">
                {["Basic Info", "Location", "Details & Pricing", "Photos"].map(
                  (label, i) => (
                    <div
                      key={i}
                      className={`text-center text-xs ${
                        addPropertyStep >= i + 1
                          ? "text-[#00BFA6] font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {label}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Form Steps */}
            <form className="space-y-6">
              {/* Step 1: Basic Info */}
              {addPropertyStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#2B2B2B]">
                    Basic Information
                  </h3>

                  <div>
                    <Label htmlFor="titleAr">Property Title (Arabic) *</Label>
                    <Input
                      id="titleAr"
                      value={formData.titleAr}
                      onChange={(e) =>
                        handleInputChange("titleAr", e.target.value)
                      }
                      placeholder="فيلا فاخرة على البحر"
                      className="mt-1"
                      dir="rtl"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Min 10 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="titleEn">Property Title (English)</Label>
                    <Input
                      id="titleEn"
                      value={formData.titleEn}
                      onChange={(e) =>
                        handleInputChange("titleEn", e.target.value)
                      }
                      placeholder="Luxury Beach Villa"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyType">Property Type *</Label>
                      <Select
                        value={formData.propertyType}
                        onValueChange={(v) =>
                          handleInputChange("propertyType", v)
                        }
                      >
                        <SelectTrigger id="propertyType" className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="chalet">Chalet</SelectItem>
                          <SelectItem value="studio">Studio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="rentalType">Rental Type *</Label>
                      <Select
                        value={formData.rentalType}
                        onValueChange={(v) =>
                          handleInputChange("rentalType", v)
                        }
                      >
                        <SelectTrigger id="rentalType" className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vacation">Vacation</SelectItem>
                          <SelectItem value="long_term">Long Term</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="descriptionAr">
                      Description (Arabic) *
                    </Label>
                    <Textarea
                      id="descriptionAr"
                      value={formData.descriptionAr}
                      onChange={(e) =>
                        handleInputChange("descriptionAr", e.target.value)
                      }
                      placeholder="وصف تفصيلي للعقار..."
                      rows={4}
                      className="mt-1"
                      dir="rtl"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Min 50 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="descriptionEn">Description (English)</Label>
                    <Textarea
                      id="descriptionEn"
                      value={formData.descriptionEn}
                      onChange={(e) =>
                        handleInputChange("descriptionEn", e.target.value)
                      }
                      placeholder="Detailed property description..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {addPropertyStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#2B2B2B]">Location</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="governorate">Governorate *</Label>
                      <Select
                        value={formData.governorate}
                        onValueChange={(v) =>
                          handleInputChange("governorate", v)
                        }
                      >
                        <SelectTrigger id="governorate" className="mt-1">
                          <SelectValue placeholder="Select governorate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Alexandria">Alexandria</SelectItem>
                          <SelectItem value="Matrouh">Matrouh</SelectItem>
                          <SelectItem value="North Coast">
                            North Coast
                          </SelectItem>
                          <SelectItem value="Red Sea">Red Sea</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        placeholder="e.g., Marina"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="neighborhood">Neighborhood/Area</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) =>
                        handleInputChange("neighborhood", e.target.value)
                      }
                      placeholder="e.g., Sidi Abdel Rahman"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Details & Pricing */}
              {addPropertyStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#2B2B2B]">
                      Property Details
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms *</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          min="0"
                          value={formData.bedrooms}
                          onChange={(e) =>
                            handleInputChange(
                              "bedrooms",
                              parseInt(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bathrooms">Bathrooms *</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          min="0"
                          value={formData.bathrooms}
                          onChange={(e) =>
                            handleInputChange(
                              "bathrooms",
                              parseInt(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="guests">Max Guests *</Label>
                        <Input
                          id="guests"
                          type="number"
                          min="1"
                          value={formData.guestsCapacity}
                          onChange={(e) =>
                            handleInputChange(
                              "guestsCapacity",
                              parseInt(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="area">Area (m²)</Label>
                        <Input
                          id="area"
                          type="number"
                          min="0"
                          value={formData.areaSqm}
                          onChange={(e) =>
                            handleInputChange(
                              "areaSqm",
                              parseInt(e.target.value)
                            )
                          }
                          placeholder="120"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="furnished"
                          checked={formData.furnished}
                          onChange={(e) =>
                            handleInputChange("furnished", e.target.checked)
                          }
                          className="w-4 h-4"
                        />
                        <Label htmlFor="furnished" className="cursor-pointer">
                          Furnished
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="pets"
                          checked={formData.petsAllowed}
                          onChange={(e) =>
                            handleInputChange("petsAllowed", e.target.checked)
                          }
                          className="w-4 h-4"
                        />
                        <Label htmlFor="pets" className="cursor-pointer">
                          Pets Allowed
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#2B2B2B]">Pricing</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Price per Night (EGP) *</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          value={formData.pricePerNight}
                          onChange={(e) =>
                            handleInputChange(
                              "pricePerNight",
                              parseFloat(e.target.value)
                            )
                          }
                          placeholder="2000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cleaningFee">Cleaning Fee (EGP)</Label>
                        <Input
                          id="cleaningFee"
                          type="number"
                          min="0"
                          value={formData.cleaningFee}
                          onChange={(e) =>
                            handleInputChange(
                              "cleaningFee",
                              parseFloat(e.target.value)
                            )
                          }
                          placeholder="200"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="minDays">Min Rental Days</Label>
                        <Input
                          id="minDays"
                          type="number"
                          min="1"
                          value={formData.minRentalDays}
                          onChange={(e) =>
                            handleInputChange(
                              "minRentalDays",
                              parseInt(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Photos */}
              {addPropertyStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#2B2B2B]">Photos</h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#00BFA6] transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Click to select photos or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        Upload at least 5 high-quality photos (JPG, PNG)
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Max 10MB per photo
                      </p>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previewUrls.map((url, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {i === 0 && (
                            <Badge className="absolute top-2 left-2 bg-blue-500">
                              Cover
                            </Badge>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-600">
                    Selected: {selectedFiles.length} photo(s){" "}
                    {selectedFiles.length < 5 &&
                      `(need ${5 - selectedFiles.length} more)`}
                  </p>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Uploading images...
                      </p>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Photo Tips:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Use natural lighting for best results</li>
                      <li>Include photos of all rooms and outdoor spaces</li>
                      <li>Highlight unique features and amenities</li>
                      <li>First photo will be the cover image</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                {addPropertyStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={loading}
                  >
                    Previous
                  </Button>
                )}

                {addPropertyStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-[#00BFA6] hover:bg-[#00A890]"
                    disabled={loading}
                  >
                    Next
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-[#00BFA6] hover:bg-[#00A890]"
                      disabled={loading}
                    >
                      {loading ? "Publishing..." : "Publish Property"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddProperty(false)}
                      disabled={loading}
                    >
                      Save as Draft
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-3xl grid-cols-5 mb-8">
              <TabsTrigger value="listings" className="gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Properties</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Earnings</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Properties Tab */}
            <TabsContent value="listings">
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
                My Properties
              </h2>

              {loadingProperties ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BFA6] mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading properties...</p>
                </div>
              ) : properties.length === 0 ? (
                <Card className="p-12 text-center">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
                    No Properties Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by adding your first property
                  </p>
                  <Button
                    onClick={() => setShowAddProperty(true)}
                    className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Property
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <Card key={property.propertyId} className="overflow-hidden">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={property.coverImage}
                          alt={property.titleEn}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(property.status)}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-2">
                          <h3 className="font-semibold text-[#2B2B2B] line-clamp-1">
                            {property.titleEn}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {property.governorate} • {property.city}
                          </p>
                        </div>

                        <div className="text-sm text-gray-600 mb-3">
                          {property.bedrooms} beds • {property.bathrooms} baths
                          • {property.guestsCapacity} guests
                        </div>

                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="font-semibold">
                            {property.pricePerNight} EGP / night
                          </span>
                          {property.averageRating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{property.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {property.status === "active" && (
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4 pb-4 border-b">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {property.viewCount} views
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {property.bookingConfirmedCount} bookings
                            </div>
                          </div>
                        )}

                        {property.status === "pending_approval" && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4 text-xs text-yellow-800">
                            Awaiting admin approval
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setDeletePropertyId(property.propertyId)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
                Bookings Management
              </h2>
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
                  No bookings yet
                </h3>
                <p className="text-gray-600">
                  Your confirmed bookings will appear here
                </p>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-6">
                Earnings & Revenue Analytics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-600">Total Earnings</h3>
                    <DollarSign className="w-5 h-5 text-[#00BFA6]" />
                  </div>
                  <p className="text-3xl font-semibold text-[#2B2B2B]">0 EGP</p>
                  <p className="text-sm text-gray-500 mt-1">All time</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-600">This Month</h3>
                    <TrendingUp className="w-5 h-5 text-[#00BFA6]" />
                  </div>
                  <p className="text-3xl font-semibold text-[#2B2B2B]">0 EGP</p>
                  <p className="text-sm text-gray-500 mt-1">No bookings yet</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-600">Total Bookings</h3>
                    <Calendar className="w-5 h-5 text-[#00BFA6]" />
                  </div>
                  <p className="text-3xl font-semibold text-[#2B2B2B]">
                    {properties.reduce(
                      (sum, p) => sum + (p.bookingConfirmedCount || 0),
                      0
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">All properties</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-600">Avg. Rating</h3>
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-3xl font-semibold text-[#2B2B2B]">
                    {properties.length > 0
                      ? (
                          properties.reduce(
                            (sum, p) => sum + (p.averageRating || 0),
                            0
                          ) / properties.length
                        ).toFixed(1)
                      : "0.0"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {properties.reduce(
                      (sum, p) => sum + (p.totalReviews || 0),
                      0
                    )}{" "}
                    reviews
                  </p>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#2B2B2B] mb-4">
                  Property Performance
                </h3>
                {properties.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Add properties to see analytics
                  </p>
                ) : (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div
                        key={property.propertyId}
                        className="border-b pb-4 last:border-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{property.titleEn}</h4>
                            <p className="text-sm text-gray-500">
                              {property.city}
                            </p>
                          </div>
                          {getStatusBadge(property.status)}
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Views</p>
                            <p className="font-semibold">
                              {property.viewCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Bookings</p>
                            <p className="font-semibold">
                              {property.bookingConfirmedCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Rating</p>
                            <p className="font-semibold">
                              {property.averageRating.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Reviews</p>
                            <p className="font-semibold">
                              {property.totalReviews}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
                Reviews Received
              </h2>
              <Card className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-600">
                  Guest reviews will appear here after their stay
                </p>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="p-6 max-w-2xl">
                <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-6">
                  Account Settings
                </h2>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#2B2B2B]">
                      Business Information
                    </h3>
                    <div>
                      <Label htmlFor="hostName">
                        Host Name / Business Name
                      </Label>
                      <Input
                        id="hostName"
                        defaultValue="Ahmed Hassan"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#2B2B2B]">
                      Contact Information
                    </h3>
                    <div>
                      <Label htmlFor="hostEmail">Contact Email</Label>
                      <Input
                        id="hostEmail"
                        type="email"
                        defaultValue="host@ajarly.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hostPhone">Phone Number</Label>
                      <Input
                        id="hostPhone"
                        defaultValue="+20 123 456 7890"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button className="bg-[#00BFA6] hover:bg-[#00A890]">
                    Save Changes
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletePropertyId}
        onOpenChange={() => setDeletePropertyId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot
              be undone. All associated bookings and data will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletePropertyId && handleDeleteProperty(deletePropertyId)
              }
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
