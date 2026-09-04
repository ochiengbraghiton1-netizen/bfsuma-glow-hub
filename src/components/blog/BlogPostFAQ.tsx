import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { normalizeFaqItems, type BlogFaq } from '@/lib/blog-faqs';

interface BlogPostFAQProps {
  postId: string;
}

const BlogPostFAQ = ({ postId }: BlogPostFAQProps) => {
  const [faqs, setFaqs] = useState<BlogFaq[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from('blog_post_faqs')
        .select('id, question, answer, display_order')
        .eq('post_id', postId)
        .order('display_order');
      if (active) setFaqs(normalizeFaqItems(data));
    };
    load();
    return () => {
      active = false;
    };
  }, [postId]);

  if (faqs.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, idx) => (
          <AccordionItem key={faq.id || idx} value={faq.id || `faq-${idx}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground whitespace-pre-line">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default BlogPostFAQ;
