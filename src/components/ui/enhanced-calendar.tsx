import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { format, getYear, getMonth, setYear, setMonth, addMonths, subMonths } from "date-fns";

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  bookedSlots?: Array<{provider_id: string, date: string, time: string}>;
  providerId?: string;
};

function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  bookedSlots = [],
  providerId,
  ...props
}: EnhancedCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  // Generate year options (current year + next 2 years)
  const currentYear = getYear(new Date());
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear + i);
  
  // Month options
  const monthOptions = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" }
  ];

  const handleYearChange = (year: string) => {
    const newDate = setYear(currentMonth, parseInt(year));
    setCurrentMonth(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(currentMonth, parseInt(month));
    setCurrentMonth(newDate);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Check if a date has booked slots
  const hasBookedSlots = (date: Date) => {
    if (!providerId || !bookedSlots.length) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookedSlots.some(slot => 
      slot.provider_id === providerId && slot.date === dateStr
    );
  };

  return (
    <div className="space-y-4 bg-card border rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b">
        <CalendarIcon className="h-4 w-4 text-teal" />
        <div>
          <h3 className="font-medium text-foreground">Select Date</h3>
          <p className="text-sm text-muted-foreground">Choose your preferred appointment date</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={getYear(currentMonth).toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-24 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={getMonth(currentMonth).toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handlePreviousMonth}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 w-9")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 w-9")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <DayPicker
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        showOutsideDays={showOutsideDays}
        className={cn("w-full", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "hidden",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex items-center justify-center",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
          ),
          day_selected: "bg-teal text-teal-foreground hover:bg-teal hover:text-teal-foreground focus:bg-teal focus:text-teal-foreground",
          day_today: "bg-accent text-accent-foreground font-medium",
          day_outside: "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        modifiers={{
          hasBookings: (date) => hasBookedSlots(date)
        }}
        modifiersClassNames={{
          hasBookings: "relative after:absolute after:bottom-0.5 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1 after:h-1 after:bg-teal after:rounded-full"
        }}
        {...props}
      />

      {/* Simple Legend */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-teal rounded-full"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-accent rounded-full"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-teal rounded-full"></div>
          <span>Has Bookings</span>
        </div>
      </div>
    </div>
  );
}
EnhancedCalendar.displayName = "EnhancedCalendar";

export { EnhancedCalendar };