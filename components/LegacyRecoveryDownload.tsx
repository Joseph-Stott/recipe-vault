"use client";

import { useState, useSyncExternalStore } from "react";
import { getLegacyRecoveryJson, subscribeToLegacyRecovery } from "@/lib/legacyRecovery";

export default function LegacyRecoveryDownload() {
    const archive = useSyncExternalStore(
        subscribeToLegacyRecovery, getLegacyRecoveryJson, () => null
    );
    const [error, setError] = useState<string | null>(null);
    if (archive === null) return null;

    return (
        <section className="flex w-full max-w-sm flex-col gap-2 text-center text-sm text-zinc-400">
            <button
                className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-medium text-zinc-100 hover:bg-zinc-800"
                onClick={() => {
                    try {
                        // Read on click so the download includes the latest completed cleanup.
                        const raw = getLegacyRecoveryJson();
                        if (raw === null) throw new Error("Recovery copy is unavailable");
                        const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "recipe-vault-legacy-recovery.json";
                        link.click();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                        setError(null);
                    } catch {
                        setError("Recovery copy could not be downloaded. Please try again.");
                    }
                }}
            >
                Download Legacy Recovery
            </button>
            <p>Original browser copies retained after migration. These are separate from your current database backup.</p>
            {error && <p role="alert" className="text-red-300">{error}</p>}
        </section>
    );
}
