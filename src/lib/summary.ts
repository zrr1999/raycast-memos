import { Memo } from "./types";
import { getPreferenceValues, Cache } from "@raycast/api";
import { PreferenceValues } from "./types";
import { OpenAI } from "openai";

const cache = new Cache();

export async function getSummary(memo: Memo) {
  const { openAiApiKey, openAiBasePath, model, language } = getPreferenceValues<PreferenceValues>();
  const cachedSummary = cache.get(`summary-${memo.uid}`);

  if (cachedSummary) {
    return cachedSummary;
  }

  if (!openAiApiKey) {
    return memo.content;
  }

  const openai = new OpenAI({
    apiKey: openAiApiKey,
    baseURL: openAiBasePath,
  });

  const answer = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that summarizes the given content as a concise title. Your must use ${language}!!`,
      },
      { role: "user", content: memo.content },
    ],
  });

  if (answer.choices[0].message.content) {
    cache.set(`summary-${memo.uid}`, answer.choices[0].message.content);
    return answer.choices[0].message.content;
  }

  return memo.content;
}
