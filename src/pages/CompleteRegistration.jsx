import React, { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import apiClient from "@/api/apiClient";
import { describeError } from "@/lib/errorMessage";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, Loader2, Check } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

const MATRIC_NUMBER_PATTERN = /^\d{11}$/;
const REDIRECT_DELAY_MS = 1800;

export default function CompleteRegistration() {
  const { user, isAuthenticated, isLoadingAuth, authChecked, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/community";

  const [matricNumber, setMatricNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (isLoadingAuth || !authChecked) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Only auto-redirect for someone who already had a matric number before
  // ever touching this form (e.g. reached this URL directly by typing it).
  // Once the form below sets `success`, this is deliberately suppressed —
  // refreshUser() updating the global user object mid-flow was triggering
  // this exact check to fire its own navigation at the same time as the
  // explicit one below, which is what was showing up as a reload.
  if (user?.matric_number && !success) return <Navigate to={from} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!MATRIC_NUMBER_PATTERN.test(matricNumber)) {
      setError("Matriculation number must be exactly 11 digits — your 4-digit registration year followed by 7 digits, e.g. 20211263825.");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/auth/sync", { matric_number: matricNumber });
      setSuccess(true);
      // Updates the global user object in the background — deliberately
      // not awaited, so it can't delay the success message appearing.
      // The guard above keeps its result from triggering a second,
      // competing navigation while the message is showing.
      refreshUser();
      setTimeout(() => navigate(from, { replace: true }), REDIRECT_DELAY_MS);
    } catch (err) {
      setError(describeError(err, "Couldn't save that. Please try again."));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={success ? Check : Hash}
      title={success ? "You're all set!" : "Almost there"}
      subtitle={success ? "Taking you to your dashboard..." : "One more thing before you continue"}
    >
      {success ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-sm text-muted-foreground">
            Your registration is complete.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            You're signed in, but we still need your matriculation number to finish
            setting up your account — every student on UniLearn is identified by
            theirs, and Google sign-in doesn't collect it automatically.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matric">Matriculation Number</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="matric"
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  placeholder="e.g. 20211263825"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="pl-10 h-12"
                  maxLength={11}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
