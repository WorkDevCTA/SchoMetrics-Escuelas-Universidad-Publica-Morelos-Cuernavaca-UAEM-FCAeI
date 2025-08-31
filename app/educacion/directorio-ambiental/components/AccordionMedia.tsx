import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; //
import ResourceCard from "./ResourceCard";
import type { AccordionMediaItem } from "../data";

interface AccordionMediaProps {
  title: string;
  items: AccordionMediaItem[];
}

const AccordionMedia: React.FC<AccordionMediaProps> = ({ title, items }) => {
  return (
    <div className="mb-10">
      <h2 className="mb-5 text-2xl font-semibold text-gray-800">{title}</h2>
      <Accordion type="single" collapsible className="w-full space-y-3">
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <AccordionItem
              value={item.id}
              key={item.id}
              className="rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <AccordionTrigger className="px-6 py-4 text-lg font-medium text-gray-700 hover:text-orange-600 hover:no-underline">
                <div className="flex items-center gap-3">
                  {ItemIcon && <ItemIcon className="h-6 w-6 text-orange-600" />}
                  {item.title}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {item.items.map((mediaItem) => (
                    <ResourceCard
                      key={mediaItem.id}
                      resource={mediaItem}
                      type={item.id === "websites" ? "website" : "media"}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default AccordionMedia;
