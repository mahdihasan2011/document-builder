
import React, { useState } from 'react';
import { ResumeData, Experience, Education, Project, Reference, SocialLink } from '../types';
import { generateResumeSummary, generateExperienceBullets, generateProjectDescription, generateSkills } from '../services/geminiService';
import { Loader2, Plus, Trash2, Wand2, Upload, Eye, EyeOff, User, Mail, Phone, MapPin, Globe, ChevronDown, ChevronUp, Briefcase, GraduationCap, Code, Languages, Award, Users, GripVertical, Sparkles, Settings2 } from 'lucide-react';

interface EditorProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
    onSectionFocus: (section: string) => void;
    expanded: Record<string, boolean>;
    onExpand: (section: string) => void;
}

const Editor: React.FC<EditorProps> = ({ data, onChange, onSectionFocus, expanded, onExpand }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingField, setLoadingField] = useState<string | null>(null);
    const [draggedSection, setDraggedSection] = useState<string | null>(null);
    const [dragOverSection, setDragOverSection] = useState<string | null>(null);
    const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
    const [tailorOpen, setTailorOpen] = useState<Record<string, boolean>>({});

    const toggleExpanded = (section: string) => {
        onExpand(section);
        if (!expanded[section]) {
            onSectionFocus(section);
        }
    };

    const toggleTailor = (id: string) => {
        setTailorOpen(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, section: string) => {
        setDraggedSection(section);
        e.dataTransfer.effectAllowed = 'move';
        const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
        ghost.style.opacity = '0.5';
        ghost.style.position = 'absolute';
        ghost.style.top = '-1000px';
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => document.body.removeChild(ghost), 0);
    };

    const handleDragOver = (e: React.DragEvent, section: string) => {
        e.preventDefault();
        if (!draggedSection || draggedSection === section) return;
        setDragOverSection(section);
    };

    const handleDragEnd = () => {
        setDraggedSection(null);
        setDragOverSection(null);
    };

    const handleDrop = (e: React.DragEvent, targetSection: string) => {
        e.preventDefault();
        if (!draggedSection || draggedSection === targetSection) {
            handleDragEnd();
            return;
        }

        const currentOrder = [...data.sectionOrder];
        const dragIdx = currentOrder.indexOf(draggedSection);
        const dropIdx = currentOrder.indexOf(targetSection);

        if (dragIdx !== -1 && dropIdx !== -1) {
            currentOrder.splice(dragIdx, 1);
            currentOrder.splice(dropIdx, 0, draggedSection);
            onChange({ ...data, sectionOrder: currentOrder });
        }
        handleDragEnd();
    };

    const isVisibleInResume = (section: keyof ResumeData['sectionVisibility']) => {
        return data.sectionVisibility ? data.sectionVisibility[section] : true;
    };

    const toggleResumeVisibility = (section: keyof ResumeData['sectionVisibility'], e: React.MouseEvent) => {
        e.stopPropagation();
        const current = data.sectionVisibility || {
            education: true, experience: true, projects: true, skills: true, languages: true, activities: true, summary: true, references: true
        };

        onChange({
            ...data,
            sectionVisibility: {
                ...current,
                [section]: !current[section]
            }
        });
    };

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...data,
            personalInfo: { ...data.personalInfo, [e.target.name]: e.target.value }
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange({
                    ...data,
                    personalInfo: { ...data.personalInfo, profilePicture: reader.result as string }
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSummaryGenerate = async () => {
        setIsGenerating(true);
        try {
            const summary = await generateResumeSummary(data);
            onChange({ ...data, summary });
        } catch (error) {
            alert("Failed to generate summary. Please check your API Key or try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExperienceGenerate = async (exp: Experience) => {
        setLoadingField(`exp-${exp.id}`);
        try {
            const bullets = await generateExperienceBullets(exp.jobTitle, exp.company, exp.description, exp.targetRole, exp.targetKeywords);
            updateExperience(exp.id, 'description', bullets);
        } catch (e) {
            alert("Failed to generate experience description.");
        } finally {
            setLoadingField(null);
        }
    };

    const handleProjectGenerate = async (proj: Project) => {
        if (!proj.name) {
            alert("Please enter a project name first.");
            return;
        }
        setLoadingField(`proj-${proj.id}`);
        try {
            const desc = await generateProjectDescription(proj.name, proj.technologies || "", proj.goals, proj.description);
            updateProject(proj.id, 'description', desc);
        } catch (e) {
            alert("Failed to generate project description.");
        } finally {
            setLoadingField(null);
        }
    };

    const handleSkillsGenerate = async () => {
        setLoadingField('skills');
        setSuggestedSkills([]);
        try {
            const skillsString = await generateSkills(data);
            if (skillsString) {
                const newSkills = skillsString.split(',').map(s => s.trim());
                const suggestions = newSkills.filter(s => s && !data.skills.includes(s));
                if (suggestions.length === 0) {
                    alert("AI couldn't find any new skills to suggest based on your profile.");
                } else {
                    setSuggestedSkills(suggestions);
                }
            }
        } catch (e) {
            alert("Failed to generate skills.");
        } finally {
            setLoadingField(null);
        }
    };

    const addSuggestedSkill = (skill: string) => {
        const updatedSkills = [...data.skills, skill];
        onChange({ ...data, skills: updatedSkills });
        setSuggestedSkills(prev => prev.filter(s => s !== skill));
    };

    const updateExperience = (id: string, field: keyof Experience, value: string) => {
        const newExp = data.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp);
        onChange({ ...data, experience: newExp });
    };

    const addExperience = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newExp: Experience = {
            id: Date.now().toString(),
            jobTitle: "New Job",
            company: "Company Name",
            startDate: "",
            endDate: "",
            description: ""
        };
        onChange({ ...data, experience: [newExp, ...data.experience] });
        if (!expanded['experience']) toggleExpanded('experience');
        if (!isVisibleInResume('experience')) {
            onChange({ ...data, experience: [newExp, ...data.experience], sectionVisibility: { ...data.sectionVisibility, experience: true } });
        }
    };

    const removeExperience = (id: string) => {
        onChange({ ...data, experience: data.experience.filter(e => e.id !== id) });
    };

    const updateEducation = (id: string, field: keyof Education, value: string) => {
        const newEdu = data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu);
        onChange({ ...data, education: newEdu });
    };

    const addEducation = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newEdu: Education = {
            id: Date.now().toString(),
            degree: "Degree",
            school: "School Name",
            graduationDate: ""
        };
        onChange({ ...data, education: [...data.education, newEdu] });
        if (!expanded['education']) toggleExpanded('education');
        if (!isVisibleInResume('education')) {
            onChange({ ...data, education: [...data.education, newEdu], sectionVisibility: { ...data.sectionVisibility, education: true } });
        }
    };

    const removeEducation = (id: string) => {
        onChange({ ...data, education: data.education.filter(e => e.id !== id) });
    };

    const addProject = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newProj: Project = {
            id: Date.now().toString(),
            name: "Project Name",
            description: "",
            technologies: "",
            goals: ""
        };
        onChange({ ...data, projects: [...data.projects, newProj] });
        if (!expanded['projects']) toggleExpanded('projects');
        if (!isVisibleInResume('projects')) {
            onChange({ ...data, projects: [...data.projects, newProj], sectionVisibility: { ...data.sectionVisibility, projects: true } });
        }
    };

    const updateProject = (id: string, field: keyof Project, value: string) => {
        const newProjs = data.projects.map(p => p.id === id ? { ...p, [field]: value } : p);
        onChange({ ...data, projects: newProjs });
    };

    const removeProject = (id: string) => {
        onChange({ ...data, projects: data.projects.filter(p => p.id !== id) });
    };

    // --- References ---
    const addReference = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newRef: Reference = {
            id: Date.now().toString(),
            name: "Reference Name",
            position: "Position",
            company: "Company",
            email: "",
            phone: ""
        };
        onChange({ ...data, references: [...data.references, newRef] });
        if (!expanded['references']) toggleExpanded('references');
        if (!isVisibleInResume('references')) {
            onChange({ ...data, references: [...data.references, newRef], sectionVisibility: { ...data.sectionVisibility, references: true } });
        }
    };

    const updateReference = (id: string, field: keyof Reference, value: string) => {
        const newRefs = data.references.map(r => r.id === id ? { ...r, [field]: value } : r);
        onChange({ ...data, references: newRefs });
    };

    const removeReference = (id: string) => {
        onChange({ ...data, references: data.references.filter(r => r.id !== id) });
    };

    // --- Custom Links ---
    const addCustomLink = () => {
        const newLink: SocialLink = { id: Date.now().toString(), platform: "", url: "" };
        onChange({
            ...data,
            personalInfo: { ...data.personalInfo, customLinks: [...data.personalInfo.customLinks, newLink] }
        });
    };

    const updateCustomLink = (id: string, field: keyof SocialLink, value: string) => {
        const newLinks = data.personalInfo.customLinks.map(l => l.id === id ? { ...l, [field]: value } : l);
        onChange({
            ...data,
            personalInfo: { ...data.personalInfo, customLinks: newLinks }
        });
    };

    const removeCustomLink = (id: string) => {
        onChange({
            ...data,
            personalInfo: { ...data.personalInfo, customLinks: data.personalInfo.customLinks.filter(l => l.id !== id) }
        });
    };

    const handleListChange = (key: 'skills' | 'languages' | 'activities', value: string) => {
        const list = value.split(',').map(s => s.trim());
        onChange({ ...data, [key]: list });
    };

    const InputWithIcon = ({ icon: Icon, ...props }: any) => (
        <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Icon className="w-4 h-4" />
            </div>
            <input
                {...props}
                className={`input-field !pl-10 ${props.className || ''}`}
            />
        </div>
    );

    const SectionHeader = ({
        title,
        icon: Icon,
        sectionKey,
        visibilityKey,
        onAdd,
        draggable = false
    }: {
        title: string,
        icon?: any,
        sectionKey: string,
        visibilityKey?: keyof ResumeData['sectionVisibility'],
        onAdd?: (e: React.MouseEvent) => void,
        draggable?: boolean
    }) => (
        <div
            className={`flex justify-between items-center cursor-pointer py-3 select-none rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors px-2 -mx-2 ${expanded[sectionKey] ? 'bg-gray-50 dark:bg-slate-800/50 mb-4' : ''} ${dragOverSection === sectionKey ? 'border-2 border-dashed border-blue-400 bg-blue-50/50' : ''}`}
            onClick={() => toggleExpanded(sectionKey)}
            draggable={draggable}
            onDragStart={(e) => draggable && handleDragStart(e, sectionKey)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => draggable && handleDragOver(e, sectionKey)}
            onDrop={(e) => draggable && handleDrop(e, sectionKey)}
        >
            <div className="flex items-center gap-3">
                {draggable && (
                    <div className="cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing p-1">
                        <GripVertical className="w-4 h-4" />
                    </div>
                )}
                <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                    {expanded[sectionKey] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-blue-500" />}
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {visibilityKey && (
                    <button
                        onClick={(e) => toggleResumeVisibility(visibilityKey, e)}
                        className={`p-2 rounded-md transition ${isVisibleInResume(visibilityKey) ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-400 hover:text-gray-600'}`}
                        title={isVisibleInResume(visibilityKey) ? "Visible in Resume" : "Hidden in Resume"}
                    >
                        {isVisibleInResume(visibilityKey) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                )}
                {onAdd && (
                    <button onClick={onAdd} className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex items-center gap-1 border border-blue-100 dark:border-blue-800">
                        <Plus className="w-3 h-3" /> Add
                    </button>
                )}
            </div>
        </div>
    );

    const sectionConfig: Record<string, () => React.ReactNode> = {
        summary: () => (
            <section id="editor-section-summary" className="space-y-4 pt-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                <SectionHeader title="Professional Summary" icon={Briefcase} sectionKey="summary" visibilityKey="summary" draggable />
                {expanded['summary'] && (
                    <div className="relative w-full px-2">
                        <textarea
                            value={data.summary}
                            onChange={(e) => onChange({ ...data, summary: e.target.value })}
                            rows={5}
                            className="input-textarea"
                            placeholder="Write a brief professional summary focusing on your key achievements and skills..."
                        />
                        <button
                            onClick={handleSummaryGenerate}
                            disabled={isGenerating}
                            className="absolute bottom-3 right-5 flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all border border-transparent hover:scale-105"
                        >
                            {isGenerating ? <Loader2 className="animate-spin w-3 h-3" /> : <Wand2 className="w-3 h-3" />}
                            Generate with AI
                        </button>
                    </div>
                )}
            </section>
        ),
        experience: () => (
            <section id="editor-section-experience" className="space-y-4 pt-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                <SectionHeader title="Experience" icon={Briefcase} sectionKey="experience" visibilityKey="experience" onAdd={addExperience} draggable />
                {expanded['experience'] && (
                    <div className="space-y-6 px-2">
                        {data.experience.map((exp) => (
                            <div key={exp.id} className="border border-gray-200 dark:border-slate-700 p-5 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 relative group transition-all w-full hover:shadow-sm">
                                <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-sm border border-gray-100 dark:border-slate-700"><Trash2 className="w-4 h-4" /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Job Title</label>
                                        <input value={exp.jobTitle} onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)} placeholder="e.g. Senior Developer" className="input-field font-semibold" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Company</label>
                                        <input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="e.g. Google" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Start Date</label>
                                        <input value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="MM/YYYY" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">End Date</label>
                                        <input value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="MM/YYYY or Present" className="input-field" />
                                    </div>
                                </div>

                                {/* Tailoring UI for Experience */}
                                <div className="mb-4">
                                    <button
                                        onClick={() => toggleTailor(exp.id)}
                                        className="text-xs flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold hover:underline mb-3"
                                    >
                                        <Settings2 className="w-3.5 h-3.5" />
                                        {tailorOpen[exp.id] ? "Hide AI Tailoring Settings" : "Tailor AI Suggestions (Optional)"}
                                    </button>

                                    {tailorOpen[exp.id] && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 mb-4 animate-in slide-in-from-top-2 duration-200">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Target Job Role</label>
                                                <input
                                                    value={exp.targetRole || ""}
                                                    onChange={(e) => updateExperience(exp.id, 'targetRole', e.target.value)}
                                                    placeholder="e.g. Staff Engineer"
                                                    className="input-field text-xs py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Custom Keywords</label>
                                                <input
                                                    value={exp.targetKeywords || ""}
                                                    onChange={(e) => updateExperience(exp.id, 'targetKeywords', e.target.value)}
                                                    placeholder="e.g. leadership, architecture"
                                                    className="input-field text-xs py-2"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative w-full">
                                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Description</label>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                        placeholder="• Achieved X by doing Y..."
                                        rows={5}
                                        className="input-textarea min-h-[120px]"
                                    />
                                    <button
                                        onClick={() => handleExperienceGenerate(exp)}
                                        disabled={loadingField === `exp-${exp.id}`}
                                        className="absolute bottom-3 right-3 text-[10px] bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition font-bold border border-indigo-100 dark:border-indigo-800 hover:scale-105"
                                    >
                                        {loadingField === `exp-${exp.id}` ? <Loader2 className="animate-spin w-3 h-3" /> : <Wand2 className="w-3 h-3" />}
                                        {exp.description && exp.description.length > 15 ? 'Refine with AI' : 'Generate with AI'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {data.experience.length === 0 && <div className="text-center text-gray-400 py-4 italic text-sm">No experience added yet. Click "Add" to start.</div>}
                    </div>
                )}
            </section>
        ),
        projects: () => (
            <section id="editor-section-projects" className="space-y-4 pt-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                <SectionHeader title="Projects" icon={Code} sectionKey="projects" visibilityKey="projects" onAdd={addProject} draggable />
                {expanded['projects'] && (
                    <div className="space-y-6 px-2">
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="border border-gray-200 dark:border-slate-700 p-5 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 relative group transition-all w-full hover:shadow-sm">
                                <button onClick={() => removeProject(proj.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-sm border border-gray-100 dark:border-slate-700"><Trash2 className="w-4 h-4" /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10">
                                    <input value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} placeholder="Project Name" className="input-field font-semibold" />
                                    <input value={proj.link || ''} onChange={(e) => updateProject(proj.id, 'link', e.target.value)} placeholder="Project Link (URL)" className="input-field text-blue-500" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Stack (e.g. React, Go)</label>
                                        <input value={proj.technologies || ''} onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)} placeholder="Technologies Used" className="input-field py-2" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Project Goal/Problem Solved</label>
                                        <input value={proj.goals || ''} onChange={(e) => updateProject(proj.id, 'goals', e.target.value)} placeholder="e.g. Optimize image processing" className="input-field py-2" />
                                    </div>
                                </div>
                                <div className="relative w-full">
                                    <textarea
                                        value={proj.description}
                                        onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                                        placeholder="Describe the project..."
                                        rows={4}
                                        className="input-textarea min-h-[100px]"
                                    />
                                    <button
                                        onClick={() => handleProjectGenerate(proj)}
                                        disabled={loadingField === `proj-${proj.id}`}
                                        className="absolute bottom-3 right-3 text-[10px] bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition font-bold border border-indigo-100 dark:border-indigo-800 hover:scale-105"
                                    >
                                        {loadingField === `proj-${proj.id}` ? <Loader2 className="animate-spin w-3 h-3" /> : <Wand2 className="w-3 h-3" />}
                                        Generate Bullets with AI
                                    </button>
                                </div>
                            </div>
                        ))}
                        {data.projects.length === 0 && <div className="text-center text-gray-400 py-4 italic text-sm">No projects added yet.</div>}
                    </div>
                )}
            </section>
        ),
        education: () => (
            <section id="editor-section-education" className="space-y-4 pt-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                <SectionHeader title="Education" icon={GraduationCap} sectionKey="education" visibilityKey="education" onAdd={addEducation} draggable />
                {expanded['education'] && (
                    <div className="space-y-4 px-2">
                        {data.education.map((edu) => (
                            <div key={edu.id} className="border border-gray-200 dark:border-slate-700 p-5 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 relative group transition-all w-full">
                                <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-sm border border-gray-100 dark:border-slate-700"><Trash2 className="w-4 h-4" /></button>
                                <div className="grid grid-cols-1 gap-4 pr-8">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Degree</label>
                                        <input value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="e.g. Bachelor of Science in CS" className="input-field font-semibold" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">School</label>
                                            <input value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} placeholder="University Name" className="input-field" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Year</label>
                                            <input value={edu.graduationDate} onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)} placeholder="Graduation Year" className="input-field" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        ),
        references: () => (
            <section id="editor-section-references" className="space-y-4 pt-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                <SectionHeader title="References" icon={Users} sectionKey="references" visibilityKey="references" onAdd={addReference} draggable />
                {expanded['references'] && (
                    <div className="space-y-4 px-2">
                        {data.references.map((ref) => (
                            <div key={ref.id} className="border border-gray-200 dark:border-slate-700 p-5 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 relative group transition-all w-full">
                                <button onClick={() => removeReference(ref.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-sm border border-gray-100 dark:border-slate-700"><Trash2 className="w-4 h-4" /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input value={ref.name} onChange={(e) => updateReference(ref.id, 'name', e.target.value)} placeholder="Reference Name" className="input-field font-semibold" />
                                    <input value={ref.company} onChange={(e) => updateReference(ref.id, 'company', e.target.value)} placeholder="Company" className="input-field" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input value={ref.position} onChange={(e) => updateReference(ref.id, 'position', e.target.value)} placeholder="Position" className="input-field" />
                                    <input value={ref.email} onChange={(e) => updateReference(ref.id, 'email', e.target.value)} placeholder="Email" className="input-field" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        ),
        skills: () => (
            <section id="editor-section-skills" className="pb-4 pt-4 border-b border-gray-100 dark:border-slate-800">
                <SectionHeader title="Skills" icon={Award} sectionKey="skills" visibilityKey="skills" draggable />
                {expanded['skills'] && (
                    <div className="px-2 relative">
                        <p className="text-xs text-gray-500 mb-2">Separate skills with commas</p>
                        <textarea
                            value={data.skills.join(", ")}
                            onChange={(e) => handleListChange('skills', e.target.value)}
                            placeholder="e.g. Java, Python, React, Leadership, Public Speaking"
                            rows={3}
                            className="input-textarea pb-12"
                        />

                        {/* Suggestions Area */}
                        {suggestedSkills.length > 0 && (
                            <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3" /> AI Suggestions
                                    </h4>
                                    <button onClick={() => setSuggestedSkills([])} className="text-[10px] text-gray-500 hover:text-gray-700">Clear</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedSkills.map((skill, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => addSuggestedSkill(skill)}
                                            className="text-xs bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3 text-blue-500" /> {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSkillsGenerate}
                            disabled={loadingField === 'skills'}
                            className="absolute bottom-3 right-3 text-[10px] bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition font-bold border border-indigo-100 dark:border-indigo-800 hover:scale-105"
                        >
                            {loadingField === 'skills' ? <Loader2 className="animate-spin w-3 h-3" /> : <Wand2 className="w-3 h-3" />}
                            AI Suggest
                        </button>
                    </div>
                )}
            </section>
        ),
        languages: () => (
            <section id="editor-section-languages" className="pb-4 pt-4 border-b border-gray-100 dark:border-slate-800">
                <SectionHeader title="Languages" icon={Languages} sectionKey="languages" visibilityKey="languages" draggable />
                {expanded['languages'] && (
                    <div className="px-2">
                        <p className="text-xs text-gray-500 mb-2">Separate languages with commas</p>
                        <textarea
                            value={data.languages.join(", ")}
                            onChange={(e) => handleListChange('languages', e.target.value)}
                            placeholder="e.g. English (Native), Spanish (B2), French (Beginner)"
                            rows={2}
                            className="input-textarea"
                        />
                    </div>
                )}
            </section>
        ),
        activities: () => (
            <section id="editor-section-activities" className="pb-4 pt-4 border-b border-gray-100 dark:border-slate-800">
                <SectionHeader title="Activities" icon={Award} sectionKey="activities" visibilityKey="activities" draggable />
                {expanded['activities'] && (
                    <div className="px-2">
                        <p className="text-xs text-gray-500 mb-2">Volunteering, Hobbies, Certifications</p>
                        <textarea
                            value={data.activities.join(", ")}
                            onChange={(e) => handleListChange('activities', e.target.value)}
                            placeholder="e.g. Marathon Runner, Open Source Contributor"
                            rows={2}
                            className="input-textarea"
                        />
                    </div>
                )}
            </section>
        )
    };

    return (
        <div className="space-y-2 bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 w-full">

            {/* Editor Header */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-6 mb-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        Resume Editor
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Fill in details. Drag sections to reorder.</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border dark:border-slate-700">
                    <label htmlFor="accentColor" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Color</label>
                    <input
                        type="color"
                        id="accentColor"
                        value={data.accentColor}
                        onChange={(e) => onChange({ ...data, accentColor: e.target.value })}
                        className="w-6 h-6 p-0 border-0 rounded-full cursor-pointer overflow-hidden"
                    />
                </div>
            </div>

            {/* Personal Info (Static Top) */}
            <section id="editor-section-personal" className="animate-fade-in border-b border-gray-100 dark:border-slate-800 pb-6">
                <div
                    className={`flex justify-between items-center cursor-pointer py-3 select-none rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors px-2 -mx-2 ${expanded['personal'] ? 'bg-gray-50 dark:bg-slate-800/50 mb-4' : ''}`}
                    onClick={() => toggleExpanded('personal')}
                >
                    <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-blue-600">
                            {expanded['personal'] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" />
                            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Personal Details</h3>
                        </div>
                    </div>
                </div>

                {expanded['personal'] && (
                    <div className="space-y-6 px-2">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            {/* Image Upload */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative group w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-blue-500 transition-all shadow-sm mx-auto md:mx-0">
                                    {data.personalInfo.profilePicture ? (
                                        <img src={data.personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-2">
                                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                            <span className="text-[10px] text-gray-400 leading-none block font-medium">Add Photo</span>
                                        </div>
                                    )}
                                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium backdrop-blur-sm">
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        Change
                                    </label>
                                </div>
                                {data.personalInfo.profilePicture && (
                                    <button
                                        onClick={() => onChange({ ...data, personalInfo: { ...data.personalInfo, profilePicture: '' } })}
                                        className="text-[10px] text-red-500 hover:underline"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <InputWithIcon icon={User} type="text" name="fullName" placeholder="Full Name" value={data.personalInfo.fullName} onChange={handleInfoChange} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputWithIcon icon={Mail} type="email" name="email" placeholder="Email Address" value={data.personalInfo.email} onChange={handleInfoChange} />
                                    <InputWithIcon icon={Phone} type="text" name="phone" placeholder="Phone Number" value={data.personalInfo.phone} onChange={handleInfoChange} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputWithIcon icon={MapPin} type="text" name="location" placeholder="City, Country" value={data.personalInfo.location} onChange={handleInfoChange} />
                                    <InputWithIcon icon={Globe} type="text" name="website" placeholder="Website / Portfolio" value={data.personalInfo.website || ''} onChange={handleInfoChange} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Social Profiles</h4>
                            {data.personalInfo.customLinks.map(link => (
                                <div key={link.id} className="flex flex-col md:flex-row gap-3 items-center">
                                    <input value={link.platform} onChange={(e) => updateCustomLink(link.id, 'platform', e.target.value)} placeholder="Platform (e.g. LinkedIn)" className="input-field md:w-1/3" />
                                    <div className="flex w-full md:flex-1 gap-2">
                                        <input value={link.url} onChange={(e) => updateCustomLink(link.id, 'url', e.target.value)} placeholder="URL" className="input-field" />
                                        <button onClick={() => removeCustomLink(link.id)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addCustomLink} className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline mt-2"><Plus className="w-3 h-3" /> Add Another Link</button>
                        </div>
                    </div>
                )}
            </section>

            {/* Dynamic Sections */}
            {data.sectionOrder.map(sectionId => (
                <div
                    key={sectionId}
                    className={`transition-all duration-300 ${draggedSection === sectionId ? 'opacity-20 scale-95 pointer-events-none' : ''}`}
                    onDragOver={(e) => handleDragOver(e, sectionId)}
                    onDrop={(e) => handleDrop(e, sectionId)}
                >
                    {sectionConfig[sectionId] ? sectionConfig[sectionId]() : null}
                </div>
            ))}

        </div>
    );
};

export default Editor;
