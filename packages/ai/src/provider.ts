import { getAnthropicModel } from "./providers/anthropic";
import { getOpenAIModel } from "./providers/openai";

export type ProviderName = "anthropic" | "openai";

export type ProviderConfig = {
	provider: ProviderName;
	model: string;
};

export function resolveProvider(): ProviderConfig {
	const provider =
		(process.env.AI_PROVIDER as ProviderName | undefined) ?? "anthropic";
	const defaults: Record<ProviderName, string> = {
		anthropic: "claude-haiku-4-5",
		openai: "gpt-4o-mini",
	};
	const model = process.env.AI_MODEL ?? defaults[provider];
	return { provider, model };
}

export function getProviderModel() {
	const { provider, model } = resolveProvider();
	return provider === "openai"
		? getOpenAIModel(model)
		: getAnthropicModel(model);
}
