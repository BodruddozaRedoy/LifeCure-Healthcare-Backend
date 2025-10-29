import OpenAI from 'openai';
import config from '../../config';

/**
 * 🤖 OpenAI Client Configuration
 * -----------------------------------------------------
 * Creates and exports a pre-configured OpenAI client instance
 * that connects to the OpenRouter API endpoint.
 *
 * - `baseURL`: Points to the OpenRouter API instead of the default OpenAI API.
 * - `apiKey`: Retrieved securely from environment variables via config.
 *
 * This instance can be reused throughout the app to make AI-related requests.
 */
export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: config.openRouterApiKey,
});
