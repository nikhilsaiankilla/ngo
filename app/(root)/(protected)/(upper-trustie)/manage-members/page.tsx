import { getAllRoleRequests } from "@/actions/requestRoleUpgrade";
import { DataTable } from "./data-table";
import { columns } from "./columns";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ searchParams?: { cursor?: string }; }>
}) => {
  const cursor = (await searchParams).searchParams?.cursor;

  const result = await getAllRoleRequests({
    pageSize: 10,
    cursor: cursor || null,
  });

  if (!result.success) {
    // You can throw an error and use the error boundary
    throw new Error(result.message || "Failed to fetch role requests");
  }

  const roleRequests = result.data?.data ?? [];

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Role Requests</h1>
      <DataTable columns={columns} data={roleRequests} />
    </div>
  );
};

export default Page;
