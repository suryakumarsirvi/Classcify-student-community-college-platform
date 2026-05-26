import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Calendar } from "./calendar";

const CalendarPicker = () => {
    const [date, setDate] = useState(new Date());

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    {date ? format(date, "PPP") : "Select a Date"}
                    <CalendarIcon className="w-5 h-5 opacity-70" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
                {/* <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                /> */}
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow"
                />
            </PopoverContent>
        </Popover>
    );
};

export default CalendarPicker;
