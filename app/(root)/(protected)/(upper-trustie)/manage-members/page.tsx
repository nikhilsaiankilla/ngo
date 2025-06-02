import { getAllRoleRequests } from "@/actions/requestRoleUpgrade";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>; // Note: Promise here
}) => {
  const params = await searchParams; // await here
  const { cursor } = params || {};

  const { data, nextCursor } = await getAllRoleRequests({
    pageSize: 10,
    cursor: cursor || null,
  });

  return (
    <div>
      <h1>Role Requests</h1>
      <ul>
        {data.map((req) => (
          <li key={req.id}>
            User: {req.userId} — Requested Role: {req.requestedRole}
          </li>
        ))}
      </ul>
      {nextCursor && (
        <a href={`?cursor=${nextCursor}`} style={{ color: "blue" }}>
          Next Page
        </a>
      )}
    </div>
  );
};

export default page;
