import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { FileText, ScrollText } from "lucide-react";

const sections = [
  {
    id: "accounts",
    title: "Accounts and Membership",
    content: `If you create an account on the Website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it. We may monitor and review new accounts before you may sign in and start using the Services. Providing false contact information of any kind may result in the termination of your account. You must immediately notify us of any unauthorized uses of your account or any other breaches of security. We will not be liable for any acts or omissions by you, including any damages of any kind incurred as a result of such acts or omissions. We may suspend, disable, or delete your account (or any part thereof) if we determine that you have violated any provision of this Agreement or that your conduct or content would tend to damage our reputation and goodwill. If we delete your account for the foregoing reasons, you may not re-register for our Services. We may block your email address and Internet protocol address to prevent further registration.`,
  },
  {
    id: "billing",
    title: "Billing and Payments",
    content: `You shall pay all fees or charges to your account in accordance with the fees, charges, and billing terms in effect at the time a fee or charge is due and payable. We accept payments via M-Pesa, PayPal, and other methods as displayed at checkout. We reserve the right to change products and product pricing at any time. We also reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing and/or shipping address. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the email and/or phone number provided at the time the order was made.`,
  },
  {
    id: "shipping",
    title: "Shipping and International Orders",
    content: `BF Suma Royal delivers products across Kenya, with same-day or next-day delivery available in select cities including Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Kakamega, Thika, Nyeri, Machakos, and Kitale. We also ship to select international destinations. Shipping fees and estimated delivery times are calculated at checkout based on your location. International orders may be subject to customs duties and import taxes, which are the responsibility of the buyer. We are not responsible for delays caused by customs processing or third-party courier services.`,
  },
  {
    id: "accuracy",
    title: "Accuracy of Information",
    content: `Occasionally there may be information on the Website that contains typographical errors, inaccuracies, or omissions that may relate to product descriptions, pricing, availability, promotions, and offers. We reserve the right to correct any errors, inaccuracies, or omissions, and to change or update information or cancel orders if any information on the Website or Services is inaccurate at any time without prior notice (including after you have submitted your order). We undertake no obligation to update, amend, or clarify information on the Website including, without limitation, pricing information, except as required by law.`,
  },
  {
    id: "links",
    title: "Links to Other Resources",
    content: `Although the Website and Services may link to other resources (such as websites, mobile applications, etc.), we are not, directly or indirectly, implying any approval, association, sponsorship, endorsement, or affiliation with any linked resource, unless specifically stated herein. We are not responsible for examining or evaluating, and we do not warrant the offerings of, any businesses or individuals or the content of their resources. We do not assume any responsibility or liability for the actions, products, services, and content of any other third parties. Your linking to any other off-site resources is at your own risk.`,
  },
  {
    id: "prohibited",
    title: "Prohibited Uses",
    items: [
      "For any unlawful purpose.",
      "To solicit others to perform or participate in any unlawful acts.",
      "To violate any international, national, or local regulations, rules, or laws.",
      "To infringe upon or violate our intellectual property rights or the intellectual property rights of others.",
      "To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability.",
      "To submit false or misleading information.",
      "To upload or transmit viruses or any other type of malicious code.",
      "To spam, phish, pharm, pretext, spider, crawl, or scrape.",
      "For any obscene or immoral purpose.",
      "To interfere with or circumvent the security features of the Website and Services.",
    ],
    footer:
      "We reserve the right to terminate your use of the Website and Services for violating any of the prohibited uses.",
  },
  {
    id: "ip",
    title: "Intellectual Property Rights",
    content: `This Agreement does not transfer to you any intellectual property owned by BF Suma Royal or third parties, and all rights, titles, and interests in and to such property will remain solely with BF Suma Royal. All trademarks, service marks, graphics, and logos used in connection with the Website and Services are trademarks or registered trademarks of BF Suma Royal or its licensors. Other trademarks, service marks, graphics, and logos used in connection with the Website and Services may be the trademarks of other third parties. Your use of the Website and Services grants you no right or license to reproduce or otherwise use any of BF Suma Royal or third-party trademarks.`,
  },
  {
    id: "health",
    title: "Health & Supplement Disclaimer",
    content: `The products sold on this Website are dietary and nutritional supplements. They are not intended to diagnose, treat, cure, or prevent any disease. Statements regarding products have not been evaluated by any food or drug regulatory authority. Results may vary. Always consult a qualified healthcare professional before starting any supplement regimen, especially if you are pregnant, nursing, taking medication, or have an existing medical condition. BF Suma Royal does not provide medical advice.`,
  },
  {
    id: "warranty",
    title: "Disclaimer of Warranty",
    content: `You agree that the Service is provided on an "as is" and "as available" basis and that your use of the Website and Services is solely at your own risk. We expressly disclaim all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We make no warranty that the Services will meet your requirements, or that the Service will be uninterrupted, timely, secure, or error-free; nor do we make any warranty as to the results that may be obtained from the use of the Service or as to the accuracy or reliability of any information obtained through the Service.`,
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    content: `To the fullest extent permitted by applicable law, in no event will BF Suma Royal, its affiliates, directors, officers, employees, agents, suppliers, or licensors be liable to any person for any indirect, incidental, special, punitive, cover, or consequential damages (including, without limitation, damages for lost profits, revenue, sales, goodwill, use of content, impact on business, business interruption, loss of anticipated savings, loss of business opportunity) however caused, under any theory of liability. To the maximum extent permitted by applicable law, the aggregate liability of BF Suma Royal relating to the Services will be limited to the amounts actually paid by you to BF Suma Royal for the prior one-month period prior to the first event giving rise to such liability.`,
  },
  {
    id: "indemnification",
    title: "Indemnification",
    content: `You agree to indemnify and hold BF Suma Royal and its affiliates, directors, officers, employees, agents, suppliers, and licensors harmless from and against any liabilities, losses, damages, or costs, including reasonable attorneys' fees, incurred in connection with or arising from any third-party allegations, claims, actions, disputes, or demands asserted against any of them as a result of or relating to your use of the Website and Services or any willful misconduct on your part.`,
  },
  {
    id: "severability",
    title: "Severability",
    content: `If any provision or portion of any provision of this Agreement shall be held to be illegal, invalid, or unenforceable by a court of competent jurisdiction, the remaining provisions or portions thereof shall remain in full force and effect.`,
  },
  {
    id: "disputes",
    title: "Dispute Resolution",
    content: `The formation, interpretation, and performance of this Agreement and any disputes arising out of it shall be governed by the substantive and procedural laws of the Republic of Kenya. The exclusive jurisdiction and venue for actions related to the subject matter hereof shall be the courts located in Kenya, and you hereby submit to the personal jurisdiction of such courts.`,
  },
  {
    id: "assignment",
    title: "Assignment",
    content: `You may not assign, resell, sub-license, or otherwise transfer or delegate any of your rights or obligations hereunder, in whole or in part, without our prior written consent. We are free to assign any of our rights or obligations hereunder to any third party as part of the sale of all or substantially all of our assets or stock, or as part of a merger.`,
  },
  {
    id: "changes",
    title: "Changes and Amendments",
    content: `We reserve the right to modify this Agreement or its terms related to the Website and Services at any time at our discretion. When we do, we will revise the updated date at the bottom of this page. Your continued use of the Website and Services after the effective date of the revised Agreement will constitute your consent to those changes.`,
  },
];

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Terms & Conditions | BF SUMA Royal Kenya"
        description="Read the Terms & Conditions for using the BF SUMA Royal website and services. Covers accounts, billing, shipping, intellectual property, and dispute resolution under Kenyan law."
        path="/terms"
      />
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <ScrollText className="w-4 h-4" />
              Legal
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Terms &amp; Conditions
            </h1>
            <p className="text-muted-foreground mt-3 text-sm">
              Last updated: 27 March 2026
            </p>
          </div>

          {/* Intro */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-8">
            <p className="text-sm text-muted-foreground leading-relaxed">
              These terms and conditions (&ldquo;Agreement&rdquo;) set forth the general terms and conditions of your use of the{" "}
              <strong className="text-foreground">bfsumaroyal.com</strong> website (&ldquo;Website&rdquo; or &ldquo;Service&rdquo;) and any of its related products and services (collectively, &ldquo;Services&rdquo;). This Agreement is legally binding between you (&ldquo;User&rdquo;, &ldquo;you&rdquo; or &ldquo;your&rdquo;) and{" "}
              <strong className="text-foreground">BF Suma Royal</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;), a business operating from Kakamega, Kenya. By accessing and using the Website and Services, you acknowledge that you have read, understood, and agree to be bound by the terms of this Agreement.
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="bg-muted/40 rounded-2xl border border-border/50 p-5 mb-8">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Table of Contents
            </h2>
            <ol className="grid sm:grid-cols-2 gap-1.5 text-xs text-primary list-decimal list-inside">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
              <li>
                <a href="#acceptance" className="hover:underline">
                  Acceptance of These Terms
                </a>
              </li>
            </ol>
          </nav>

          {/* Sections */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-8">
            {sections.map((s) => (
              <section key={s.id} id={s.id}>
                <h2 className="text-lg font-bold text-foreground mb-3">{s.title}</h2>
                {s.content && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
                )}
                {s.items && (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">
                      In addition to other terms set forth in this Agreement, you are prohibited from using the Website and Services or Content:
                    </p>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {s.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    {s.footer && (
                      <p className="text-sm text-muted-foreground mt-3 font-medium">{s.footer}</p>
                    )}
                  </>
                )}
              </section>
            ))}

            {/* Acceptance */}
            <section id="acceptance" className="pt-4 border-t border-border">
              <h2 className="text-lg font-bold text-foreground mb-3">
                Acceptance of These Terms
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By accessing and using BF Suma Royal, you acknowledge that you have read these Terms &amp; Conditions and agree to be bound by them. If you do not agree to abide by the terms of this Agreement, you are not authorized to access or use the Website and Services.
              </p>
            </section>

            {/* Contact */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Questions about these terms? Contact us at{" "}
                <a href="mailto:bfsumaroyal@gmail.com" className="text-primary hover:underline">
                  bfsumaroyal@gmail.com
                </a>{" "}
                or WhatsApp{" "}
                <a href="https://wa.me/254795454053" className="text-primary hover:underline">
                  +254 795 454053
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;
