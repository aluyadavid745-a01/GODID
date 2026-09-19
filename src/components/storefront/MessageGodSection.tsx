'use client'
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";
import { buildWhatsAppUrl } from "../../utils/whatsapp";

export const MessageGodSection = () => {
  const [message, setMessage] = useState("");

  const send = () => {
    if (!message.trim()) return;
    window.open(buildWhatsAppUrl(`✦ Message to GODID:\n\n${message}`), "_blank");
    setMessage("");
  };

  return (
    <section className="border-y-4 border-accent bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-8">
        <motion.div
          className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">God in Every Design</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.05em] md:text-6xl">
              Message<br />God.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-white/60">
              A question. A creative idea. A style request. Whatever it is — the studio is listening.
            </p>
          </div>

          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send(); }}
              placeholder="Say anything..."
              rows={4}
              className="w-full resize-none border border-white/20 bg-white/5 p-5 font-body text-base text-white placeholder:text-white/30 focus:border-white/50 focus:outline-none"
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">Continues on WhatsApp</span>
              <button
                onClick={send}
                disabled={!message.trim()}
                className="flex items-center gap-2.5 border border-white px-6 py-3 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-accent hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={13} />
                Send to God
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
