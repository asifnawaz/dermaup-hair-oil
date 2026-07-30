import { Toaster } from "sonner";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="en" dir="ltr" className="text-left">
      {children}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
