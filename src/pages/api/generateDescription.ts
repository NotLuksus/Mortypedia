import { env } from "@/env.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { OpenAI } from "openai";

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { prompt } = (await req.body) as {
    prompt: string;
  };

  try {
    if (!prompt)
      return res
        .status(400)
        .send(JSON.stringify({ error: "No prompt provided" }));
    const message = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k-0613",
      stream: false,
      messages: [{ role: "user", content: prompt }],
    });

    return res
      .status(200)
      .send(JSON.stringify(message.choices[0]?.message.content ?? ""));
  } catch (error) {
    console.log("error:", error);
    return res
      .status(500)
      .send(JSON.stringify({ error: "Something went wrong" }));
  }
}
