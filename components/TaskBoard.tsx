import React from 'react';
import type { Task, TaskStatus, StaffMember } from '../types';
import { Card, CardTitle } from './ui/Card';

interface TaskBoardProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    staff: StaffMember[];
}

const TaskCard: React.FC<{ task: Task; staff: StaffMember[]; onDragStart: (e: React.DragEvent, taskId: string) => void }> = ({ task, staff, onDragStart }) => {
    const assignee = staff.find(s => s.id === task.assigneeId);
    return (
        <div 
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            className="bg-white p-3 rounded-md shadow-sm border cursor-grab mb-2"
        >
            <p className="font-semibold text-sm text-gray-800">{task.title}</p>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>Due: {task.dueDate}</span>
                {assignee && <span className="font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{assignee.name}</span>}
            </div>
        </div>
    );
};

const BoardColumn: React.FC<{ 
    title: string; 
    status: TaskStatus;
    tasks: Task[];
    staff: StaffMember[];
    onDragStart: (e: React.DragEvent, taskId: string) => void;
    onDrop: (e: React.DragEvent, status: TaskStatus) => void;
}> = ({ title, status, tasks, staff, onDragStart, onDrop }) => {
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };
    
    return (
        <div 
            className="bg-gray-100 rounded-lg p-4 flex-1"
            onDragOver={handleDragOver}
            onDrop={(e) => onDrop(e, status)}
        >
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">{title} ({tasks.length})</h3>
            <div className="space-y-2 h-full">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} staff={staff} onDragStart={onDragStart} />
                ))}
            </div>
        </div>
    );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, setTasks, staff }) => {
    
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData("taskId", taskId);
    };

    const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
        const taskId = e.dataTransfer.getData("taskId");
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.id === taskId ? { ...task, status: newStatus } : task
            )
        );
    };

    const columns: { title: string, status: TaskStatus }[] = [
        { title: 'To Do', status: 'To Do' },
        { title: 'In Progress', status: 'In Progress' },
        { title: 'Done', status: 'Done' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Staff Task Board</h1>
            <div className="flex gap-6 h-[75vh]">
                {columns.map(col => (
                    <BoardColumn
                        key={col.status}
                        title={col.title}
                        status={col.status}
                        tasks={tasks.filter(t => t.status === col.status)}
                        staff={staff}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                    />
                ))}
            </div>
        </div>
    );
};