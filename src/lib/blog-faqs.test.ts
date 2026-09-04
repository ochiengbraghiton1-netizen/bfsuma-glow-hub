import { describe, it, expect } from 'vitest';
import { normalizeFaqItems, hasFaqs } from './blog-faqs';

describe('normalizeFaqItems', () => {
  it('returns an empty list when there are no FAQs', () => {
    expect(normalizeFaqItems(null)).toEqual([]);
    expect(normalizeFaqItems(undefined)).toEqual([]);
    expect(normalizeFaqItems([])).toEqual([]);
  });

  it('keeps complete items and trims whitespace', () => {
    expect(
      normalizeFaqItems([{ question: '  How long?  ', answer: '  About 4 weeks. ', display_order: 0 }])
    ).toEqual([{ id: undefined, question: 'How long?', answer: 'About 4 weeks.' }]);
  });

  it('drops items missing a question or an answer', () => {
    const result = normalizeFaqItems([
      { question: 'Q1', answer: 'A1', display_order: 0 },
      { question: '   ', answer: 'A2', display_order: 1 },
      { question: 'Q3', answer: '', display_order: 2 },
    ]);
    expect(result.map((f) => f.question)).toEqual(['Q1']);
  });

  it('orders items by display_order', () => {
    const result = normalizeFaqItems([
      { question: 'second', answer: 'a', display_order: 2 },
      { question: 'first', answer: 'a', display_order: 1 },
      { question: 'third', answer: 'a', display_order: 3 },
    ]);
    expect(result.map((f) => f.question)).toEqual(['first', 'second', 'third']);
  });

  it('reflects removal of an item', () => {
    const items = [
      { id: 'a', question: 'Q1', answer: 'A1', display_order: 0 },
      { id: 'b', question: 'Q2', answer: 'A2', display_order: 1 },
    ];
    const remaining = items.filter((f) => f.id !== 'a');
    expect(normalizeFaqItems(remaining).map((f) => f.id)).toEqual(['b']);
  });
});

describe('hasFaqs', () => {
  it('is false when nothing renderable exists', () => {
    expect(hasFaqs([])).toBe(false);
    expect(hasFaqs([{ question: 'Q', answer: '  ' }])).toBe(false);
  });

  it('is true when at least one complete item exists', () => {
    expect(hasFaqs([{ question: 'Q', answer: 'A' }])).toBe(true);
  });
});
