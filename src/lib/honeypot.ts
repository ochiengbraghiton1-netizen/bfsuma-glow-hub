/**
 * Honeypot validation utilities for bot detection.
 * 
 * A honeypot is an invisible form field that only bots fill out.
 * If the field has a value, it's likely a bot submission.
 */

/**
 * Checks if the honeypot field indicates a bot submission.
 * @param honeypotValue - The value of the honeypot field
 * @returns true if the submission appears to be from a bot
 */
export function isBot(honeypotValue: string | undefined | null): boolean {
  return Boolean(honeypotValue && honeypotValue.trim().length > 0);
}

/**
 * Validates that the honeypot field is empty (indicating a human user).
 * @param honeypotValue - The value of the honeypot field
 * @returns true if the submission appears legitimate (honeypot is empty)
 */
export function isHuman(honeypotValue: string | undefined | null): boolean {
  return !isBot(honeypotValue);
}

/**
 * Default honeypot field name that's enticing to bots
 */
export const HONEYPOT_FIELD_NAME = "website";
