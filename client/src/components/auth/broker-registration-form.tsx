import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { brokerRegisterSchema } from "@shared/schema";
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
import { AlertCircle, Loader2, Upload, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function BrokerRegistrationForm() {
    const { brokerRegisterMutation } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof brokerRegisterSchema>>({
        resolver: zodResolver(brokerRegisterSchema),
        defaultValues: {
            userType: "broker",
            username: "",
            password: "",
            confirmPassword: "",
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
            companyName: "",
            companyAddress: "",
            companyCity: "",
            companyState: "",
            companyZip: "",
            contactNumber: "",
            businessEmail: "",
            contactPersonName: "",
            contactPersonPosition: "",
            dtiSecRegistration: "",
            bir2303Certificate: "",
            mayorsPermit: "",
            bocAccreditation: "",
        },
    });

    async function onSubmit(values: z.infer<typeof brokerRegisterSchema>) {
        try {
            setError(null);
            await brokerRegisterMutation.mutateAsync(values);
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Registration failed. Please try again.");
        }
    }

    return (
        <Form {...form}>
            <LoadingOverlay
                isLoading={brokerRegisterMutation.isPending}
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

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Shipping Inc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="contactNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Contact Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(555) 987-6543" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="businessEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="contact@acmeshipping.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="companyAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Shipping Blvd" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="companyCity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Chicago" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="companyState"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                            <Input placeholder="IL" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="companyZip"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ZIP</FormLabel>
                                        <FormControl>
                                            <Input placeholder="60601" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="contactPersonName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Person Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jane Smith" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contactPersonPosition"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Person Position</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Operations Manager" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Legal & Compliance Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="dtiSecRegistration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>DTI/SEC Registration</FormLabel>
                                        <FormControl>
                                            <div className="flex">
                                                <Input
                                                    type="file"
                                                    id="dtiSecRegistration"
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
                                                    onClick={() => document.getElementById('dtiSecRegistration')?.click()}
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
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="mayorsPermit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mayor's Permit</FormLabel>
                                        <FormControl>
                                            <div className="flex">
                                                <Input
                                                    type="file"
                                                    id="mayorsPermit"
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
                                                    onClick={() => document.getElementById('mayorsPermit')?.click()}
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
                                name="bocAccreditation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bureau of Customs Accreditation</FormLabel>
                                        <FormControl>
                                            <div className="flex">
                                                <Input
                                                    type="file"
                                                    id="bocAccreditation"
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
                                                    onClick={() => document.getElementById('bocAccreditation')?.click()}
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

                <Button
                    type="submit"
                    className="w-full"
                    disabled={brokerRegisterMutation.isPending}
                >
                    {brokerRegisterMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        "Create Broker Account"
                    )}
                </Button>
            </form>
        </Form>
    );
}
