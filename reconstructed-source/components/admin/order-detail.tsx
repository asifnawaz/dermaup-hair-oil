"use client";

import {
  ArrowLeft,
  Check,
  CircleX,
  ExternalLink,
  LoaderCircle,
  Mail,
  MapPin,
  Package,
  Send,
  StickyNote,
  Truck,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useConfirm } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  Order,
  OrderActivityLog,
  OrderItem,
} from "@/lib/db/schema";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export interface OrderDetailProps {
  order: Order;
  activity: OrderActivityLog[];
  items: OrderItem[];
  onRefresh?: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

export function OrderDetail({
  order,
  activity,
  items,
  onRefresh,
}: OrderDetailProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [busyAction, setBusyAction] = React.useState<string | null>(null);
  const [shipping, setShipping] = React.useState({
    courierName: "",
    trackingNumber: "",
    trackingUrl: "",
  });
  const [note, setNote] = React.useState("");

  const refresh = () => {
    if (onRefresh) onRefresh();
    else router.push(`/backoffice/orders/${order.id}`);
  };

  const patchOrder = async (
    body: Record<string, unknown>,
    actionLabel: string,
  ) => {
    setBusyAction(actionLabel);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as {
        success?: boolean;
        error?: string;
      };
      if (json.success) {
        toast.success(`Order ${actionLabel} successfully`);
        refresh();
      } else {
        toast.error(json.error || `Failed to ${actionLabel}`);
      }
    } catch {
      toast.error(`Failed to ${actionLabel}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleCancelOrder = async () => {
    const approved = await confirm({
      description: "Are you sure you want to cancel this order?",
      variant: "destructive",
      confirmLabel: "Cancel Order",
    });
    if (approved) {
      await patchOrder({ orderStatus: "cancelled" }, "cancelled");
    }
  };

  const handleVerifyPayment = async () => {
    setBusyAction("verify");
    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/verify`,
        { method: "POST" },
      );
      const json = (await response.json()) as {
        success?: boolean;
        error?: string;
      };
      if (json.success || response.ok) {
        toast.success("Payment verified");
        refresh();
      } else {
        toast.error(json.error || "Failed to verify payment");
      }
    } catch {
      toast.error("Failed to verify payment");
    } finally {
      setBusyAction(null);
    }
  };

  const handleShip = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!shipping.courierName || !shipping.trackingNumber) return;
    setBusyAction("ship");
    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/ship`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shipping),
        },
      );
      const json = (await response.json()) as {
        success?: boolean;
        error?: string;
      };
      if (json.success || response.ok) {
        toast.success("Order shipped — notification sent");
        refresh();
      } else {
        toast.error(json.error || "Failed to ship order");
      }
    } catch {
      toast.error("Failed to ship order");
    } finally {
      setBusyAction(null);
    }
  };

  const handleResendEmail = async (emailType: string) => {
    setBusyAction(`email-${emailType}`);
    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/resend-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailType }),
        },
      );
      response.ok
        ? toast.success("Email sent successfully")
        : toast.error("Failed to send email");
    } catch {
      toast.error("Failed to send email");
    } finally {
      setBusyAction(null);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setBusyAction("note");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() }),
      });
      const json = (await response.json()) as { success?: boolean };
      if (json.success) {
        toast.success("Note added");
        setNote("");
        refresh();
      } else toast.error("Failed to add note");
    } catch {
      toast.error("Failed to add note");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Created {order.createdAt ? formatDate(order.createdAt) : "—"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span
            className={cn(
              "rounded-lg border px-4 py-2 font-medium capitalize",
              statusColors[order.orderStatus || "pending"],
            )}
          >
            {order.orderStatus}
          </span>
          {order.orderStatus === "pending" ? (
            <Button
              size="sm"
              disabled={busyAction !== null}
              onClick={() =>
                patchOrder({ orderStatus: "confirmed" }, "confirmed")
              }
            >
              {busyAction === "confirmed" ? (
                <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-1 h-4 w-4" />
              )}
              Confirm
            </Button>
          ) : null}
          {order.orderStatus !== "delivered" &&
          order.orderStatus !== "cancelled" ? (
            <Button
              variant="destructive"
              size="sm"
              disabled={busyAction !== null}
              onClick={handleCancelOrder}
            >
              {busyAction === "cancelled" ? (
                <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <CircleX className="mr-1 h-4 w-4" />
              )}
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border bg-background p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <User className="h-5 w-5 text-primary" />
              Customer Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" value={order.customerName} />
              <Field label="Phone" value={order.customerPhone} />
              <Field label="Email" value={order.customerEmail} />
              <Field
                label="Language"
                value={order.language?.toUpperCase()}
              />
            </div>
          </section>

          <section className="rounded-xl border bg-background p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <MapPin className="h-5 w-5 text-primary" />
              Delivery Address
            </h2>
            <p className="font-medium">{order.address}</p>
            <p className="text-muted-foreground">{order.city}</p>
          </section>

          <section className="rounded-xl border bg-background p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Package className="h-5 w-5 text-primary" />
              Order Details
            </h2>
            <div className="space-y-3">
              {order.packageType === "multi" && items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b py-2"
                  >
                    <div>
                      <span className="font-medium">{item.productName}</span>
                      <span className="ml-2 text-sm capitalize text-muted-foreground">
                        ({item.packageType})
                      </span>
                    </div>
                    <div className="text-right">
                      <span>
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </span>
                      <span className="ml-2 font-medium">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-between border-b py-2">
                  <span className="text-muted-foreground">Package</span>
                  <span className="font-medium capitalize">
                    {order.packageType} ({order.quantity} bottle
                    {order.quantity > 1 ? "s" : ""})
                  </span>
                </div>
              )}
              <div className="flex justify-between border-b py-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>
                  {order.deliveryFee === 0
                    ? "FREE"
                    : formatPrice(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-background p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Send className="h-5 w-5 text-primary" />
              Payment
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Field
                  label="Method"
                  value={order.paymentMethod.toUpperCase()}
                />
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium capitalize",
                    paymentStatusColors[
                      order.paymentStatus || "pending"
                    ],
                  )}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentMethod !== "cod" &&
              order.paymentStatus === "pending" ? (
                <div className="flex gap-2 border-t pt-4">
                  <Button
                    className="flex-1"
                    disabled={busyAction !== null}
                    onClick={handleVerifyPayment}
                  >
                    {busyAction === "verify" ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Verify Payment
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={busyAction !== null}
                    onClick={() =>
                      patchOrder({ paymentStatus: "failed" }, "rejected")
                    }
                  >
                    <CircleX className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              ) : null}
              {order.paymentMethod !== "cod" ? (
                <div className="border-t pt-4">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Payment proof
                  </p>
                  {order.paymentScreenshotUrl ? (
                    <div className="space-y-3">
                      <a
                        href={`/api/admin/orders/${order.id}/payment-proof`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View uploaded screenshot
                      </a>
                      <div className="max-w-xs overflow-hidden rounded-lg border bg-muted/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/admin/orders/${order.id}/payment-proof`}
                          alt="Payment proof screenshot"
                          className="max-h-72 w-full object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No screenshot uploaded yet.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </section>

          {(order.orderStatus === "confirmed" ||
            order.orderStatus === "pending") &&
          (order.paymentMethod === "cod" ||
            order.paymentStatus === "verified") ? (
            <section className="rounded-xl border bg-background p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <Truck className="h-5 w-5 text-primary" />
                Ship Order
              </h2>
              <form onSubmit={handleShip} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="courierName">Courier Name</Label>
                    <Input
                      id="courierName"
                      placeholder="TCS, Leopards, PostEx..."
                      value={shipping.courierName}
                      onChange={(event) =>
                        setShipping({
                          ...shipping,
                          courierName: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="trackingNumber">Tracking Number</Label>
                    <Input
                      id="trackingNumber"
                      placeholder="TCS-123456"
                      value={shipping.trackingNumber}
                      onChange={(event) =>
                        setShipping({
                          ...shipping,
                          trackingNumber: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="trackingUrl">
                    Tracking URL (optional)
                  </Label>
                  <Input
                    id="trackingUrl"
                    type="url"
                    placeholder="https://track.tcs.com.pk/..."
                    value={shipping.trackingUrl}
                    onChange={(event) =>
                      setShipping({
                        ...shipping,
                        trackingUrl: event.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  type="submit"
                  disabled={busyAction !== null}
                  className="w-full"
                >
                  {busyAction === "ship" ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Truck className="mr-2 h-4 w-4" />
                  )}
                  Mark as Shipped & Send Notification
                </Button>
              </form>
            </section>
          ) : null}

          {order.orderStatus === "shipped" ||
          order.orderStatus === "delivered" ? (
            <section className="rounded-xl border bg-background p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <Truck className="h-5 w-5 text-primary" />
                Shipping Details
              </h2>
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <Field label="Courier" value={order.courierName} />
                <Field label="Tracking #" value={order.trackingNumber} />
                <Field
                  label="Shipped At"
                  value={
                    order.shippedAt ? formatDate(order.shippedAt) : "—"
                  }
                />
                {order.deliveredAt ? (
                  <Field
                    label="Delivered At"
                    value={formatDate(order.deliveredAt)}
                  />
                ) : null}
              </div>
              {order.trackingUrl ? (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Track Shipment
                </a>
              ) : null}
              {order.orderStatus === "shipped" ? (
                <Button
                  className="w-full"
                  disabled={busyAction !== null}
                  onClick={() =>
                    patchOrder({ orderStatus: "delivered" }, "delivered")
                  }
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Delivered
                </Button>
              ) : null}
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border bg-background p-6">
            <h2 className="mb-4 font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={busyAction !== null}
                onClick={() =>
                  handleResendEmail("order_confirmation")
                }
              >
                {busyAction === "email-order_confirmation" ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Resend Confirmation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Open WhatsApp
                </a>
              </Button>
            </div>
          </section>

          <section className="rounded-xl border bg-background p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <StickyNote className="h-5 w-5 text-primary" />
              Add Note
            </h2>
            <div className="space-y-2">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Internal note about this order..."
                rows={2}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddNote}
                disabled={busyAction !== null || !note.trim()}
                className="w-full"
              >
                {busyAction === "note" ? (
                  <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
                ) : null}
                Add Note
              </Button>
            </div>
          </section>

          <section className="rounded-xl border bg-background p-6">
            <h2 className="mb-4 font-semibold">Activity Log</h2>
            <div className="space-y-4">
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity yet
                </p>
              ) : (
                activity.map((entry) => {
                  let details: Record<string, unknown> = {};
                  try {
                    details = entry.details
                      ? (JSON.parse(entry.details) as Record<
                          string,
                          unknown
                        >)
                      : {};
                  } catch {}
                  return (
                    <div
                      key={entry.id}
                      className="border-l-2 border-muted pl-3 text-sm"
                    >
                      <p className="font-medium capitalize">
                        {entry.action.replace(/_/g, " ")}
                      </p>
                      {typeof details.note === "string" &&
                      details.note ? (
                        <p className="mt-0.5 text-xs italic text-muted-foreground">
                          “{details.note}”
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        {entry.createdAt
                          ? formatDate(entry.createdAt)
                          : "—"}
                      </p>
                      {entry.performedBy &&
                      entry.performedBy !== "system" ? (
                        <p className="text-xs text-muted-foreground">
                          by {entry.performedBy}
                        </p>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
