"use client";

import { signIn, signInSocial, signUp } from "../actions/auth-actions";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { safeRedirectPath } from "@/lib/safeRedirect";

// Where to go after signing in: the ?next= value if it's a safe same-site path,
// otherwise /auth-dashboard. Read inside handlers only, so no <Suspense> is needed.
const getNext = () =>
  safeRedirectPath(new URLSearchParams(window.location.search).get("next"));

const AuthClientPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);

  const router = useRouter();

  // form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // error states
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!isSignIn && !name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return; // stop if validation fails

    setIsLoading(true);
    setErrors({});

    try {
      if (isSignIn) {
        const result = await signIn(email, password);
        if (!result.user) {
          setErrors({ general: "Invalid email or password!" });
          return;
        }
        // signed in: go back to where the user came from, then refresh so
        // server components pick up the new session
        router.push(getNext());
        router.refresh();
      } else {
        const result = await signUp(email, password, name);

        if (!result.success) {
          setErrors({
            general: result.error || "Failed to create account!",
          });
          return;
        }
        setIsSignIn(true);
      }
    } catch (error) {
      setErrors({
        general: `Authentication Error: ${
          error instanceof Error ? error.message : "Unknown error!"
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    setErrors({ general: "" });

    console.log("logged in with:", provider);

    // the destination goes through the server action because the browser
    // leaves the site for Google/GitHub and comes back afterwards
    await signInSocial(provider, getNext());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        {/* Title */}
        <div className="flex justify-center mb-6">
          <span className="text-2xl font-bold">
            {isSignIn ? "Welcome Back" : "Create Account"}
          </span>
        </div>

        {/* text */}
        <p className="text-center text-gray-500 mb-6">
          {isSignIn
            ? "Sign in to your account to continue"
            : "Create an account to get started"}
        </p>

        {/* Social Buttons */}
        <div className="space-y-3">
          {/* Google Button */}
          <button
            className={`w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 transition relative
      ${
        loadingProvider === "google"
          ? "bg-gray-100 cursor-not-allowed opacity-70"
          : "hover:bg-gray-100 cursor-pointer"
      }`}
            onClick={() => handleSocialAuth("google")}
            disabled={loadingProvider === "google"}
          >
            {loadingProvider === "google" ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                {/* Google SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.65 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.43 6.055 29.48 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c11.045 0 20-8.955 20-20 0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 16.097 18.961 14 24 14c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.43 6.055 29.48 4 24 4c-7.616 0-14.093 4.134-17.694 10.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.305 0 10.082-1.988 13.74-5.229l-6.342-5.374C29.317 34.491 26.715 35.5 24 35.5c-5.202 0-9.616-3.315-11.292-7.94l-6.57 5.075C9.84 39.27 16.372 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303c-.792 2.232-2.293 4.114-4.258 5.397l6.342 5.374C39.168 35.083 44 29.5 44 22.5c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>
          {/* GitHub Button */}
          <button
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 transition relative
      ${
        loadingProvider === "github"
          ? "bg-gray-800 cursor-not-allowed opacity-70"
          : "bg-black hover:bg-gray-800 cursor-pointer"
      } text-white`}
            onClick={() => handleSocialAuth("github")}
            disabled={loadingProvider === "github"}
          >
            {loadingProvider === "github" ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                {/* GitHub SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.21 11.44c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.56.12-3.25 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.69.24 2.94.12 3.25.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.63-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z"
                  />
                </svg>
                Continue with GitHub
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-2 text-sm text-gray-400">Or continue with</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Email & Password form*/}
        <form className="space-y-4" onSubmit={handleAuth}>
          {!isSignIn && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className={`mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-indigo-500"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-sm text-red-500 text-center">{errors.general}</p>
          )}

          {/* submit button email & password */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition
    ${
      isLoading
        ? "bg-indigo-400 cursor-not-allowed"
        : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
    } text-white`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </>
            ) : (
              <span>{isSignIn ? "Sign In" : "Create Account"}</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {isSignIn ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-indigo-600 hover:underline"
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthClientPage;