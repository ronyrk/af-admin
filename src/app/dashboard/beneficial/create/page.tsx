"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { BeneficialCreateIProps, BeneficialDonorIProps, BeneficialIProps, BranchIProps } from "@/types"
import { useState, useMemo, useEffect } from "react"
import { UploadButton } from "@/lib/uploadthing"
import TailwindEditor from "@/components/editor"
import { Loader2, Check, ChevronsUpDown, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Types for your API data
interface PoliceStation {
    id: string;
    name: string;
    districtId: string;
    createdAt: string;
}

interface District {
    id: string;
    name: string;
    createdAt: string;
    policeStations: PoliceStation[];
}

interface BeneficialDonor {
    id: string;
    name: string;
    username: string;
    live: string;
    homeTown: string;
    photoUrl: string;
    about: string;
    createAt: string;
}

// Enhanced form schema with proper validation
const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username is too long"),
    village: z.string().min(1, "Village is required").max(100, "Village name is too long"),
    postoffice: z.string().min(1, "Post office is required").max(100, "Post office name is too long"),
    photoUrl: z.array(z.string().url("Invalid image URL")).min(1, "Profile picture is required"),
    about: z.string().min(10, "About must be at least 10 characters"),
    district: z.string().min(1, "District is required"),
    policeStation: z.string().min(1, "Police station is required"),
    occupation: z.string().min(1, "Occupation is required").max(100, "Occupation is too long"),
    phone: z.string().regex(/^[0-9]{11}$/, "Phone must be exactly 11 digits"),
    beneficialDonorId: z.string().optional(),
    nidFront: z.string().url("NID front image is required"),
    nidBack: z.string().url("NID back image is required"),
});

