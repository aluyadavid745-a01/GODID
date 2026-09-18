import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { X } from "lucide-react";

export const Modal = ({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) => (
  <AnimatePresence>
    {open ? (
      <motion.div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-0 sm:place-items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section className="max-h-[92vh] w-full overflow-y-auto bg-porcelain p-4 shadow-soft sm:max-w-xl sm:p-6" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className="min-w-0 break-words font-display text-lg font-semibold sm:text-xl">{title}</h2>
            <button className="focus-ring p-2" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
          </div>
          {children}
        </motion.section>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
