
import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { UserContext } from './types';
import { UpcomingTest, TestType, TestSyllabusItem, SubjectName, DailyPlan, HourlySlot, DailyPlanTask, TopicStatus, CalendarEvent, PlannedTopic, User, TestResult, Achievement, Rank, RankTier, StudyChallenge, ChallengeType, ChallengeStatus, QuestionsSolvedLog, Lecture, WellnessLog } from './types';
import { ArrowLeftIcon, ArrowRightIcon, TrashIcon, XMarkIcon, PlusIcon, SparklesIcon, ClockIcon, CheckCircleIcon, FireIcon, PresentationChartLineIcon, CheckBadgeIcon, ArrowUturnLeftIcon, PencilIcon, ClipboardDocumentCheckIcon, CalendarIcon, LightBulbIcon, ExclamationTriangleIcon, TrophyIcon, StarIcon, Cog6ToothIcon, ArrowPathIcon, HashtagIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';


const CountUp: React.FC<{ value: number }> = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (isNaN(value) || value === null) return;
        let startTimestamp: number | null = null;
        const duration = 1200; // ms

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setDisplayValue(Math.floor(progress * value));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [value]);

    return <>{displayValue.toLocaleString()}</>;
};

// --- Helper Functions for Formatting ---
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const formatDateToDDMMYYYY = (date: Date | string): string => {
    // If date is a string 'YYYY-MM-DD', it's parsed by default as UTC midnight.
    // Creating it with T00:00:00 makes it local midnight, avoiding timezone shifts.
    const d = typeof date === 'string' && !date.includes('T')
        ? new Date(`${date}T00:00:00`)
        : new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};
