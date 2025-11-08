

import React, { useState, useContext, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { UserContext } from './types';
import { CoachingLog as CoachingLogType, SubjectName, User, CoachingLecture, CoachingTestActivity, CoachingLogActivity, Doubt, DailyPlanTask, TopicStatus, CoachingOtherActivity, DailyPlan, Document, Teacher } from './types';
import { PlusIcon, XMarkIcon, PencilIcon, TrashIcon, BuildingLibraryIcon, AcademicCapIcon, BookOpenIcon, SparklesIcon, CalendarDaysIcon, DocumentDuplicateIcon, DocumentArrowUpIcon, LinkIcon, EyeIcon, ArrowTopRightOnSquareIcon, MagnifyingGlassIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { listFilesFromDrive, DriveFile } from './driveService';
import DocumentViewer from './DocumentViewer';

// --- Helper Functions ---
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const formatDateToDisplay = (dateStr: string): string => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};
const formatTimeToAMPM = (time: string): string => {
    if (!time || !time.includes(':')) return '';
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${String(formattedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
};

// --- Reusable Modal ---
const Modal: React.FC<{ children: React.ReactNode, onClose: () => void, title: string, maxWidth?: string }> = ({ children, onClose, title, maxWidth = 'max-w-2xl' }) => {
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className={`bg-surface rounded-xl shadow-2xl w-full ${maxWidth} p-6 relative max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-text-primary mb-4 flex-shrink-0">{title}</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-primary transition-transform hover:rotate-90"><XMarkIcon className="w-6 h-6" /></button>
                <div className="overflow-y-auto pr-2 -mr-2 flex-grow">
                    {children}
                </div>
            </div>
        </div>,
        document.getElementById('popover-root')!
    );
};

// --- Form Modals ---
const LectureFormModal: React.FC<{
    onClose: () => void;
    onSave: (lecture: Omit<CoachingLecture, 'id' | 'type'>) => void;
    initialLecture?: CoachingLecture;
}> = ({ onClose, onSave, initialLecture }) => {
    const { user, updateUser } = useContext(UserContext);
    const [form, setForm] = useState({
        startTime: initialLecture?.startTime || '09:00',
        endTime: initialLecture?.endTime || '10:30',
        subject: initialLecture?.subject || 'Physics' as SubjectName,
        teacher: initialLecture?.teacher || '',
        category: initialLecture?.category || 'Combined' as CoachingLecture['category'],
        chapter: initialLecture?.chapter || '',
        subtopicsTaught: initialLecture?.subtopicsTaught || [] as string[],
        remarks: initialLecture?.remarks || '',
        rating: initialLecture?.rating || 3,
        homework: initialLecture?.homework || '',
        doubts: initialLecture?.doubts || '',
    });
    const [newTeacher, setNewTeacher] = useState('');
    const [showNewTeacherInput, setShowNewTeacherInput] = useState(false);
    
    const chaptersForSubject = useMemo(() => {
        if (!user) return [];
        const subjectData = user.topics[form.subject.toLowerCase() as keyof typeof user.topics];
        return 'chapters' in subjectData ? subjectData.chapters : subjectData.sections.flatMap(s => s.chapters);
    }, [user, form.subject]);

    const subtopicsForChapter = useMemo(() => {
        return chaptersForSubject.find(c => c.name === form.chapter)?.majorTopics.flatMap