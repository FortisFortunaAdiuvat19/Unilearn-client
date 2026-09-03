import React from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";

const PHONE_NUMBER = "+2349076960499";
const PHONE_DISPLAY = "+234 907 696 0499";
// WhatsApp's click-to-chat API takes the number without the leading "+".
const WHATSAPP_NUMBER = PHONE_NUMBER.replace("+", "");

export default function Support() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[90rem] mx-auto px-6 md:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-4">
              Support
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Need help? Reach out directly.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-10">
              For any questions or issues with UniLearn, call or message us directly.
            </p>

            <div className="border border-border/50 rounded-sm p-8 inline-block">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Contact Number
              </p>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="font-display text-2xl md:text-3xl font-semibold tracking-tight hover:text-primary transition-colors"
              >
                {PHONE_DISPLAY}
              </a>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="flex items-center justify-center gap-2 border border-primary/40 text-primary px-5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
