"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function TestCalendar() {
  const [date, setDate] = useState<Date>();

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" type="button">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MMMM do, yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[9999]">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              console.log("✅ Selected:", d);
              setDate(d);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
