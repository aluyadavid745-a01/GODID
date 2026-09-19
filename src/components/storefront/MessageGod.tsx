'use client'
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { buildWhatsAppUrl } from "../../utils/whatsapp";

export const MessageGod = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const send = () => {
    if (!message.trim()) return;
    window.open(buildWhatsAppUrl(`✦ Message to GODID:\n\n${message}`), "_blank");
    setMessage("");
    setOpen(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-ink px-5 py-3 font-display text-[11px] font-bold uppercase tracking-[0.13em] text-porcelain shadow-soft transition-colors hover:bg-accent"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Message God"
      >
        <Sparkles size={13} />
        Message God
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              className="w-full bg-porcelain shadow-soft sm:max-w-lg"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="border-b-4 border-accent bg-ink px-6 py-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">GODID Studio</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">Message God</h2>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-1 text-white/50 transition hover:text-white"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="mt-2 text-sm text-white/60">Speak your truth. The studio is listening.</p>
              </div>

              <div className="p-6">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send(); }}
                  placeholder="Say anything to GODID — a question, a thought, a creative idea..."
                  rows={5}
                  className="w-full resize-none border border-line bg-bone p-4 font-body text-sm text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none"
                  autoFocus
                />
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Continues on WhatsApp</span>
                  <button
                    onClick={send}
                    disabled={!message.trim()}
                    className="flex items-center gap-2 bg-ink px-5 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-porcelain transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={13} />
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
