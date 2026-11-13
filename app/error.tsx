"use client";

import { useState } from "react";
import { BrowserStorageError, resetDamagedBrowserEntry, STORAGE_LABELS } from "@/lib/browserStorage";
import StatusPanel from "@/components/StatusPanel";

export default function ErrorPage({ error, retry, reset }: { error: unknown; retry: () => void; reset: () => void }) {
    const [actionError, setActionError] = useState<string | null>(null);
    const storageError = error instanceof BrowserStorageError ? error : null;
    const label = storageError ? STORAGE_LABELS[storageError.key] : "";
    const canReset = storageError?.reason === "invalid" && storageError.raw !== null;
    // Storage recovery only needs a fresh client render, including when offline.
    const recover = storageError ? reset : retry;
    const buttonClass = "w-full cursor-pointer rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-zinc-100 hover:bg-zinc-800";

    return (
        <main className="flex min-h-svh flex-col items-center bg-black px-6 py-16 text-zinc-100">
            <StatusPanel title={storageError ? "Browser data needs attention" : "Page unavailable"} tone="warning">
                <div className="flex flex-col gap-4">
                    <p>
                        {storageError
                            ? storageError.reason === "invalid"
                                ? `${label} could not be read. The original data is still saved in this browser. Download it before resetting.`
                                : `${label} could not be accessed. Allow this site to use browser storage, then retry. No reset is available while the data cannot be read.`
                            : "This page could not be displayed. Please try again."}
                    </p>
                    {canReset && (
                        <button className={buttonClass} onClick={() => {
                            try {
                                const url = URL.createObjectURL(new Blob([storageError.raw!], { type: "text/plain;charset=utf-8" }));
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `recipe-vault-${storageError.key.replaceAll(":", "-")}-recovery.txt`;
                                link.click();
                                setTimeout(() => URL.revokeObjectURL(url), 1000);
                                setActionError(null);
                            } catch {
                                setActionError("The recovery file could not be downloaded. Please try again before resetting.");
                            }
                        }}>Download original data</button>
                    )}
                    <button className={buttonClass} onClick={() => { setActionError(null); recover(); }}>Retry</button>
                    {canReset && (
                        <>
                            <p>Reset removes only this local entry. Anything not saved elsewhere will need to be recovered from your download.</p>
                            <button className={buttonClass} onClick={() => {
                                if (!confirm(`Reset ${label.toLowerCase()} in this browser? This removes this local entry only. Download its original data first; records not in the database may otherwise be lost.`)) return;
                                try {
                                    resetDamagedBrowserEntry(storageError);
                                    recover();
                                } catch (failure) {
                                    setActionError(failure instanceof Error ? failure.message : "The data could not be reset.");
                                }
                            }}>Reset damaged entry</button>
                        </>
                    )}
                    {actionError && <p role="alert" className="text-red-300">{actionError}</p>}
                </div>
            </StatusPanel>
        </main>
    );
}
