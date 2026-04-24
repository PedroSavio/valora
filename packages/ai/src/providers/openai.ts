import { openai } from "@ai-sdk/openai";

export function getOpenAIModel(model: string) {
	return openai(model);
}
