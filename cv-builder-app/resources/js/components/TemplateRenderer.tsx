
import React from 'react';
import { ResumeData } from '../types';

interface TemplateRendererProps {
  templateId: string;
  data: ResumeData;
  id?: string;
  onSectionClick?: (section: string) => void;
  onHeightChange?: (height: number) => void;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ templateId, data, id, onSectionClick, onHeightChange }) => {
  const [containerHeight, setContainerHeight] = React.useState<string>('297mm');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      // Temporarily set height to auto to measure natural content height
      const originalHeight = containerRef.current.style.height;
      containerRef.current.style.height = 'auto';
      
      // Measure the scrollHeight
      const scrollHeight = containerRef.current.scrollHeight;
      
      // Restore original height
      containerRef.current.style.height = originalHeight;
      
      // Calculate how many pages (1 page = width * 1.4142857)
      const currentWidth = containerRef.current.offsetWidth || 794;
      const pageHeight = currentWidth * 1.4142857;
      
      const numPages = Math.max(1, Math.ceil(scrollHeight / pageHeight));
      
      // Set the height in mm so it scales perfectly in any context (print, export, preview)
      setContainerHeight(`${numPages * 297}mm`);

      if (onHeightChange) {
        // Report pixel height to parent for scaling
        onHeightChange(numPages * pageHeight);
      }
    }
  }, [data, templateId, onHeightChange]);

  const containerStyle: React.CSSProperties = {
    width: '210mm', // A4 width
    minHeight: '297mm', // A4 height
    height: containerHeight,
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact'
  };

  const showEducation = data.sectionVisibility.education && data.education.length > 0;
  const showExperience = data.sectionVisibility.experience && data.experience.length > 0;
  const showProjects = data.sectionVisibility.projects && data.projects.length > 0;
  const showSkills = data.sectionVisibility.skills && data.skills.length > 0;
  const showLanguages = data.sectionVisibility.languages && data.languages.length > 0;
  const showActivities = data.sectionVisibility.activities && data.activities.length > 0;
  const showSummary = data.sectionVisibility.summary && data.summary;
  const showReferences = data.sectionVisibility.references && data.references.length > 0;

  const accent = data.accentColor;

  // Helper to handle click
  const handleClick = (section: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSectionClick) onSectionClick(section);
  };

  // Helper for dates (ATS friendly format: Month Year)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.toLowerCase().includes('present')) return "Present";
    try {
        const date = new Date(dateStr + (dateStr.length === 7 ? '-01' : '')); // Handle YYYY-MM
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
        return dateStr;
    }
  };

  // Helper to render dynamic sections
  const renderDynamicSections = (
    rendererMap: Record<string, () => React.ReactNode>, 
    layoutOrder: string[] | null = null // Pass null to use data.sectionOrder
  ) => {
    const order = layoutOrder || data.sectionOrder || ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'activities', 'references'];
    return order.map(section => {
      if (rendererMap[section]) {
        // Multi-item sections shouldn't be forced entirely onto one page if they are long.
        // Instead, we let them split naturally, while preventing individual items inside them from splitting.
        const isMultiItem = ['experience', 'projects', 'education', 'references'].includes(section);
        const avoidClass = isMultiItem ? '' : 'break-inside-avoid';
        return (
          <div 
            key={section} 
            data-section={section}
            onClick={handleClick(section)} 
            className={`cursor-pointer hover:bg-blue-50/10 transition-colors rounded -mx-1 px-1 ${avoidClass}`}
          >
            {rendererMap[section]()}
          </div>
        );
      }
      return null;
    });
  };

  // --- Renderers for each template ---

  // 1. Modern: Sidebar Left, Content Right
  const Modern = () => {
    const sidebarSections: Record<string, () => React.ReactNode> = {
      skills: () => showSkills ? (
        <div className="mb-6">
            <h3 className="uppercase tracking-widest text-xs font-bold border-b border-slate-700/80 mb-3 pb-1 text-slate-200">Skills</h3>
            <div className="flex flex-wrap -mb-2">
                {data.skills.map((skill, i) => (
                <span key={i} className="bg-slate-700 px-2 py-1 rounded text-xs mr-2 mb-2 inline-block">{skill}</span>
                ))}
            </div>
        </div>
      ) : <></>,
      languages: () => showLanguages ? (
        <div className="mb-6">
              <h3 className="uppercase tracking-widest text-xs font-bold border-b border-slate-700/80 mb-3 pb-1 text-slate-200">Languages</h3>
              <ul className="text-xs text-slate-300 list-disc list-inside">
                {data.languages.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
        </div>
      ) : <></>,
      education: () => showEducation ? (
        <div className="mb-6">
            <h3 className="uppercase tracking-widest text-xs font-bold border-b border-slate-700/80 mb-3 pb-1 text-slate-200">Education</h3>
            {data.education.map(edu => (
                <div key={edu.id} className="mb-3">
                <p className="font-bold">{edu.degree}</p>
                <p className="text-xs">{edu.school}</p>
                <p className="text-xs opacity-70">{formatDate(edu.graduationDate)}</p>
                </div>
            ))}
        </div>
      ) : <></>
    };

    const mainSections: Record<string, () => React.ReactNode> = {
      summary: () => showSummary ? (
        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-widest mb-4 pb-1 border-b-2" style={{ color: accent, borderColor: '#e2e8f0' }}>Professional Summary</h2>
          <p className="leading-relaxed text-sm">{data.summary}</p>
        </div>
      ) : <></>,
      experience: () => showExperience ? (
        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-widest mb-4 pb-1 border-b-2" style={{ color: accent, borderColor: '#e2e8f0' }}>Experience</h2>
          {data.experience.map(exp => (
              <div key={exp.id} className="mb-6">
              <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-base">{exp.jobTitle}</h3>
                  <span className="text-xs font-medium text-slate-500">{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</span>
              </div>
              <p className="text-sm font-semibold mb-2" style={{ color: accent }}>{exp.company}</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{exp.description}</p>
              </div>
          ))}
        </div>
      ) : <></>,
      projects: () => showProjects ? (
        <div className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-4 pb-1 border-b-2" style={{ color: accent, borderColor: '#e2e8f0' }}>Projects</h2>
            {data.projects.map(proj => (
              <div key={proj.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-base">{proj.name}</h3>
                    {proj.link && <span className="text-xs" style={{color: accent}}>{proj.link}</span>}
                </div>
                {proj.technologies && <p className="text-xs text-slate-500 italic mb-1">{proj.technologies}</p>}
                <p className="text-sm text-slate-700">{proj.description}</p>
              </div>
            ))}
        </div>
      ) : <></>,
      activities: () => showActivities ? (
         <div className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-4 pb-1 border-b-2" style={{ color: accent, borderColor: '#e2e8f0' }}>Activities</h2>
             <ul className="list-disc list-inside text-sm text-slate-700">
                 {data.activities.map((act, i) => <li key={i}>{act}</li>)}
             </ul>
         </div>
      ) : <></>,
      references: () => showReferences ? (
         <div className="mb-8">
             <h2 className="text-lg font-bold uppercase tracking-widest mb-4 pb-1 border-b-2" style={{ color: accent, borderColor: '#e2e8f0' }}>References</h2>
             {data.references.map(ref => (
                 <div key={ref.id} className="text-sm">
                     <p className="font-bold">{ref.name}</p>
                     <p className="text-slate-600">{ref.position}, {ref.company}</p>
                 </div>
             ))}
         </div>
      ) : <></>
    };

    return (
      <div className="flex h-full text-sm font-sans">
        <div className="w-1/3 text-white p-6 flex flex-col gap-6 relative print:bg-slate-800" style={{minHeight: '297mm', backgroundColor: '#1e293b'}}>
          <div className="flex flex-col items-center text-center" onClick={handleClick('personal')}>
              {data.personalInfo.profilePicture && (
                <img src={data.personalInfo.profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-slate-600" />
              )}
              <h1 className="text-2xl font-bold leading-tight break-words text-white">{data.personalInfo.fullName}</h1>
              <p className="text-slate-300 mt-1">{data.experience[0]?.jobTitle}</p>
          </div>
          <div className="space-y-2">
              <div onClick={handleClick('personal')}>
                  <h3 className="uppercase tracking-widest text-xs font-bold border-b border-slate-700/80 mb-3 pb-1 text-slate-200">Contact</h3>
                  <div className="flex flex-col gap-2 text-xs text-slate-300 break-words">
                      <p>{data.personalInfo.email}</p>
                      <p>{data.personalInfo.phone}</p>
                      <p>{data.personalInfo.location}</p>
                      {data.personalInfo.website && <p>{data.personalInfo.website}</p>}
                      {data.personalInfo.customLinks.map(l => (
                          <p key={l.id} className="opacity-90 hover:text-white transition-colors">
                            {l.platform ? <span className="opacity-60 mr-1">{l.platform}:</span> : ''}
                            {l.url}
                          </p>
                      ))}
                  </div>
              </div>
              {renderDynamicSections(sidebarSections, ['education', 'skills', 'languages'])} 
          </div>
        </div>
        <div className="w-2/3 p-8 text-slate-800">
           {renderDynamicSections(mainSections)}
        </div>
      </div>
    );
  };

  // 2. Creative: Bold colors, gradients
  const Creative = () => {
    const sections: Record<string, () => React.ReactNode> = {
      skills: () => showSkills ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="font-black text-lg mb-4" style={{ color: accent }}>SKILLS</h3>
            <ul className="space-y-2 text-sm font-medium text-gray-700">
                {data.skills.map(s => <li key={s}>{s}</li>)}
            </ul>
        </div>
      ) : <></>,
      languages: () => showLanguages ? (
        <div className="p-2 mb-8">
            <h3 className="font-black text-lg mb-2" style={{ color: accent }}>LANGUAGES</h3>
            <p className="text-sm text-gray-600">{data.languages.join(", ")}</p>
        </div>
      ) : <></>,
      summary: () => showSummary ? (
        <div className="mb-8">
            <h3 className="font-black text-lg mb-3 flex items-center gap-2 px-2 py-1 rounded" style={{ color: accent, background: `linear-gradient(90deg, white, ${accent}20)` }}>
                ABOUT ME
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">{data.summary}</p>
        </div>
      ) : <></>,
      experience: () => showExperience ? (
        <div className="mb-8">
            <h3 className="font-black text-lg mb-6 flex items-center gap-2 px-2 py-1 rounded" style={{ color: accent, background: `linear-gradient(90deg, white, ${accent}20)` }}>
                EXPERIENCE
            </h3>
            {data.experience.map(exp => (
                <div key={exp.id} className="mb-6 pl-4 border-l-2" style={{ borderColor: accent }}>
                    <h4 className="font-bold text-gray-800">{exp.jobTitle}</h4>
                    <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                        <span>{exp.company}</span>
                        <span>{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</span>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{exp.description}</p>
                </div>
            ))}
        </div>
      ) : <></>,
      projects: () => showProjects ? (
        <div className="mb-8">
            <h3 className="font-black text-lg mb-6 flex items-center gap-2 px-2 py-1 rounded" style={{ color: accent, background: `linear-gradient(90deg, white, ${accent}20)` }}>
                PROJECTS
            </h3>
            {data.projects.map(proj => (
                <div key={proj.id} className="mb-4">
                    <div className="flex items-baseline gap-2">
                        <h4 className="font-bold text-gray-800">{proj.name}</h4>
                        {proj.link && <span className="text-xs text-blue-500">{proj.link}</span>}
                    </div>
                    <p className="text-sm text-gray-600">{proj.description}</p>
                </div>
            ))}
        </div>
      ) : <></>,
      education: () => showEducation ? (
        <div className="mb-8">
           <h3 className="font-black text-lg mb-6 flex items-center gap-2 px-2 py-1 rounded" style={{ color: accent, background: `linear-gradient(90deg, white, ${accent}20)` }}>
                EDUCATION
            </h3>
            {data.education.map(edu => (
                <div key={edu.id} className="mb-4">
                   <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                   <p className="text-sm text-gray-600">{edu.school}, {formatDate(edu.graduationDate)}</p>
                </div>
            ))}
        </div>
      ) : <></>,
      activities: () => showActivities ? (
        <div className="mb-8">
             <h3 className="font-black text-lg mb-3 flex items-center gap-2 px-2 py-1 rounded" style={{ color: accent, background: `linear-gradient(90deg, white, ${accent}20)` }}>
                ACTIVITIES
            </h3>
            <ul className="text-sm text-gray-600 list-disc list-inside">
                {data.activities.map(a => <li key={a}>{a}</li>)}
            </ul>
        </div>
      ) : <></>,
      references: () => showReferences ? (
        <div className="mb-8">
             <h3 className="font-black text-lg mb-3 flex items-center gap-2 px-2 py-1 rounded" style={{ color: accent, background: `linear-gradient(90deg, white, ${accent}20)` }}>
                REFERENCES
            </h3>
            {data.references.map(r => (
               <div key={r.id} className="mb-2 text-sm text-gray-600">
                  <p className="font-bold">{r.name}</p>
                  <p>{r.position}, {r.company}</p>
               </div>
            ))}
        </div>
      ) : <></>
    };

    return (
      <div className="h-full bg-white p-8 font-sans">
          <div className="flex justify-between items-center mb-8 pb-8 border-b-4" style={{ borderColor: accent }} onClick={handleClick('personal')}>
              <div>
                  <h1 className="text-5xl font-black tracking-tighter" style={{ color: accent }}>{data.personalInfo.fullName.split(' ')[0]}</h1>
                  <h1 className="text-5xl font-light text-gray-400 tracking-tighter">{data.personalInfo.fullName.split(' ').slice(1).join(' ')}</h1>
                  <p className="text-xl mt-2 font-medium text-gray-800">{data.experience[0]?.jobTitle}</p>
              </div>
              <div className="text-right text-sm space-y-1 text-gray-600">
                  <p>{data.personalInfo.email}</p>
                  <p>{data.personalInfo.phone}</p>
                  <p>{data.personalInfo.location}</p>
                  {data.personalInfo.website && <p className="text-blue-500 underline">{data.personalInfo.website}</p>}
                  {data.personalInfo.customLinks.map(l => (
                      <p key={l.id} className="text-blue-500 underline">{l.url}</p>
                  ))}
              </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
              <div className="col-span-1">
                   {renderDynamicSections(sections, ['skills', 'languages'])}
              </div>

              <div className="col-span-2">
                  {renderDynamicSections(sections, data.sectionOrder.filter(k => !['skills', 'languages'].includes(k)))}
              </div>
          </div>
      </div>
    );
  }

  // 3. Plain Text / ATS Template
  // OPTIMIZED for ATS: Single column, clear headings, no complex tables or floats.
  const PlainTemplate = () => {
    const sections: Record<string, () => React.ReactNode> = {
      summary: () => showSummary ? (
        <div className="mb-6">
            <h2 className="text-base font-bold uppercase mb-2 border-b border-black pb-1 tracking-wide">Summary</h2>
            <p className="text-sm leading-relaxed">{data.summary}</p>
        </div>
      ) : <></>,
      experience: () => showExperience ? (
        <div className="mb-6">
            <h2 className="text-base font-bold uppercase mb-3 border-b border-black pb-1 tracking-wide">Experience</h2>
            {data.experience.map(exp => (
                <div key={exp.id} className="mb-4">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-sm text-black">{exp.jobTitle}</h3>
                        <span className="text-sm font-bold text-black">{formatDate(exp.startDate)} – {formatDate(exp.endDate)}</span>
                    </div>
                    <div className="text-sm italic mb-1 text-black">{exp.company}</div>
                    <p className="text-sm whitespace-pre-line leading-normal">{exp.description}</p>
                </div>
            ))}
        </div>
      ) : <></>,
      education: () => showEducation ? (
        <div className="mb-6">
            <h2 className="text-base font-bold uppercase mb-3 border-b border-black pb-1 tracking-wide">Education</h2>
            {data.education.map(edu => (
                <div key={edu.id} className="mb-2">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-sm text-black">{edu.school}</h3>
                        <span className="text-sm text-black">{formatDate(edu.graduationDate)}</span>
                    </div>
                    <div className="text-sm">{edu.degree}</div>
                    {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
                </div>
            ))}
        </div>
      ) : <></>,
      projects: () => showProjects ? (
        <div className="mb-6">
            <h2 className="text-base font-bold uppercase mb-3 border-b border-black pb-1 tracking-wide">Projects</h2>
            {data.projects.map(proj => (
                <div key={proj.id} className="mb-3">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-sm text-black">{proj.name}</h3>
                    </div>
                    {proj.link && <div className="text-sm mb-1">{proj.link}</div>}
                    <p className="text-sm">{proj.description}</p>
                    {proj.technologies && <p className="text-sm italic mt-1">Tech: {proj.technologies}</p>}
                </div>
            ))}
        </div>
      ) : <></>,
      skills: () => showSkills ? (
        <div className="mb-6">
            <h2 className="text-base font-bold uppercase mb-2 border-b border-black pb-1 tracking-wide">Skills</h2>
            <p className="text-sm">{data.skills.join(", ")}</p>
        </div>
      ) : <></>,
      languages: () => showLanguages ? (
        <div className="mb-6">
            <h2 className="text-base font-bold uppercase mb-2 border-b border-black pb-1 tracking-wide">Languages</h2>
            <p className="text-sm">{data.languages.join(", ")}</p>
        </div>
      ) : <></>,
      activities: () => showActivities ? (
        <div className="mb-6">
            <h2 className="text-base font-bold uppercase mb-2 border-b border-black pb-1 tracking-wide">Activities</h2>
            <p className="text-sm">{data.activities.join(", ")}</p>
        </div>
      ) : <></>,
      references: () => showReferences ? (
        <div className="mb-6">
            <h2 className="text-base font-bold uppercase mb-2 border-b border-black pb-1 tracking-wide">References</h2>
            {data.references.map(r => (
               <div key={r.id} className="text-sm mb-1">{r.name} - {r.position}, {r.company}</div>
            ))}
        </div>
      ) : <></>
    };

    return (
        <div className="h-full p-12 font-sans text-black bg-white leading-relaxed text-left" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="mb-8 border-b-2 border-black pb-4" onClick={handleClick('personal')}>
                <h1 className="text-3xl font-bold uppercase mb-2 text-black">{data.personalInfo.fullName}</h1>
                <div className="text-sm flex flex-wrap gap-x-4 gap-y-1 text-black">
                     <span>{data.personalInfo.location}</span>
                     <span>| {data.personalInfo.phone}</span>
                     <span>| {data.personalInfo.email}</span>
                     {data.personalInfo.website && <span>| {data.personalInfo.website}</span>}
                     {data.personalInfo.customLinks.map(l => (
                         <span key={l.id}>| {l.url}</span>
                     ))}
                </div>
            </div>
            {renderDynamicSections(sections)}
        </div>
    );
  };

  // 4. Executive: Dark header, Serif, formal
  const Executive = () => {
    const sections: Record<string, () => React.ReactNode> = {
       summary: () => showSummary ? (
         <div className="mb-6">
           <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">Executive Profile</h3>
           <p className="text-sm leading-relaxed text-gray-800">{data.summary}</p>
         </div>
       ) : <></>,
       experience: () => showExperience ? (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 border-b border-slate-200 pb-2">Professional Experience</h3>
            {data.experience.map(exp => (
              <div key={exp.id} className="mb-5">
                 <div className="flex justify-between items-baseline mb-1">
                    <span className="text-lg font-serif font-bold text-gray-900">{exp.company}</span>
                    <span className="text-sm text-slate-600 font-semibold">{formatDate(exp.startDate)} – {formatDate(exp.endDate)}</span>
                 </div>
                 <div className="text-sm font-bold text-gray-700 mb-2">{exp.jobTitle}</div>
                 <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
       ) : <></>,
       projects: () => showProjects ? (
         <div className="mb-6">
           <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 border-b border-slate-200 pb-2">Key Projects</h3>
           {data.projects.map(proj => (
             <div key={proj.id} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                   <span className="text-base font-bold text-gray-900">{proj.name}</span>
                   {proj.link && <span className="text-xs text-indigo-650 font-semibold hover:underline">{proj.link}</span>}
                </div>
                {proj.technologies && <div className="text-xs italic text-slate-600 mb-1">Technologies: {proj.technologies}</div>}
                <p className="text-sm text-gray-805 leading-relaxed">{proj.description}</p>
             </div>
           ))}
         </div>
       ) : <></>,
       skills: () => showSkills ? (
           <div className="mb-6">
               <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-2">Core Competencies</h3>
               <div className="flex flex-wrap -mb-2">
                  {data.skills.map((s,i) => <span key={i} className="text-sm bg-slate-50 border border-slate-200 px-3 py-1 rounded text-slate-800 mr-2 mb-2 inline-block font-sans font-medium">{s}</span>)}
               </div>
           </div>
       ) : <></>,
       education: () => showEducation ? (
         <div className="mb-6">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-2">Education</h3>
             {data.education.map(edu => (
                 <div key={edu.id} className="mb-3">
                     <div className="flex justify-between items-baseline mb-1">
                         <span className="font-bold text-gray-900">{edu.school}</span>
                         <span className="text-sm text-slate-600 font-semibold">{formatDate(edu.graduationDate)}</span>
                     </div>
                     <div className="text-sm text-gray-700">{edu.degree}</div>
                 </div>
             ))}
         </div>
       ) : <></>,
       languages: () => showLanguages ? (
         <div className="mb-6">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-2">Languages</h3>
             <div className="text-sm text-slate-800 leading-relaxed font-serif">{data.languages.join(", ")}</div>
         </div>
       ) : <></>,
       activities: () => showActivities ? (
         <div className="mb-6">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-2">Activities & Honors</h3>
             <div className="text-sm text-slate-800 leading-relaxed font-serif">{data.activities.join(", ")}</div>
         </div>
       ) : <></>,
       references: () => showReferences ? (
         <div className="mb-6">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-2">References</h3>
             {data.references.map(r => (
                <div key={r.id} className="text-sm mb-1 text-slate-800"><span className="font-bold text-gray-900">{r.name}</span> - {r.position}, {r.company}</div>
             ))}
         </div>
       ) : <></>
    };

    return (
      <div className="h-full bg-white font-serif">
         <div className="bg-slate-900 text-white p-10" onClick={handleClick('personal')}>
            <h1 className="text-4xl font-bold mb-2 tracking-wide">{data.personalInfo.fullName.toUpperCase()}</h1>
            <div className="text-sm text-gray-300 flex flex-wrap gap-4 mt-4 font-sans">
               <span>{data.personalInfo.email}</span>
               <span>{data.personalInfo.phone}</span>
               <span>{data.personalInfo.location}</span>
               {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
               {data.personalInfo.customLinks.map(l => (
                   <span key={l.id}>{l.url}</span>
               ))}
            </div>
         </div>
         <div className="p-10 text-left">
            {renderDynamicSections(sections)}
         </div>
      </div>
    );
  };

  // 5. Minimal: Centered, lots of whitespace, simple
  const Minimal = () => {
    const sections: Record<string, () => React.ReactNode> = {
        summary: () => showSummary ? <div className="mb-8 text-center max-w-2xl mx-auto"><p className="text-sm text-slate-600 leading-loose">{data.summary}</p></div> : <></>,
        experience: () => showExperience ? (
            <div className="mb-10">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-6 text-slate-500">Experience</h3>
                {data.experience.map(exp => (
                    <div key={exp.id} className="mb-6 text-center">
                        <div className="font-bold text-slate-900">{exp.jobTitle}</div>
                        <div className="text-sm text-slate-500 mb-2">{exp.company} | {formatDate(exp.startDate)} - {formatDate(exp.endDate)}</div>
                        <p className="text-sm text-slate-600 max-w-xl mx-auto whitespace-pre-line leading-relaxed">{exp.description}</p>
                    </div>
                ))}
            </div>
        ) : <></>,
        education: () => showEducation ? (
            <div className="mb-10">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-6 text-slate-500">Education</h3>
                {data.education.map(edu => (
                    <div key={edu.id} className="mb-4 text-center">
                        <div className="font-bold text-slate-900">{edu.school}</div>
                        <div className="text-sm text-slate-600">{edu.degree} | {formatDate(edu.graduationDate)}</div>
                    </div>
                ))}
            </div>
        ) : <></>,
        projects: () => showProjects ? (
            <div className="mb-10">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-6 text-slate-500">Projects</h3>
                {data.projects.map(proj => (
                    <div key={proj.id} className="mb-6 text-center">
                        <div className="font-bold text-slate-900">{proj.name}</div>
                        {proj.link && <div className="text-xs text-indigo-650 hover:underline mb-1">{proj.link}</div>}
                        {proj.technologies && <div className="text-xs italic text-slate-500 mb-2">Tech: {proj.technologies}</div>}
                        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">{proj.description}</p>
                    </div>
                ))}
            </div>
        ) : <></>,
        skills: () => showSkills ? (
             <div className="mb-10 text-center">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-4 text-slate-500">Skills</h3>
                <div className="flex justify-center flex-wrap -mb-4 max-w-lg mx-auto">
                    {data.skills.map(s => <span key={s} className="text-sm text-slate-600 mx-2 mb-4 inline-block font-medium">{s}</span>)}
                </div>
             </div>
        ) : <></>,
        languages: () => showLanguages ? (
            <div className="mb-10 text-center">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-4 text-slate-500">Languages</h3>
                <div className="flex justify-center flex-wrap max-w-lg mx-auto gap-4">
                    {data.languages.map(l => <span key={l} className="text-sm text-slate-600 inline-block font-medium">{l}</span>)}
                </div>
            </div>
        ) : <></>,
        activities: () => showActivities ? (
            <div className="mb-10 text-center">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-4 text-slate-500">Activities</h3>
                <div className="flex justify-center flex-wrap max-w-lg mx-auto gap-4">
                    {data.activities.map(a => <span key={a} className="text-sm text-slate-600 inline-block font-medium">{a}</span>)}
                </div>
            </div>
        ) : <></>,
        references: () => showReferences ? (
            <div className="mb-10">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-6 text-slate-500">References</h3>
                {data.references.map(r => (
                    <div key={r.id} className="mb-4 text-center">
                        <div className="font-bold text-slate-900">{r.name}</div>
                        <div className="text-sm text-slate-600">{r.position} @ {r.company}</div>
                        <div className="text-xs text-slate-500">{r.email} | {r.phone}</div>
                    </div>
                ))}
            </div>
        ) : <></>
    };

    return (
        <div className="h-full bg-white p-12 font-sans flex flex-col items-center">
            <div className="text-center mb-12" onClick={handleClick('personal')}>
                <h1 className="text-2xl font-normal tracking-widest uppercase mb-4 text-slate-900">{data.personalInfo.fullName}</h1>
                <div className="text-xs text-slate-500 flex flex-wrap justify-center gap-3 tracking-wider">
                    <span>{data.personalInfo.location}</span>
                    <span>{data.personalInfo.email}</span>
                    <span>{data.personalInfo.phone}</span>
                    {data.personalInfo.customLinks.map(l => (
                        <span key={l.id}>{l.url}</span>
                    ))}
                </div>
            </div>
            <div className="w-full text-left">
                {renderDynamicSections(sections)}
            </div>
        </div>
    );
  };

  // 6. Split: 40% Left Color, 60% Right White
  const Split = () => {
      const sidebarSections: Record<string, () => React.ReactNode> = {
          skills: () => showSkills ? (
              <div className="mb-8">
                  <h3 className="text-white font-bold uppercase text-sm mb-4 border-b border-white/20 pb-2">Skills</h3>
                  <div className="flex flex-wrap -mb-2">
                      {data.skills.map(s => <span key={s} className="text-xs bg-white/10 px-2 py-1 rounded text-white mr-2 mb-2 inline-block">{s}</span>)}
                  </div>
              </div>
          ) : <></>,
          education: () => showEducation ? (
              <div className="mb-8">
                  <h3 className="text-white font-bold uppercase text-sm mb-4 border-b border-white/20 pb-2">Education</h3>
                  {data.education.map(e => (
                      <div key={e.id} className="mb-4 text-white/90 text-sm">
                          <div className="font-bold">{e.degree}</div>
                          <div className="text-xs opacity-80">{e.school}</div>
                          <div className="text-xs opacity-60">{formatDate(e.graduationDate)}</div>
                      </div>
                  ))}
              </div>
          ) : <></>,
           languages: () => showLanguages ? (
            <div className="mb-8">
                <h3 className="text-white font-bold uppercase text-sm mb-4 border-b border-white/20 pb-2">Languages</h3>
                <div className="text-white/90 text-sm">{data.languages.join(", ")}</div>
            </div>
          ) : <></>
      };

      const mainSections: Record<string, () => React.ReactNode> = {
          summary: () => showSummary ? (
              <div className="mb-8">
                  <h3 className="text-gray-900 font-bold uppercase text-sm mb-4 border-b border-gray-200 pb-2">Profile</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{data.summary}</p>
              </div>
          ) : <></>,
          experience: () => showExperience ? (
              <div className="mb-8">
                   <h3 className="text-gray-900 font-bold uppercase text-sm mb-4 border-b border-gray-200 pb-2">Experience</h3>
                   {data.experience.map(exp => (
                       <div key={exp.id} className="mb-6">
                           <div className="font-bold text-gray-800">{exp.jobTitle}</div>
                           <div className="text-sm text-gray-500 mb-2">{exp.company} | {formatDate(exp.startDate)} - {formatDate(exp.endDate)}</div>
                           <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                       </div>
                   ))}
              </div>
          ) : <></>,
           projects: () => showProjects ? (
              <div className="mb-8">
                   <h3 className="text-gray-900 font-bold uppercase text-sm mb-4 border-b border-gray-200 pb-2">Projects</h3>
                   {data.projects.map(p => (
                       <div key={p.id} className="mb-4">
                           <div className="font-bold text-gray-800 text-sm">{p.name}</div>
                           <p className="text-sm text-gray-600">{p.description}</p>
                       </div>
                   ))}
              </div>
          ) : <></>
      };

      return (
          <div className="flex h-full font-sans" style={{ minHeight: '297mm' }}>
              <div className="w-[40%] p-8" style={{ backgroundColor: accent, color: 'white' }}>
                  <div className="mb-10" onClick={handleClick('personal')}>
                       {data.personalInfo.profilePicture && <img src={data.personalInfo.profilePicture} className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-white/20 mx-auto" />}
                       <h1 className="text-2xl font-bold mb-2 break-words text-center">{data.personalInfo.fullName}</h1>
                       <div className="text-sm text-white/80 space-y-1 text-center">
                           <p>{data.personalInfo.email}</p>
                           <p>{data.personalInfo.phone}</p>
                           <p>{data.personalInfo.location}</p>
                           {data.personalInfo.customLinks.map(l => (
                               <p key={l.id}>{l.url}</p>
                           ))}
                       </div>
                  </div>
                  {renderDynamicSections(sidebarSections, ['education', 'skills', 'languages'])}
              </div>
              <div className="w-[60%] p-8 bg-white">
                  {renderDynamicSections(mainSections)}
              </div>
          </div>
      );
  };

  // 7. Timeline: Vertical line connecting items
  const Timeline = () => {
       // Simplified Timeline logic
       const TimelineItem = ({ title, subtitle, date, content }: any) => (
           <div className="relative pl-8 pb-8 border-l-2 border-gray-200 last:border-0 last:pb-0">
               <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4" style={{ borderColor: accent }}></div>
               <div className="flex justify-between items-baseline mb-1">
                   <h4 className="font-bold text-gray-800">{title}</h4>
                   <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{date}</span>
               </div>
               <div className="text-sm font-medium text-gray-600 mb-2">{subtitle}</div>
               <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
           </div>
       );

       const sections: Record<string, () => React.ReactNode> = {
            experience: () => showExperience ? (
                <div className="mb-8">
                     <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: accent }}>Work History</h3>
                     <div className="ml-2">
                        {data.experience.map(exp => (
                            <TimelineItem 
                                key={exp.id} 
                                title={exp.jobTitle} 
                                subtitle={exp.company} 
                                date={`${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`} 
                                content={exp.description} 
                            />
                        ))}
                     </div>
                </div>
            ) : <></>,
            education: () => showEducation ? (
                 <div className="mb-8">
                     <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: accent }}>Education</h3>
                     <div className="ml-2">
                        {data.education.map(edu => (
                            <TimelineItem 
                                key={edu.id} 
                                title={edu.degree} 
                                subtitle={edu.school} 
                                date={formatDate(edu.graduationDate)} 
                                content={edu.description || ''} 
                            />
                        ))}
                     </div>
                </div>
            ) : <></>
       };
       // Reuse others via generic
       
       return (
           <div className="h-full bg-white p-10 font-sans">
               <div className="border-b pb-8 mb-8 flex justify-between items-end" onClick={handleClick('personal')}>
                   <div>
                       <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
                       <p className="text-xl text-gray-500">{data.experience[0]?.jobTitle}</p>
                   </div>
                   <div className="text-right text-sm text-gray-600 space-y-1">
                       <p>{data.personalInfo.email}</p>
                       <p>{data.personalInfo.phone}</p>
                       <p>{data.personalInfo.location}</p>
                       {data.personalInfo.customLinks.map(l => (
                           <p key={l.id}>{l.url}</p>
                       ))}
                   </div>
               </div>
               <div className="grid grid-cols-12 gap-8">
                   <div className="col-span-4 space-y-8">
                       {/* Sidebar info like skills */}
                        {showSkills && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm">Skills</h3>
                                <div className="flex flex-wrap -mb-2">
                                    {data.skills.map(s => <span key={s} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2 mb-2 inline-block">{s}</span>)}
                                </div>
                            </div>
                        )}
                        {showSummary && (
                             <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm">Profile</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{data.summary}</p>
                            </div>
                        )}
                   </div>
                   <div className="col-span-8">
                        {renderDynamicSections(sections, ['experience', 'education'])}
                        {renderDynamicSections(sections, data.sectionOrder.filter(s => !['experience', 'education', 'skills', 'summary'].includes(s)))}
                   </div>
               </div>
           </div>
       );
  };

  // 8. Compact: Grid layout for dense info
  const Compact = () => {
      // Very similar to Plain but 2 columns
       const sections: Record<string, () => React.ReactNode> = {
          experience: () => showExperience ? (
              <div className="mb-4">
                  <h3 className="font-bold border-b border-gray-300 mb-2 text-sm uppercase">Experience</h3>
                  {data.experience.map(exp => (
                      <div key={exp.id} className="mb-3 text-sm">
                          <div className="flex justify-between font-bold"><span>{exp.jobTitle}</span> <span className="text-xs">{formatDate(exp.startDate)}-{formatDate(exp.endDate)}</span></div>
                          <div className="italic text-xs mb-1">{exp.company}</div>
                          <p className="text-xs leading-tight">{exp.description}</p>
                      </div>
                  ))}
              </div>
          ) : <></>,
           projects: () => showProjects ? (
              <div className="mb-4">
                  <h3 className="font-bold border-b border-gray-300 mb-2 text-sm uppercase">Projects</h3>
                  {data.projects.map(p => (
                      <div key={p.id} className="mb-2 text-sm">
                          <div className="font-bold text-xs">{p.name}</div>
                          <p className="text-xs">{p.description}</p>
                      </div>
                  ))}
              </div>
          ) : <></>,
           // ... others
       };

       return (
           <div className="h-full bg-white p-6 font-sans">
               <div className="border-b-2 border-gray-800 pb-2 mb-4" onClick={handleClick('personal')}>
                    <h1 className="text-2xl font-bold uppercase">{data.personalInfo.fullName}</h1>
                    <div className="text-xs flex gap-4 text-gray-600 mt-1">
                        <span>{data.personalInfo.email}</span>
                        <span>{data.personalInfo.phone}</span>
                        <span>{data.personalInfo.location}</span>
                        {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
                        {data.personalInfo.customLinks.map(l => (
                            <span key={l.id}>{l.url}</span>
                        ))}
                    </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                    <div>
                         {/* Left Col */}
                        {showSummary && (
                            <div className="mb-4">
                                <h3 className="font-bold border-b border-gray-300 mb-2 text-sm uppercase">Summary</h3>
                                <p className="text-xs leading-relaxed">{data.summary}</p>
                            </div>
                        )}
                        {renderDynamicSections(sections, ['experience'])}
                    </div>
                    <div>
                        {/* Right Col */}
                        {showSkills && (
                             <div className="mb-4">
                                <h3 className="font-bold border-b border-gray-300 mb-2 text-sm uppercase">Skills</h3>
                                <p className="text-xs">{data.skills.join(", ")}</p>
                            </div>
                        )}
                         {showEducation && (
                             <div className="mb-4">
                                <h3 className="font-bold border-b border-gray-300 mb-2 text-sm uppercase">Education</h3>
                                {data.education.map(e => <div key={e.id} className="text-xs mb-1"><span className="font-bold">{e.degree}</span> - {e.school}</div>)}
                            </div>
                        )}
                        {renderDynamicSections(sections, ['projects'])}
                    </div>
               </div>
           </div>
       );
  };
  
  // 9. Tech: Monospace-ish, dark header
  const Tech = () => {
      const MonoHeader = ({ title }: { title: string }) => (
          <h3 className="font-mono text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2" style={{ color: accent }}>&gt;</span> {title}
          </h3>
      );
      
      const sections: Record<string, () => React.ReactNode> = {
          skills: () => showSkills ? (
              <div className="mb-8">
                  <MonoHeader title="SKILLS" />
                  <div className="font-mono text-sm text-slate-600 bg-slate-50 p-4 rounded border border-slate-200">
                      {data.skills.map(s => `[${s}]`).join(" ")}
                  </div>
              </div>
          ) : <></>,
           experience: () => showExperience ? (
              <div className="mb-8">
                  <MonoHeader title="EXPERIENCE" />
                  {data.experience.map(exp => (
                      <div key={exp.id} className="mb-6 border-l-2 border-slate-200 pl-4" style={{ borderLeftColor: `${accent}40` }}>
                          <div className="font-mono font-bold text-slate-900">{exp.jobTitle} @ {exp.company}</div>
                          <div className="text-xs font-mono text-slate-500 mb-2">// {formatDate(exp.startDate)} to {formatDate(exp.endDate)}</div>
                          <p className="text-sm text-slate-700 whitespace-pre-line">{exp.description}</p>
                      </div>
                  ))}
              </div>
          ) : <></>,
          // ... others generic
      };

      return (
          <div className="h-full bg-white font-sans text-slate-800">
              <div className="bg-slate-900 p-8 font-mono" style={{ color: accent }} onClick={handleClick('personal')}>
                  <h1 className="text-3xl font-bold mb-2 cursor-blink">{data.personalInfo.fullName}_</h1>
                  <div className="text-sm opacity-80 flex flex-wrap gap-4">
                      <span>const email = "{data.personalInfo.email}";</span>
                      <span>const phone = "{data.personalInfo.phone}";</span>
                      {data.personalInfo.customLinks.map(l => (
                          <span key={l.id}>const {l.platform.replace(/\s+/g, '').toLowerCase() || 'link'} = "{l.url}";</span>
                      ))}
                  </div>
              </div>
              <div className="p-8">
                  {showSummary && <div className="mb-8 font-mono text-sm p-4 border border-dashed border-slate-300 text-slate-600">{data.summary}</div>}
                  {renderDynamicSections(sections)}
                  {/* Generic fallbacks for others */}
                  {showEducation && !sections.education && (
                      <div className="mb-8">
                          <MonoHeader title="EDUCATION" />
                          {data.education.map(e => <div key={e.id} className="font-mono text-sm">{e.degree} from {e.school}</div>)}
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderContent = () => {
    switch(templateId) {
      case 'modern': return <Modern />;
      case 'creative': return <Creative />;
      case 'plain': return <PlainTemplate />;
      case 'classic': return <ATSTemplate fontFamily="font-serif" />;
      case 'tech': return <Tech />;
      case 'minimal': return <Minimal />;
      case 'executive': return <Executive />;
      case 'timeline': return <Timeline />;
      case 'split': return <Split />;
      case 'compact': return <Compact />;
      default: return <ATSTemplate />;
    }
  };

  const ATSTemplate = ({ fontFamily = 'font-sans' }: { fontFamily?: string }) => {
    // Standard ATS/Classic layout. Single column, high readability.
     const sections: Record<string, () => React.ReactNode> = {
      summary: () => showSummary ? (
        <div className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 tracking-wide" style={{ color: accent }}>Summary</h2>
            <p className="text-sm leading-normal">{data.summary}</p>
        </div>
      ) : <></>,
      experience: () => showExperience ? (
        <div className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 tracking-wide" style={{ color: accent }}>Experience</h2>
            {data.experience.map(exp => (
                <div key={exp.id} className="mb-5">
                    <div className="flex justify-between font-bold text-base">
                        <span>{exp.jobTitle}</span>
                        <span className="text-sm">{formatDate(exp.startDate)} – {formatDate(exp.endDate)}</span>
                    </div>
                    <div className="text-sm font-semibold italic mb-2 text-gray-700">{exp.company}</div>
                    <p className="text-sm whitespace-pre-line leading-relaxed">{exp.description}</p>
                </div>
            ))}
        </div>
      ) : <></>,
      projects: () => showProjects ? (
        <div className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 tracking-wide" style={{ color: accent }}>Projects</h2>
            {data.projects.map(proj => (
                <div key={proj.id} className="mb-4">
                    <div className="flex justify-between items-baseline">
                        <span className="font-bold text-base">{proj.name}</span>
                    </div>
                    {proj.technologies && <div className="text-xs italic text-gray-600 mb-1">Stack: {proj.technologies}</div>}
                    <p className="text-sm">{proj.description}</p>
                </div>
            ))}
        </div>
      ) : <></>,
      education: () => showEducation ? (
        <div className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 tracking-wide" style={{ color: accent }}>Education</h2>
            {data.education.map(edu => (
                <div key={edu.id} className="mb-2">
                    <div className="flex justify-between font-bold text-sm">
                            <span>{edu.school}</span>
                            <span>{formatDate(edu.graduationDate)}</span>
                    </div>
                    <div className="text-sm">{edu.degree}</div>
                </div>
            ))}
        </div>
      ) : <></>,
      skills: () => showSkills ? (
        <div className="mb-6">
                <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 tracking-wide" style={{ color: accent }}>Skills</h2>
                <div className="text-sm">{data.skills.join(", ")}</div>
        </div>
      ) : <></>,
      languages: () => showLanguages ? (
        <div className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 tracking-wide" style={{ color: accent }}>Languages</h2>
            <div className="text-sm">{data.languages.join(", ")}</div>
        </div>
      ) : <></>,
      activities: () => showActivities ? (
        <div className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 tracking-wide" style={{ color: accent }}>Activities</h2>
            <div className="text-sm">{data.activities.join(", ")}</div>
        </div>
      ) : <></>,
      references: () => showReferences ? (
         <div className="mb-6">
             <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 tracking-wide" style={{ color: accent }}>References</h2>
             {data.references.map(r => (
               <div key={r.id} className="text-sm mb-1">{r.name} - {r.position}, {r.company}</div>
             ))}
         </div>
      ) : <></>
    };

    return (
      <div className={`h-full p-10 ${fontFamily} text-gray-900 leading-normal bg-white`}>
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6" onClick={handleClick('personal')}>
              <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">{data.personalInfo.fullName}</h1>
              <div className="text-sm flex flex-wrap justify-center gap-3 text-gray-700">
                    <span>{data.personalInfo.location}</span> |
                    <span>{data.personalInfo.phone}</span> |
                    <a href={`mailto:${data.personalInfo.email}`} className="text-blue-800 underline">{data.personalInfo.email}</a>
                    {data.personalInfo.website && <span>| {data.personalInfo.website}</span>}
                    {data.personalInfo.customLinks.map(l => (
                        <span key={l.id}> | {l.url}</span>
                    ))}
              </div>
          </div>
          {renderDynamicSections(sections)}
      </div>
    );
  };

  return (
    <div 
        id={id}
        ref={containerRef}
        style={containerStyle} 
        className="mx-auto bg-white"
    >
      {renderContent()}
    </div>
  );
};

export default TemplateRenderer;
