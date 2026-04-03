import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

type Variant = "danger" | "warning" | "info";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const variantStyles: Record<Variant, { icon: string; button: string }> = {
  danger: {
    icon: "bg-red-500/10 text-red-500",
    button: "bg-red-500 hover:bg-red-600 text-white",
  },
  warning: {
    icon: "bg-amber-500/10 text-amber-500",
    button: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  info: {
    icon: "bg-blue-500/10 text-blue-500",
    button: "bg-blue-500 hover:bg-blue-600 text-white",
  },
};

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const styles = variantStyles[variant];

  // Focus the confirm button when opened
  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="relative z-10 mx-4 w-full max-w-md animate-in zoom-in-95 fade-in duration-200 rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${styles.icon}`}>
          <AlertTriangle size={22} />
        </div>

        {/* Content */}
        <h2
          id="confirm-title"
          className="text-center text-lg font-semibold text-foreground"
        >
          {title}
        </h2>
        <p
          id="confirm-desc"
          className="mt-2 text-center text-sm text-muted-foreground"
        >
          {description}
        </p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${styles.button}`}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
