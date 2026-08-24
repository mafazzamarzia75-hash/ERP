import { Store } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <span className="font-semibold">Sanvinal Mini-ERP</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Sanvinal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}