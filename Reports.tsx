
import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { UserContext } from './types';
import { DailyPlan, TestResult, WellnessLog, SubjectName, PlannedTopic, HourlySlot, QuestionsSolvedLog, Chapter, StudyChallenge, Lecture, CoachingLog, CoachingLecture, CoachingLogActivity, CoachingTestActivity, ReportData, ChapterReportDetails, TeacherReportDetails, DailyBreakdownItem, ReportHourlySlot, Doubt, TestReportData } from './types';
import { DocumentTextIcon, PrinterIcon, ClockIcon, PresentationChartLineIcon, MoonIcon, FaceSmileIcon, BookOpenIcon, ClipboardDocumentCheckIcon, SparklesIcon, CalendarDaysIcon, CheckCircleIcon, DocumentArrowDownIcon, HashtagIcon, TrophyIcon, ChartPieIcon, AcademicCapIcon, BuildingLibraryIcon, BeakerIcon, ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid, ComposedChart, ScatterChart, Scatter } from 'recharts';


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
    if (!time || !time.includes(':')) return 'Invalid Time';
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${String(formattedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
};

// --- Report View Components ---

const ReportContents: React.FC<{ report: ReportData }> = ({ report }) => {
    const { user } = useContext(UserContext);

    const wellnessEmojis = ['❓', '😞', '😐', '🙂', '😊', '😄'];
    const { avgMood, avgSleep } = report.wellnessSummary;
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const DOUBT_COLORS: { [key: string]: string } = { 'Cleared': '#10b981', 'Still Confusing': '#f59e0b' };

    const totalHoursData = [
      { name: 'Self-Study', hours: report.totalStudyHours },
      { name: 'Coaching', hours: report.totalCoachingHours },
    ];
    
    const dailyTrendData = report.dailyBreakdown.map(day => ({
        date: day.date.substring(5), // M-D
        'Study Hours': parseFloat(day.studyHours.toFixed(1)),
        'Coaching Hours': parseFloat(day.coachingHours.toFixed(1)),
    }));

    const wellnessTrendData = report.dailyBreakdown.map(day => ({
        date: day.date.substring(5),
        'Efficiency (%)': day.efficiency,
        'Mood': day.wellness?.mood || day.dailyMood,
        'Sleep (hrs)': day.wellness?.sleepHours,
    }));
    
    return (
        <div className="mt-6 bg-surface p-6 sm:p-8 rounded-xl shadow-lg border border-accent printable-area print-bg-white font-inter" id="report-content">
            <div className="hidden print:block text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800">GURPINDER's PREP TRACKER</h1>
                <p className="text-xl mt-2 text-slate-600">{user?.displayName}'s Performance Report</p>
            </div>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-text-primary print-text-black">{report.title}</h2>
                    <p className="text-text-secondary print-text-black">{report.dateRange}</p>
                </div>
            </div>
            
            <div className="no-print mt-6 text-center bg-gradient-to-r from-primary to-primary-dark p-6 rounded-lg text-white shadow-lg">
                <DocumentArrowDownIcon className="w-12 h-12 mx-auto text-amber-300" />
                <h3 className="text-xl font-bold mt-2">Your Mega Report is Ready!</h3>
                <p className="text-indigo-200 mb-4 text-sm sm:text-base">Download a comprehensive PDF of this report for offline analysis or sharing.</p>
                <button onClick={() => window.print()} className="bg-white text-primary font-semibold py-2 px-4 sm:px-6 rounded-full hover:bg-indigo-100 transition-transform hover:scale-105 text-sm sm:text-base">
                    Download Your Mega Report
                </button>
            </div>

            <div className="mt-8 text-center border-b-2 border-accent pb-6 page-break-avoid">
                 <h3 className="text-2xl font-bold text-text-primary print-text-black mb-4">Executive Summary</h3>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div className="bg-background print-bg-white p-4 rounded-lg"><p className="text-sm text-text-secondary print-text-black">Total Study Hours</p><p className="text-3xl font-bold text-primary print-text-black">{(report.totalStudyHours + report.totalCoachingHours).toFixed(1)}</p></div>
                    <div className="bg-background print-bg-white p-4 rounded-lg"><p className="text-sm text-text-secondary print-text-black">Avg. Efficiency</p><p className="text-3xl font-bold text-primary print-text-black">{report.avgEfficiency?.toFixed(0) ?? 'N/A'}%</p></div>
                    <div className="bg-background print-bg-white p-4 rounded-lg"><p className="text-sm text-text-secondary print-text-black">Questions Solved</p><p className="text-3xl font-bold text-primary print-text-black">{report.totalQuestionsSolved}</p></div>
                    <div className="bg-background print-bg-white p-4 rounded-lg"><p className="text-sm text-text-secondary print-text-black">Topics Completed</p><p className="text-3xl font-bold text-primary print-text-black">{report.completedTopicsCount}</p></div>
                    <div className="bg-background print-bg-white p-4 rounded-lg"><p className="text-sm text-text-secondary print-text-black">Tasks Done</p><p className="text-3xl font-bold text-primary print-text-black">{report.completedTasksCount}</p></div>
                </div>
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-background print-bg-white p-4 rounded-lg"><h3 className="text-lg font-bold text-text-primary print-text-black mb-2">Study Hours Breakdown</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={totalHoursData} dataKey="hours" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    <Cell fill="#3b82f6" /><Cell fill="#6366f1" />
                                </Pie>
                                <Tooltip formatter={(value) => `${(value as number).toFixed(1)} hrs`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-background print-bg-white p-4 rounded-lg flex flex-col justify-center"><h3 className="text-lg font-bold text-text-primary print-text-black mb-2">Wellness Summary</h3><div className="flex justify-around items-center"><div className="text-center"><p className="text-4xl">{wellnessEmojis[Math.round(avgMood || 0)]}</p><p className="text-sm text-text-secondary print-text-black">Avg. Mood</p></div><div className="text-center"><p className="text-3xl font-bold text-primary print-text-black">{avgSleep?.toFixed(1) ?? 'N/A'}</p><p className="text-sm text-text-secondary print-text-black">Avg. Sleep (hrs)</p></div></div></div>
                </div>
            </div>
            
            <div className="mt-8 page-break-avoid">
                <h3 className="text-2xl font-bold text-text-primary print-text-black mb-4 text-center">Performance Metrics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-background print-bg-white p-4 rounded-lg"><h3 className="text-lg font-bold text-text-primary print-text-black mb-2">Daily Study Trend (Hours)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={dailyTrendData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date" interval={dailyTrendData.length > 8 ? Math.floor(dailyTrendData.length / 7) : 0} tick={{ fontSize: 10 }} /><YAxis/><Tooltip/><Legend/><Line type="monotone" dataKey="Study Hours" stroke="#3b82f6" strokeWidth={2}/><Line type="monotone" dataKey="Coaching Hours" stroke="#6366f1" strokeWidth={2}/></LineChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="bg-background print-bg-white p-4 rounded-lg"><h3 className="text-lg font-bold text-text-primary print-text-black mb-2">Wellness & Efficiency Trend</h3>
                        <ResponsiveContainer width="100%" height={250}>
                             <ComposedChart data={wellnessTrendData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="date" interval={wellnessTrendData.length > 8 ? Math.floor(wellnessTrendData.length / 7) : 0} tick={{ fontSize: 10 }} />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" domain={[0, 100]} unit="%" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 10]} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="Efficiency (%)" barSize={20} fill="#6366f1" />
                                <Line yAxisId="right" type="monotone" dataKey="Mood" stroke="#f59e0b" />
                                <Line yAxisId="right" type="monotone" dataKey="Sleep (hrs)" stroke="#10b981" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="bg-background print-bg-white p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-text-primary print-text-black mb-2">Time Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={report.timeDistribution} dataKey="hours" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {report.timeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value) => `${(value as number).toFixed(1)} hrs`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-background print-bg-white p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-text-primary print-text-black mb-2">Doubts by Subject</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={report.doubtsBySubject}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="subject"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="count" name="Doubts"><Cell fill="#3b82f6"/><Cell fill="#10b981"/><Cell fill="#f59e0b"/></Bar></BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="mt-8 page-break-avoid">
                 <h3 className="text-2xl font-bold text-text-primary print-text-black mb-4 text-center">Question Practice Analysis</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="bg-background print-bg-white p-4 rounded-lg"><h3 className="text-lg font-bold text-text-primary print-text-black mb-2">Questions Solved by Subject</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={report.questionsBySubject}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="subject"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="count" name="Questions"><Cell fill="#3b82f6"/><Cell fill="#10b981"/><Cell fill="#f59e0b"/></Bar></BarChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="bg-background print-bg-white p-4 rounded-lg"><h3 className="text-lg font-bold text-text-primary print-text-black mb-2">Questions by Type</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={report.questionsByType} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={60} outerRadius={80} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => { const radius = innerRadius + (outerRadius - innerRadius) * 0.5; const x = cx + radius * Math.cos(-midAngle * Math.PI / 180); const y = cy + radius * Math.sin(-midAngle * Math.PI / 180); return (<text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>);}}>
                                    {report.questionsByType.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="bg-background print-bg-white p-4 rounded-lg"><h3 className="text-lg font-bold text-text-primary print-text-black mb-2">Questions by Source</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={report.questionsBySource} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={80} label>
                                    {report.questionsBySource.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
            </div>
            
            {report.testsTaken.length > 0 && 
            <div className="mt-8 page-break-avoid"><h3 className="text-2xl font-bold text-text-primary print-text-black mb-2 text-center">Tests Taken</h3>
                <div className="bg-background print-bg-white p-4 rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className="border-b-2 border-accent"><th className="p-2">Name</th><th>Type</th><th>Score</th><th>Physics</th><th>Chemistry</th><th>Math</th></tr></thead>
                            <tbody>{report.testsTaken.map(t => { const neg = t.negativeMarks || { physics: 0, chemistry: 0, math: 0 }; const total = (t.marks.physics-neg.physics)+(t.marks.chemistry-neg.chemistry)+(t.marks.math-neg.math); return (<tr key={t.id} className="border-b border-accent/50"><td className="p-2 font-semibold">{t.name}</td><td>{t.type}</td><td className="p-2 font-bold">{total}/{t.totalMarks}</td><td>{t.marks.physics-neg.physics}</td><td>{t.marks.chemistry-neg.chemistry}</td><td>{t.marks.math-neg.math}</td></tr>)})}</tbody>
                        </table>
                    </div>
                </div>
            </div>}

            <div className="mt-8 page-break-before">
                <h3 className="text-2xl font-bold text-text-primary print-text-black mb-4 text-center">Daily Breakdown</h3>
                {report.dailyBreakdown.map(day => (
                    <div key={day.date} className="bg-background print-bg-white p-6 rounded-lg mb-6 page-break-avoid border border-accent">
                        <h4 className="text-xl font-bold text-text-primary print-text-black border-b-2 border-accent pb-2 mb-4">{formatDateToDisplay(day.date)}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div><p className="text-2xl font-bold text-primary print-text-black">{day.studyHours.toFixed(1)}</p><p className="text-sm text-text-secondary print-text-black">Study Hours</p></div>
                            <div><p className="text-2xl font-bold text-primary print-text-black">{day.coachingHours.toFixed(1)}</p><p className="text-sm text-text-secondary print-text-black">Coaching Hours</p></div>
                            <div><p className="text-2xl font-bold text-primary print-text-black">{day.efficiency?.toFixed(0) ?? 'N/A'}%</p><p className="text-sm text-text-secondary print-text-black">Efficiency</p></div>
                            <div><p className="text-2xl font-bold text-primary print-text-black">{day.questionsSolved.reduce((sum, q) => sum + q.count, 0)}</p><p className="text-sm text-text-secondary print-text-black">Questions</p></div>
                        </div>
                        {day.schedule.length > 0 && (
                        <div className="mt-4">
                            <h5 className="font-semibold mb-2 print-text-black">Schedule</h5>
                            <ul className="text-sm space-y-1">{day.schedule.map(slot => (<li key={slot.id} className="flex items-center gap-2 print-text-black"><span className="font-mono text-text-secondary print-text-black w-20">{formatTimeToAMPM(slot.startTime)}</span><span className={slot.status === 'Completed' ? 'line-through text-text-secondary print-text-black' : ''}>{slot.activityName}</span></li>))}</ul>
                        </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ChapterAnalysisView: React.FC<{ report: ReportData }> = ({ report }) => {
    const { user } = useContext(UserContext);
    const [selectedSubject, setSelectedSubject] = useState<SubjectName | ''>('');
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    
    const chapterLeaderboards = useMemo(() => {
        const chapters = Array.from(report.chapterAnalysis.entries()).map(([key, data]) => {
            const [subject, chapterName] = key.split(':');
            return { subject, chapterName, ...data };
        });
        
        const mostPracticed = [...chapters].sort((a,b) => b.questionCount.total - a.questionCount.total).slice(0, 5);
        const mostTested = [...chapters].sort((a,b) => b.testCount - a.testCount).slice(0, 5);
        
        return { mostPracticed, mostTested };
    }, [report.chapterAnalysis]);

    const subjectChapters = useMemo(() => {
        if (!user || !selectedSubject) return [];
        const subjectData = user.topics[selectedSubject.toLowerCase() as keyof typeof user.topics];
        return 'chapters' in subjectData ? subjectData.chapters.map(c => c.name) : subjectData.sections.flatMap(s => s.chapters).map(c => c.name);
    }, [user, selectedSubject]);

    const selectedChapterData = useMemo(() => {
        if (!selectedSubject || !selectedChapter) return null;
        return report.chapterAnalysis.get(`${selectedSubject}:${selectedChapter}`);
    }, [selectedSubject, selectedChapter, report.chapterAnalysis]);

    return (
        <div className="mt-6 space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">Chapter Leaderboards</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-surface p-4 rounded-lg border border-accent"><h4 className="text-lg font-bold text-text-primary mb-2 text-center">Most Practiced Chapters (by Questions)</h4>
                         <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chapterLeaderboards.mostPracticed} layout="vertical" margin={{left: 100}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="chapterName" width={100} tick={{fontSize: 12}}/>
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="questionCount.Basic" stackId="a" fill="#a7f3d0" name="Basic" />
                                <Bar dataKey="questionCount.Mains" stackId="a" fill="#3b82f6" name="Mains" />
                                <Bar dataKey="questionCount.Advanced" stackId="a" fill="#ef4444" name="Advanced" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="bg-surface p-4 rounded-lg border border-accent"><h4 className="text-lg font-bold text-text-primary mb-2 text-center">Most Tested Chapters</h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chapterLeaderboards.mostTested} layout="vertical" margin={{left: 100}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="chapterName" width={100} tick={{fontSize: 12}} />
                                <Tooltip />
                                <Bar dataKey="testCount" name="Times in Tests" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
             <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">Chapter Deep Dive</h3>
                <div className="bg-surface p-4 rounded-lg border border-accent flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value as SubjectName); setSelectedChapter(''); }} className="p-2 bg-background border border-accent rounded-md">
                        <option value="">-- Select Subject --</option>
                        <option value="Physics">Physics</option><option value="Chemistry">Chemistry</option><option value="Math">Math</option>
                    </select>
                    <select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} className="p-2 bg-background border border-accent rounded-md" disabled={!selectedSubject}>
                         <option value="">-- Select Chapter --</option>
                         {subjectChapters.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                {selectedChapterData && (
                    <div className="mt-4 bg-background p-6 rounded-lg border border-accent animate-fade-in space-y-4">
                        <h4 className="text-xl font-bold">{selectedSubject}: {selectedChapter}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-surface rounded"><p className="text-2xl font-bold text-primary">{selectedChapterData.questionCount.total}</p><p className="text-sm text-text-secondary">Questions Solved</p></div>
                             <div className="text-center p-3 bg-surface rounded"><p className="text-lg font-semibold">{selectedChapterData.questionCount.Basic} Basic / {selectedChapterData.questionCount.Mains} Mains / {selectedChapterData.questionCount.Advanced} Advanced</p><p className="text-sm text-text-secondary">Question Breakdown</p></div>
                            <div className="text-center p-3 bg-surface rounded"><p className="text-2xl font-bold text-primary">{selectedChapterData.testCount}</p><p className="text-sm text-text-secondary">Times in Tests</p></div>
                        </div>
                        {selectedChapterData.coachingLectures.length > 0 && <div>
                            <h5 className="font-semibold mb-2">Coaching Lectures</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">{selectedChapterData.coachingLectures.map(l=><li key={l.id}>{l.category} class by {l.teacher} ({formatDateToDisplay(report.dailyBreakdown.find(d => d.coachingActivities.some(a=>a.id === l.id))?.date || '')})</li>)}</ul>
                        </div>}
                    </div>
                )}
            </div>
        </div>
    );
};

const CoachingInsightsView: React.FC<{ report: ReportData }> = ({ report }) => {
    const { teacherData, categoryDistribution, moodCorrelation, assignedHomework } = report.coachingInsights;
    
    return (
        <div className="mt-6 space-y-8">
            <h3 className="text-2xl font-bold text-text-primary text-center">Coaching Insights</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-surface p-4 rounded-lg border border-accent"><h4 className="text-lg font-bold text-text-primary mb-2 text-center">Hours by Teacher</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart><Pie data={teacherData} dataKey="hours" nameKey="name" cx="50%" cy="50%" outerRadius={80} label /><Tooltip formatter={(value)=>(value as number).toFixed(1) + ' hrs'}/><Legend/></PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="bg-surface p-4 rounded-lg border border-accent"><h4 className="text-lg font-bold text-text-primary mb-2 text-center">Average Rating by Teacher</h4>
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={teacherData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={50} tick={{ fontSize: 10 }} /><YAxis domain={[0, 5]}/><Tooltip/><Bar dataKey="avgRating" name="Avg Rating" fill="#10b981" /></BarChart>
                    </ResponsiveContainer>
                 </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface p-4 rounded-lg border border-accent"><h4 className="text-lg font-bold text-text-primary mb-2 text-center">Lecture Category Distribution</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart><Pie data={categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label /><Tooltip/><Legend/></PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-surface p-4 rounded-lg border border-accent"><h4 className="text-lg font-bold text-text-primary mb-2 text-center">Coaching Motivation vs Daily Mood</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart data={moodCorrelation}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date" interval={moodCorrelation.length > 8 ? Math.floor(moodCorrelation.length / 7) : 0} tick={{ fontSize: 10 }}/><YAxis domain={[0,5]}/><Tooltip/><Legend/>
                            <Bar dataKey="mood" name="Daily Mood" fill="#f59e0b" />
                            <Line type="monotone" dataKey="motivation" name="Coaching Motivation" stroke="#ef4444" strokeWidth={2}/>
                        </ComposedChart>
                    </ResponsiveContainer>
                 </div>
            </div>
            {assignedHomework.length > 0 && <div>
                <h4 className="text-lg font-bold text-text-primary mb-2 text-center">Assigned Homework</h4>
                <div className="bg-surface p-4 rounded-lg border border-accent max-h-64 overflow-y-auto">
                    <ul className="space-y-2">{assignedHomework.map((hw, i) => (<li key={i} className="bg-background p-2 rounded-md text-sm"><span className="font-semibold">{formatDateToDisplay(hw.date)}</span> by {hw.teacher}: {hw.task}</li>))}</ul>
                </div>
            </div>}
        </div>
    );
};

const AdvancedAnalytics: React.FC<{ tests: TestResult[] }> = ({ tests }) => {
    const subjectPerformance = useMemo(() => {
        if (tests.length === 0) return [];
        const data: { [key in SubjectName]: { score: number, negative: number, max: number, count: number } } = { Physics: { score: 0, negative: 0, max: 0, count: 0 }, Chemistry: { score: 0, negative: 0, max: 0, count: 0 }, Math: { score: 0, negative: 0, max: 0, count: 0 } };
        tests.forEach(test => {
            const neg = test.negativeMarks || { physics: 0, chemistry: 0, math: 0 };
            const maxPerSubject = test.totalMarks > 0 ? test.totalMarks / 3 : 100;
            data.Physics.score += test.marks.physics - neg.physics; data.Physics.negative += neg.physics; data.Physics.max += maxPerSubject; data.Physics.count++;
            data.Chemistry.score += test.marks.chemistry - neg.chemistry; data.Chemistry.negative += neg.chemistry; data.Chemistry.max += maxPerSubject; data.Chemistry.count++;
            data.Math.score += test.marks.math - neg.math; data.Math.negative += neg.math; data.Math.max += maxPerSubject; data.Math.count++;
        });
        return [
            { subject: 'Physics', '% Score': data.Physics.max > 0 ? Math.max(0, (data.Physics.score / data.Physics.max) * 100) : 0, 'Avg Negative': data.Physics.count > 0 ? data.Physics.negative / data.Physics.count : 0 },
            { subject: 'Chemistry', '% Score': data.Chemistry.max > 0 ? Math.max(0, (data.Chemistry.score / data.Chemistry.max) * 100) : 0, 'Avg Negative': data.Chemistry.count > 0 ? data.Chemistry.negative / data.Chemistry.count : 0 },
            { subject: 'Math', '% Score': data.Math.max > 0 ? Math.max(0, (data.Math.score / data.Math.max) * 100) : 0, 'Avg Negative': data.Math.count > 0 ? data.Math.negative / data.Math.count : 0 },
        ];
    }, [tests]);
    const negativeVsScore = useMemo(() => tests.map(test => { const neg = test.negativeMarks || { physics: 0, chemistry: 0, math: 0 }; return { negative: neg.physics + neg.chemistry + neg.math, score: (test.marks.physics - neg.physics) + (test.marks.chemistry - neg.chemistry) + (test.marks.math - neg.math) } }), [tests]);
    const scopePerformance = useMemo(() => {
        const scopeData: { [key: string]: { scores: number[]; count: number } } = {};
        tests.forEach(test => {
            const scope = test.testScope || 'N/A';
            if (!scopeData[scope]) scopeData[scope] = { scores: [], count: 0 };
            const neg = test.negativeMarks || { physics: 0, chemistry: 0, math: 0 };
            const netScore = (test.marks.physics - neg.physics) + (test.marks.chemistry - neg.chemistry) + (test.marks.math - neg.math);
            scopeData[scope].scores.push(netScore); scopeData[scope].count++;
        });
        return Object.entries(scopeData).map(([name, data]) => ({ name, 'Avg Score': data.scores.reduce((a, b) => a + b, 0) / data.count, 'Tests': data.count }));
    }, [tests]);
    return (<div className="bg-surface p-6 rounded-xl shadow-md border border-accent"><h2 className="text-xl font-bold text-text-primary mb-4">Advanced Analytics</h2><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div><h3 className="text-lg font-semibold text-center mb-2">Subject Performance vs. Negative Marks</h3><ResponsiveContainer width="100%" height={250}><BarChart data={subjectPerformance}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="subject" tick={{ fill: '#475569' }} /><YAxis yAxisId="left" orientation="left" stroke="#3b82f6" label={{ value: '% Score', angle: -90, position: 'insideLeft' }} /><YAxis yAxisId="right" orientation="right" stroke="#ef4444" label={{ value: 'Avg Negative', angle: 90, position: 'insideRight' }} /><Tooltip /><Legend /><Bar yAxisId="left" dataKey="% Score" fill="#3b82f6" /><Bar yAxisId="right" dataKey="Avg Negative" fill="#ef4444" /></BarChart></ResponsiveContainer></div><div><h3 className="text-lg font-semibold text-center mb-2">Total Negative Marks vs. Final Score</h3><ResponsiveContainer width="100%" height={250}><ScatterChart><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" dataKey="negative" name="Negative Marks" unit="" tick={{ fill: '#475569' }} /><YAxis type="number" dataKey="score" name="Final Score" unit="" tick={{ fill: '#475569' }} /><Tooltip cursor={{ strokeDasharray: '3 3' }} /><Scatter name="Tests" data={negativeVsScore} fill="#8b5cf6" /></ScatterChart></ResponsiveContainer></div><div className="lg:col-span-2"><h3 className="text-lg font-semibold text-center mb-2">Average Score by Test Scope</h3><ResponsiveContainer width="100%" height={250}><BarChart data={scopePerformance}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fill: '#475569' }} /><YAxis /><Tooltip /><Legend /><Bar dataKey="Avg Score" fill="#10b981" /></BarChart></ResponsiveContainer></div></div></div>);
};

const TestAnalysisView: React.FC<{ report: ReportData }> = ({ report }) => {
    const { testAnalysis } = report;
    if (testAnalysis.totalTests === 0) {
        return <p className="text-center text-text-secondary py-10">No tests taken in this period to analyze.</p>;
    }

    const performanceDataWithIndex = testAnalysis.performanceData.map((d, i) => ({ ...d, index: i }));

    return (
        <div className="mt-6 space-y-8">
            <h3 className="text-2xl font-bold text-text-primary text-center">Test Analysis</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-surface p-3 rounded-lg"><p className="text-2xl font-bold text-primary">{testAnalysis.totalTests}</p><p className="text-sm text-text-secondary">Tests Taken</p></div>
                <div className="bg-surface p-3 rounded-lg"><p className="text-2xl font-bold text-primary">{testAnalysis.highestScore.toFixed(1)}</p><p className="text-sm text-text-secondary">Highest Score</p></div>
                <div className="bg-surface p-3 rounded-lg"><p className="text-2xl font-bold text-primary">{testAnalysis.averageScore.toFixed(1)}</p><p className="text-sm text-text-secondary">Average Score</p></div>
                <div className="bg-surface p-3 rounded-lg"><p className="text-2xl font-bold text-danger">{testAnalysis.averageNegative.toFixed(1)}</p><p className="text-sm text-text-secondary">Avg. Negative</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface p-4 rounded-lg border border-accent">
                    <h4 className="text-lg font-bold text-text-primary mb-2 text-center">Score Progression</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceDataWithIndex}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="index" tickFormatter={(index) => performanceDataWithIndex[index]?.date || ''} interval={performanceDataWithIndex.length > 8 ? Math.floor(performanceDataWithIndex.length / 7) : 0} tick={{ fontSize: 10 }} /><YAxis/><Tooltip/><Legend/><Line type="monotone" dataKey="Total" name="Score" stroke="#3b82f6" strokeWidth={2}/></LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-surface p-4 rounded-lg border border-accent">
                    <h4 className="text-lg font-bold text-text-primary mb-2 text-center">Class Rank Progression</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceDataWithIndex}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="index" tickFormatter={(index) => performanceDataWithIndex[index]?.date || ''} interval={performanceDataWithIndex.length > 8 ? Math.floor(performanceDataWithIndex.length / 7) : 0} tick={{ fontSize: 10 }} /><YAxis reversed={true} domain={['dataMin', 'dataMax']} /><Tooltip/><Legend/><Line type="monotone" dataKey="Rank" name="Class Rank" stroke="#8b5cf6" connectNulls strokeWidth={2}/></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <AdvancedAnalytics tests={report.testsTaken} />

            <div className="bg-surface p-6 rounded-xl shadow-md border border-accent">
                <h2 className="text-xl font-bold text-text-primary mb-4">Test History for Period</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-sm text-text-secondary"><tr className="border-b border-accent"><th className="p-2 font-semibold">Date</th><th className="p-2 font-semibold">Name</th><th className="p-2 font-semibold">Scope</th><th className="p-2 font-semibold">Rank</th><th className="p-2 font-semibold">Score</th></tr></thead>
                        <tbody>
                            {report.testsTaken.map(test => {
                                const neg = test.negativeMarks || { physics: 0, chemistry: 0, math: 0 };
                                const totalScore = (test.marks.physics - neg.physics) + (test.marks.chemistry - neg.chemistry) + (test.marks.math - neg.math);
                                return (
                                <tr key={test.id} className="border-b border-accent/50">
                                    <td className="p-2 text-text-secondary">{new Date(test.date + 'T00:00:00').toLocaleDateString()}</td>
                                    <td className="p-2 text-text-primary font-medium">{test.name}</td>
                                    <td className="p-2 text-text-secondary">{test.testScope}</td>
                                    <td className="p-2 text-text-primary font-semibold">{test.classRank || '-'}</td>
                                    <td className="p-2 text-text-primary font-bold">{totalScore}/{test.totalMarks}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const Reports: React.FC = () => {
    const { user } = useContext(UserContext);
    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return formatDate(d);
    });
    const [endDate, setEndDate] = useState<string>(formatDate(new Date()));
    const [report, setReport] = useState<ReportData | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'chapters' | 'coaching' | 'tests'>('summary');

    const generateReport = useCallback((start: string, end: string): ReportData | null => {
        if (!user) return null;

        const startDateObj = new Date(`${start}T00:00:00`);
        const endDateObj = new Date(`${end}T23:59:59`);
        
        const dateFilter = (item: { date: string }) => {
            const d = new Date(`${item.date}T00:00:00`);
            return d >= startDateObj && d <= endDateObj;
        };

        const plansInRange = user.dailyPlans.filter(dateFilter);
        const testsInRange = user.tests.filter(dateFilter);
        const wellnessInRange = user.wellnessLogs.filter(dateFilter);
        const coachingLogsInRange = user.coachingLogs.filter(dateFilter);
        const challengesInRange = user.challenges.filter(c => new Date(c.startDate) <= endDateObj && new Date(c.endDate) >= startDateObj);
        const doubtsInRange = user.doubts.filter(dateFilter);
        
        const dailyBreakdown: DailyBreakdownItem[] = [];
        const chapterAnalysis = new Map<string, ChapterReportDetails>();
        const teacherDataMap = new Map<string, { lectures: CoachingLecture[], totalHours: number }>();

        const getChapterData = (subject: SubjectName, chapterName: string) => {
            const key = `${subject}:${chapterName}`;
            if (!chapterAnalysis.has(key)) {
                chapterAnalysis.set(key, { questionCount: { Basic: 0, Mains: 0, Advanced: 0, total: 0, bySource: {} }, testCount: 0, coachingLectures: [], studyHours: 0 });
            }
            return chapterAnalysis.get(key)!;
        };

        for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
            const dateString = formatDate(d);
            const plan = plansInRange.find(p => p.date === dateString);
            const coachingLog = coachingLogsInRange.find(l => l.date === dateString);
            if (!plan && !coachingLog) continue;

            let studyHours = 0, coachingHours = 0;
            
            plan?.questionsSolved.forEach(q => {
                const data = getChapterData(q.subject, q.chapter);
                data.questionCount[q.type] += q.count;
                data.questionCount.total += q.count;
                const source = q.source || 'Other';
                data.questionCount.bySource[source] = (data.questionCount.bySource[source] || 0) + q.count;
            });
            
            coachingLog?.activities.forEach(act => {
                const s = new Date(`1970-01-01T${act.startTime}:00`);
                const e = new Date(`1970-01-01T${act.endTime}:00`);
                if (e > s) coachingHours += (e.getTime() - s.getTime()) / (1000 * 60 * 60);
            });

            const allPlannedTopics = plan ? [...plan.subjectPlans.Physics, ...plan.subjectPlans.Chemistry, ...plan.subjectPlans.Math] : [];
            plan?.schedule.forEach(slot => {
                const isCoaching = coachingLog?.activities.some(act => act.id === slot.plannedTopicId);
                if (slot.status === 'Completed' && slot.subject && !isCoaching) {
                    const s = new Date(`1970-01-01T${slot.startTime}:00`);
                    const e = new Date(`1970-01-01T${slot.endTime}:00`);
                    const duration = (e > s) ? (e.getTime() - s.getTime()) / (1000 * 60 * 60) : 0;
                    studyHours += duration;
                    const topic = allPlannedTopics.find(t => t.id === slot.plannedTopicId);
                    if (topic) {
                        getChapterData(topic.subject, topic.chapterName).studyHours += duration;
                    }
                }
            });

            const scheduledSlots = plan?.schedule.filter(s => s.plannedTopicId) || [];
            const efficiency = scheduledSlots.length > 0 ? (scheduledSlots.filter(s => s.status === 'Completed').length / scheduledSlots.length) * 100 : null;
            
            const scheduleForReport: ReportHourlySlot[] = (plan?.schedule || []).map(slot => {
                let activityName = "Free Slot";
                let activityType: ReportHourlySlot['activityType'] = 'free';

                if (slot.plannedTopicId) {
                    const topic = allPlannedTopics.find(t => t.id === slot.plannedTopicId);
                    if (topic) { activityName = `${topic.subject}: ${topic.chapterName}`; activityType = 'topic'; }
                    const task = plan?.tasks.find(t => t.id === slot.plannedTopicId);
                    if (task) { activityName = task.text; activityType = 'task'; }
                    const lecture = user.lectures.find(l => `lecture-${l.id}` === slot.plannedTopicId);
                    if (lecture) { activityName = `Lecture: ${lecture.title}`; activityType = 'lecture'; }
                    const coaching = coachingLog?.activities.find(c => c.id === slot.plannedTopicId);
                    if(coaching) {
                        activityName = coaching.type === 'lecture' ? `Coaching: ${coaching.subject} - ${coaching.chapter}` : coaching.type === 'test' ? `Coaching Test: ${coaching.testName}` : `Coaching: ${coaching.description}`;
                        activityType = 'coaching';
                    }
                }
                return { ...slot, activityName, activityType };
            });

            dailyBreakdown.push({
                date: dateString,
                studyHours,
                coachingHours,
                efficiency,
                completedTopics: plan ? allPlannedTopics.filter(t => t.status === 'Completed').map(t => ({ subject: t.subject, name: t.chapterName })) : [],
                completedTasks: plan ? plan.tasks.filter(t => t.status === 'Completed').map(t => t.text) : [],
                schedule: scheduleForReport,
                wellness: wellnessInRange.find(w => w.date === dateString) || null,
                dailyMood: plan?.dailyMood || null,
                questionsSolved: plan?.questionsSolved || [],
                coachingActivities: coachingLog?.activities || [],
            });
        }

        testsInRange.forEach(test => {
            test.syllabus.forEach(item => {
                getChapterData(item.subject as SubjectName, item.chapter).testCount += 1;
            });
        });

        coachingLogsInRange.flatMap(log => log.activities).forEach(act => {
            if (act.type === 'lecture') {
                getChapterData(act.subject, act.chapter).coachingLectures.push(act);
                if (!teacherDataMap.has(act.teacher)) {
                    teacherDataMap.set(act.teacher, { lectures: [], totalHours: 0 });
                }
                const teacher = teacherDataMap.get(act.teacher)!;
                teacher.lectures.push(act);
                const s = new Date(`1970-01-01T${act.startTime}:00`);
                const e = new Date(`1970-01-01T${act.endTime}:00`);
                if(e > s) teacher.totalHours += (e.getTime() - s.getTime()) / (1000 * 60 * 60);
            }
        });
        
        const teacherData: TeacherReportDetails[] = Array.from(teacherDataMap.entries()).map(([name, data]) => {
            const ratings = data.lectures.map(l => l.rating).filter(r => r > 0);
            const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
            return { name, hours: data.totalHours, lectureCount: data.lectures.length, avgRating };
        });

        const totalStudyHours = dailyBreakdown.reduce((sum, day) => sum + day.studyHours, 0);
        const totalCoachingHours = dailyBreakdown.reduce((sum, day) => sum + day.coachingHours, 0);
        const efficiencies = dailyBreakdown.map(d => d.efficiency).filter((e): e is number => e !== null);
        const avgEfficiency = efficiencies.length > 0 ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length : null;
        
        const completedTopicsCount = dailyBreakdown.reduce((sum, day) => sum + day.completedTopics.length, 0);
        const completedTasksCount = dailyBreakdown.reduce((sum, day) => sum + day.completedTasks.length, 0);
        const studyHoursBySubject = (['Physics', 'Chemistry', 'Math'] as SubjectName[]).map(subject => ({
            subject,
            hours: Array.from(chapterAnalysis.entries())
                .filter(([key]) => key.startsWith(`${subject}:`))
                .reduce((sum, [, data]) => sum + data.studyHours, 0)
        }));

        const totalQuestionsSolved = plansInRange.reduce((sum, p) => sum + p.questionsSolved.reduce((s, q) => s + q.count, 0), 0);
        const questionsBySubject = (['Physics', 'Chemistry', 'Math'] as SubjectName[]).map(subject => ({
            subject,
            count: plansInRange.reduce((sum, p) => sum + p.questionsSolved.filter(q => q.subject === subject).reduce((s, q) => s + q.count, 0), 0)
        }));

        const questionsByTypeRaw = plansInRange
            .flatMap(p => p.questionsSolved)
            .reduce<Record<string, number>>((acc, q) => {
                acc[q.type] = (acc[q.type] || 0) + q.count;
                return acc;
            }, {});
        const questionsByType = Object.entries(questionsByTypeRaw).map(([type, count]) => ({ type, count: count as number }));
        
        const questionsBySourceRaw = plansInRange
            .flatMap(p => p.questionsSolved)
            .reduce<Record<string, number>>((acc, q) => {
                const source = q.source || 'Other';
                acc[source] = (acc[source] || 0) + q.count;
                return acc;
            }, {});
        const questionsBySource = Object.entries(questionsBySourceRaw).map(([source, count]) => ({ source, count: count as number }));

        const moodLogs = wellnessInRange.map(w => w.mood).filter(m => m > 0);
        const avgMood = moodLogs.length > 0 ? moodLogs.reduce((a, b) => a + b, 0) / moodLogs.length : null;
        const sleepLogs = wellnessInRange.map(w => w.sleepHours).filter(s => s > 0);
        const avgSleep = sleepLogs.length > 0 ? sleepLogs.reduce((a, b) => a + b, 0) / sleepLogs.length : null;

        const categoryDistributionRaw = coachingLogsInRange
            .flatMap(log => log.activities)
            .filter((act): act is CoachingLecture => act.type === 'lecture')
            .reduce<Record<string, number>>((acc, lecture) => {
                acc[lecture.category] = (acc[lecture.category] || 0) + 1;
                return acc;
            }, {});
        const categoryDistribution = Object.entries(categoryDistributionRaw).map(([name, value]) => ({ name, value: value as number }));
        
        const moodCorrelation = dailyBreakdown.map(day => ({
            date: day.date.substring(5),
            motivation: coachingLogsInRange.find(l => l.date === day.date)?.motivation,
            mood: day.wellness?.mood || day.dailyMood,
        })).filter(item => item.motivation !== undefined || item.mood !== undefined);

        const assignedHomework = coachingLogsInRange.flatMap(log => log.activities.filter((act): act is CoachingLecture => act.type === 'lecture' && !!act.homework).map(act => ({
            date: log.date,
            task: act.homework,
            teacher: act.teacher,
        })));

        const doubtsBySubject = (['Physics', 'Chemistry', 'Math'] as SubjectName[]).map(subject => ({
            subject,
            count: doubtsInRange.filter(d => d.subject === subject).length
        }));
        
        const doubtResolutionRaw = doubtsInRange.reduce<Record<string, number>>((acc, doubt) => {
            acc[doubt.status] = (acc[doubt.status] || 0) + 1;
            return acc;
        }, {});
        const doubtResolution = Object.entries(doubtResolutionRaw).map(([name, value]) => ({ name, value: value as number }));

        const timeDistributionRaw: { [key: string]: number } = {};
        dailyBreakdown.forEach(day => {
            day.schedule.forEach(slot => {
                    const s = new Date(`1970-01-01T${slot.startTime}:00`);
                    const e = new Date(`1970-01-01T${slot.endTime}:00`);
                    const duration = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
                    if (duration > 0) {
                    let category = 'Free Time';
                    switch (slot.activityType) {
                        case 'topic': category = 'Self-Study (Topics)'; break;
                        case 'lecture': category = 'Self-Study (Lectures)'; break;
                        case 'coaching': category = 'Coaching'; break;
                        case 'task': category = 'Tasks'; break;
                        case 'activity': 
                            if (slot.activityName.toLowerCase().includes('rest') || slot.activityName.toLowerCase().includes('break')) {
                                category = 'Breaks & Other';
                            }
                            break;
                    }
                    timeDistributionRaw[category] = (timeDistributionRaw[category] || 0) + duration;
                    }
            });
        });
        const timeDistribution = Object.entries(timeDistributionRaw).map(([name, hours]) => ({ name, hours: parseFloat(hours.toFixed(1)) })).filter(item => item.hours > 0);
        
        const scores = testsInRange.map(t => (t.marks.physics - (t.negativeMarks?.physics || 0)) + (t.marks.chemistry - (t.negativeMarks?.chemistry || 0)) + (t.marks.math - (t.negativeMarks?.math || 0)));
        const testAnalysis: TestReportData = {
            totalTests: testsInRange.length,
            highestScore: testsInRange.length > 0 ? Math.max(...scores) : 0,
            averageScore: testsInRange.length > 0 ? scores.reduce((a,b)=> a+b,0) / scores.length : 0,
            averageNegative: testsInRange.length > 0 ? testsInRange.reduce((sum, t) => sum + (t.negativeMarks?.physics || 0) + (t.negativeMarks?.chemistry || 0) + (t.negativeMarks?.math || 0), 0) / testsInRange.length : 0,
            performanceData: testsInRange.map(t => ({
                date: t.date.substring(5),
                name: t.name,
                Total: (t.marks.physics - (t.negativeMarks?.physics || 0)) + (t.marks.chemistry - (t.negativeMarks?.chemistry || 0)) + (t.marks.math - (t.negativeMarks?.math || 0)),
                Negative: (t.negativeMarks?.physics || 0) + (t.negativeMarks?.chemistry || 0) + (t.negativeMarks?.math || 0),
                Rank: t.classRank,
            })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        };

        return {
            title: "Performance Report",
            dateRange: `${formatDateToDisplay(start)} - ${formatDateToDisplay(end)}`,
            totalStudyHours,
            totalCoachingHours,
            avgEfficiency,
            studyHoursBySubject,
            completedTopicsCount,
            completedTasksCount,
            totalQuestionsSolved,
            questionsBySubject,
            questionsByType,
            questionsBySource,
            testsTaken: testsInRange,
            wellnessSummary: { avgMood, avgSleep },
            challenges: challengesInRange,
            dailyBreakdown,
            chapterAnalysis,
            coachingInsights: {
                teacherData,
                categoryDistribution,
                moodCorrelation,
                assignedHomework,
            },
            doubtsBySubject,
            doubtResolution,
            timeDistribution,
            testAnalysis,
        };
    }, [user]);
    useEffect(() => {
        const initialReport = generateReport(startDate, endDate);
        setReport(initialReport);
    }, [generateReport, startDate, endDate]);

    const handleGenerate = () => {
        const generatedReport = generateReport(startDate, endDate);
        setReport(generatedReport);
    };
    
    const tabs = [
        { id: 'summary', name: 'Summary' },
        { id: 'chapters', name: 'Chapter Analysis' },
        { id: 'coaching', name: 'Coaching' },
        { id: 'tests', name: 'Test Analysis' }
    ];

    if (!user) return <div className="text-center p-8">Loading user data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-10 h-10 text-primary" />
                    <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
                </div>
            </div>

            <div className="bg-surface p-4 rounded-xl shadow-md border border-accent flex flex-col md:flex-row gap-4 items-center no-print">
                <div className="flex items-center gap-2">
                    <label htmlFor="start-date" className="font-semibold">From:</label>
                    <input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 bg-background border border-accent rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="end-date" className="font-semibold">To:</label>
                    <input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 bg-background border border-accent rounded-md" />
                </div>
                <button onClick={handleGenerate} className="w-full md:w-auto bg-primary text-white py-2 px-6 rounded-md font-semibold hover:bg-primary-dark transition-transform hover:scale-105 flex-grow md:flex-grow-0">
                    Generate Report
                </button>
            </div>

            {report ? (
                <div>
                    <div className="no-print border-b border-accent">
                        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        ${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-text-secondary hover:text-primary hover:border-gray-300'
                                        }
                                        whitespace-nowrap flex-shrink-0 py-3 px-1 border-b-2 font-medium text-sm transition-colors
                                    `}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className={`${activeTab === 'summary' ? 'block' : 'hidden'} print:block`}>
                        <ReportContents report={report} />
                    </div>
                    <div className={`${activeTab === 'chapters' ? 'block' : 'hidden'} print:block print-page-break-before`}>
                        <ChapterAnalysisView report={report} />
                    </div>
                     <div className={`${activeTab === 'coaching' ? 'block' : 'hidden'} print:block print-page-break-before`}>
                        <CoachingInsightsView report={report} />
                    </div>
                     <div className={`${activeTab === 'tests' ? 'block' : 'hidden'} print:block print-page-break-before`}>
                        <TestAnalysisView report={report} />
                    </div>
                </div>
            ) : (
                <div className="text-center text-text-secondary py-16">
                    <p>Select a date range and click "Generate Report" to see your performance analysis.</p>
                </div>
            )}
        </div>
    );
};

export default Reports;
