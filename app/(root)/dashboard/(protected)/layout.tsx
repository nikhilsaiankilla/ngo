// app/protected/layout.tsx (or wherever your layout is)

import { getUserRole } from "@/actions/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbDynamic } from "@/components/BreadcrumbDynamic";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const ProtectedLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const res = await getUserRole();

  if (!res.success) {
    // something went wrong
  }

  const role = res?.data;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "19rem",
      } as React.CSSProperties}
      className="bg-light"
    >
      <AppSidebar role={role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-light">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <BreadcrumbDynamic />
        </header>
        <div className="flex flex-1 flex-col items-start justify-start gap-4 pt-0 bg-light">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
