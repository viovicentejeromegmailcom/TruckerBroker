import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import { truckerRegisterSchema, vehicleSchema } from "@shared/schema";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Plus, Trash2, Upload, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export default function TruckerRegistrationForm() {
    const { truckerRegisterMutation } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof truckerRegisterSchema>>({
        resolver: zodResolver(truckerRegisterSchema),
        defaultValues: {
            userType: "trucker",
            username: "",
            password: "",
            confirmPassword: "",
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
            // Company info fields are still required by the schema but no longer displayed in UI
            companyName: "Independent Trucker",
            address: "",
            city: "",
            state: "",
            zip: "",
            contactNumber: "",
            businessEmail: "",
            vehicles: [
                {
                    vehicleType: "",
                    vehicleMake: "",
                    plateNumber: "",
                    weightCapacity: "",
                    truckDocuments: "",
                }
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "vehicles",
    });

    async function onSubmit(values: z.infer<typeof truckerRegisterSchema>) {
        try {
            setError(null);
            // Get personal email and phone and use for business contact info too
            const modifiedValues = {
                ...values,
                // Set business email to personal email if not provided
                businessEmail: values.businessEmail || values.email,
                // Set contact number to personal phone if not provided
                contactNumber: values.contactNumber || values.phone
            };
            await truckerRegisterMutation.mutateAsync(modifiedValues);
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Registration failed. Please try again.");
        }
    }

    return (
        <Form {...form}>
            <LoadingOverlay
                isLoading={truckerRegisterMutation.isPending}
                text="Creating your account. Please wait..."
            />
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            {...field}
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
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="(555) 123-4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="johndoe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Company information section removed per client request */}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Legal & Compliance Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="bir2303Certificate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>BIR 2303 Certificate</FormLabel>
                                        <FormControl>
                                            <div className="flex">
                                                <Input
                                                    type="file"
                                                    id="bir2303Certificate"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            field.onChange(file.name);
                                                        }
                                                    }}
                                                />
                                                <Input
                                                    readOnly
                                                    value={field.value || ""}
                                                    placeholder="No file selected"
                                                    className="rounded-r-none"
                                                />
                                                <Button
                                                    type="button"
                                                    className="rounded-l-none"
                                                    variant="secondary"
                                                    onClick={() => document.getElementById('bir2303Certificate')?.click()}
                                                >
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Browse
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="businessPermit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Permit</FormLabel>
                                        <FormControl>
                                            <div className="flex">
                                                <Input
                                                    type="file"
                                                    id="businessPermit"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            field.onChange(file.name);
                                                        }
                                                    }}
                                                />
                                                <Input
                                                    readOnly
                                                    value={field.value || ""}
                                                    placeholder="No file selected"
                                                    className="rounded-r-none"
                                                />
                                                <Button
                                                    type="button"
                                                    className="rounded-l-none"
                                                    variant="secondary"
                                                    onClick={() => document.getElementById('businessPermit')?.click()}
                                                >
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Browse
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="insuranceCoverage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Insurance Coverage</FormLabel>
                                        <FormControl>
                                            <div className="flex">
                                                <Input
                                                    type="file"
                                                    id="insuranceCoverage"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            field.onChange(file.name);
                                                        }
                                                    }}
                                                />
                                                <Input
                                                    readOnly
                                                    value={field.value || ""}
                                                    placeholder="No file selected"
                                                    className="rounded-r-none"
                                                />
                                                <Button
                                                    type="button"
                                                    className="rounded-l-none"
                                                    variant="secondary"
                                                    onClick={() => document.getElementById('insuranceCoverage')?.click()}
                                                >
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Browse
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="permitToOperate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Permit to Operate</FormLabel>
                                        <FormControl>
                                            <div className="flex">
                                                <Input
                                                    type="file"
                                                    id="permitToOperate"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            field.onChange(file.name);
                                                        }
                                                    }}
                                                />
                                                <Input
                                                    readOnly
                                                    value={field.value || ""}
                                                    placeholder="No file selected"
                                                    className="rounded-r-none"
                                                />
                                                <Button
                                                    type="button"
                                                    className="rounded-l-none"
                                                    variant="secondary"
                                                    onClick={() => document.getElementById('permitToOperate')?.click()}
                                                >
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Browse
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl">Vehicle Information</CardTitle>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => append({
                                vehicleType: "",
                                vehicleMake: "",
                                plateNumber: "",
                                weightCapacity: "",
                                truckDocuments: "",
                            })}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Vehicle
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Accordion type="multiple" className="w-full">
                            {fields.map((field, index) => (
                                <AccordionItem key={field.id} value={`item-${index}`}>
                                    <AccordionTrigger className="text-lg">
                                        Vehicle {index + 1}
                                        {form.watch(`vehicles.${index}.vehicleType`) &&
                                            ` - ${form.watch(`vehicles.${index}.vehicleType`)}`
                                        }
                                        {form.watch(`vehicles.${index}.plateNumber`) &&
                                            ` (${form.watch(`vehicles.${index}.plateNumber`)})`
                                        }
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`vehicles.${index}.vehicleType`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Vehicle Type</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g., Box Truck, Semi-Truck" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`vehicles.${index}.vehicleMake`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Vehicle Make</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g., Volvo, Freightliner" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`vehicles.${index}.plateNumber`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Plate Number</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g., ABC-1234" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`vehicles.${index}.weightCapacity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Weight Capacity</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g., 20000 kg" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name={`vehicles.${index}.truckDocuments`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Truck OR/CR</FormLabel>
                                                        <FormControl>
                                                            <div className="flex">
                                                                <Input
                                                                    type="file"
                                                                    id={`truckDocuments-${index}`}
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            field.onChange(file.name);
                                                                        }
                                                                    }}
                                                                />
                                                                <Input
                                                                    readOnly
                                                                    value={field.value || ""}
                                                                    placeholder="No file selected"
                                                                    className="rounded-r-none"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    className="rounded-l-none"
                                                                    variant="secondary"
                                                                    onClick={() => document.getElementById(`truckDocuments-${index}`)?.click()}
                                                                >
                                                                    <Upload className="h-4 w-4 mr-1" />
                                                                    Browse
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {fields.length > 1 && (
                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Remove Vehicle
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={truckerRegisterMutation.isPending}
                >
                    {truckerRegisterMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        "Create Trucker Account"
                    )}
                </Button>
            </form>
        </Form>
    );
}
