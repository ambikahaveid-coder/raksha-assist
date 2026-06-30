import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const defaultFaqs = [
  {
    question: "What is Raksha Assist and how is it different from insurance?",
    answer: "Raksha Assist is a membership-based emergency assistance program, NOT an insurance product. Unlike insurance which works on lengthy reimbursement processes, we provide immediate financial support directly to hospitals during medical emergencies. There's no paperwork hassle or waiting for funds."
  },
  {
    question: "What types of emergencies are covered?",
    answer: "We provide assistance for serious accidents requiring hospitalization (more than 24 hours), medical emergencies like heart attacks, strokes, and other life-threatening conditions. The assistance benefits depend on your membership plan - from basic individual plans to comprehensive family and senior citizen plans."
  },
  {
    question: "How does the emergency assistance process work?",
    answer: "When an emergency occurs: 1) Request assistance through our app or helpline, 2) Upload hospital admission proof and doctor's note, 3) Our team verifies with the hospital directly, 4) Once approved (usually within 2 hours), funds are transferred directly to the hospital in stages based on treatment needs."
  },
  {
    question: "What are the assistance limits for each plan?",
    answer: "Individual Basic (₹1,499/year): Up to ₹1 Lakh | Individual Standard (₹2,499/year): Up to ₹2 Lakh | Family Basic (₹3,999/year): Up to ₹2 Lakh for family | Family Premium (₹7,999/year): Up to ₹5 Lakh for up to 8 family members. All plans include 24/7 helpline support. We offer 10 plan categories including senior citizen, maternity, vehicle, and business plans."
  },
  {
    question: "When does my membership become active?",
    answer: "Your membership is activated immediately after successful payment verification. You will receive a digital membership card instantly. However, there is a standard 30-day waiting period before you can request emergency assistance (except for accident cases which are covered from day one)."
  },
  {
    question: "Can I add my family members to my plan?",
    answer: "Yes! Our Family plans allow you to add family members. Family Basic covers up to 4 members, while Family Premium covers up to 8 family members with higher assistance limits and VIP benefits."
  }
];

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
}

export function FAQ() {
  const { data: faqs = [] } = useQuery<Faq[]>({
    queryKey: ["public-faqs"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/faqs");
        if (!res.ok) return [];
        const data = await res.json();
        return data;
      } catch {
        return [];
      }
    }
  });

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
            Got Questions? We Have Answers
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about Raksha Assist membership and emergency assistance.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4" data-testid="faq-accordion">
            {displayFaqs.map((faq, index) => (
              <AccordionItem 
                key={'id' in faq ? (faq as Faq).id : index} 
                value={`item-${index}`}
                className="bg-slate-50 border border-slate-100 rounded-xl px-6 data-[state=open]:bg-white data-[state=open]:shadow-md data-[state=open]:border-primary/20 transition-all"
                data-testid={`faq-item-${index}`}
              >
                <AccordionTrigger 
                  className="text-left font-semibold text-slate-900 hover:text-primary py-5 [&[data-state=open]]:text-primary"
                  data-testid={`faq-trigger-${index}`}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5" data-testid={`faq-content-${index}`}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Still have questions? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="tel:+918143752025" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
              data-testid="link-faq-call-support"
            >
              Call: +91 81437 52025
            </a>
            <a 
              href="https://wa.me/918143752025" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
              data-testid="link-faq-whatsapp-support"
            >
              WhatsApp Support
            </a>
            <a 
              href="mailto:support@rakshaassist.com" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              data-testid="link-faq-email-support"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
