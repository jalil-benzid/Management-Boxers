import { useState } from "react";
import { fetchClient } from "../api/fetchClient";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    token_type: string;
  };
}

export function useLoginCoach() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const data: LoginResponse = await fetchClient(
        "/api/auth/coach/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

      // Save token (temporary simple way)
      localStorage.setItem("token", data.data.access_token);

      return data;
    } catch (err: unknown) {
    if (err instanceof Error) {
        setError(err.message);
    } else {
        setError("Unexpected error occurred");
    }
    throw err;
    }
    finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
