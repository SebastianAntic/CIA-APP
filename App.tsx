import React, { useState, useEffect } from 'react';
import { User, UserRole, Exam, Submission, Question, QuestionType, Answer, Feedback } from './types';
import { db } from './services/mockDb';
import { evaluateSubjectiveAnswer, generateQuestionsFromPrompt } from './services/geminiService';
import { 
  BookOpen, 
  CheckCircle, 
  LogOut, 
  Plus, 
  Save, 
  Clock,
  BrainCircuit,
  FileText,
  User as UserIcon,
  Loader2,
  Flag,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Eye,
  AlertTriangle,
  Edit2,
  Smartphone,
  Code
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- Components ---

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8 text-indigo-600">
    <Loader2 className="animate-spin h-8 w-8" />
  </div>
);

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'ai';
  className?: string;
  disabled?: boolean;
  icon?: any;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "", 
  disabled = false,
  icon: Icon,
  title
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-500 hover:bg-slate-100",
    ai: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      title={title}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

// --- Pages ---

// 1. Login Page
const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = db.authenticate(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-2xl">
              <BrainCircuit className="text-white h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">SmartCIA</h1>
          <p className="text-slate-500 mt-2">AI-Powered Continuous Assessment System</p>
        </div>

        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-6">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                required
                className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <Button className="w-full justify-center mt-6" onClick={() => {}}>
              Login
            </Button>
            
            <div className="mt-6 text-xs text-slate-400 border-t pt-4">
              <p className="font-semibold mb-1">Authorized Personnel Only</p>
              <div className="grid grid-cols-2 gap-2">
                <div>Student: 222BCAA29</div>
                <div>Teacher: AI26, IOT26...</div>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

// 2. Teacher Dashboard
const TeacherDashboard = ({ user, onNavigate }: { user: User, onNavigate: (view: string, data?: any) => void }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [feedbackCounts, setFeedbackCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // FILTER: Only show exams created by this teacher
    const allExams = db.getExams().filter(e => e.createdBy === user.id);
    setExams(allExams);
    
    // Calculate unresolved feedback counts
    const counts: Record<string, number> = {};
    allExams.forEach(e => {
      const feedback = db.getFeedbackForExam(e.id);
      counts[e.id] = feedback.filter(f => !f.isResolved).length;
    });
    setFeedbackCounts(counts);
  }, [user.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
          <p className="text-slate-500">Welcome, {user.name}. Here are your subject assessments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onNavigate('mobile-guide')} icon={Smartphone}>
            Mobile App Setup
          </Button>
          <Button onClick={() => onNavigate('create-exam')} icon={Plus}>
            Create New Exam
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => (
          <Card key={exam.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <FileText size={24} />
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${exam.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {exam.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
            <h3 className="font-bold text-lg mb-1">{exam.title}</h3>
            <p className="text-slate-500 text-sm mb-4">{exam.subject} • {exam.durationMinutes} mins</p>
            
            {feedbackCounts[exam.id] > 0 && (
              <div className="mb-4 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{feedbackCounts[exam.id]} Reported Issues</span>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 text-sm justify-center" onClick={() => onNavigate('analytics', exam.id)}>
                Analytics
              </Button>
              <Button 
                variant="secondary" 
                className="text-sm px-3" 
                onClick={() => onNavigate('review-feedback', exam.id)}
                title="Review Feedback"
              >
                <MessageSquare size={16} />
              </Button>
            </div>
          </Card>
        ))}
        
        {exams.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No exams found for your subject.</p>
            <button onClick={() => onNavigate('create-exam')} className="text-indigo-600 font-medium hover:underline mt-2">Create your first exam</button>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Feedback Review
const FeedbackReview = ({ examId, onBack }: { examId: string, onBack: () => void }) => {
  const [exam, setExam] = useState<Exam | undefined>(undefined);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  
  const refreshData = () => {
    setExam(db.getExamById(examId));
    setFeedbacks(db.getFeedbackForExam(examId));
  };

  useEffect(() => {
    refreshData();
  }, [examId]);

  const handleResolve = (id: string) => {
    db.resolveFeedback(id);
    refreshData();
  };

  if (!exam) return <LoadingSpinner />;

  // Group feedback by question
  const feedbackByQuestion = feedbacks.reduce((acc, curr) => {
    if (!acc[curr.questionId]) acc[curr.questionId] = [];
    acc[curr.questionId].push(curr);
    return acc;
  }, {} as Record<string, Feedback[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>&larr; Back</Button>
        <h1 className="text-2xl font-bold">Review Feedback: {exam.title}</h1>
      </div>

      <div className="space-y-6">
        {Object.keys(feedbackByQuestion).length === 0 && (
           <Card className="p-12 text-center text-slate-500">
             <CheckCircle className="mx-auto h-12 w-12 text-emerald-200 mb-4" />
             <p className="text-lg">No issues reported for this exam.</p>
           </Card>
        )}

        {exam.questions.map((q, idx) => {
          const qFeedbacks = feedbackByQuestion[q.id];
          if (!qFeedbacks || qFeedbacks.length === 0) return null;

          return (
            <Card key={q.id} className="p-6 border-l-4 border-l-amber-400">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">Question {idx + 1}</h3>
                  <p className="text-slate-600 mt-1">{q.text}</p>
                </div>
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                  {qFeedbacks.filter(f => !f.isResolved).length} Open
                </div>
              </div>

              <div className="space-y-3 mt-4 bg-slate-50 p-4 rounded-xl">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Student Reports</h4>
                {qFeedbacks.map(f => (
                  <div key={f.id} className={`p-3 rounded-lg border flex justify-between gap-4 ${f.isResolved ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-white border-red-100'}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-slate-900">{f.studentName}</span>
                        <span className="text-xs text-slate-400">{new Date(f.timestamp).toLocaleDateString()}</span>
                        {f.isResolved && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 rounded">Resolved</span>}
                      </div>
                      <p className="text-sm text-slate-700">{f.text}</p>
                    </div>
                    {!f.isResolved && (
                      <Button variant="outline" className="h-8 px-2 text-xs" onClick={() => handleResolve(f.id)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// 4. Exam Creator with AI
const ExamCreator = ({ onBack }: { onBack: () => void }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Question Form State
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<QuestionType>(QuestionType.MCQ);
  const [qMarks, setQMarks] = useState(1);
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [qRubric, setQRubric] = useState('');

  // AI Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCount, setAiCount] = useState(3);
  const [aiType, setAiType] = useState<'MIXED' | 'MCQ' | 'SHORT_ANSWER'>('MIXED');
  const [isGenerating, setIsGenerating] = useState(false);

  const addQuestion = () => {
    if (!qText) return;
    
    const newQ: Question = {
      id: Date.now().toString(),
      text: qText,
      type: qType,
      marks: qMarks,
      options: qType === QuestionType.MCQ ? qOptions.filter(o => o.trim() !== '') : undefined,
      correctOptionIndex: qType === QuestionType.MCQ ? qCorrectIndex : undefined,
      rubric: qType !== QuestionType.MCQ ? qRubric : undefined
    };

    setQuestions([...questions, newQ]);
    // Reset form
    setQText('');
    setQOptions(['', '', '', '']);
    setQRubric('');
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const newQuestions = await generateQuestionsFromPrompt(aiPrompt, aiCount, aiType);
      if (newQuestions.length === 0) throw new Error("No questions generated");
      setQuestions([...questions, ...newQuestions]);
      setAiPrompt('');
    } catch (err: any) {
      alert(`Error generating questions: ${err.message}\n\nPlease ensure your API Key is valid and has access to gemini-2.5-flash.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveExam = () => {
    if (!title || !subject || questions.length === 0) {
      alert("Please fill in exam details and add at least one question.");
      return;
    }

    const newExam: Exam = {
      id: Date.now().toString(),
      title,
      subject,
      durationMinutes: duration,
      questions,
      createdBy: db.getCurrentUser()?.id || 'unknown',
      isPublished: true, // Auto publish for demo
      createdAt: new Date().toISOString()
    };

    db.saveExam(newExam);
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>&larr; Back</Button>
        <h1 className="text-2xl font-bold">Create New Exam</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Exam Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Exam Title</label>
            <input className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mid-Term Assessment" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <input className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Minutes)</label>
            <input type="number" className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={duration} onChange={e => setDuration(parseInt(e.target.value))} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Question List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-slate-700">Questions ({questions.length})</h3>
          {questions.map((q, idx) => (
            <div key={q.id} className="p-3 bg-white rounded-lg border border-slate-200 text-sm">
              <div className="flex justify-between font-medium">
                <span>Q{idx + 1}. {q.type}</span>
                <span className="text-slate-500">{q.marks} marks</span>
              </div>
              <p className="truncate text-slate-600 mt-1">{q.text}</p>
            </div>
          ))}
          {questions.length === 0 && <p className="text-sm text-slate-400 italic">No questions added yet.</p>}
          <Button onClick={handleSaveExam} className="w-full justify-center mt-4" icon={Save}>Save & Publish Exam</Button>
        </div>

        {/* Right: Add Question Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Generator Card */}
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-800">
              <Sparkles size={20} />
              <h2 className="text-lg font-bold">AI Question Generator</h2>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                 <div className="flex-1">
                   <label className="text-xs font-bold text-slate-600 mb-1 block">Topic</label>
                   <input 
                    className="w-full p-2 border border-indigo-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-400 outline-none" 
                    placeholder="e.g. 'Photosynthesis', 'World War II'"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                 </div>
                 <div className="w-20">
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Count</label>
                    <input 
                      type="number"
                      className="w-full p-2 border border-indigo-200 rounded-lg bg-white text-slate-900"
                      value={aiCount}
                      onChange={e => setAiCount(parseInt(e.target.value))}
                      min={1} max={10}
                    />
                 </div>
              </div>
              
              <div>
                 <label className="text-xs font-bold text-slate-600 mb-1 block">Question Types</label>
                 <select 
                   className="w-full p-2 border border-indigo-200 rounded-lg bg-white text-slate-900"
                   value={aiType}
                   onChange={e => setAiType(e.target.value as any)}
                 >
                   <option value="MIXED">Mixed (MCQ + Short Answer)</option>
                   <option value="MCQ">Multiple Choice Only</option>
                   <option value="SHORT_ANSWER">Short Answer Only</option>
                 </select>
              </div>
            </div>

            <Button 
                variant="ai" 
                onClick={handleAiGenerate} 
                className="w-full justify-center"
                disabled={isGenerating || !aiPrompt.trim()}
                icon={isGenerating ? Loader2 : Sparkles}
              >
                {isGenerating ? 'Generating...' : 'Auto-Generate Questions'}
              </Button>
          </Card>

          {/* Manual Add Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Add Question Manually</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                  value={qType}
                  onChange={(e) => setQType(e.target.value as QuestionType)}
                >
                  <option value={QuestionType.MCQ}>Multiple Choice (MCQ)</option>
                  <option value={QuestionType.SHORT_ANSWER}>Short Answer</option>
                  <option value={QuestionType.LONG_ANSWER}>Long Answer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                <textarea 
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" 
                  rows={3} 
                  value={qText} 
                  onChange={e => setQText(e.target.value)}
                  placeholder="Enter the question here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marks</label>
                <input 
                  type="number" 
                  className="w-24 p-2 border border-slate-300 rounded-lg bg-white text-slate-900" 
                  value={qMarks} 
                  onChange={e => setQMarks(parseInt(e.target.value))} 
                  min={1}
                />
              </div>

              {qType === QuestionType.MCQ && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Options</label>
                  {qOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="correctOption" 
                        checked={qCorrectIndex === idx} 
                        onChange={() => setQCorrectIndex(idx)}
                      />
                      <input 
                        className="flex-1 p-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900" 
                        value={opt} 
                        onChange={(e) => {
                          const newOpts = [...qOptions];
                          newOpts[idx] = e.target.value;
                          setQOptions(newOpts);
                        }} 
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {qType !== QuestionType.MCQ && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Evaluation Rubric / Key Points</label>
                  <textarea 
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" 
                    rows={3} 
                    value={qRubric} 
                    onChange={e => setQRubric(e.target.value)}
                    placeholder="Enter keywords or points the AI should look for..."
                  />
                  <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                    <BrainCircuit size={12} /> AI will use this to grade student answers.
                  </p>
                </div>
              )}

              <Button variant="secondary" onClick={addQuestion} className="w-full justify-center" icon={Plus}>Add to Exam</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 5. Student Dashboard
const StudentDashboard = ({ onNavigate }: { onNavigate: (view: string, data?: any) => void }) => {
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    setAvailableExams(db.getExams().filter(e => e.isPublished));
    setSubmissions(db.getSubmissions().filter(s => s.studentId === db.getCurrentUser()?.id));
  }, []);

  const hasTaken = (examId: string) => submissions.some(s => s.examId === examId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Student Portal</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600"/> Available Exams
          </h2>
          <div className="space-y-4">
            {availableExams.filter(e => !hasTaken(e.id)).map(exam => (
              <Card key={exam.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{exam.title}</h3>
                  <p className="text-sm text-slate-500">{exam.subject} • {exam.durationMinutes} mins</p>
                </div>
                <Button onClick={() => onNavigate('take-exam', exam.id)}>Start Exam</Button>
              </Card>
            ))}
            {availableExams.filter(e => !hasTaken(e.id)).length === 0 && (
              <p className="text-slate-500 text-sm">No new exams available.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-600"/> Completed
          </h2>
          <div className="space-y-4">
            {submissions.map(sub => {
              const exam = availableExams.find(e => e.id === sub.examId);
              return (
                <Card key={sub.id} className="p-4 hover:border-indigo-200 transition-colors cursor-pointer" >
                   <div className="flex justify-between items-center" onClick={() => onNavigate('view-submission', sub.id)}>
                    <div>
                      <h3 className="font-bold">{exam?.title || 'Unknown Exam'}</h3>
                      <p className="text-sm text-slate-500">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">{sub.totalScore}/{sub.maxScore}</div>
                        <div className="text-xs text-slate-400">Score</div>
                      </div>
                      <Eye className="text-slate-400" size={20} />
                    </div>
                   </div>
                </Card>
              );
            })}
             {submissions.length === 0 && (
              <p className="text-slate-500 text-sm">No completed exams yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Submission Viewer with Teacher Grade Editing
const SubmissionViewer = ({ submissionId, onBack }: { submissionId: string, onBack: () => void }) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [exam, setExam] = useState<Exam | undefined>(undefined);
  const currentUser = db.getCurrentUser();
  const isTeacher = currentUser?.role === UserRole.TEACHER;
  
  // State for editing grades
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [newScore, setNewScore] = useState<number>(0);

  const refreshData = () => {
    const subs = db.getSubmissions();
    const sub = subs.find(s => s.id === submissionId);
    if (sub) {
      setSubmission(sub);
      setExam(db.getExamById(sub.examId));
    }
  }

  useEffect(() => {
    refreshData();
  }, [submissionId]);

  const handleDispute = (questionId: string) => {
    if (!submission || !exam) return;
    const reason = prompt("Please explain why you believe this grade is incorrect:");
    if (reason) {
      db.saveFeedback({
        id: Date.now().toString(),
        examId: exam.id,
        questionId: questionId,
        studentId: submission.studentId,
        studentName: submission.studentName,
        text: `[GRADE DISPUTE] ${reason}`,
        timestamp: new Date().toISOString(),
        isResolved: false
      });
      alert("Dispute submitted to teacher.");
    }
  };

  const startEditing = (questionId: string, currentScore: number) => {
    setEditingQId(questionId);
    setNewScore(currentScore);
  };

  const saveGrade = (questionId: string) => {
    if(!submission) return;
    db.updateSubmissionGrade(submission.id, questionId, newScore);
    setEditingQId(null);
    refreshData(); // Reload to see new total score
  };

  if (!submission || !exam) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>&larr; Back</Button>
        <div>
          <h1 className="text-2xl font-bold">{exam.title} - Results</h1>
          <p className="text-slate-500">Student: {submission.studentName} | Score: {submission.totalScore}/{submission.maxScore}</p>
        </div>
      </div>

      <div className="space-y-6">
        {submission.answers.map((ans, idx) => {
          const question = exam.questions.find(q => q.id === ans.questionId);
          if (!question) return null;

          return (
            <Card key={ans.questionId} className={`p-6 border-l-4 ${ans.obtainedMarks === question.marks ? 'border-l-green-500' : 'border-l-amber-500'}`}>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-lg text-slate-800">Q{idx+1}</span>
                
                <div className="flex items-center gap-2">
                  {isTeacher && editingQId === question.id ? (
                     <div className="flex items-center gap-2">
                       <input 
                         type="number" 
                         className="w-16 p-1 border border-indigo-300 rounded text-center"
                         value={newScore}
                         onChange={(e) => setNewScore(parseFloat(e.target.value))}
                         max={question.marks}
                         min={0}
                       />
                       <span className="text-sm text-slate-500">/ {question.marks}</span>
                       <Button variant="primary" className="h-8 px-2 py-0 text-xs" onClick={() => saveGrade(question.id)}>Save</Button>
                       <Button variant="ghost" className="h-8 px-2 py-0 text-xs" onClick={() => setEditingQId(null)}>Cancel</Button>
                     </div>
                  ) : (
                     <div className="flex items-center gap-2">
                       <span className="font-bold text-slate-600">{ans.obtainedMarks} / {question.marks} Marks</span>
                       {isTeacher && (
                         <button onClick={() => startEditing(question.id, ans.obtainedMarks || 0)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded">
                           <Edit2 size={16} />
                         </button>
                       )}
                     </div>
                  )}
                </div>
              </div>
              <p className="mb-4 text-slate-800">{question.text}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Student Answer</span>
                  <p className="text-slate-900 font-medium">{ans.studentAnswer}</p>
                </div>
                {question.type === QuestionType.MCQ && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <span className="block text-xs font-bold text-emerald-700 uppercase mb-1">Correct Answer</span>
                    <p className="text-emerald-900 font-medium">{question.options?.[question.correctOptionIndex!]}</p>
                  </div>
                )}
              </div>

              {ans.feedback && (
                <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                   <div className="flex items-center gap-2 mb-1">
                      <BrainCircuit size={16} className="text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-700 uppercase">AI Feedback</span>
                   </div>
                   <p className="text-sm text-indigo-900">{ans.feedback}</p>
                </div>
              )}

              {!isTeacher && ans.obtainedMarks !== question.marks && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => handleDispute(question.id)}
                    className="text-xs flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                  >
                    <AlertTriangle size={14} /> Dispute Grade
                  </button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  );
};

// 7. Exam Taking Interface with Jumbling and AI Grading
const ExamTaking = ({ examId, onBack }: { examId: string, onBack: () => void }) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState<Record<string, string>>({});
  const [feedbackOpen, setFeedbackOpen] = useState<Record<string, boolean>>({});

  // Load and Jumble
  useEffect(() => {
    const rawExam = db.getExamById(examId);
    if (rawExam) {
      // Deep copy to avoid mutating store
      const examCopy = JSON.parse(JSON.stringify(rawExam)) as Exam;
      
      // JUMBLING LOGIC
      // 1. Shuffle Questions
      examCopy.questions = examCopy.questions.sort(() => Math.random() - 0.5);
      
      // 2. Shuffle Options for MCQs
      // We only shuffle the display options. The grading logic relies on comparing the *text value* 
      // of the selected option with the *text value* of the correct option from the original exam.
      examCopy.questions.forEach(q => {
        if (q.type === QuestionType.MCQ && q.options) {
           q.options = [...q.options].sort(() => Math.random() - 0.5);
        }
      });

      setExam(examCopy);
      setTimeLeft(examCopy.durationMinutes * 60);
    }
  }, [examId]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleFeedback = (qId: string) => {
    setFeedbackOpen(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const sendFeedback = (qId: string) => {
    if (!feedbackInput[qId]?.trim()) return;
    
    const user = db.getCurrentUser();
    if (!user || !exam) return;

    db.saveFeedback({
      id: Date.now().toString(),
      examId: exam.id,
      questionId: qId,
      studentId: user.id,
      studentName: user.name,
      text: feedbackInput[qId],
      timestamp: new Date().toISOString(),
      isResolved: false
    });

    setFeedbackInput(prev => ({ ...prev, [qId]: '' }));
    setFeedbackOpen(prev => ({ ...prev, [qId]: false }));
    alert("Feedback sent to teacher.");
  };

  const handleSubmit = async () => {
    if (!exam || isSubmitting) return;
    setIsSubmitting(true);

    const currentUser = db.getCurrentUser()!;
    const processedAnswers: Answer[] = [];
    let totalScore = 0;
    let maxScore = 0;

    // We need to fetch the ORIGINAL exam to get correct answers/rubrics reliably
    // because the displayed exam has shuffled questions/options.
    const originalExam = db.getExamById(examId)!;

    for (const q of originalExam.questions) {
      const studentAns = answers[q.id]; // This is the value (string), not index
      maxScore += q.marks;

      let ansObj: Answer = {
        questionId: q.id,
        studentAnswer: studentAns ?? '',
        isGraded: false
      };

      if (q.type === QuestionType.MCQ) {
        // Auto grade MCQ
        // For MCQ, studentAns stored as the OPTION STRING.
        // We compare it to the correct option string from the original exam.
        const correctOptionText = q.options?.[q.correctOptionIndex!];
        const isCorrect = correctOptionText === studentAns;
        
        ansObj.obtainedMarks = isCorrect ? q.marks : 0;
        ansObj.isGraded = true;
        ansObj.feedback = isCorrect ? 'Correct' : 'Incorrect';
        totalScore += ansObj.obtainedMarks;
      } else {
        // AI Grade Subjective
        const grading = await evaluateSubjectiveAnswer(q, String(studentAns || ''));
        ansObj.obtainedMarks = grading.score;
        ansObj.feedback = grading.feedback;
        ansObj.isGraded = true;
        totalScore += grading.score;
      }
      processedAnswers.push(ansObj);
    }

    const submission: Submission = {
      id: Date.now().toString(),
      examId: exam.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      answers: processedAnswers,
      totalScore,
      maxScore,
      submittedAt: new Date().toISOString(),
      aiEvaluated: true
    };

    db.saveSubmission(submission);
    setIsSubmitting(false);
    onBack();
  };

  if (!exam) return <LoadingSpinner />;
  if (isSubmitting) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      <h2 className="text-xl font-bold text-slate-700">Submitting & AI Grading...</h2>
      <p className="text-slate-500">Please wait while our AI evaluates your answers.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header with Timer */}
      <div className="sticky top-4 z-10 bg-white p-4 rounded-xl shadow-lg border border-indigo-100 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">{exam.title}</h1>
          <p className="text-sm text-slate-500">Student: {db.getCurrentUser()?.name}</p>
        </div>
        <div className={`text-xl font-mono font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
          <Clock className="inline mr-2 h-5 w-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-6">
        {exam.questions.map((q, idx) => (
          <Card key={q.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="font-bold text-lg text-slate-700">Q{idx + 1}</span>
              <div className="flex items-center gap-3">
                 <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-500">{q.marks} Marks</span>
                 <button 
                   onClick={() => toggleFeedback(q.id)}
                   className="text-slate-400 hover:text-red-500 transition-colors"
                   title="Report Issue"
                 >
                   <Flag size={18} />
                 </button>
              </div>
            </div>
            <p className="mb-4 text-slate-800 text-lg">{q.text}</p>
            
            {q.type === QuestionType.MCQ && (
              <div className="space-y-2">
                {q.options?.map((opt, optIdx) => (
                  <label key={optIdx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name={q.id} 
                      className="w-4 h-4 text-indigo-600"
                      onChange={() => setAnswers(prev => ({...prev, [q.id]: opt}))}
                      checked={answers[q.id] === opt}
                    />
                    <span className="text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type !== QuestionType.MCQ && (
              <textarea 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[150px] bg-white text-slate-900"
                placeholder="Type your answer here..."
                value={String(answers[q.id] || '')}
                onChange={e => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
              />
            )}

            {/* Feedback Input Section */}
            {feedbackOpen[q.id] && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-red-700 mb-1">Report Issue / Suggestion</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 text-sm p-2 border border-red-200 rounded bg-white text-slate-900"
                    placeholder="e.g. Typo in option B, Ambiguous phrasing..."
                    value={feedbackInput[q.id] || ''}
                    onChange={e => setFeedbackInput(prev => ({...prev, [q.id]: e.target.value}))}
                  />
                  <Button variant="danger" className="text-xs py-1" onClick={() => sendFeedback(q.id)}>Send</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end max-w-4xl mx-auto">
        <Button onClick={handleSubmit} className="px-8 py-3 text-lg shadow-lg shadow-indigo-200">Submit Exam</Button>
      </div>
    </div>
  );
};

// 8. Analytics Page
const Analytics = ({ examId, onNavigate, onBack }: { examId: string, onNavigate: (view: string, data: any) => void, onBack: () => void }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [exam, setExam] = useState<Exam | undefined>(undefined);

  useEffect(() => {
    setSubmissions(db.getSubmissionsForExam(examId));
    setExam(db.getExamById(examId));
  }, [examId]);

  if (!exam) return <LoadingSpinner />;

  // Stats
  const totalSubmissions = submissions.length;
  const avgScore = totalSubmissions > 0 
    ? submissions.reduce((acc, s) => acc + s.totalScore, 0) / totalSubmissions 
    : 0;
  
  const passed = submissions.filter(s => (s.totalScore / s.maxScore) >= 0.4).length;
  const passRate = totalSubmissions > 0 ? (passed / totalSubmissions) * 100 : 0;

  // Chart Data
  const scoreDist = submissions.map((s, i) => ({
    name: s.studentName,
    score: s.totalScore
  }));

  const pieData = [
    { name: 'Passed', value: passed },
    { name: 'Failed', value: totalSubmissions - passed }
  ];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>&larr; Back</Button>
        <h1 className="text-2xl font-bold">Analytics: {exam.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Submissions</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{totalSubmissions}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Average Score</p>
          <p className="text-4xl font-bold text-indigo-600 mt-2">{avgScore.toFixed(1)} / {submissions[0]?.maxScore || 0}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Pass Rate</p>
          <p className="text-4xl font-bold text-emerald-600 mt-2">{passRate.toFixed(1)}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 h-[400px]">
          <h3 className="text-lg font-semibold mb-4">Student Performance</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreDist}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#6366f1" name="Score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 h-[400px]">
          <h3 className="text-lg font-semibold mb-4">Pass vs Fail</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{sub.studentName}</td>
                  <td className="px-4 py-3">{new Date(sub.submittedAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{sub.totalScore.toFixed(1)} / {sub.maxScore}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${sub.totalScore/sub.maxScore >= 0.4 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sub.totalScore/sub.maxScore >= 0.4 ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                   <td className="px-4 py-3">
                    <Button variant="ghost" className="h-8 px-2 text-indigo-600" onClick={() => onNavigate('view-submission', sub.id)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// 9. Mobile Deployment Guide Page
const MobileDeploymentGuide = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>&larr; Back</Button>
        <h1 className="text-3xl font-bold text-slate-900">Android Deployment Guide</h1>
      </div>

      <Card className="p-8">
        <div className="prose max-w-none text-slate-800">
          <p className="text-lg mb-6">
            Follow these exact steps to convert this SmartCIA web application into a native Android app using <strong>Android Studio</strong>.
          </p>

          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-indigo-600" /> 1. Create Project
          </h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Open Android Studio and select <strong>New Project</strong>.</li>
            <li>Choose <strong>"Empty Views Activity"</strong> (Java).</li>
            <li><strong>Package Name:</strong> <code>com.smartcia.app</code></li>
            <li><strong>Minimum SDK:</strong> API 24 (Android 7.0)</li>
          </ul>

          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Code className="text-indigo-600" /> 2. Android Manifest
          </h2>
          <p className="mb-2 text-sm text-slate-500">Add the internet permission to <code>app/src/main/AndroidManifest.xml</code></p>
          <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-8">
            <pre>{`<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- ADD THIS LINE -->
    <uses-permission android:name="android.permission.INTERNET" />

    <application ...`}</pre>
          </div>

          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Code className="text-indigo-600" /> 3. Layout XML
          </h2>
          <p className="mb-2 text-sm text-slate-500">Replace <code>app/src/main/res/layout/activity_main.xml</code> with this:</p>
          <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-8">
            <pre>{`<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <WebView
        android:id="@+id/webview"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>`}</pre>
          </div>

          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Code className="text-indigo-600" /> 4. Java Activity
          </h2>
          <p className="mb-2 text-sm text-slate-500">
            Replace <code>app/src/main/java/com/smartcia.app/MainActivity.java</code> with this code.
            <br/><span className="text-amber-400 font-bold">IMPORTANT:</span> Replace the URL string with your actual deployed website URL.
          </p>
          <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-8">
            <pre>{`package com.smartcia.app;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {

    private WebView myWebView;
    private static final String APP_URL = "https://your-smartcia-url.vercel.app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        myWebView = findViewById(R.id.webview);
        WebSettings webSettings = myWebView.getSettings();
        
        // CRITICAL SETTINGS
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

        myWebView.setWebViewClient(new WebViewClient());
        myWebView.loadUrl(APP_URL);
    }

    @Override
    public void onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Main Layout ---

const Navbar = ({ user, onLogout }: { user: User, onLogout: () => void }) => (
  <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
             <BrainCircuit className="text-white h-6 w-6" />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">SmartCIA</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            <UserIcon size={16} />
            <span className="font-medium">{user.name}</span>
            <span className="text-slate-400">|</span>
            <span className="text-xs uppercase font-bold tracking-wide text-indigo-600">{user.role}</span>
          </div>
          <button 
            onClick={onLogout}
            className="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-slate-50"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  </nav>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewData, setViewData] = useState<any>(null);

  useEffect(() => {
    const user = db.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    setCurrentView('login');
  };

  const navigate = (view: string, data?: any) => {
    setCurrentView(view);
    setViewData(data);
    window.scrollTo(0, 0);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar user={currentUser} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === UserRole.TEACHER ? (
          <>
            {currentView === 'dashboard' && <TeacherDashboard user={currentUser} onNavigate={navigate} />}
            {currentView === 'mobile-guide' && <MobileDeploymentGuide onBack={() => navigate('dashboard')} />}
            {currentView === 'create-exam' && <ExamCreator onBack={() => navigate('dashboard')} />}
            {currentView === 'analytics' && <Analytics examId={viewData} onNavigate={navigate} onBack={() => navigate('dashboard')} />}
            {currentView === 'review-feedback' && <FeedbackReview examId={viewData} onBack={() => navigate('dashboard')} />}
            {currentView === 'view-submission' && <SubmissionViewer submissionId={viewData} onBack={() => navigate('analytics', db.getSubmissions().find(s => s.id === viewData)?.examId)} />}
          </>
        ) : (
          <>
            {currentView === 'dashboard' && <StudentDashboard onNavigate={navigate} />}
            {currentView === 'take-exam' && <ExamTaking examId={viewData} onBack={() => navigate('dashboard')} />}
            {currentView === 'view-submission' && <SubmissionViewer submissionId={viewData} onBack={() => navigate('dashboard')} />}
          </>
        )}
      </main>
    </div>
  );
}