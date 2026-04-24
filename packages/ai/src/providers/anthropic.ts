import { anthropic } from "@ai-sdk/anthropic";

export function getAnthropicModel(model: string) {
	return anthropic(model);
}
