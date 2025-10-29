/**
 * 🧠 extractJsonFromMessage
 * -------------------------------------------------------
 * Safely extracts and parses JSON data from a text-based message.
 * Commonly used to handle AI model or API responses that return
 * JSON either inside code blocks or embedded in text.
 *
 * ✅ Handles:
 * 1. ```json ... ``` code blocks
 * 2. Direct JSON strings (plain objects or arrays)
 * 3. Embedded JSON substrings as fallback
 *
 * ⚠️ Returns an empty array if parsing fails or no JSON is found.
 *
 * @param message - The message object or string that may contain JSON.
 * @returns Parsed JSON (object/array) or [] if extraction fails.
 */
export const extractJsonFromMessage = (message: any) => {
  try {
    const content = typeof message === 'string' ? message : message?.content || '';

    // 1️⃣ Try to extract JSON from a ```json ... ``` code block
    const jsonBlockMatch = content.match(/```json([\s\S]*?)```/);
    if (jsonBlockMatch) {
      const jsonText = jsonBlockMatch[1].trim();
      return JSON.parse(jsonText);
    }

    // 2️⃣ If no code block, check if message itself is valid JSON
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return JSON.parse(trimmed);
    }

    // 3️⃣ Fallback: find the first JSON-like substring in text
    const jsonFallbackMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonFallbackMatch) {
      return JSON.parse(jsonFallbackMatch[1]);
    }

    // 4️⃣ If no JSON found, return an empty array as safe default
    return [];
  } catch (error) {
    console.error('❌ Failed to parse JSON from message:', error);
    return [];
  }
};
