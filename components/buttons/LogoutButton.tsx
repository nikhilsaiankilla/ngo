'use client'

import { userSignOut } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const LogoutButton = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            await userSignOut()
            router.push('/auth/signin') // Redirect after logout
        } catch (error) {
            console.error('Logout failed:', error)
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="destructive"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-shadow duration-300"
            disabled={isLoading}
            aria-label="Logout"
            title="Logout"
        >
            {isLoading ? (
                <>
                    <Loader className="animate-spin h-5 w-5" />
                    <span>Logging out...</span>
                </>
            ) : (
                "Logout"
            )}
        </Button>
    )
}
