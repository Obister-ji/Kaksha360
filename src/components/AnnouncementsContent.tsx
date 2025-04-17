
import { useState, useEffect } from "react";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { UserCircle2, Plus, Search, ShieldAlert, Megaphone, Calendar, RefreshCw, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserRole, Announcement } from "@/types/test";
import { VisuallyHidden } from "./ui/visually-hidden";
import { useUser } from "@/contexts/UserContext";
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/services/announcementService";

interface AnnouncementsContentProps {
  userRole: UserRole;
}

const AnnouncementsContent = ({ userRole }: AnnouncementsContentProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewAnnouncement, setViewAnnouncement] = useState<Announcement | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { userProfile } = useUser();

  const isAdmin = userRole === "ADMIN";
  console.log("AnnouncementsContent - User Role:", userRole, "isAdmin:", isAdmin);

  // Load announcements from Supabase on component mount
  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
      // Also update localStorage for offline access
      localStorage.setItem('announcements', JSON.stringify(data));
    } catch (error) {
      console.error("Error loading announcements:", error);
      // Try to load from localStorage as fallback
      const savedAnnouncements = localStorage.getItem('announcements');
      if (savedAnnouncements) {
        setAnnouncements(JSON.parse(savedAnnouncements));
        toast.info("Loaded announcements from local storage");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);
  const form = useForm<Announcement>({
    defaultValues: {
      title: "",
      content: "",
      date: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      author: userProfile?.displayName || "LAKSHYA",
      important: false
    }
  });

  const handleAddAnnouncement = () => {
    if (!isAdmin) {
      toast.error("Only administrators can add announcements");
      return;
    }
    // Reset form with current date and default values
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    form.reset({
      title: "",
      content: "",
      date: today,
      author: userProfile?.displayName || "LAKSHYA",
      important: false
    });
    setCurrentAnnouncement(null);
    setIsDialogOpen(true);
  };

  const handleSaveAnnouncement = async (values: Announcement) => {
    if (!isAdmin) {
      toast.error("Only administrators can save announcements");
      return;
    }

    setIsLoading(true);
    try {
      // Make sure the date is in the correct format (YYYY/MM/DD)
      let formattedDate = values.date;
      if (values.date) {
        // Try to format the date if it's not already in the correct format
        try {
          const dateObj = new Date(values.date);
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

      // Make sure we have an author
      const author = values.author || userProfile?.displayName || "LAKSHYA";

      // Prepare the announcement data
      const announcementData = {
        ...values,
        date: formattedDate,
        author,
        important: values.important || false
      };

      console.log("Prepared announcement data:", announcementData);

      if (currentAnnouncement) {
        // Edit existing announcement
        const announcementToUpdate = { ...announcementData, id: currentAnnouncement.id };
        const success = await updateAnnouncement(announcementToUpdate);

        if (success) {
          // Reload announcements to get the updated list
          await loadAnnouncements();
          toast.success("Announcement updated successfully");
          setIsDialogOpen(false);
        } else {
          toast.error("Failed to update announcement in Supabase");
        }
      } else {
        // Add new announcement
        const result = await createAnnouncement(announcementData);

        if (result) {
          // Reload announcements to get the updated list
          await loadAnnouncements();
          toast.success("New announcement created successfully");
          setIsDialogOpen(false);
        } else {
          toast.error("Failed to create announcement in Supabase");
        }
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error("An error occurred while saving the announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    if (!isAdmin) {
      toast.error("Only administrators can edit announcements");
      return;
    }
    setCurrentAnnouncement(announcement);
    form.reset(announcement);
    setIsDialogOpen(true);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!isAdmin) {
      toast.error("Only administrators can delete announcements");
      return;
    }

    setIsLoading(true);
    try {
      const success = await deleteAnnouncement(id);

      if (success) {
        // Reload announcements to get the updated list
        await loadAnnouncements();
        toast.success("Announcement deleted successfully");
      } else {
        toast.error("Failed to delete announcement from Supabase");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("An error occurred while deleting the announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(ann =>
    ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ann.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For debugging purposes - uncomment to reset announcements
  // const resetAnnouncements = () => {
  //   localStorage.removeItem('announcements');
  //   setAnnouncements(initialAnnouncements);
  //   localStorage.setItem('announcements', JSON.stringify(initialAnnouncements));
  //   toast.success("Announcements reset to initial state");
  // };

  return (
    <SidebarInset className="bg-light">
      <header className="sticky top-0 z-90 bg-white shadow-sm py-5 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-primary" />
          <h1 className="text-xl md:text-2xl font-playfair text-primary font-bold">Announcements</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnnouncements}
            disabled={isLoading}
            className="flex items-center gap-1 mr-2"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </Button>
          {isAdmin && (
            <div className="flex items-center gap-2 bg-amber-100 text-amber-600 px-3 py-1 rounded-full mr-3">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-xs font-semibold hidden md:inline">Admin Mode</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-gold/10 px-3 md:px-4 py-2 rounded-full">
            <UserCircle2 className="text-gold h-5 w-5" />
            <span className="text-primary font-semibold text-sm hidden md:inline">{userProfile?.displayName || "User"}</span>
            <span className="text-primary font-semibold text-sm md:hidden">{userProfile?.initials || "U"}</span>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {isAdmin ? (
            <Button
              onClick={handleAddAnnouncement}
              disabled={isLoading}
              className="w-full md:w-auto bg-gold hover:bg-gold/90 text-primary-foreground font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Announcement
            </Button>
          ) : (
            <div className="text-sm text-gray-500 italic">
              View-only mode. Contact an administrator for changes.
            </div>
          )}
        </div>

        <div className="space-y-5">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-5 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isAdmin ? (
                <>No announcements found. Add a new announcement to get started.</>
              ) : (
                <>No announcements found. Check back later for updates.</>
              )}
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`bg-white rounded-lg shadow p-4 md:p-6 ${announcement.important ? 'border-l-4 border-amber-500' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => {
                  setViewAnnouncement(announcement);
                  setIsViewDialogOpen(true);
                }}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-0">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 flex items-center">
                      {announcement.important && (
                        <Megaphone className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                      )}
                      {announcement.title}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{announcement.date}</span>
                      <span className="mx-2">•</span>
                      <span>{announcement.author}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-2 self-end md:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                        onClick={() => handleEditAnnouncement(announcement)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-line text-base leading-relaxed line-clamp-3">{announcement.content}</p>
                <div className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Click to read more
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            className="sm:max-w-[600px] p-4 md:p-6 max-w-[95vw] md:max-w-[600px]"
            aria-labelledby="announcement-dialog-title">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800" id="announcement-dialog-title">
                {currentAnnouncement ? "Edit Announcement" : "Add New Announcement"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveAnnouncement)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Announcement title"
                          className="border-gray-300 focus:border-gold focus:ring-gold"
                          {...field}
                          required
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Announcement content"
                          className="min-h-[120px] md:min-h-[150px] border-gray-300 focus:border-gold focus:ring-gold"
                          {...field}
                          required
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="important"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-amber-50 p-3 rounded-md border border-amber-100">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-amber-400 text-amber-600 focus:ring-amber-500"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-amber-800 font-medium">
                          Mark as Important
                        </FormLabel>
                        <p className="text-xs text-amber-700">Important announcements will be highlighted and shown at the top</p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                    className="w-full sm:w-auto border-gray-300 text-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-gold hover:bg-gold/90 text-primary-foreground font-medium"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {currentAnnouncement ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      currentAnnouncement ? "Update" : "Create"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Announcement Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent
            className="sm:max-w-[600px] p-4 md:p-6 max-w-[95vw] md:max-w-[600px]"
            aria-labelledby="view-announcement-dialog-title"
          >
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-gray-800" id="view-announcement-dialog-title">
                  {viewAnnouncement?.title}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                  <VisuallyHidden>Close</VisuallyHidden>
                </Button>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{viewAnnouncement?.date}</span>
                <span className="mx-2">•</span>
                <span>{viewAnnouncement?.author}</span>
                {viewAnnouncement?.important && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="flex items-center text-amber-600">
                      <Megaphone className="h-4 w-4 mr-1" />
                      Important
                    </span>
                  </>
                )}
              </div>
            </DialogHeader>
            <div className="mt-4 text-gray-700 whitespace-pre-line text-base leading-relaxed max-h-[60vh] overflow-y-auto">
              {viewAnnouncement?.content}
            </div>
            <DialogFooter className="mt-6">
              <Button
                onClick={() => setIsViewDialogOpen(false)}
                className="w-full sm:w-auto bg-gold hover:bg-gold/90 text-primary-foreground font-medium"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </SidebarInset>
  );
};

export default AnnouncementsContent;

