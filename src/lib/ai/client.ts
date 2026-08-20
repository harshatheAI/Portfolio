import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Overridable via env; kept current-gen and vision-capable. */
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

export const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);
