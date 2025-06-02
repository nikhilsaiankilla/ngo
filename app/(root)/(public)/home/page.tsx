import { cookies } from "next/headers";
import Link from "next/link";

const Page = async () => {
    const cookieStore = await cookies();

    const usedId = cookieStore.get('userId')?.value;

    if(!usedId){
        return <h1>user id not found</h1>
    }

    const token = cookieStore.get('accessToken')?.value;

    if(!token){
        return <h1>token is missing</h1>
    }

    return (
        <div>
            <h1>Current User</h1>

            <Link href={`/profile/${usedId}`} className="w-fit mx-auto px-3 py-1 bg-blue-400 rounded-2xl ">go to profile</Link>
        </div>
    );
};

export default Page;
