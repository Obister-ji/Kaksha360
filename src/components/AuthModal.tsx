
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Import Supabase client
import { supabaseClient, isSupabaseConfigured } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "signup";
}

const AuthModal = ({ isOpen, onClose, initialView = "login" }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supabaseConfigured = isSupabaseConfigured();

  const handleEmailSignIn = async () => {
    try {
      if (!supabaseConfigured) {
        toast.error("Supabase is not configured. Please connect to Supabase from the Lovable interface.");
        return;
      }

      setIsLoading(true);

      if (!email || !password) {
        toast.error("Please enter both email and password");
        return;
      }

      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Logged in successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      if (!supabaseConfigured) {
        toast.error("Supabase is not configured. Please connect to Supabase from the Lovable interface.");
        return;
      }

      setIsLoading(true);

      if (!email || !password) {
        toast.error("Please enter both email and password");
        return;
      }

      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      toast.success("Registration successful! Please check your email to verify your account.");
      setActiveTab("login");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };



  const handleSendOTP = () => {
    if (!phone) {
      toast.error("Please enter your mobile number");
      return;
    }

    // In a real app, this would connect to Supabase to send an OTP
    toast.success(`OTP sent to ${phone}`);
    setShowOtp(true);
  };

  const handleVerifyOTP = () => {
    if (!otp) {
      toast.error("Please enter the verification code");
      return;
    }

    // In a real app, this would verify the OTP with Supabase
    toast.success("OTP verified successfully");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white rounded-lg">
        <div className="h-1 bg-gradient-to-r from-primary to-accent" />

        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-center text-2xl font-playfair text-primary">
            {activeTab === "login" ? "Access Your Account" : "Join Kaksha360"}
          </DialogTitle>
        </DialogHeader>

        {!supabaseConfigured && (
          <div className="px-6 pb-4">
            <Alert variant="destructive" className="bg-amber-50 text-amber-800 border-amber-300">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm">
                Supabase is not configured. Connect to Supabase from the Lovable interface to enable authentication.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 rounded-none border-b">
            <TabsTrigger value="login" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-gold">Login</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-gold">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="p-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-accent hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-primary hover:bg-secondary text-white"
                onClick={handleEmailSignIn}
                disabled={isLoading || !supabaseConfigured}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>



              <div className="mt-4">
                <div className="text-center text-sm">
                  <span className="text-gray-500">Don't have an account? </span>
                  <button
                    className="text-accent hover:underline cursor-pointer"
                    onClick={() => setActiveTab("signup")}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="p-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters
                </p>
              </div>

              <Button
                className="w-full bg-primary hover:bg-secondary text-white"
                onClick={handleEmailSignUp}
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>



              <div className="mt-4">
                <div className="text-center text-sm">
                  <span className="text-gray-500">Already have an account? </span>
                  <button
                    className="text-accent hover:underline cursor-pointer"
                    onClick={() => setActiveTab("login")}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Phone authentication option */}
        <div className="p-6 pt-0 border-t border-gray-100">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or use phone</span>
            </div>
          </div>

          {!showOtp ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleSendOTP}
              >
                Send OTP
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleVerifyOTP}
              >
                Verify & Proceed
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
