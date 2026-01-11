'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { taskService } from '@/services/task-service';
import { Task } from '@/types';
import TaskCard from '@/components/TaskCard';
import SearchFilter from '@/components/SearchFilter';
import TaskModal from '@/components/TaskModal';
import { Plus, Loader2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, logout, loading: authLoading } = useAuth();
    const router = useRouter();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const data = await taskService.getTasks({
                search: debouncedSearch,
                status: status as any,
            });
            setTasks(data.tasks);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, status]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchTasks();
        }
    }, [user, authLoading, router, fetchTasks]);

    const handleCreateTask = async (data: any) => {
        try {
            await taskService.createTask(data);
            toast.success('Task created successfully');
            fetchTasks();
            closeModal();
        } catch (error) {
            console.error('Create task error:', error);
            toast.error('Failed to create task');
        }
    };

    const handleUpdateTask = async (data: any) => {
        if (!editingTask) return;
        try {
            await taskService.updateTask(editingTask.id, data);
            toast.success('Task updated successfully');
            fetchTasks();
            closeModal();
        } catch (error) {
            console.error('Update task error:', error);
            toast.error('Failed to update task');
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await taskService.deleteTask(id);
            toast.success('Task deleted successfully');
            setTasks(tasks.filter(t => t.id !== id));
        } catch (error) {
            console.error('Delete task error:', error);
            toast.error('Failed to delete task');
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const { task } = await taskService.toggleTaskStatus(id);
            setTasks(tasks.map(t => t.id === id ? task : t));
            toast.success(`Task marked as ${task.status.replace('_', ' ').toLowerCase()}`);
        } catch (error) {
            console.error('Toggle status error:', error);
            toast.error('Failed to update status');
        }
    };

    const openCreateModal = () => {
        setEditingTask(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTask(undefined);
    };

    if (authLoading || (!user && loading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 glass border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            TM
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 hidden sm:block">
                            TaskMaster
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400 hidden sm:inline-block">
                            Welcome, {user?.name || user?.email}
                        </span>
                        <button
                            onClick={logout}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">My Tasks</h2>
                        <p className="text-slate-400 mt-1">Manage your daily goals and projects</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg hover:shadow-blue-500/25 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        New Task
                    </button>
                </div>

                <SearchFilter
                    search={search}
                    onSearchChange={setSearch}
                    status={status}
                    onStatusChange={setStatus}
                />

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50 border-dashed">
                        <p className="text-slate-400 text-lg mb-4">No tasks found</p>
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 text-blue-400 hover:text-blue-300 font-medium"
                        >
                            Create your first task
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onDelete={handleDeleteTask}
                                onEdit={openEditModal}
                                onToggle={handleToggleStatus}
                            />
                        ))}
                    </div>
                )}
            </main>

            <TaskModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                task={editingTask}
                title={editingTask ? 'Edit Task' : 'Create New Task'}
            />
        </div>
    );
}
