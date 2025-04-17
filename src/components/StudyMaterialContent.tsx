
import { useState, useEffect } from "react";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { UserCircle2, Plus, Search, ShieldAlert, FileText, Calendar, Download, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserRole, StudyMaterial } from "@/types/test";
import { useUser } from "@/contexts/UserContext";
import { fetchStudyMaterials, createStudyMaterial, updateStudyMaterial, deleteStudyMaterial } from "@/services/studyMaterialService";

interface StudyMaterialContentProps {
  userRole: UserRole;
}

const StudyMaterialContent = ({ userRole }: StudyMaterialContentProps) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<StudyMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useUser();

  const isAdmin = userRole === "ADMIN";
  console.log("StudyMaterialContent - User Role:", userRole, "isAdmin:", isAdmin);

  // Load study materials from Supabase on component mount
  const loadStudyMaterials = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStudyMaterials();
      setMaterials(data);
      // Also update localStorage for offline access
      localStorage.setItem('studyMaterials', JSON.stringify(data));
    } catch (error) {
      console.error("Error loading study materials:", error);
      // Try to load from localStorage as fallback
      const savedMaterials = localStorage.getItem('studyMaterials');
      if (savedMaterials) {
        setMaterials(JSON.parse(savedMaterials));
        toast.info("Loaded study materials from local storage");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudyMaterials();
  }, []);
  const form = useForm<StudyMaterial>({
    defaultValues: {
      title: "",
      description: "",
      fileUrl: "",
      subject: "Physics",
      uploadedBy: userProfile?.displayName || "LAKSHYA",
      uploadDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      fileType: "pdf"
    }
  });

  const handleAddMaterial = () => {
    if (!isAdmin) {
      toast.error("Only administrators can add study materials");
      return;
    }
    // Reset form with current date and default values
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    form.reset({
      title: "",
      description: "",
      fileUrl: "",
      subject: "Physics",
      uploadedBy: userProfile?.displayName || "LAKSHYA",
      uploadDate: today,
      fileType: "pdf"
    });
    setCurrentMaterial(null);
    setIsDialogOpen(true);
  };

  const handleSaveMaterial = async (values: StudyMaterial) => {
    if (!isAdmin) {
      toast.error("Only administrators can save study materials");
      return;
    }

    setIsLoading(true);
    try {
      // Make sure the date is in the correct format (YYYY/MM/DD)
      let formattedDate = values.uploadDate;
      if (values.uploadDate) {
        // Try to format the date if it's not already in the correct format
        try {
          const dateObj = new Date(values.uploadDate);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
          }
        } catch (e) {
          console.warn("Could not format date, using as-is", e);
        }
      } else {
        // If no date is provided, use today's date
        const today = new Date();
        formattedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
      }

      // Make sure we have an uploadedBy
      const uploadedBy = values.uploadedBy || userProfile?.displayName || "LAKSHYA";

      // Prepare the study material data
      const materialData = {
        ...values,
        uploadDate: formattedDate,
        uploadedBy
      };

      console.log("Prepared study material data:", materialData);

      if (currentMaterial) {
        // Edit existing study material
        const materialToUpdate = { ...materialData, id: currentMaterial.id };
        const success = await updateStudyMaterial(materialToUpdate);

        if (success) {
          // Reload study materials to get the updated list
          await loadStudyMaterials();
          toast.success("Study material updated successfully");
          setIsDialogOpen(false);
        } else {
          toast.error("Failed to update study material in Supabase");
        }
      } else {
        // Add new study material
        const result = await createStudyMaterial(materialData);

        if (result) {
          // Reload study materials to get the updated list
          await loadStudyMaterials();
          toast.success("New study material added successfully");
          setIsDialogOpen(false);
        } else {
          toast.error("Failed to create study material in Supabase");
        }
      }
    } catch (error) {
      console.error("Error saving study material:", error);
      toast.error("An error occurred while saving the study material");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMaterial = (material: StudyMaterial) => {
    if (!isAdmin) {
      toast.error("Only administrators can edit study materials");
      return;
    }
    setCurrentMaterial(material);
    form.reset(material);
    setIsDialogOpen(true);
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!isAdmin) {
      toast.error("Only administrators can delete study materials");
      return;
    }

    setIsLoading(true);
    try {
      const success = await deleteStudyMaterial(id);

      if (success) {
        // Reload study materials to get the updated list
        await loadStudyMaterials();
        toast.success("Study material deleted successfully");
      } else {
        toast.error("Failed to delete study material from Supabase");
      }
    } catch (error) {
      console.error("Error deleting study material:", error);
      toast.error("An error occurred while deleting the study material");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMaterials = materials.filter(mat =>
    mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mat.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For debugging purposes - uncomment to reset study materials
  // const resetMaterials = () => {
  //   localStorage.removeItem('studyMaterials');
  //   setMaterials(initialMaterials);
  //   localStorage.setItem('studyMaterials', JSON.stringify(initialMaterials));
  //   toast.success("Study materials reset to initial state");
  // };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-500" />;
      case 'doc':
        return <FileText className="h-10 w-10 text-blue-500" />;
      case 'ppt':
        return <FileText className="h-10 w-10 text-orange-500" />;
      default:
        return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <SidebarInset className="bg-light">
      <header className="sticky top-0 z-90 bg-white shadow-sm py-5 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-primary" />
          <h1 className="text-2xl font-playfair text-primary">Study Materials</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStudyMaterials}
            disabled={isLoading}
            className="flex items-center gap-1 mr-2"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </Button>
          {isAdmin && (
            <div className="flex items-center gap-2 bg-amber-100 text-amber-600 px-3 py-1 rounded-full mr-3">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-xs font-semibold">Admin Mode</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full">
            <UserCircle2 className="text-gold h-5 w-5" />
            <span className="text-primary font-semibold text-sm">{userProfile?.displayName || "User"}</span>
          </div>
        </div>
      </header>

      <main className="px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search study materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {isAdmin ? (
            <Button
              onClick={handleAddMaterial}
              disabled={isLoading}
              className="bg-gold hover:bg-gold/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Study Material
            </Button>
          ) : (
            <div className="text-sm text-gray-500 italic">
              View-only mode. Contact an administrator for changes.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="flex mb-4">
                    <div className="h-10 w-10 bg-gray-200 rounded"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-8 text-gray-500 col-span-full">
              {isAdmin ? (
                <>No study materials found. Add a new study material to get started.</>
              ) : (
                <>No study materials found. Check back later for updates.</>
              )}
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex mb-4">
                  {getFileTypeIcon(material.fileType)}
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold">{material.title}</h2>
                    <div className="text-sm text-gray-500">
                      <span>{material.subject}</span>
                      <span className="mx-1">•</span>
                      <span>{material.fileType.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm">{material.description}</p>

                <div className="text-xs text-gray-500 mb-4 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Uploaded on {material.uploadDate} by {material.uploadedBy}</span>
                </div>

                <div className="flex justify-between items-center">
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>

                  {isAdmin && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMaterial(material)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleDeleteMaterial(material.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{currentMaterial ? "Edit Study Material" : "Add New Study Material"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveMaterial)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Study material title" {...field} required />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Study material description"
                          className="min-h-[80px]"
                          {...field}
                          required
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="URL to the file"
                          {...field}
                          required
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Physics">Physics</SelectItem>
                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                            <SelectItem value="Biology">Biology</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fileType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select file type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="doc">DOC</SelectItem>
                            <SelectItem value="ppt">PPT</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {currentMaterial ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      currentMaterial ? "Update" : "Add"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </SidebarInset>
  );
};

export default StudyMaterialContent;

