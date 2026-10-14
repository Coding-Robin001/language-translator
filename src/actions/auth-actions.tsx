"use server";

import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/lib/safeRedirect";


type AuthError = {
  statusCode?: number;
};

export const signUp = async (email: string, password: string, name: string) => {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        callbackURL: "/auth-dashboard",
      },
    });

    return {
      success: true,
      user: result.user,
      error: null,
    };
  } catch (err: unknown) {
    console.error("SignUp Error:", err);

    const error = err as {
      statusCode?: number;
      status?: string;
      body?: {
        code?: string;
        message?: string;
      };
    };

    switch (error.body?.code) {
      case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
        return {
          success: false,
          user: null,
          error: "This email is already registered. Please sign in instead.",
        };

      case "PASSWORD_TOO_SHORT":
        return {
          success: false,
          user: null,
          error: "Your password is too short. Please choose a longer password.",
        };

      default:
        return {
          success: false,
          user: null,
          error:
            "Unable to create your account. Please check your details and try again.",
        };
    }
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
        callbackURL: "/auth-dashboard",
      },
    });
    return result;
  } catch (err: unknown) {
    const error = err as AuthError;

    if (error.statusCode === 401) {
      return {
        success: false,
        user: null,
        error: "Invalid email or password",
      };
    }
    return {
      success: false,
      user: null,
      error: "Sign in failed. Please try again.",
    };
  }
};


export const signInSocial = async (provider: "google" | "github", callbackURL?: string) => {
  const { url } = await auth.api.signInSocial({
    body: { provider, callbackURL: safeRedirectPath(callbackURL) },
  });
  if (url) redirect(url);
};
export const signOut = async () => {
  try {
    const result = await auth.api.signOut({ headers: await headers() });
    return result;
  } catch {
    throw new Error("Sign out failed.");
  }
};
