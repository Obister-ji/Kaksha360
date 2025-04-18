import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper function to extract tokens from URL
const extractTokensFromUrl = () => {
  const hash = window.location.hash;
  const searchParams = new URLSearchParams(window.location.search);
  let accessToken = null;
  let refreshToken = null;
  let type = null;

  // Try to extract from hash (fragment) first
  if (hash && hash.includes("access_token")) {
    const hashParams = new URLSearchParams(hash.substring(1));
    accessToken = hashParams.get("access_token");
    refreshToken = hashParams.get("refresh_token");
    type = hashParams.get("type");
  }

  // If not found in hash, try query parameters
  if (!accessToken && searchParams.has("access_token")) {
    accessToken = searchParams.get("access_token");
    refreshToken = searchParams.get("refresh_token");
    type = searchParams.get("type");
  }

  return { accessToken, refreshToken, type };
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showManualTokenInput, setShowManualTokenInput] = useState(false);
  const [manualToken, setManualToken] = useState("");

  const location = useLocation();

  useEffect(() => {
    // Check if we have the access token in the URL
    const { accessToken, type } = extractTokensFromUrl();

    // Log the URL information for debugging
    console.log("URL information:", {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      hasAccessToken: !!accessToken,
      type
    });

    // Check if we have the necessary tokens
    if (!accessToken) {
      console.log("No access token found in URL");
      setError("Invalid or expired password reset link. You can try entering your reset token manually below.");
      setShowManualTokenInput(true);
    } else {
      console.log("Access token found in URL");
      setShowManualTokenInput(false);
    }
  }, [location]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      // Get the tokens from URL using our helper function or use manual token if provided
      let accessToken, refreshToken;

      if (showManualTokenInput && manualToken) {
        // Use the manually entered token
        accessToken = manualToken.trim();
        refreshToken = "";
        console.log("Using manually entered token for password reset");
      } else {
        // Use tokens from URL
        const tokens = extractTokensFromUrl();
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        console.log("Using tokens from URL for password reset");
      }

      console.log("Using tokens for password reset", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        isManualToken: showManualTokenInput && !!manualToken
      });

      // Update the user's password
      let result;
      if (accessToken) {
        try {
          // If we have an access token, use it to set the session
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });
        } catch (sessionError) {
          console.error("Error setting session:", sessionError);
          // Continue anyway, as we'll try recovery mode if this fails
        }
      }

      // Now update the password
      result = await supabase.auth.updateUser({ password });

      if (result.error) {
        console.error("Error updating password:", result.error);

        // If we get an error about the JWT being expired or invalid, try a different approach
        if (result.error.message.includes("JWT") || result.error.message.includes("token")) {
          console.log("Trying alternative password reset approach...");

          // Try to use the recovery flow if available
          const recoveryResult = await supabase.auth.updateUser({
            password,
            data: { recovery_mode: true }
          });

          if (recoveryResult.error) {
            throw recoveryResult.error;
          }
        } else {
          throw result.error;
        }
      }

      setSuccess(true);
      toast.success("Your password has been reset successfully");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center">
            {success
              ? "Your password has been reset successfully. You will be redirected to the login page."
              : "Enter your new password below."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <Alert variant={showManualTokenInput ? "warning" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  {showManualTokenInput && (
                    <p className="mt-2 text-xs">
                      Check your email for the reset token. If you can't find it, you can
                      <button
                        type="button"
                        className="text-primary underline"
                        onClick={() => navigate("/auth")}
                      >
                        request a new password reset
                      </button>.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  Password reset successful! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            {!success && (
              <>
                {showManualTokenInput && (
                  <div className="space-y-2">
                    <Label htmlFor="reset-token">Reset Token</Label>
                    <Input
                      id="reset-token"
                      type="text"
                      placeholder="Paste your reset token here"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the token from your password reset email. It's usually a long string of characters.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
          </CardContent>

          {!success && (
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !!error}
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
