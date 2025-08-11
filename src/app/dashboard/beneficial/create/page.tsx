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
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { BeneficialCreateIProps, BeneficialDonorIProps, BeneficialIProps, BranchIProps } from "@/types"
import { useState, useMemo } from "react"
import { UploadButton } from "@/lib/uploadthing"
import TailwindEditor from "@/components/editor"
import { Loader2, Check, ChevronsUpDown } from "lucide-react"
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

const formSchema = z.object({
    name: z.string(),
    username: z.string(),
    village: z.string(),
    postoffice: z.string(),
    photoUrl: z.array(z.string()),
    about: z.string(),
    district: z.string(),
    policeStation: z.string(),
    occupation: z.string(),
    phone: z.string(),
    beneficialDonorId: z.string().optional(),
    nidFront: z.string(),
    nidBack: z.string(),
});

function BeneficialCreate() {
    const [openDonor, setOpenDonor] = useState(false);
    const [open, setOpen] = useState(false);


    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    // Fetch districts and police stations data
    const { data: districts = [], isLoading: isLoadingDistricts } = useQuery<District[]>({
        queryKey: ['districts'],
        queryFn: async () => {
            const response = await axios.get('/api/district'); // Replace with your actual API endpoint
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Fetch beneficial donors data
    const { data: beneficialDonors = [], isLoading: isLoadingDonors, error: donorsError } = useQuery<BeneficialDonor[]>({
        queryKey: ['beneficialDonors'],
        queryFn: async () => {
            try {
                const response = await axios.get('/api/beneficial/donor'); // Replace with your actual API endpoint
                console.log('Beneficial Donors Response:', response.data);
                return response.data;
            } catch (error) {
                console.error('Error fetching beneficial donors:', error);
                // Fallback to mock data for testing
                return [
                    {
                        id: "68979e361cd5041bc3fcfa74",
                        name: "MD RAKIBUL HASAN -4",
                        username: "rakibul",
                        live: "Rangpur",
                        homeTown: "kurigram",
                        photoUrl: "https://utfs.io/f/7f5d5659-450e-480b-b460-55e0381eb385-2f4opl.jpg",
                        about: "<h2> Hello I am rakibul</h2>",
                        createAt: "2025-08-09T19:15:02.334Z"
                    }
                ];
            }
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: 1, // Only retry once
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
    useMemo(() => {
        if (selectedDistrictName) {
            form.setValue("policeStation", "");
        }
    }, [selectedDistrictName, form]);

    // 2. Define a mutation.
    const { mutate, isPending } = useMutation({
        mutationFn: async ({ name, username, village, postoffice, district, policeStation, occupation, photoUrl, about, beneficialDonorId, phone, nidFront, nidBack }: BeneficialCreateIProps) => {
            const response = await axios.post("/api/beneficial", {
                name, username, village, postoffice, district, policeStation, occupation, photoUrl, about, beneficialDonorId, phone, nidFront, nidBack
            });
            return response.data;
        },
    });

    // 3. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log({ values })
        const { username, name, photoUrl, about, village, postoffice, district, policeStation, occupation, beneficialDonorId, phone, nidFront, nidBack } = values;
        mutate({ username, name, photoUrl, about, village, nidBack, nidFront, postoffice, district, policeStation, occupation, beneficialDonorId, phone }, {
            onSuccess: ({ message, result }: { message: string, result: BeneficialIProps }) => {
                toast.success(message);
                console.log({ result });
                router.refresh();
            },
            onError: ({ message }: { message: any }) => {
                toast.error(message);
            }
        });
    };

    return (
        <div className="">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <div className=" flex flex-col gap-3">
                        <h2 className=" text-lg text-color-main font-medium">Branch Information</h2>
                        <div className=" grid grid-cols-3 gap-3 border-2 rounded p-3">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="username" {...field} />
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
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name" {...field} />
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
                                        <FormLabel>Village</FormLabel>
                                        <FormControl>
                                            <Input placeholder="village" {...field} />
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
                                        <FormLabel>Post Office</FormLabel>
                                        <FormControl>
                                            <Input placeholder="home town" {...field} />
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
                                        <FormLabel>District</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingDistricts}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingDistricts ? "Loading districts..." : "Select district"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {districts.map((district) => (
                                                    <SelectItem key={district.name} value={district.name}>
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
                                render={({ field }) => {
                                    return (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Police Station</FormLabel>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button

                                                            role="combobox"
                                                            aria-expanded={open}
                                                            disabled={!selectedDistrictName || availablePoliceStations.length === 0 || isLoadingDistricts}
                                                            className={cn(
                                                                "w-full justify-between",
                                                                !field.value && "text-muted-foreground",
                                                                (!selectedDistrictName || availablePoliceStations.length === 0 || isLoadingDistricts) && "opacity-50"
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
                                                                            field.onChange(station.value === field.value ? "" : station.value);
                                                                            setOpen(false);
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
                                    );
                                }}
                            />

                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Occupation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="occupation" {...field} />
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
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="phone" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="beneficialDonorId"
                                render={({ field }) => {

                                    return (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Beneficial Donor</FormLabel>
                                            <Popover open={openDonor} onOpenChange={setOpenDonor}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button

                                                            role="combobox"
                                                            aria-expanded={open}
                                                            disabled={isLoadingDonors}
                                                            className={cn(
                                                                "w-full justify-between",
                                                                !field.value && "text-muted-foreground",
                                                                isLoadingDonors && "opacity-50"
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
                                                                        ? `Error loading donors: ${donorsError.message}`
                                                                        : "No donor found."}
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {availableDonors.map((donor) => (
                                                                    <CommandItem
                                                                        value={donor.searchText}
                                                                        key={donor.value}
                                                                        onSelect={() => {
                                                                            field.onChange(donor.value === field.value ? "" : donor.value);
                                                                            setOpen(false);
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
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            <FormField
                                control={form.control}
                                name="photoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className=" flex justify-center">Profile Picture</FormLabel>
                                        <FormControl>
                                            <UploadButton
                                                className="ut-button:bg-color-sub  ut-button:ut-readying:bg-color-sub/80"
                                                endpoint="branchUploader"
                                                onClientUploadComplete={(res) => {
                                                    let photos = [];
                                                    // Do something with the response
                                                    for (const file of res) {
                                                        photos.push(file.url);
                                                    }
                                                    console.log({ photos })
                                                    field.onChange(photos)
                                                    toast.success("Image Upload successfully")
                                                }}
                                                onUploadError={(error: Error) => {
                                                    toast.error(error.message);
                                                }}
                                            />
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
                                        <FormLabel className=" flex justify-center">NID Front</FormLabel>
                                        <FormControl>
                                            <UploadButton
                                                className="ut-button:bg-color-sub  ut-button:ut-readying:bg-color-sub/80"
                                                endpoint="imageUploader"
                                                onClientUploadComplete={(res) => {
                                                    field.onChange(res[0].url)
                                                    toast.success("Image Upload successfully")
                                                }}
                                                onUploadError={(error: Error) => {
                                                    toast.error(error.message);
                                                }}
                                            />
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
                                        <FormLabel className=" flex justify-center">NID Back</FormLabel>
                                        <FormControl>
                                            <UploadButton
                                                className="ut-button:bg-color-sub  ut-button:ut-readying:bg-color-sub/80"
                                                endpoint="imageUploader"
                                                onClientUploadComplete={(res) => {
                                                    field.onChange(res[0].url)
                                                    toast.success("Image Upload successfully")
                                                }}
                                                onUploadError={(error: Error) => {
                                                    toast.error(error.message);
                                                }}
                                            />
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
                                <FormLabel>About</FormLabel>
                                <FormControl>
                                    <TailwindEditor description={field.name} onChange={field.onChange} value={field.value} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isPending} >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default BeneficialCreate;