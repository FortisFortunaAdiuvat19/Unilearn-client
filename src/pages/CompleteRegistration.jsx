import React, { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import apiClient from "@/api/apiClient";
import { describeError } from "@/lib/errorMessage";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

const MATRIC_NUMBER_PATTERN = /^\d{11}$/;

export default function CompleteRegistration() {
  const { user, isAuthenticated, isLoadingAuth, authChecked, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/community";

  const [matricNumber, setMatricNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isLoadingAuth || !authChecked) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Already complete — nothing to do here, most likely reached by typing
  // the URL directly.
  if (user?.matric_number) return <Navigate to={from} replace />;

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
      await refreshUser();
      navigate(from, { replace: true });
    } catch (err) {
      setError(describeError(err, "Couldn't save that. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={Hash}
      title="Almost there"
      subtitle="One more thing before you continue"
    >
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
    </AuthLayout>
  );
}
