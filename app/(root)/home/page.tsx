interface UserDetails {
    displayName: string,
    email: string,
    photoURL?: string,
}
const Page = async () => {
    
    return (
        <div>
            <h1>Current User</h1>
        </div>
    );
};

export default Page;
