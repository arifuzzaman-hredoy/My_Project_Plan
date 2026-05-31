import { Suspense } from "react";
import { AdminVaultPage } from "@/components/admin-vault";

function AdminVaultLoading() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 text-sm font-semibold text-slate-600 shadow-soft dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
      Loading Admin Vault...
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<AdminVaultLoading />}>
      <AdminVaultPage />
    </Suspense>
  );
}