import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader, Mail, Calendar as CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGenerateReportMutation,
  useUpdateReportSettingMutation,
} from "@/features/report/reportAPI";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useTypedSelector } from "@/app/hook";
import { toast } from "sonner";
import { updateCredentials } from "@/features/auth/authSlice";

const formSchema = z.object({
  email: z.string(),
  frequency: z.string(),
  isEnabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const ScheduleReportForm = ({ onCloseDrawer }: { onCloseDrawer: () => void }) => {
  const dispatch = useAppDispatch();
  const { user, reportSetting } = useTypedSelector((state) => state.auth);

  const [updateReportSetting, { isLoading }] = useUpdateReportSettingMutation();
  const [generateReport, { isLoading: isSending }] = useGenerateReportMutation();

  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      isEnabled: true,
      frequency: "MONTHLY",
    },
  });

  // Prefill user data
  useEffect(() => {
    if (user && reportSetting) {
      form.reset({
        email: user?.email,
        isEnabled: reportSetting?.isEnabled,
        frequency: reportSetting?.frequency,
      });
    }
  }, [user, reportSetting, form]);

  // Handle save (toggle enable/disable)
  const onSubmit = (values: FormValues) => {
    const payload = { isEnabled: values.isEnabled };

    updateReportSetting(payload)
      .unwrap()
      .then(() => {
        dispatch(updateCredentials({ reportSetting: payload }));
        onCloseDrawer();
        toast.success("Report setting updated successfully");
      })
      .catch((error) => {
        toast.error(error.data?.message || "Failed to update report setting");
      });
  };

  // Helper text
  const getScheduleSummary = () => {
    if (!form.watch("isEnabled")) {
      return "Reports are currently deactivated";
    }
    return "Report will be sent once a month on the 1st day of the next month.";
  };

  return (
    <div className="pt-5 px-2.5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="w-full space-y-6 flex-1 px-4">
            {/* Enable/Disable Reports */}
            <FormField
              control={form.control}
              name="isEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Monthly Reports</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {field.value ? "Reports activated" : "Reports deactivated"}
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Email + Frequency */}
            <div className="space-y-6 relative">
              <div className={cn("relative", !form.watch("isEnabled") && "opacity-50")}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input disabled {...field} className="flex-1" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeat On</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Manual Report Section */}
            <div className="space-y-3 border rounded-lg p-4 mt-4">
              <FormLabel className="text-base">Send Report by Date</FormLabel>
              <p className="text-xs text-muted-foreground mb-2">
                Choose a date range to manually generate and send a report to your email.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* From Date Picker */}
                <div className="flex flex-col gap-1.5">
                  <FormLabel className="text-xs">From</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate ? format(fromDate, "MMMM do, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* To Date Picker */}
                <div className="flex flex-col gap-1.5">
                  <FormLabel className="text-xs">To</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !toDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "MMMM do, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                       disabled={(date) => !!fromDate && date < fromDate}

                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

             {/* Send Report Button */}
<Button
  type="button"
  onClick={async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    // ✅ Fix timezone issue (send correct IST/local date instead of UTC)
    const formatLocalDate = (date: Date) => {
      const tzOffset = date.getTimezoneOffset() * 60000; // offset in ms
      return new Date(date.getTime() - tzOffset).toISOString().split("T")[0];
    };

    try {
      const res = await generateReport({
        from: formatLocalDate(fromDate),
        to: formatLocalDate(toDate),
      }).unwrap();

      toast.success(res.message || "Report sent successfully!");
    } catch {
      toast.error("Failed to send report. Please try again.");
    }
  }}
  disabled={isSending}
  className="w-full text-white"
>
  {isSending ? (
    <>
      <Loader className="h-4 w-4 animate-spin mr-2" /> Sending...
    </>
  ) : (
    "Send Report Email"
  )}
</Button>

            </div>

            {/* Summary */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Schedule Summary</h3>
              <p className="text-sm text-muted-foreground">{getScheduleSummary()}</p>
            </div>

            {/* Save Button */}
            <div className="sticky bottom-0 py-2 z-50">
              <Button type="submit" disabled={isLoading} className="w-full text-white">
                {isLoading && <Loader className="h-4 w-4 animate-spin mr-2" />}
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ScheduleReportForm;
