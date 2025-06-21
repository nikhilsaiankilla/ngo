import { getAllRoleRequests } from "@/actions/requestRoleUpgrade";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import ManageMembers from "@/components/sections/ManageMembers";

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
    <main className="max-w-7xl w-full mx-auto p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Role Requests
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Review and manage role upgrade requests submitted by users.
        </p>
      </header>

      {roleRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-6h6v6m2 4H7a2 2 0 01-2-2V7a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium">No role requests found.</p>
          <p className="mt-2 text-sm">
            Once users submit requests, they will appear here.
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={roleRequests} />
      )}

      <div className="w-full">
        <ManageMembers />
      </div>
    </main>
  );
};

export default Page;