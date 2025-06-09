// components/BreadcrumbDynamic.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

export const BreadcrumbDynamic = () => {
    const pathname = usePathname();
    const segments = pathname.split("/").filter((seg) => seg);

    if (segments.length === 0) {
        return (
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        );
    }

    let href = "";
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {segments.map((segment, index) => {
                    href += `/${segment}`;
                    const isLast = index === segments.length - 1;

                    return (
                        <Fragment key={href}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{decodeURIComponent(segment)}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={href}>
                                            {decodeURIComponent(segment)}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
};