const formatTimeToAMPM = (time: string): string => { // time is "HH:mm"
    if (!time || !time.includes(':')) return 'Invalid Time';
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12
    return `${String(formattedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
};

// --- Helper Components ---
const Modal: React.FC<{ children: React.ReactNode, onClose: () => void, title: string, maxWidth?: string }> = ({ children, onClose, title, maxWidth = 'max-w-3xl' }) => {
     useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className={`bg-surface rounded-xl shadow-2xl w-full ${maxWidth} p-6 relative max-h-[90vh] flex flex-col transition-transform duration-300 scale-95 animate-fade-in`} onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-text-primary mb-4 flex-shrink-0">{title}</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-primary transition-transform hover:rotate-90"><XMarkIcon className="w-6 h-6" /></button>
                <div className="overflow-y-auto pr-2 -mr-2 flex-grow">
                    {children}
                </div>
            </div>
        </div>,
        document.getElementById('popover-root')!
    );
}

// --- Dashboard Header ---
const DashboardHeader: React.FC = () => {
    const { user, updateUser } = useContext(UserContext);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.displayName || '');
    const today = new Date();
    const dateString = today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const handleNameUpdate = () => {
        if (newName.trim() && newName.trim() !== user?.displayName) {
            updateUser({ displayName: newName.trim() });
        }
        setIsEditingName(false);
    };
    
    const RankDisplay: React.FC<{ rank: Rank }> = ({ rank }) => {
        const trophyColors: { [key in RankTier]: string } = { Bronze: 'text-yellow-600', Silver: 'text-slate-400', Gold: 'text-yellow-400', Platinum: 'text-cyan-400' };
        return (
            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg transition-transform hover:scale-105">
                <TrophyIcon className={`w-8 h-8 ${trophyColors[rank.tier]}`} />
                <div>
                    <p className="font-bold text-lg leading-tight">{rank.name}</p>
                    <p className="text-xs text-indigo-200">Rank Score: {rank.score.toFixed(1)}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-primary-dark to-primary text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div>
                 {isEditingName ? (
                    <div className="flex items-center gap-2">
                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNameUpdate()} className="bg-transparent border-b-2 border-white/50 text-3xl font-bold focus:outline-none focus:border-white" autoFocus onBlur={handleNameUpdate}/>
                        <button onClick={handleNameUpdate} className="p-1 rounded-full bg-white/20 hover:bg-white/40"><CheckCircleIcon className="w-6 h-6"/></button>
                    </div>
                ) : (
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        Welcome, {user?.displayName}!
                        <button onClick={() => { setNewName(user?.displayName || ''); setIsEditingName(true); }} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                            <PencilIcon className="w-5 h-5 opacity-60 hover:opacity-100" />
                        </button>
                    </h1>
                )}
                <p className="text-indigo-200">{dateString}</p>
            </div>
            <div className="flex w-full items-center gap-4 sm:gap-6 md:w-auto">
                <div className="flex-1 sm:flex-initial">
                    {user?.rank && <RankDisplay rank={user.rank} />}
                </div>
                <div className="flex-1 sm:flex-initial text-right sm:text-center flex items-center justify-end sm:justify-center gap-2 transition-transform duration-300 hover:scale-105">
                    <FireIcon className="w-8 h-8 text-red-400" />
                    <div>
                        <p className="text-3xl font-bold"><CountUp value={user?.studyStreak || 1} /></p>
                        <p className="text-xs text-indigo-200 -mt-1">Day Streak</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PrepTimelineWidget: React.FC = () => {
    const { user } = useContext(UserContext);

    const prepStartDate = useMemo(() => new Date(user?.prepStartDate || '2025-04-01T00:00:00Z'), [user?.prepStartDate]);
    const examDate = useMemo(() => new Date(user?.examDate || '2027-01-03T00:00:00Z'), [user?.examDate]);
    
    const today = new Date();
    const daysOfPrep = Math.floor((today.getTime() - prepStartDate.getTime()) / (1000 * 3600 * 24));
    const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    const totalQuestions = useMemo(() => {
        if (!user?.dailyPlans) return 0;
        return user.dailyPlans.reduce((total, plan) =>
            total + (plan.questionsSolved?.reduce((sum, q) => sum + q.count, 0) || 0)
        , 0);
    }, [user?.dailyPlans]);

    return (
        <div className="bg-surface p-6 rounded-2xl shadow-lg border border-accent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex justify-around items-center">
            <div className="text-center">
                <p className="text-4xl font-bold text-success"><CountUp value={daysOfPrep < 0 ? 0 : daysOfPrep} /></p>
                <p className="text-xs text-text-secondary">Days of Prep</p>
            </div>
            <div className="h-16 w-px bg-accent"></div>
            <div className="text-center">
                <p className="text-4xl font-bold text-primary"><CountUp value={totalQuestions} /></p>
                <p className="text-xs text-text-secondary">Questions Solved</p>
            </div>
            <div className="h-16 w-px bg-accent"></div>
            <div className="text-center">
                <p className="text-4xl font-bold text-danger"><CountUp value={daysLeft < 0 ? 0 : daysLeft} /></p>
                <p className="text-xs text-text-secondary">Days Left for Exam</p>
            </div>
        </div>
    );
};

// --- Ongoing Chapters/Topics Component ---
const OngoingTopics: React.FC = () => {
    const { user } = useContext(UserContext);
    const ongoing: { [key in SubjectName]: string[] } = useMemo(() => {
        if (!user) return { Physics: [], Chemistry: [], Math: [] };
        
        const inProgressTopics: { [key in SubjectName]: string[] } = { Physics: [], Chemistry: [], Math: [] };

        // Physics
        user.topics.physics.chapters.forEach(c => {
            if (c.status === TopicStatus.InProgress && !inProgressTopics.Physics.find(t => t.startsWith(c.name))) {
                inProgressTopics.Physics.push(`${c.name} (Chapter)`);
            }
            c.majorTopics.forEach(mt => mt.subtopics.forEach(st => {
                if (st.status === TopicStatus.InProgress) {
                    inProgressTopics.Physics.push(`${c.name} - ${st.name}`);
                }
            }));
        });
        user.topics.chemistry.sections.forEach(section => {
            section.chapters.forEach(c => {
                if (c.status === TopicStatus.InProgress && !inProgressTopics.Chemistry.find(t => t.startsWith(c.name))) {
                    inProgressTopics.Chemistry.push(`${c.name} (Chapter)`);
                }
                c.majorTopics.forEach(mt => mt.subtopics.forEach(st => {
                    if (st.status === TopicStatus.InProgress) {
                        inProgressTopics.Chemistry.push(`${c.name} - ${st.name}`);
                    }
                }));
            });
        });
        user.topics.math.chapters.forEach(c => {
            if (c.status === TopicStatus.InProgress && !inProgressTopics.Math.find(t => t.startsWith(c.name))) {
                inProgressTopics.Math.push(`${c.name} (Chapter)`);
            }
            c.majorTopics.forEach(mt => mt.subtopics.forEach(st => {
                if (st.status === TopicStatus.InProgress) {
                    inProgressTopics.Math.push(`${c.name} - ${st.name}`);
                }
            }));
        });
        return inProgressTopics;
    }, [user]);

    const hasOngoingTopics = Object.values(ongoing).some(arr => arr.length > 0);

    return (
        <div className="bg-surface p-6 rounded-2xl shadow-lg border border-accent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
            <h2 className="text-xl font-bold text-text-primary mb-3">Ongoing Chapters & Topics</h2>
            {hasOngoingTopics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['Physics', 'Chemistry', 'Math'] as SubjectName[]).map(subject => (
                        <div key={subject}>
                            <h3 className="font-semibold text-text-primary border-b border-accent pb-1 mb-2">{subject}</h3>
                            <ul className="space-y-1 text-sm text-text-secondary list-disc list-inside">
                                {ongoing[subject].length > 0 ? ongoing[subject].map((topic, index) => <li key={topic} className="animate-slide-in-up" style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}>{topic}</li>) : <li>No ongoing topics.</li>}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-text-secondary text-center py-4">No topics are currently in progress. Go to the Topic Tracker to get started!</p>
            )}
        </div>
    );
};

// --- NEW Upcoming Tests & Events Widget ---
const UpcomingTestsAndEventsWidget: React.FC = () => {
    const { user } = useContext(UserContext);

    const upcomingItems = useMemo(() => {
        if (!user) return [];
        const now = new Date();
        const twentyDaysFromNow = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const tests = (user.upcomingTests || [])
            .map(test => ({
                id: test.id,
                title: test.name,
                dateTime: new Date(`${test.date}T${test.time || '00:00'}`),
                itemType: 'test' as const
            }))
            .filter(test => test.dateTime >= now && test.dateTime <= twentyDaysFromNow);
        
        const events = (user.events || [])
            .map(event => ({
                id: event.id,
                title: event.title,
                dateTime: new Date(`${event.date}T${event.time || '00:00'}`),
                itemType: 'event' as const,
                eventType: event.type
            }))
            .filter(evt => evt.dateTime >= now && evt.dateTime <= sevenDaysFromNow);

        return [...tests, ...events]
            .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    }, [user]);

    const Countdown: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
        const calculateTimeLeft = useCallback(() => {
            const difference = +targetDate - +new Date();
            let timeLeft: { [key: string]: number } = {};
            if (difference > 0) {
                timeLeft = {
                    d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    m: Math.floor((difference / 1000 / 60) % 60),
                };
            }
            return timeLeft;
        }, [targetDate]);

        const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
        useEffect(() => {
            const timer = setTimeout(() => { setTimeLeft(calculateTimeLeft()); }, 1000 * 60); // Update every minute
            return () => clearTimeout(timer);
        });

        if (!Object.keys(timeLeft).length) return <span className="text-sm font-semibold text-danger animate-pulse">Today!</span>;
        
        return (
            <div className="flex items-end gap-1 font-mono">
                {timeLeft.d > 0 && <><span className="text-lg font-bold text-primary">{timeLeft.d}</span><span className="text-xs text-text-secondary -mb-px">d</span></>}
                <span className="text-lg font-bold text-primary">{String(timeLeft.h).padStart(2, '0')}</span><span className="text-xs text-text-secondary -mb-px">h</span>
                <span className="text-lg font-bold text-primary">{String(timeLeft.m).padStart(2, '0')}</span><span className="text-xs text-text-secondary -mb-px">m</span>
            </div>
        );
    }

    return (
        <div className="bg-surface p-6 rounded-2xl shadow-lg border border-accent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
            <h2 className="text-xl font-bold text-text-primary mb-3 flex-shrink-0">Upcoming Tests & Events</h2>
            {upcomingItems.length > 0 ? (
                <div className="space-y-3 overflow-y-auto pr-2 -mr-2">
                    {upcomingItems.map((item, index) => (
                        <div key={item.id} className="bg-background p-3 rounded-lg flex justify-between items-center animate-slide-in-up" style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}>
                            <div className="flex items-center gap-3">
                                {item.itemType === 'test' ? <ClipboardDocumentCheckIcon className="w-6 h-6 text-primary" /> : <BellAlertIcon className="w-6 h-6 text-amber-500" />}
                                <div>
                                    <p className="font-semibold text-text-primary">{item.title}</p>
                                    <p className="text-sm text-text-secondary">{formatDateToDDMMYYYY(item.dateTime)} at {formatTimeToAMPM(item.dateTime.toTimeString())}</p>
                                </div>
                            </div>
                            <Countdown targetDate={item.dateTime} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-text-secondary text-center py-4">No upcoming tests or events. Enjoy the peace or get planning!</p>
            )}
        </div>
    );
};


// --- Graphical Progress Components ---
const SyllabusProgress: React.FC = () => {
    const { user } = useContext(UserContext);

    const progressData = useMemo(() => {
        if (!user) return { Physics: { data: [], total: 0, completed: 0 }, Chemistry: { data: [], total: 0, completed: 0 }, Math: { data: [], total: 0, completed: 0 } };
        
        const result: { [key in SubjectName]: { data: { name: string; value: number }[]; total: number; completed: number } } = { 
            Physics: { data: [], total: 0, completed: 0 }, 
            Chemistry: { data: [], total: 0, completed: 0 }, 
            Math: { data: [], total: 0, completed: 0 } 
        };

        (['Physics', 'Chemistry', 'Math'] as SubjectName[]).forEach(subject => {
            const subjectKey = subject.toLowerCase() as 'physics' | 'chemistry' | 'math';
            const subjectData = user.topics[subjectKey];
            const allChapters = 'chapters' in subjectData ? subjectData.chapters : subjectData.sections.flatMap(s => s.chapters);
            const allSubtopics = allChapters.flatMap(c => c.majorTopics.flatMap(mt => mt.subtopics));
            
            const total = allSubtopics.length;
            const completed = allSubtopics.filter(st => st.status === TopicStatus.Completed).length;
            const percentage = total > 0 ? (completed / total) * 100 : 0;

            result[subject] = {
                data: [
                    { name: 'Completed', value: percentage },
                    { name: 'Remaining', value: 100 - percentage }
                ],
                total,
                completed
            };
        });
        return result;
    }, [user]);

    const subjectColors = ['#3b82f6', '#10b981', '#f59e0b'];

    return (
        <div className="bg-surface p-6 rounded-2xl shadow-lg border border-accent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
            <h3 className="text-lg font-bold text-text-primary mb-2 text-center">Syllabus Progress</h3>
            <div className="grid grid-cols-3 gap-2">
                {(['Physics', 'Chemistry', 'Math'] as SubjectName[]).map((subject, i) => {
                    const { data, total, completed } = progressData[subject];
                    const percentage = data[0]?.value ?? 0;
                    return (
                        <div key={subject} className="text-center">
                            <div className="relative h-28 w-28 mx-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data} dataKey="value" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270} paddingAngle={0} cornerRadius={5}>
                                            <Cell fill={subjectColors[i]} />
                                            <Cell fill="#e5e7eb" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-bold text-text-primary">{percentage.toFixed(0)}%</span>
                                </div>
                            </div>
                            <p className="text-sm font-semibold mt-1">{subject}</p>
                            <p className="text-xs text-text-secondary">{completed} / {total}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const WeeklyFocus: React.FC = () => {
    const { user } = useContext(UserContext);

    const weeklyData = useMemo(() => {
        if (!user) return [];
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ...
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
        const weekStart = new Date(today.setDate(diff));
        
        const data = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateString = formatDate(date);
            const plan = user.dailyPlans.find(p => p.date === dateString);
            const hours = { Physics: 0, Chemistry: 0, Math: 0 };
            if (plan) {
                plan.schedule.forEach(slot => {
                    if (slot.status === 'Completed' && slot.subject) {
                        const start = new Date(`1970-01-01T${slot.startTime}:00`);
                        const end = new Date(`1970-01-01T${slot.endTime}:00`);
                        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                        if (duration > 0) hours[slot.subject] += duration;
                    }
                });
            }
            return {
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                Physics: parseFloat(hours.Physics.toFixed(2)),
                Chemistry: parseFloat(hours.Chemistry.toFixed(2)),
                Math: parseFloat(hours.Math.toFixed(2)),
            };
        });
        return data;
    }, [user]);

    return (
        <div className="bg-surface p-6 rounded-2xl shadow-lg border border-accent transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
             <h2 className="text-2xl font-bold text-text-primary mb-4">Weekly Study Focus (Hours)</h2>
             <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                    <XAxis dataKey="day" tick={{ fill: '#475569' }}/>
                    <YAxis tick={{ fill: '#475569' }}/>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                    <Legend wrapperStyle={{ color: '#1e3a8a' }}/>
                    <Bar dataKey="Physics" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="Chemistry" stackId="a" fill="#10b981" />
                    <Bar dataKey="Math" stackId="a" fill="#f59e0b" />
                </BarChart>
             </ResponsiveContainer>
        </div>
    );
};


// --- Advanced Daily Planner ---
const AddTopicModal: React.FC<{
    subject: SubjectName; onClose: () => void; onAddTopic: (topic: Omit<PlannedTopic, 'id' | 'status'>) => void;
}> = ({ subject, onClose, onAddTopic }) => {
    const { user } = useContext(UserContext);
    const [chapterName, setChapterName] = useState('');
    const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const subjectData = user!.topics[subject.toLowerCase() as keyof typeof user.topics];
    const chapters = 'chapters' in subjectData ? subjectData.chapters : subjectData.sections.flatMap(s => s.chapters);
    const availableSubtopics = useMemo(() => chapters.find(c => c.name === chapter