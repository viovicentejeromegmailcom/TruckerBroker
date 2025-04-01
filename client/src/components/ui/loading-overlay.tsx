import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
    isLoading: boolean;
    text?: string;
}

export function LoadingOverlay({ isLoading, text = "Loading..." }: LoadingOverlayProps) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-gray-700">{text}</p>
            </div>
        </div>
    );
}