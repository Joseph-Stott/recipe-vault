import type { ReactNode } from "react";

type StatusPanelProps = {
    title: string;
    children: ReactNode;
    tone?: "neutral" | "warning" | "error";
    action?: ReactNode;
};

const toneStyles = {
    neutral: "border-zinc-700 bg-zinc-900 text-zinc-300",
    warning: "border-yellow-700 bg-yellow-950/30 text-yellow-100",
    error: "border-red-800 bg-red-950/40 text-red-100",
};

export default function StatusPanel({
    title,
    children,
    tone = "neutral",
    action,
}: StatusPanelProps) {
    return (
        <section
            className={`w-full max-w-sm rounded-lg border p-4 text-center text-sm ${toneStyles[tone]}`}
        >
            <h2 className="mb-2 font-semibold text-zinc-50">
                {title}
            </h2>
            <div className="text-pretty leading-6">
                {children}
            </div>
            {action && (
                <div className="mt-3">
                    {action}
                </div>
            )}
        </section>
    );
}
