import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import apiClient from "@/api/apiClient";
import { describeError, describeFirebaseAuthError } from "@/lib/errorMessage";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Hash, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

const MATRIC_NUMBER_PATTERN = /^\d{11}$/;
// At least 8 characters, at least one uppercase letter, at least one
// character that isn't a letter or digit (a symbol) — whitespace doesn't
// count toward that last part, so a password can't satisfy it with a
// plain space.
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,}$/;

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const from = location.state?.from?.pathname || "/community";
  const [email, setEmail] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!PASSWORD_PATTERN.test(password)) {
      setError("Password must be at least 8 characters and include one capital letter and one special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!MATRIC_NUMBER_PATTERN.test(matricNumber)) {
      setError("Matriculation number must be exactly 11 digits — your 4-digit registration year followed by 7 digits, e.g. 20211263825.");
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      try {
        // Firebase and Mongo are separate systems — the account above
        // only exists in Firebase. This is what actually records the
        // matric number, and it's where a duplicate gets caught.
        await apiClient.post("/auth/sync", { matric_number: matricNumber });
      } catch (syncErr) {
        // The Firebase account succeeded but the matric number didn't —
        // most likely a duplicate. Don't leave an orphaned Firebase
        // account with no way to ever complete registration (retrying
        // would just fail with "email already in use"). Roll it back so
        // they can fix the number and try again cleanly.
        await auth.currentUser?.delete().catch(() => {});
        setError(describeError(syncErr, "Registration failed."));
        return;
      }
      // The call above only saves the matric number server-side — it
      // doesn't itself update the app's local copy of the user. The only
      // thing that normally does is the automatic sync AuthContext fires
      // on every auth-state change, but that one runs independently and
      // sends no matric number of its own; if its query happens to land
      // before this save does, it has nothing to reflect. Refreshing
      // explicitly here, now that the save is confirmed, guarantees the
      // next page actually sees it rather than bouncing back here.
      await refreshUser();
      navigate(from, { replace: true });
    } catch (err) {
      setError(describeFirebaseAuthError(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate(from, { replace: true });
    } catch (err) {
      const message = describeFirebaseAuthError(err, "Google sign-in failed. Please try again.");
      if (message) setError(message);
    }
  };

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="matric">Matriculation Number</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="matric"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 20211263825"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
              className="pl-10 h-12"
              maxLength={11}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            At least 8 characters, with one capital letter and one special character.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
