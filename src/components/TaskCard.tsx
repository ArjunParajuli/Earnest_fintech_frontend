'use client';

import React from 'react';
import { Task } from '@/types';
import { CheckCircle2, Circle, Clock, Trash2, Edit2, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils'; // I'll need to create this utility or just use template literals

// Simple utility function for class names
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

interface TaskCardProps {
    task: Task;
    onDelete: (id: number) => void;
    onEdit: (task: Task) => void;
    onToggle: (id: number) => void;
}

export default function TaskCard({ task, onDelete, onEdit, onToggle }: TaskCardProps) {
    const statusColors = {
        PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        IN_PROGRESS: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
    };

    const statusIcons = {
        PENDING: <Circle className="w-4 h-4" />,
        IN_PROGRESS: <PlayCircle className="w-4 h-4" />,
        COMPLETED: <CheckCircle2 className="w-4 h-4" />,
    };

    return (
        <div className="glass-card rounded-xl p-5 hover:scale-[1.02] transition-transform duration-200 group relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
                <div className={classNames(
                    "px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5",
                    statusColors[task.status]
                )}>
                    {statusIcons[task.status]}
                    {task.status.replace('_', ' ')}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                        title="Edit Task"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Task"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-200 mb-2 truncate pr-4">
                {task.title}
            </h3>

            {task.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {task.description}
                </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(task.createdAt).toLocaleDateString()}
                </div>

                <button
                    onClick={() => onToggle(task.id)}
                    className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                    {task.status === 'COMPLETED' ? 'Mark as Pending' : 'Advance Status'}
                </button>
            </div>
        </div>
    );
}
