/**
 * CartSyncIndicator Component
 * Shows a subtle indicator when cart is syncing to database
 * Requirements: 7.2, 7.4 - Show error indicator and retry button
 */

"use client";

import { Cloud, CloudOff, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CartSyncIndicatorProps {
  isSyncing: boolean;
  syncError: string | null;
  lastSyncedAt: number | null;
  onRetry?: () => void;
  className?: string;
}

export function CartSyncIndicator({
  isSyncing,
  syncError,
  lastSyncedAt,
  onRetry,
  className,
}: CartSyncIndicatorProps) {
  // Don't show anything if never synced and no error
  if (!isSyncing && !syncError && !lastSyncedAt) {
    return null;
  }

  // Determine if this is a network error (offline)
  const isOffline =
    syncError?.toLowerCase().includes("network") ||
    syncError?.toLowerCase().includes("fetch");

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground",
          className
        )}
      >
        {isSyncing ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Menyimpan...</span>
          </>
        ) : syncError ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5">
                  {isOffline ? (
                    <WifiOff className="h-3 w-3 text-amber-500" />
                  ) : (
                    <CloudOff className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={cn(
                      isOffline ? "text-amber-600" : "text-red-500"
                    )}
                  >
                    {isOffline ? "Offline" : "Gagal sinkronisasi"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-xs">
                  {isOffline
                    ? "Tidak ada koneksi internet. Keranjang akan disimpan secara lokal."
                    : syncError}
                </p>
              </TooltipContent>
            </Tooltip>
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs hover:bg-red-50"
                onClick={onRetry}
                title="Coba sinkronisasi lagi"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Coba Lagi
              </Button>
            )}
          </>
        ) : lastSyncedAt ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <Cloud className="h-3 w-3 text-green-500" />
                <span className="text-green-600">Tersimpan</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">
                Terakhir disinkronkan:{" "}
                {new Date(lastSyncedAt).toLocaleTimeString("id-ID")}
              </p>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
