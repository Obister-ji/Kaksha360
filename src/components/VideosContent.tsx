
import { useState, useEffect } from "react";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { UserCircle2, Plus, Search, ShieldAlert, Play, Calendar, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserRole, VideoResource } from "@/types/test";
import { useUser } from "@/contexts/UserContext";
import { fetchVideos, createVideo, updateVideo, deleteVideo } from "@/services/videoService";

interface VideosContentProps {
  userRole: UserRole;
}

const VideosContent = ({ userRole }: VideosContentProps) => {
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoResource | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useUser();

  const isAdmin = userRole === "ADMIN";
  console.log("VideosContent - User Role:", userRole, "isAdmin:", isAdmin);

  // Load videos from Supabase on component mount
  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const data = await fetchVideos();
      setVideos(data);
      // Also update localStorage for offline access
      localStorage.setItem('videos', JSON.stringify(data));
    } catch (error) {
      console.error("Error loading videos:", error);
      // Try to load from localStorage as fallback
      const savedVideos = localStorage.getItem('videos');
      if (savedVideos) {
        setVideos(JSON.parse(savedVideos));
        toast.info("Loaded videos from local storage");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);
  const form = useForm<VideoResource>({
    defaultValues: {
      title: "",
      description: "",
      youtubeId: "",
      subject: "Physics",
      uploadedBy: userProfile?.displayName || "LAKSHYA",
      date: new Date().toISOString().split('T')[0].replace(/-/g, '/')
    }
  });

  const handleAddVideo = () => {
    if (!isAdmin) {
      toast.error("Only administrators can add videos");
      return;
    }
    // Reset form with current date and default values
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    form.reset({
      title: "",
      description: "",
      youtubeId: "",
      subject: "Physics",
      uploadedBy: userProfile?.displayName || "LAKSHYA",
      date: today
    });
    setCurrentVideo(null);
    setIsDialogOpen(true);
  };

  const handleSaveVideo = async (values: VideoResource) => {
    if (!isAdmin) {
      toast.error("Only administrators can save videos");
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

      // Make sure we have an uploadedBy
      const uploadedBy = values.uploadedBy || userProfile?.displayName || "LAKSHYA";

      // Prepare the video data
      const videoData = {
        ...values,
        date: formattedDate,
        uploadedBy
      };

      console.log("Prepared video data:", videoData);

      if (currentVideo) {
        // Edit existing video
        const videoToUpdate = { ...videoData, id: currentVideo.id };
        const success = await updateVideo(videoToUpdate);

        if (success) {
          // Reload videos to get the updated list
          await loadVideos();
          toast.success("Video updated successfully");
          setIsDialogOpen(false);
        } else {
          toast.error("Failed to update video in Supabase");
        }
      } else {
        // Add new video
        const result = await createVideo(videoData);

        if (result) {
          // Reload videos to get the updated list
          await loadVideos();
          toast.success("New video added successfully");
          setIsDialogOpen(false);
        } else {
          toast.error("Failed to create video in Supabase");
        }
      }
    } catch (error) {
      console.error("Error saving video:", error);
      toast.error("An error occurred while saving the video");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditVideo = (video: VideoResource) => {
    if (!isAdmin) {
      toast.error("Only administrators can edit videos");
      return;
    }
    setCurrentVideo(video);
    form.reset(video);
    setIsDialogOpen(true);
  };

  const handleDeleteVideo = async (id: string) => {
    if (!isAdmin) {
      toast.error("Only administrators can delete videos");
      return;
    }

    setIsLoading(true);
    try {
      const success = await deleteVideo(id);

      if (success) {
        // Reload videos to get the updated list
        await loadVideos();
        toast.success("Video deleted successfully");
      } else {
        toast.error("Failed to delete video from Supabase");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("An error occurred while deleting the video");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVideo = (id: string) => {
    setActiveVideoId(id === activeVideoId ? null : id);
  };

  const filteredVideos = videos.filter(vid =>
    vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vid.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vid.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For debugging purposes - uncomment to reset videos
  // const resetVideos = () => {
  //   localStorage.removeItem('videos');
  //   setVideos(initialVideos);
  //   localStorage.setItem('videos', JSON.stringify(initialVideos));
  //   toast.success("Videos reset to initial state");
  // };

  return (
    <SidebarInset className="bg-light">
      <header className="sticky top-0 z-90 bg-white shadow-sm py-5 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-primary" />
          <h1 className="text-2xl font-playfair text-primary">Video Resources</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadVideos}
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
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {isAdmin ? (
            <Button
              onClick={handleAddVideo}
              disabled={isLoading}
              className="bg-gold hover:bg-gold/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          ) : (
            <div className="text-sm text-gray-500 italic">
              View-only mode. Contact an administrator for changes.
            </div>
          )}
        </div>

        <div className="space-y-6">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded w-40 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isAdmin ? (
                <>No videos found. Add a new video to get started.</>
              ) : (
                <>No videos found. Check back later for updates.</>
              )}
            </div>
          ) : (
            filteredVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-2 flex items-center">
                        {video.title}
                      </h2>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{video.date}</span>
                        <span className="mx-2">•</span>
                        <span>{video.subject}</span>
                        <span className="mx-2">•</span>
                        <span>{video.uploadedBy}</span>
                      </div>
                      <p className="text-gray-700 mb-4">{video.description}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVideo(video)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      onClick={() => handlePlayVideo(video.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {activeVideoId === video.id ? "Hide Video" : "Watch Video"}
                    </Button>
                  </div>
                </div>

                {activeVideoId === video.id && (
                  <div className="aspect-w-16 aspect-h-9 relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      className="w-full h-80 border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen>
                    </iframe>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{currentVideo ? "Edit Video" : "Add New Video"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveVideo)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Video title" {...field} required />
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
                          placeholder="Video description"
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
                  name="youtubeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Video ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. dQw4w9WgXcQ (part after v= in YouTube URL)"
                          {...field}
                          required
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

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
                        {currentVideo ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      currentVideo ? "Update" : "Add"
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

export default VideosContent;
