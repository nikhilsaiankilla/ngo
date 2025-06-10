"use client";

import { deleteEvent } from '@/actions/events';
import { deleteService } from '@/actions/services';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

type DeleteBtnProps = {
    id: string;
    type: 'event' | 'service';
};

const DeleteBtn: React.FC<DeleteBtnProps> = ({ id, type }) => {
    const router = useRouter();

    const handleDelete = async () => {
        if (!type || !id) {
            return toast.error('id or type is missing');
        }

        if (type === 'event') {
            const res = await deleteEvent(id);
            if (!res?.success) return toast.error(res?.message);
            router.push('/dashboard/events');
            return toast.success('Event Deleted Successfully');
        }

        if (type === 'service') {
            const res = await deleteService(id);
            if (!res?.success) return toast.error(res?.message);
            router.push('/dashboard/services');
            return toast.success('Service Deleted Successfully');
        }
    };

    return <span className='flex items-center gap-1 text-red-500 cursor-pointer' onClick={handleDelete}>
        <Trash2 size={18}  />
        Delete
    </span>
};

export default DeleteBtn;
