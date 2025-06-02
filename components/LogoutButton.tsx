'use client'

import { userSignOut } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const LogoutButton = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLogout = async () => {
        setIsLoading(true)
        await userSignOut()
        router.push('/auth/signin') // or homepage
        setIsLoading(false)
    }

    return (
        <Button variant="destructive" onClick={handleLogout} className='px-2 cursor-pointer'>
            {isLoading ? <><Loader className='animate-spin'/> Logging Out</> : "Logout"}
        </Button>
    )
}