function BeneficialCreate() {
    const [openDonor, setOpenDonor] = useState(false);
    const [openPoliceStation, setOpenPoliceStation] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const router = useRouter();

    // 1. Define your form with default values
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            username: "",
            village: "",
            postoffice: "",
            photoUrl: [],
            about: "",
            district: "",
            policeStation: "",
            occupation: "",
            phone: "",
            beneficialDonorId: "",
            nidFront: "",
            nidBack: "",
        }
    });

    // Fetch districts and police stations data with better error handling
    const { data: districts = [], isLoading: isLoadingDistricts, error: districtsError } = useQuery<District[]>({
        queryKey: ['districts'],
        queryFn: async () => {
            try {
                const response = await axios.get('/api/district');
                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error('Invalid districts data format');
                }
                return response.data;
            } catch (error) {
                console.error('Error fetching districts:', error);
                if (axios.isAxiosError(error)) {
                    throw new Error(`Failed to fetch districts: ${error.response?.data?.message || error.message}`);
                }
                throw new Error('Failed to fetch districts');
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
    });

    // Fetch beneficial donors data with improved error handling
    const { data: beneficialDonors = [], isLoading: isLoadingDonors, error: donorsError } = useQuery<BeneficialDonor[]>({
        queryKey: ['beneficialDonors'],
        queryFn: async () => {
            try {
                const response = await axios.get('/api/beneficial/donor');
                console.log('Beneficial Donors Response:', response.data);

                if (!response.data || !Array.isArray(response.data)) {
                    console.warn('Invalid donors data format, using fallback');
                    return [];
                }

                return response.data;
            } catch (error) {
                console.error('Error fetching beneficial donors:', error);
                // Return empty array instead of mock data for production
                return [];
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
    });

    // Watch district changes to reset police station
    const selectedDistrictName = form.watch("district");

    // Find selected district data
    const selectedDistrict = useMemo(() => {
        return districts.find(district => district.name === selectedDistrictName);
    }, [districts, selectedDistrictName]);

    // UseMemo for police stations based on selected district
    const availablePoliceStations = useMemo(() => {
        if (!selectedDistrict || !selectedDistrict.policeStations) {
            return [];
        }
        return selectedDistrict.policeStations.map(station => ({
            value: station.name,
            label: station.name
        }));
    }, [selectedDistrict]);

    // UseMemo for beneficial donors (transform for combobox)
    const availableDonors = useMemo(() => {
        return beneficialDonors.map(donor => ({
            value: donor.id,
            label: `${donor.name} (${donor.username})`,
            searchText: `${donor.name} ${donor.username} ${donor.live} ${donor.homeTown}`.toLowerCase()
        }));
    }, [beneficialDonors]);

    // Reset police station when district changes
    useEffect(() => {
        if (selectedDistrictName) {
            form.setValue("policeStation", "");
        }
    }, [selectedDistrictName, form]);

    // Clear submit error when form changes
    useEffect(() => {
        const subscription = form.watch(() => {
            if (submitError) {
                setSubmitError(null);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, submitError]);

    // 2. Define a mutation with improved error handling
    const { mutate, isPending } = useMutation({
        mutationFn: async (data: BeneficialCreateIProps) => {
            try {
                const response = await axios.post("/api/beneficial", data);
                return response.data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message = error.response?.data?.message || error.message;
                    throw new Error(message);
                }
                throw error;
            }
        },
        onSuccess: ({ message, result }: { message: string, result: BeneficialIProps }) => {
            toast.success(message);
            form.reset(); // Reset form after successful submission
            router.push("/dashboard/beneficial");
            router.refresh();
        },
        onError: (error: Error) => {
            const errorMessage = error.message || "An unexpected error occurred";
            setSubmitError(errorMessage);
            toast.error(errorMessage);
        }
    });

    // 3. Define a submit handler with validation
    function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitError(null);

        // Additional client-side validation
        if (!values.photoUrl || values.photoUrl.length === 0) {
            toast.error("Profile picture is required");
            return;
        }

        if (!values.nidFront || !values.nidBack) {
            toast.error("Both NID front and back images are required");
            return;
        }

        const { username, name, photoUrl, about, village, postoffice, district, policeStation, occupation, beneficialDonorId, phone, nidFront, nidBack } = values;

        mutate({
            username,
            name,
            photoUrl,
            about,
            village,
            postoffice,
            district,
            policeStation,
            occupation,
            beneficialDonorId: beneficialDonorId || undefined,
            phone,
            nidFront,
            nidBack
        });
    }

    // Loading state for the entire form
    if (isLoadingDistricts && districts.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading form data...</span>
            </div>
        );
    }

    // Error state for critical data
    if (districtsError) {
        return (
            <div className="p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load districts data. Please refresh the page or try again later.
                        {districtsError.message && ` Error: ${districtsError.message}`}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="">
            {submitError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitError}</AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <div className="flex flex-col gap-3">
                        <h2 className="text-lg text-color-main font-medium">Beneficial Information</h2>
                        <div className="grid grid-cols-3 gap-3 border-2 rounded p-3">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter username"
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter full name"
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="village"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Village *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter village name"
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="postoffice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Post Office *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter post office"
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* District Select */}
                            <FormField
                                control={form.control}
                                name="district"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>District *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isLoadingDistricts || isPending}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={
                                                        isLoadingDistricts
                                                            ? "Loading districts..."
                                                            : "Select district"
                                                    } />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {districts.map((district) => (
                                                    <SelectItem key={district.id} value={district.name}>
                                                        {district.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Police Station Searchable Select */}
                            <FormField
                                control={form.control}
                                name="policeStation"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Police Station *</FormLabel>
                                        <Popover open={openPoliceStation} onOpenChange={setOpenPoliceStation}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"secondary"}
                                                        role="combobox"
                                                        aria-expanded={openPoliceStation}
                                                        disabled={!selectedDistrictName || availablePoliceStations.length === 0 || isPending}
                                                        className={cn(
                                                            "w-full justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value && selectedDistrict
                                                            ? availablePoliceStations.find((station) => station.value === field.value)?.label
                                                            : selectedDistrictName
                                                                ? availablePoliceStations.length > 0
                                                                    ? "Select police station..."
                                                                    : "No police stations available"
                                                                : "Select district first"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Search police station..."
                                                        className="h-9"
                                                    />
                                                    <CommandList className="max-h-[200px]">
                                                        <CommandEmpty>No police station found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {availablePoliceStations.map((station) => (
                                                                <CommandItem
                                                                    value={station.label}
                                                                    key={station.value}
                                                                    onSelect={() => {
                                                                        field.onChange(station.value);
                                                                        setOpenPoliceStation(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            station.value === field.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {station.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Occupation *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter occupation"
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="01XXXXXXXXX"
                                                {...field}
                                                disabled={isPending}
                                                maxLength={11}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Beneficial Donor Selection */}
                            <FormField
                                control={form.control}
                                name="beneficialDonorId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Beneficial Donor (Optional)</FormLabel>
                                        <Popover open={openDonor} onOpenChange={setOpenDonor}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openDonor}
                                                        disabled={isLoadingDonors || isPending}
                                                        className={cn(
                                                            "w-full justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? availableDonors.find((donor) => donor.value === field.value)?.label
                                                            : isLoadingDonors
                                                                ? "Loading donors..."
                                                                : "Search and select donor..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Search by name, username, or location..."
                                                        className="h-9"
                                                    />
                                                    <CommandList className="max-h-[250px]">
                                                        <CommandEmpty>
                                                            {isLoadingDonors
                                                                ? "Loading donors..."
                                                                : donorsError
                                                                    ? "Error loading donors"
                                                                    : "No donor found."}
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {availableDonors.map((donor) => (
                                                                <CommandItem
                                                                    value={donor.searchText}
                                                                    key={donor.value}
                                                                    onSelect={() => {
                                                                        field.onChange(donor.value === field.value ? "" : donor.value);
                                                                        setOpenDonor(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            donor.value === field.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{donor.label.split(' (')[0]}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            @{beneficialDonors.find(d => d.id === donor.value)?.username} • {beneficialDonors.find(d => d.id === donor.value)?.live}
                                                                        </span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {donorsError && (
                                            <span className="text-xs text-destructive">
                                                Failed to load donors
                                            </span>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Upload Fields */}
                            <FormField
                                control={form.control}
                                name="photoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex justify-center">Profile Picture *</FormLabel>
                                        <FormControl>
                                            <div className="w-full">
                                                <UploadButton
                                                    className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80 w-full"
                                                    endpoint="branchUploader"
                                                    onClientUploadComplete={(res) => {
                                                        const photos = res.map(file => file.url);
                                                        field.onChange(photos);
                                                        toast.success("Profile picture uploaded successfully");
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        toast.error(`Upload failed: ${error.message}`);
                                                    }}
                                                />
                                                {field.value && field.value.length > 0 && (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        ✓ {field.value.length} image(s) uploaded
                                                    </p>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nidFront"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex justify-center">NID Front *</FormLabel>
                                        <FormControl>
                                            <div className="w-full">
                                                <UploadButton
                                                    className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80 w-full"
                                                    endpoint="imageUploader"
                                                    onClientUploadComplete={(res) => {
                                                        field.onChange(res[0].url);
                                                        toast.success("NID front uploaded successfully");
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        toast.error(`Upload failed: ${error.message}`);
                                                    }}
                                                />
                                                {field.value && (
                                                    <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nidBack"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex justify-center">NID Back *</FormLabel>
                                        <FormControl>
                                            <div className="w-full">
                                                <UploadButton
                                                    className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80 w-full"
                                                    endpoint="imageUploader"
                                                    onClientUploadComplete={(res) => {
                                                        field.onChange(res[0].url);
                                                        toast.success("NID back uploaded successfully");
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        toast.error(`Upload failed: ${error.message}`);
                                                    }}
                                                />
                                                {field.value && (
                                                    <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="about"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>About *</FormLabel>
                                <FormControl>
                                    <TailwindEditor
                                        description={field.name}
                                        onChange={field.onChange}
                                        value={field.value}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Create Beneficial"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}

export default BeneficialCreate;