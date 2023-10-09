import { useState } from "react";

export const useGenerateAIMessage = (): {
  submitPrompt: (prompt: string) => Promise<string>;
  loading: boolean;
} => {
  const [loading, setLoading] = useState(false);
  async function submitPrompt(prompt: string): Promise<string> {
    setLoading(true);
    const response = await fetch("/api/generateDescription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    }).then((response) => response.text());
    setLoading(false);
    return response;
  }

  return {
    submitPrompt,
    loading,
  };
};
