"use client";

import { BeneficialIProps, BeneficialUpdatedIProps } from '@/types';
import Image from 'next/image'
import React, { useMemo, useState, useEffect } from 'react'
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
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { UploadButton } from "@/lib/uploadthing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronsUpDown, SquarePen } from 'lucide-react';
import UpdatedEditor from './UpdatedEditor';
import { Popover } from '@radix-ui/react-popover';
import { PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { cn } from '@/lib/utils';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { BeneficialTransactionCreate } from './beneficial-transaction';

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

function BeneficialProfileEdit({ data }: { data: BeneficialIProps }) {
    const [openDonor, setOpenDonor] = useState(false);
    const [open, setOpen] = useState(false);
    const { id, username, name, photoUrl, about, village, postoffice, district, policeStation, occupation, phone, beneficialDonorId, nidFront, nidBack } = data;
    const [editMode, setEditMode] = useState<boolean>(false);
    const router = useRouter();
    const [image, setImage] = useState<string[]>(data.photoUrl);
    const [showImage, setShowImage] = useState<string[]>(data.photoUrl);
    const [nidFrontImage, setNidFrontImage] = useState<string>(data.nidFront);
    const [nidBackImage, setNidBackImage] = useState<string>(data.nidBack);



    // Drag and drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const upload = image.length >= 1;

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name,
            username,
            village,
            postoffice,
            photoUrl: image,
            about,
            district,
            policeStation,
            occupation,
            phone,
            beneficialDonorId,
            nidFront,
            nidBack
        }
    });

    // Enhanced photo management with drag and drop
    const deletePhoto = (indexToDelete: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newImages = showImage.filter((_, index) => index !== indexToDelete);
        setShowImage(newImages);
        setImage(newImages);
        form.setValue('photoUrl', newImages);
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');

        setTimeout(() => {
            if (e.target instanceof HTMLElement) {
                e.target.style.opacity = '0.5';
            }
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedIndex !== null && index !== draggedIndex) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);

        if (draggedIndex === null || draggedIndex === dropIndex) {
            return;
        }

        const newImages = [...showImage];
        const draggedImage = newImages[draggedIndex];

        // Remove dragged item
        newImages.splice(draggedIndex, 1);

        // Insert at new position
        const actualDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        newImages.splice(actualDropIndex, 0, draggedImage);

        setShowImage(newImages);
        setImage(newImages);
        form.setValue('photoUrl', newImages);
        setDraggedIndex(null);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '1';
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Move to front on double click
    const moveToFront = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        if (index > 0) {
            const newImages = [...showImage];
            const imageToMove = newImages[index];
            newImages.splice(index, 1);
            newImages.unshift(imageToMove);
            setShowImage(newImages);
            setImage(newImages);
            form.setValue('photoUrl', newImages);
        }
    };

    // Move to back on right click
    const moveToBack = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        if (index < showImage.length - 1) {
            const newImages = [...showImage];
            const imageToMove = newImages[index];
            newImages.splice(index, 1);
            newImages.push(imageToMove);
            setShowImage(newImages);
            setImage(newImages);
            form.setValue('photoUrl', newImages);
        }
    };

    // Fetch districts and police stations data
    const { data: districts = [], isLoading: isLoadingDistricts } = useQuery<District[]>({
        queryKey: ['districts'],
        queryFn: async () => {
            const response = await axios.get('/api/district');
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    // Fetch beneficial donors data
    const { data: beneficialDonors = [], isLoading: isLoadingDonors, error: donorsError } = useQuery<BeneficialDonor[]>({
        queryKey: ['beneficial'],
        queryFn: async () => {
            try {
                const response = await axios.get('/api/beneficial/donor');
                console.log('Beneficial Donors Response:', response.data);
                return response.data;
            } catch (error) {
                console.error('Error fetching beneficial donors:', error);
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
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    // Watch district changes to reset police station
    const selectedDistrictName = form.watch("district");
    const currentPoliceStation = form.watch("policeStation");

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

    // Check if current police station is valid for the selected district
    const isPoliceStationValidForDistrict = useMemo(() => {
        if (!currentPoliceStation || !selectedDistrict || !selectedDistrict.policeStations) {
            return false;
        }
        return selectedDistrict.policeStations.some(station => station.name === currentPoliceStation);
    }, [currentPoliceStation, selectedDistrict]);

    // UseMemo for beneficial donors (transform for combobox)
    const availableDonors = useMemo(() => {
        return beneficialDonors.map(donor => ({
            value: donor.id,
            label: `${donor.name} (${donor.username})`,
            searchText: `${donor.name} ${donor.username} ${donor?.live} ${donor.homeTown}`.toLowerCase()
        }));
    }, [beneficialDonors]);

    // Effect to handle district changes and police station validation
    useEffect(() => {
        if (selectedDistrictName && !isLoadingDistricts) {
            const district = districts.find(d => d.name === selectedDistrictName);
            if (district) {
                // If police station is set but not valid for the current district, clear it
                const currentPS = form.getValues("policeStation");
                if (currentPS && !district.policeStations.some(station => station.name === currentPS)) {
                    form.setValue("policeStation", "");
                }
            }
        }
    }, [selectedDistrictName, districts, isLoadingDistricts, form]);

    // 2. Define a mutation.
    const { mutate, isPending } = useMutation({
        mutationFn: async ({ name, photoUrl, about, village, postoffice, district, policeStation, occupation, phone, beneficialDonorId, nidFront, nidBack }: BeneficialUpdatedIProps) => {
            const response = await axios.patch(`/api/beneficial/${username}`, {
                username, name, photoUrl, about, village, postoffice, district, policeStation, occupation, phone, beneficialDonorId, nidFront, nidBack
            });
            return response.data;
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const { name, photoUrl, about, village, postoffice, district, policeStation, occupation, phone, beneficialDonorId, nidFront, nidBack } = values;

        mutate({ name, photoUrl, about, village, postoffice, district, policeStation, occupation, phone, beneficialDonorId, nidFront, nidBack }, {
            onSuccess: ({ message, result }: { message: string, result: BeneficialIProps }) => {
                if (result.id) {
                    toast.success(message);
                } else {
                    toast.error("Profile Updated Failed");
                }
                setEditMode(false);
                router.refresh();
            },
            onError: (error) => {
                console.error('Update error:', error);
                toast.error("Profile Update Failed");
            }
        });
    };

    return (
        <div className="flex flex-col gap-6 relative">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Top Bar Actions */}
                    <div className="absolute flex flex-row gap-2 top-2 right-4 z-50">
                        {editMode && (
                            <div>
                                {isPending ? (
                                    <Button disabled>Loading...</Button>
                                ) : (
                                    <Button className='bg-blue-500 hover:bg-blue-600' disabled={!upload} type="submit">
                                        Save Changes
                                    </Button>
                                )}
                            </div>
                        )}
                        <Button
                            type="button"
                            onClick={() => setEditMode(!editMode)}
                            className="cursor-pointer"
                            variant={editMode ? "destructive" : "secondary"}
                        >
                            <SquarePen />
                            <span className="ml-2">{editMode ? "Cancel Edit" : "Edit"}</span>
                        </Button>
                    </div>

                    <div className="flex md:flex-row flex-col gap-6 px-2">
                        {/* Profile Images */}
                        <div className="basis-4/12 border rounded-lg p-4 flex flex-col items-center bg-white shadow">
                            <Carousel className="w-full max-w-xs">
                                <CarouselContent>
                                    {photoUrl.map((img, index) => (
                                        <CarouselItem key={index}>
                                            <Image
                                                src={img}
                                                alt={`Beneficial Image ${index + 1}`}
                                                width={600}
                                                height={500}
                                                priority
                                                className="object-cover rounded-lg"
                                            />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="absolute left-0 z-10 flex items-center justify-center w-10 h-10 bg-gray-200 text-blue-900 font-extrabold rounded-full shadow-md" />
                                <CarouselNext className="absolute right-0 z-10 flex items-center justify-center w-10 h-10 bg-gray-200 text-blue-900 font-extrabold rounded-full shadow-md" />
                            </Carousel>
                        </div>

                        {/* Profile Info - Keeping your existing form fields */}
                        <div className="basis-8/12 border rounded-lg p-4 flex flex-col gap-4 bg-white shadow">
                            <div className=' grid grid-cols-2 gap-4 mb-4'>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                {editMode ? (
                                                    <Input className="text-xl" {...field} />
                                                ) : (
                                                    <div className="text-xl font-semibold">{field.value}</div>
                                                )}
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
                                            <FormLabel>Home Town</FormLabel>
                                            <FormControl>
                                                {editMode ? (
                                                    <Input className="text-xl" {...field} />
                                                ) : (
                                                    <div className="text-xl">{field.value}</div>
                                                )}
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
                                            <FormLabel>Lives in</FormLabel>
                                            <FormControl>
                                                {editMode ? (
                                                    <Input className="text-xl" {...field} />
                                                ) : (
                                                    <div className="text-xl">{field.value}</div>
                                                )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="occupation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Occupation</FormLabel>
                                            <FormControl>
                                                {editMode ? (
                                                    <Input className="text-xl" {...field} />
                                                ) : (
                                                    <div className="text-xl">{field.value}</div>
                                                )}
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
                                                {editMode ? (
                                                    <Input className="text-xl" {...field} />
                                                ) : (
                                                    <div className="text-xl">{field.value}</div>
                                                )}
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
                                            {editMode ? (
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || ""}
                                                    disabled={isLoadingDistricts}
                                                >
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
                                            ) : (
                                                <div className="text-xl">{field.value}</div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Police Station Searchable Select */}
                                <FormField
                                    control={form.control}
                                    name="policeStation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Police Station</FormLabel>
                                            {editMode ? (
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
                                                                {field.value && isPoliceStationValidForDistrict
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
                                                            <CommandInput placeholder="Search police station..." className="h-9" />
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
                                            ) : (
                                                <div className="text-xl">
                                                    {field.value && isPoliceStationValidForDistrict ? field.value :
                                                        field.value ? `${field.value} (Invalid for selected district)` : 'Not set'}
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Beneficial Donor Select */}
                                <FormField
                                    control={form.control}
                                    name="beneficialDonorId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Beneficial Donor</FormLabel>
                                            {editMode ? (
                                                <Popover open={openDonor} onOpenChange={setOpenDonor}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                role="combobox"
                                                                aria-expanded={openDonor}
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
                                                            <CommandInput placeholder="Search by name, username, or location..." className="h-9" />
                                                            <CommandList className="max-h-[250px]">
                                                                <CommandEmpty>
                                                                    {isLoadingDonors
                                                                        ? "Loading donors..."
                                                                        : donorsError
                                                                            ? `Error loading donors`
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
                                            ) : (
                                                <div className="text-xl">
                                                    {field.value ?
                                                        availableDonors.find(d => d.value === field.value)?.label || 'Unknown Donor' :
                                                        'Not assigned'}
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Photo Management Section */}
                    {editMode && (
                        <div className="border my-4 mx-2 rounded-lg p-4 flex flex-col items-center bg-white shadow">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="text-lg font-semibold">
                                        Photo Management ({showImage.length} photos)
                                    </AccordionTrigger>
                                    <AccordionContent className="flex flex-col gap-4">
                                        {/* Instructions */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                            <p className="text-blue-800 text-sm mb-2">
                                                <strong>Photo Controls:</strong>
                                            </p>
                                            <ul className="text-blue-700 text-xs ml-4 list-disc space-y-1">
                                                <li><strong>Drag & Drop:</strong> Drag photos to reorder them</li>
                                                <li><strong>Double-click:</strong> Move photo to first position</li>
                                                <li><strong>Right-click:</strong> Move photo to last position</li>
                                                <li><strong>Click ×:</strong> Delete the photo</li>
                                            </ul>
                                        </div>

                                        {/* Photo Grid with Drag & Drop */}
                                        {showImage.length === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500 italic">
                                                    No photos uploaded yet.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {showImage.map((url, index) => (
                                                    <div
                                                        key={`${url}-${index}`}
                                                        className="relative group"
                                                        onDragOver={(e) => handleDragOver(e, index)}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={(e) => handleDrop(e, index)}
                                                    >
                                                        {/* Drop indicator */}
                                                        {dragOverIndex === index && draggedIndex !== index && (
                                                            <div className="absolute inset-0 bg-yellow-200 rounded-lg border-2 border-dashed border-yellow-400 animate-pulse -z-10"></div>
                                                        )}

                                                        {/* Photo container */}
                                                        <div
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, index)}
                                                            onDragEnd={handleDragEnd}
                                                            onDoubleClick={(e) => moveToFront(index, e)}
                                                            onContextMenu={(e) => moveToBack(index, e)}
                                                            className={`
                                                                relative cursor-move transform transition-all duration-300 ease-in-out
                                                                hover:scale-105 hover:shadow-lg rounded-lg overflow-hidden
                                                                ${draggedIndex === index
                                                                    ? 'scale-95 rotate-2 shadow-2xl z-50 opacity-75'
                                                                    : 'hover:shadow-xl'
                                                                }
                                                                ${dragOverIndex === index && draggedIndex !== index
                                                                    ? 'scale-110 shadow-lg'
                                                                    : ''
                                                                }
                                                            `}
                                                            style={{
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                willChange: 'transform, opacity, box-shadow'
                                                            }}
                                                            title="Drag to reorder • Double-click for first • Right-click for last"
                                                        >
                                                            <Image
                                                                src={url}
                                                                alt={`Photo ${index + 1}`}
                                                                width={200}
                                                                height={200}
                                                                priority
                                                                className="object-cover w-full h-32 sm:h-40 rounded-lg"
                                                            />

                                                            {/* Drag handle indicator */}
                                                            {draggedIndex !== index && (
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-30 transition-opacity duration-200 bg-black bg-opacity-20 rounded-lg">
                                                                    <div className="text-white text-sm font-bold">⋮⋮</div>
                                                                </div>
                                                            )}

                                                            {/* Position indicator */}
                                                            <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                                                                {index + 1}
                                                            </div>
                                                        </div>

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={(e) => deletePhoto(index, e)}
                                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg z-20"
                                                            title={`Delete photo ${index + 1}`}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Photo State Display */}
                                        <div className="bg-gray-50 border rounded-lg p-3 mt-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 text-sm">Photo Array State:</h4>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Total photos: <span className="font-mono">{showImage.length}</span>
                                                        {draggedIndex !== null && (
                                                            <span className="ml-4 text-blue-600">
                                                                • Dragging photo #{draggedIndex + 1}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <FormField
                                                        control={form.control}
                                                        name="photoUrl"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <UploadButton
                                                                        className="ut-button:bg-color-sub  ut-button:ut-readying:bg-color-sub/80"
                                                                        endpoint="branchUploader"
                                                                        onClientUploadComplete={(res) => {
                                                                            // Do something with the response
                                                                            for (const file of res) {
                                                                                setImage((prev) => [...prev, file.url]);
                                                                                setShowImage((prev) => [...prev, file.url]);
                                                                                field.onChange([...image, file.url]);
                                                                                form.setValue('photoUrl', [...image, file.url]);
                                                                            }
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
                                                    {showImage.length > 0 && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowImage([]);
                                                                setImage([]);
                                                                form.setValue('photoUrl', []);
                                                            }}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Clear All Photos
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )}

                    {/* About Section */}
                    <div className="p-4 mt-4 bg-white rounded-lg shadow mx-2">
                        <FormField
                            control={form.control}
                            name="about"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>About</FormLabel>
                                    <FormControl>
                                        {editMode ? (
                                            <UpdatedEditor
                                                content={about as string}
                                                description={field.name}
                                                onChange={field.onChange}
                                                value={field.value}
                                            />
                                        ) : (
                                            <div className="py-4" dangerouslySetInnerHTML={{ __html: about?.split("^")[0] as string }} />
                                        )}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* NID Section - Added for completeness */}
                    {editMode && (
                        <div className="border my-4 mx-2 rounded-lg p-4 bg-white shadow">
                            <h3 className="text-lg font-semibold mb-4">NID Documents</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nidFront"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>NID Front</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col gap-2">
                                                    {nidFrontImage && (
                                                        <Image
                                                            src={nidFrontImage}
                                                            alt="NID Front"
                                                            width={200}
                                                            height={120}
                                                            className="object-cover rounded border"
                                                        />
                                                    )}
                                                    <UploadButton
                                                        className="ut-button:bg-green-500 ut-button:ut-readying:bg-green-500/80"
                                                        endpoint="branchUploader"
                                                        onClientUploadComplete={(res) => {
                                                            if (res[0]) {
                                                                setNidFrontImage(res[0].url);
                                                                field.onChange(res[0].url);
                                                                toast.success("NID Front uploaded successfully")
                                                            }
                                                        }}
                                                        onUploadError={(error: Error) => {
                                                            toast.error(error.message);
                                                        }}
                                                    />
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
                                            <FormLabel>NID Back</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col gap-2">
                                                    {nidBackImage && (
                                                        <Image
                                                            src={nidBackImage}
                                                            alt="NID Back"
                                                            width={200}
                                                            height={120}
                                                            className="object-cover rounded border"
                                                        />
                                                    )}
                                                    <UploadButton
                                                        className="ut-button:bg-green-500 ut-button:ut-readying:bg-green-500/80"
                                                        endpoint="branchUploader"
                                                        onClientUploadComplete={(res) => {
                                                            if (res[0]) {
                                                                setNidBackImage(res[0].url);
                                                                field.onChange(res[0].url);
                                                                toast.success("NID Back uploaded successfully")
                                                            }
                                                        }}
                                                        onUploadError={(error: Error) => {
                                                            toast.error(error.message);
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </form>
            </Form>
            {beneficialDonorId && (
                <div>
                    <BeneficialTransactionCreate
                        beneficialDonorId={beneficialDonorId as string}
                        beneficialId={id}
                    />
                </div>
            )}

        </div>
    )
}

export default BeneficialProfileEdit