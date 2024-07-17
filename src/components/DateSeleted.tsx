"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { DateFormateConvert } from "@/lib/formateDateConvert"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function DatePickerWithRange({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date("2024-05-25T18:00:00.000+00:00"),
        to: new Date("2024-05-29T18:00:00.000+00:00"),
    });

    const dateFrom = DateFormateConvert(date?.from as any);
    const dateTo = DateFormateConvert(date?.to as any);

    // React.useEffect(() => {
    //     function handleFrom(term: string) {
    //         const params = new URLSearchParams(searchParams);
    //         if (term) {
    //             params.set("from", term);
    //         } else {
    //             params.delete("from");
    //         }
    //         replace(`${pathname}?${params.toString()}`);
    //     };
    //     handleFrom(dateFrom);
    //     function handleTo(term: string) {
    //         const params = new URLSearchParams(searchParams);
    //         if (term) {
    //             params.set("to", term);
    //         } else {
    //             params.delete("to");
    //         }
    //         replace(`${pathname}?${params.toString()}`);
    //     };
    //     handleTo(dateTo);
    // }, [dateFrom, dateTo, searchParams, pathname, replace]);

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "PPP")} -{" "}
                                    {format(date.to, "PPP")}
                                </>
                            ) : (
                                format(date.from, "PPP")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
