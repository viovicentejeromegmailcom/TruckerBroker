import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, AlertTriangle } from "lucide-react";

export default function RegistrationSuccess() {
    const [, setLocation] = useLocation();
    const [countdown, setCountdown] = useState(10);

    // Parse URL query params manually
    const getQueryParams = () => {
        const searchParams = new URLSearchParams(window.location.search);
        return {
            email: searchParams.get("email") || "",
            status: searchParams.get("status") || "pending",
            message: searchParams.get("message") || "",
            verified: searchParams.get("verified") === "true"
        };
    };

    const { email, status, message, verified } = getQueryParams();

    // Start a countdown to redirect to login
    useEffect(() => {
        if (verified) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setLocation("/auth");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [verified, setLocation]);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8 p-6 bg-white shadow-lg rounded-lg">
                    {verified ? (
                        <div className="text-center">
                            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
                            <p className="text-gray-600 mb-6">
                                Your email has been successfully verified. Your account is now awaiting admin approval.
                                We'll notify you once your account has been approved.
                            </p>
                            <Alert className="mb-4 border-blue-200 bg-blue-50">
                                <AlertTitle>Redirecting to login page...</AlertTitle>
                                <AlertDescription>
                                    You'll be redirected in {countdown} seconds.
                                </AlertDescription>
                            </Alert>
                            <Button onClick={() => setLocation("/auth")}>
                                Go to Login Now
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                                <Mail className="h-10 w-10 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
                            <p className="text-gray-600 mb-6">
                                {message || "Thank you for registering with TruckLink. We've sent a verification email to your inbox."}
                            </p>

                            <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <AlertTitle>Next Steps</AlertTitle>
                                <AlertDescription className="mt-2">
                                    <ol className="list-decimal list-inside space-y-1 text-left">
                                        <li>Check your email inbox at <strong>{email}</strong></li>
                                        <li>Click the verification link in the email</li>
                                        <li>Wait for admin approval of your account</li>
                                        <li>Once approved, you can log in to your account</li>
                                    </ol>
                                </AlertDescription>
                            </Alert>

                            <Button onClick={() => setLocation("/auth")}>
                                Return to Login
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}