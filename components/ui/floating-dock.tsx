import { cn } from "@/lib/utils";
import { TableOfContents } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useState } from "react";

export const FloatingDock = ({
  items,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative block lg:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            // Posicionar debajo del botón
            className="absolute top-0 ml-12 flex max-w-[calc(100vw-80px)] flex-row gap-2 overflow-x-auto"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: -10,
                  transition: { delay: (items.length - 1 - idx) * 0.05 }, // último se va último
                }}
                transition={{ delay: idx * 0.05 }} // primero entra primero
              >
                <a
                  href={item.href}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-baseSecondColor/20 bg-white"
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-baseSecondColor"
      >
        <TableOfContents className="h-5 w-5 text-white" />
      </button>
    </div>
  );
};
