'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task } from '@/types';
import { X, Loader2 } from 'lucide-react';

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TaskForm) => Promise<void>;
    task?: Task;
    title: string;
}

export default function TaskModal({ isOpen, onClose, onSubmit, task, title }: TaskModalProps) {
    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<TaskForm>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            status: 'PENDING',
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (task) {
                setValue('title', task.title);
                setValue('description', task.description || '');
                setValue('status', task.status);
            } else {
                reset({
                    title: '',
                    description: '',
                    status: 'PENDING',
                });
            }
        }
    }, [isOpen, task, setValue, reset]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            {...register('title')}
                            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-slate-500"
                            placeholder="Task title"
                            autoFocus
                        />
                        {errors.title && (
                            <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-slate-500 resize-none"
                            placeholder="Add details about this task..."
                        />
                    </div>

                    {task && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Status
                            </label>
                            <select
                                {...register('status')}
                                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white appearance-none cursor-pointer"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {task ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
