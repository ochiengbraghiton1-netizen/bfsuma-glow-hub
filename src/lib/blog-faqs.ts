export interface BlogFaqInput {
  id?: string;
  question?: string | null;
  answer?: string | null;
  display_order?: number | null;
}

export interface BlogFaq {
  id?: string;
  question: string;
  answer: string;
}

/**
 * Keeps only FAQ rows that have both a question and an answer, trims them,
 * and preserves display order. Used by the admin editor before saving and by
 * the public article page before rendering.
 */
export function normalizeFaqItems(items: BlogFaqInput[] | null | undefined): BlogFaq[] {
  if (!items?.length) return [];
  return items
    .slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((f) => ({
      id: f.id,
      question: (f.question || '').trim(),
      answer: (f.answer || '').trim(),
    }))
    .filter((f) => f.question.length > 0 && f.answer.length > 0);
}

export function hasFaqs(items: BlogFaqInput[] | null | undefined): boolean {
  return normalizeFaqItems(items).length > 0;
}
