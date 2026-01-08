
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import { INITIAL_DATA, TEMPLATES, ResumeData, User } from './types';
import TemplateRenderer from './components/TemplateRenderer';
import Editor from './components/Editor';
import AuthModal from './components/AuthModal';
import { apiService } from './services/apiService';
import { Download, Printer, Moon, Sun, Menu, X, ArrowDown, Sparkles, Eye, Check, Edit2, ChevronRight, LayoutTemplate, LogIn, LogOut, Save, User as UserIcon, Loader2 } from 'lucide-react';

const Footer = () => (
    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-4">
                <div className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    <Sparkles className="w-6 h-6 text-blue-400" /> BD METRIX
                </div>
                <p className="text-slate-400 max-w-sm leading-relaxed">
                    The ultimate AI-powered resume builder helping thousands of professionals land their dream jobs with ATS-optimized templates.
                </p>
            </div>
            <div>
                <h3 className="font-bold mb-6 text-slate-200">Product</h3>
                <ul className="space-y-3 text-slate-400 text-sm">
                    <li><a href="#" className="hover:text-blue-400 transition">Templates</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition">Examples</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition">Pricing</a></li>
                </ul>
            </div>
            <div>
                <h3 className="font-bold mb-6 text-slate-200">Company</h3>
                <ul className="space-y-3 text-slate-400 text-sm">
                    <li><a href="#" className="hover:text-blue-400 transition">About Us</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition">Terms of Service</a></li>
                </ul>
            </div>
        </div>
        <div className="text-center text-slate-600 text-sm mt-12 pt-8 border-t border-slate-800">
            © {new Date().getFullYear()} BD METRIX. All rights reserved.
        </div>
    </footer>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-slate-700 transform transition-all scale-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Download PDF?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    Are you sure you want to download your resume?
                </p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5">Download</button>
                </div>
            </div>
        </div>
    );
};

// Visual Thumbnail Component
const TemplateThumbnail = ({ id, selected }: { id: string; selected: boolean }) => {
    const borderColor = selected ? "border-white/30" : "border-gray-200 dark:border-slate-700";

    const renderContent = () => {
        switch (id) {
            case 'modern': // Left sidebar dark, right content
                return (
                    <>
                        <div className="w-[30%] bg-slate-800 h-full"></div>
                        <div className="flex-1 p-[2px] flex flex-col gap-[2px]">
                            <div className="h-1 w-full bg-gray-200 rounded-[1px]"></div>
                            <div className="h-[2px] w-2/3 bg-gray-100 rounded-[1px]"></div>
                            <div className="mt-[1px] space-y-[1px]">
                                <div className="h-[1px] w-full bg-gray-100"></div>
                                <div className="h-[1px] w-full bg-gray-100"></div>
                            </div>
                        </div>
                    </>
                );
            case 'split': // 40/60 split, left colored
                return (
                    <>
                        <div className="w-[40%] bg-teal-600 h-full"></div>
                        <div className="flex-1 p-[2px] flex flex-col gap-[2px]">
                            <div className="h-[3px] w-full bg-gray-200 mb-[1px]"></div>
                            <div className="h-[1px] w-full bg-gray-100"></div>
                            <div className="h-[1px] w-full bg-gray-100"></div>
                        </div>
                    </>
                );
            case 'executive': // Top header colored
                return (
                    <div className="flex flex-col w-full h-full">
                        <div className="h-[20%] bg-emerald-700 w-full mb-[1px]"></div>
                        <div className="flex-1 p-[2px] space-y-[2px]">
                            <div className="h-[2px] w-full bg-gray-200"></div>
                            <div className="h-[1px] w-full bg-gray-100"></div>
                            <div className="h-[1px] w-full bg-gray-100"></div>
                        </div>
                    </div>
                );
            case 'timeline': // Left line
                return (
                    <div className="flex w-full h-full p-[2px] gap-[2px]">
                        <div className="w-[1px] bg-orange-500 h-full ml-[2px]"></div>
                        <div className="flex-1 space-y-[2px]">
                            <div className="h-[2px] w-full bg-gray-200"></div>
                            <div className="h-[1px] w-full bg-gray-100"></div>
                            <div className="h-[1px] w-full bg-gray-100"></div>
                        </div>
                    </div>
                );
            case 'creative': // Bold header, grid
                return (
                    <div className="flex flex-col w-full h-full p-[2px]">
                        <div className="h-[3px] w-full border-b border-purple-500 mb-[2px]"></div>
                        <div className="flex gap-[2px] h-full">
                            <div className="w-[25%] bg-gray-50 h-full"></div>
                            <div className="flex-1 space-y-[1px]">
                                <div className="h-[1px] w-full bg-gray-100"></div>
                                <div className="h-[1px] w-full bg-gray-100"></div>
                            </div>
                        </div>
                    </div>
                );
            case 'minimal': // Header, two cols
                return (
                    <div className="flex flex-col w-full h-full p-[2px]">
                        <div className="h-[4px] w-full mb-[1px] border-b border-gray-100"></div>
                        <div className="flex gap-[2px] h-full">
                            <div className="w-[30%] space-y-[1px]">
                                <div className="h-[1px] w-full bg-gray-100"></div>
                            </div>
                            <div className="flex-1 space-y-[1px]">
                                <div className="h-[1px] w-full bg-gray-200"></div>
                                <div className="h-[1px] w-full bg-gray-100"></div>
                            </div>
                        </div>
                    </div>
                );
            case 'compact': // Grid
                return (
                    <div className="flex flex-col w-full h-full p-[2px]">
                        <div className="h-[3px] w-full bg-indigo-50 mb-[1px]"></div>
                        <div className="grid grid-cols-2 gap-[2px] h-full">
                            <div className="bg-gray-50 h-full rounded-[1px]"></div>
                            <div className="bg-gray-50 h-full rounded-[1px]"></div>
                        </div>
                    </div>
                );
            case 'tech': // Dark header
                return (
                    <div className="flex flex-col w-full h-full">
                        <div className="h-[15%] w-full bg-slate-900 mb-[2px]"></div>
                        <div className="px-[2px] space-y-[2px]">
                            <div className="h-[1px] w-full bg-gray-200"></div>
                            <div className="h-[1px] w-full bg-gray-100"></div>
                        </div>
                    </div>
                );
            case 'classic': // Serif style, centered
                return (
                    <div className="flex flex-col w-full h-full p-[2px] items-center">
                        <div className="h-[2px] w-[80%] bg-gray-400 mb-[2px]"></div>
                        <div className="w-full space-y-[2px]">
                            <div className="h-[1px] w-full bg-gray-200"></div>
                            <div className="h-[1px] w-full bg-gray-100"></div>
                        </div>
                    </div>
                );
            case 'plain': // ATS Plain
                return (
                    <div className="flex flex-col w-full h-full p-[3px] bg-white">
                        <div className="space-y-[3px]">
                            <div className="h-[1px] w-[40%] bg-black"></div>
                            <div className="h-[1px] w-full bg-gray-300"></div>
                            <div className="h-[1px] w-full bg-gray-300"></div>
                            <div className="h-[1px] w-full bg-gray-300"></div>
                        </div>
                    </div>
                );
            default: // Plain/Standard
                return (
                    <div className="flex flex-col w-full h-full p-[3px]">
                        <div className="h-[2px] w-[50%] bg-gray-300 mb-[2px]"></div>
                        <div className="space-y-[2px]">
                            <div className="h-[1px] w-full bg-gray-100"></div>
                            <div className="h-[1px] w-full bg-gray-100"></div>
                            <div className="h-[1px] w-full bg-gray-100"></div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`w-9 h-[52px] min-w-[36px] bg-white rounded-sm border shadow-sm overflow-hidden flex ${borderColor} ${selected ? 'ring-2 ring-white/20' : ''}`}>
            {renderContent()}
        </div>
    )
};

// Mobile Preview Modal
const MobilePreviewModal = ({
    isOpen,
    onClose,
    templateId,
    data,
    onDownload
}: {
    isOpen: boolean,
    onClose: () => void,
    templateId: string,
    data: ResumeData,
    onDownload: () => void
}) => {
    const [scale, setScale] = useState(0.4);

    useLayoutEffect(() => {
        const calculateScale = () => {
            const width = window.innerWidth;
            const availableWidth = width - 32; // padding
            // Base A4 width approx 794px
            const newScale = Math.min(availableWidth / 794, 0.8);
            setScale(newScale);
        };

        if (isOpen) {
            calculateScale();
            window.addEventListener('resize', calculateScale);
        }
        return () => window.removeEventListener('resize', calculateScale);
    }, [isOpen]);

    if (!isOpen) return null;

    // Calculate dimensions to correct flow height
    const scaledWidth = 794 * scale;
    const scaledHeight = 1123 * scale; // Approx A4 height in px

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col animate-in slide-in-from-bottom-10 duration-200 lg:hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900 shadow-md z-10">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-400" /> Resume Preview
                </h3>
                <button onClick={onClose} className="p-2 bg-gray-800 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-950 p-4 flex justify-center">
                <div
                    style={{
                        width: scaledWidth,
                        height: scaledHeight,
                        marginBottom: '80px', // Space for sticky footer
                        position: 'relative'
                    }}
                >
                    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                        <TemplateRenderer templateId={templateId} data={data} />
                    </div>
                </div>
            </div>

            {/* Sticky Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900 flex gap-3 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] safe-area-bottom">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition border border-gray-700 flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => { onDownload(); }} className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" /> Download PDF
                </button>
            </div>
        </div>
    );
};

const AdBanner = ({ position }: { position: string }) => (
    <div className="w-full bg-gray-50 dark:bg-slate-900/50 py-6 flex justify-center border-y border-gray-200 dark:border-slate-800">
        <div className="w-[728px] max-w-[90vw] h-[90px] bg-white dark:bg-slate-800 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 text-xs border border-dashed border-gray-300 dark:border-slate-700 rounded-lg shadow-sm">
            <span className="font-semibold uppercase tracking-wider mb-1">Sponsored</span>
            <span>Ad Space ({position})</span>
        </div>
    </div>
);

const App: React.FC = () => {
    const [data, setData] = useState<ResumeData>(INITIAL_DATA);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('modern');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

    // Auth State
    const [user, setUser] = useState<User | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Auto-Save Debounce Ref
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Lifted expanded state to App to allow controlling it from Preview
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        personal: true,
        summary: true,
        experience: true,
        projects: true,
        education: false,
        skills: false,
        languages: false,
        activities: false,
        references: false
    });

    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        { title: "Build Your Dream Career", desc: "Create professional, ATS-friendly resumes in minutes.", color: "from-blue-600 to-indigo-700" },
        { title: "AI-Powered Writing", desc: "Let our advanced AI write compelling summaries for you.", color: "from-purple-600 to-fuchsia-700" },
        { title: "Beautiful Templates", desc: "Choose from 10+ designer-crafted layouts.", color: "from-emerald-500 to-teal-700" }
    ];

    const builderRef = useRef<HTMLDivElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [previewScale, setPreviewScale] = useState(0.8);

    // --- Auth & Data Loading Effects ---

    useEffect(() => {
        // Check for existing session
        const checkSession = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    // Fetch profile/data from backend
                    const { user, resume_data, template_id } = await apiService.getUserProfile();
                    setUser(user);
                    if (resume_data) setData(resume_data);
                    if (template_id) setSelectedTemplateId(template_id);
                } catch (error) {
                    console.error("Session expired or invalid", error);
                    localStorage.removeItem('auth_token');
                }
            }
        };
        checkSession();
    }, []);

    const handleLoginSuccess = useCallback(async (user: User, token: string) => {
        localStorage.setItem('auth_token', token);
        setUser(user);
        // Save current resume to server immediately on login
        try {
            await apiService.saveResume(data, selectedTemplateId);
        } catch (e) {
            console.error('Failed to save resume on login', e);
        }

        // Optionally fetch their data again to be sure
        apiService.getUserProfile().then(({ resume_data, template_id }) => {
            if (resume_data) setData(resume_data);
            if (template_id) setSelectedTemplateId(template_id);
        });
    }, [data, selectedTemplateId]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
        window.location.reload(); // Reset state clean
    };

    // --- Auto-Save Logic ---
    const handleDataChange = (newData: ResumeData) => {
        setData(newData);

        // If user is logged in, debounce save to backend
        if (user) {
            setIsSaving(true);
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

            saveTimeoutRef.current = setTimeout(async () => {
                await apiService.saveResume(newData, selectedTemplateId);
                setIsSaving(false);
                setLastSavedAt(new Date());
            }, 2000); // Save 2 seconds after last keystroke
        }
    };

    // Also save when template changes
    useEffect(() => {
        if (user) {
            (async () => {
                setIsSaving(true);
                await apiService.saveResume(data, selectedTemplateId);
                setIsSaving(false);
                setLastSavedAt(new Date());
            })();
        }
    }, [selectedTemplateId, user]);

    const forceSave = async () => {
        if (!user) {
            // No-op if not logged in; suggest opening auth modal instead
            setIsAuthModalOpen(true);
            return;
        }
        setIsSaving(true);
        try {
            await apiService.saveResume(data, selectedTemplateId);
            setLastSavedAt(new Date());
        } catch (e) {
            console.error('Save failed', e);
        } finally {
            setIsSaving(false);
        }
    };

    const formatTimeAgo = (d: Date | null) => {
        if (!d) return '';
        const diff = Math.floor((Date.now() - d.getTime()) / 1000);
        if (diff < 5) return 'just now';
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when screen resizes to desktop to avoid UI bugs
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useLayoutEffect(() => {
        const handleResize = () => {
            if (previewContainerRef.current) {
                const { clientWidth, clientHeight } = previewContainerRef.current;
                const padding = 32; // Reduced padding for better fit
                const a4Width = 794;
                const a4Height = 1123;

                const availableWidth = clientWidth - padding;
                const availableHeight = clientHeight - padding;

                const scaleW = availableWidth / a4Width;
                const scaleH = availableHeight / a4Height;

                const scale = Math.min(scaleW, scaleH, 1.0);
                setPreviewScale(scale);
            }
        };

        const observer = new ResizeObserver(handleResize);
        if (previewContainerRef.current) {
            observer.observe(previewContainerRef.current);
        }

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        };
    }, []);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const scrollToBuilder = () => {
        builderRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSectionFocus = (section: string) => {
        // Expand the section first
        setExpandedSections(prev => ({ ...prev, [section]: true }));

        // Scroll to it after a micro-delay to ensure rendering
        setTimeout(() => {
            const element = document.getElementById(`editor-section-${section}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);
    };

    const handleEditorExpand = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleDownloadPDF = async () => {
        setShowDownloadModal(false);

        // Check Auth before download? Optional. 
        // The requirement says "users can login... to store". 
        // We can allow download without login, but good UX is to prompt login to save first.
        if (!user) {
            // Maybe open auth modal here? For now, let's just let them download but suggest login.
            // Or simply proceed.
        }

        if (user) {
            // Force save immediately before download
            await apiService.saveResume(data, selectedTemplateId);
        }

        // Always use the dedicated PDF render container (hidden off-screen)
        const element = document.getElementById('resume-pdf-render-container');

        if (!element) {
            console.error("Resume element not found");
            return;
        }

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '210mm';
        // allow height to expand for multi-page output
        container.style.height = 'auto';
        container.style.zIndex = '-9999';
        container.style.backgroundColor = 'white';
        container.style.overflow = 'visible';

        const clone = element.cloneNode(true) as HTMLElement;

        clone.style.margin = '0';
        clone.classList.remove('mx-auto');
        clone.style.transform = 'none';
        clone.style.width = '100%';
        // let content determine height so html2pdf can paginate
        clone.style.height = 'auto';
        clone.style.boxShadow = 'none';
        clone.style.printColorAdjust = 'exact';
        (clone.style as any).webkitPrintColorAdjust = 'exact';

        // inject print CSS to help with paging and avoid breaking inside items
        const styleTag = document.createElement('style');
        styleTag.innerHTML = `
            @page { size: A4; margin: 10mm; }
            .avoid-break { page-break-inside: avoid; break-inside: avoid; }
            .page-break { page-break-after: always; }
            /* ensure images and tables scale correctly */
            #resume-pdf-render-container img { max-width: 100%; height: auto; }
        `;
        container.appendChild(styleTag);

        container.appendChild(clone);
        document.body.appendChild(container);

        await new Promise(r => setTimeout(r, 150));

        const widthInPx = 794;

        // @ts-ignore
        const opt = {
            margin: 0,
            filename: `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                scrollY: 0,
                scrollX: 0,
                windowWidth: widthInPx,
                width: widthInPx,
                x: 0,
                y: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            // @ts-ignore
            // allow html2pdf to use CSS page breaks
            await html2pdf().from(clone).set({ ...opt, pagebreak: { mode: ['css', 'legacy'] } }).save();
        } catch (error) {
            console.error("PDF generation failed:", error);
        } finally {
            document.body.removeChild(container);
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 bg-gray-50 dark:bg-slate-950">

            {/* Mobile Drawer (High Z-Index, Outside main flow) */}
            <div
                className={`fixed inset-0 z-[200] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}
            >
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Drawer Content */}
                <div
                    className={`
                absolute top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 flex flex-col border-r border-gray-200 dark:border-slate-800
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
                >
                    {/* Mobile Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4 text-blue-500" />
                            Templates
                        </h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Info Mobile */}
                    {user ? (
                        <div className="p-4 bg-blue-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {user.name ? user.name[0] : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                            </div>
                            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500"><LogOut className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                            <button onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">
                                Login / Signup
                            </button>
                        </div>
                    )}

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {TEMPLATES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { setSelectedTemplateId(t.id); setIsMobileMenuOpen(false); }}
                                className={`
                            w-full text-left px-3 py-3 rounded-lg font-medium transition-all flex items-center justify-between group
                            ${selectedTemplateId === t.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                    }
                        `}
                            >
                                <div className="flex items-center gap-3">
                                    <TemplateThumbnail id={t.id} selected={selectedTemplateId === t.id} />
                                    <span className="truncate">{t.name}</span>
                                </div>
                                {selectedTemplateId === t.id && <Check className="w-4 h-4" />}
                                {selectedTemplateId !== t.id && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navbar */}
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
                        ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-slate-800 py-3'
                        : 'bg-transparent py-4'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 text-2xl font-bold cursor-pointer group"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isScrolled ? 'from-slate-800 to-slate-600 dark:from-white dark:to-slate-300' : 'from-white to-blue-100'}`}>BD METRIX</span>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Mobile controls */}
                        <div className="flex lg:hidden items-center gap-2">
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                            <button
                                onClick={() => setShowDownloadModal(true)}
                                className={`p-2 rounded-full transition ${isScrolled ? 'text-green-600 bg-green-50' : 'text-white bg-white/20'}`}
                                title="Download PDF"
                            >
                                <Download className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => setShowMobilePreview(true)}
                                className={`p-2 rounded-full transition ${isScrolled ? 'text-blue-600 bg-blue-50' : 'text-white bg-white/20'}`}
                                title="Preview Resume"
                            >
                                <Eye className="w-5 h-5" />
                            </button>

                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-full transition ${isScrolled ? 'text-slate-600' : 'text-white'}`}
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => { setIsMobileMenuOpen(true); }}
                                className={`p-2 rounded-lg transition ${isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Desktop controls */}
                        <div className="hidden lg:flex items-center gap-3">
                            {/* Auth Button Desktop */}
                            {user ? (
                                <div className={`flex items-center gap-3 mr-2 px-3 py-1.5 rounded-full ${isScrolled ? 'bg-gray-100 dark:bg-slate-800' : 'bg-white/10 text-white'}`}>
                                    <div className="flex flex-col items-end leading-none">
                                        <span className="text-xs font-bold">{user.name || 'User'}</span>
                                        <span className="text-[10px] opacity-70">Saved</span>
                                    </div>
                                    <button onClick={handleLogout} className="hover:text-red-400"><LogOut className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className={`text-sm font-bold flex items-center gap-2 mr-2 ${isScrolled ? 'text-slate-600 hover:text-blue-600' : 'text-white/90 hover:text-white'}`}
                                >
                                    <LogIn className="w-4 h-4" /> Login
                                </button>
                            )}

                            <div className={`h-6 w-px ${isScrolled ? 'bg-slate-300 dark:bg-slate-700' : 'bg-white/20'}`}></div>

                            {/* <button 
                    onClick={() => window.print()} 
                    className={`p-2 rounded-full transition ${isScrolled ? 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white/80 hover:bg-white/10'}`} 
                    title="Print"
                  >
                      <Printer className="w-5 h-5" />
                  </button> */}

                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-full transition ${isScrolled ? 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white/80 hover:bg-white/10'}`}
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={() => { scrollToBuilder(); setShowDownloadModal(true); }}
                                className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-700 transition shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="relative overflow-hidden mb-8">
                <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} opacity-100 transition-all duration-1000`}></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12 flex flex-col items-center text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">
                        {slides[currentSlide].title}
                    </h1>
                    <p className="text-lg opacity-90 max-w-2xl font-light mb-8">
                        {slides[currentSlide].desc}
                    </p>
                    <button
                        onClick={scrollToBuilder}
                        className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold text-base hover:bg-blue-50 transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        Start Building <ArrowDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <AdBanner position="Top" />

            {/* Builder Section - Grid Layout */}
            <div ref={builderRef} className="flex-1 max-w-[1920px] w-full mx-auto p-4 md:p-8 relative z-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Combined Templates + Preview Panel */}
                    <div className="lg:col-span-5 sticky top-24 hidden lg:flex flex-col gap-4">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm p-3">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2"><LayoutTemplate className="w-4 h-4 text-blue-500" /> Templates</h3>
                                <div className="text-xs text-gray-500">Preview & select</div>
                            </div>
                            <div className="flex gap-3 overflow-x-auto py-2 px-1">
                                {TEMPLATES.map(t => (
                                    <button key={t.id} onClick={() => setSelectedTemplateId(t.id)} className={`flex-none w-40 p-2 rounded-lg border ${selectedTemplateId === t.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-slate-700'} hover:shadow`}>
                                        <div className="h-28 mb-2 overflow-hidden rounded-sm bg-white dark:bg-slate-800 flex items-center justify-center">
                                            <TemplateThumbnail id={t.id} selected={selectedTemplateId === t.id} />
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{t.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-200 dark:bg-slate-800 rounded-xl p-6 flex-1 flex flex-col items-center border border-gray-300 dark:border-slate-700 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-8 bg-gray-300 dark:bg-slate-700 flex items-center px-4 gap-2 z-10 shadow-sm">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 ml-2">preview.pdf</span>
                            </div>

                            <div className="w-full h-full flex justify-center items-center overflow-hidden" ref={previewContainerRef}>
                                <div
                                    style={{
                                        transform: `scale(${previewScale})`,
                                        transformOrigin: 'center center',
                                        transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        height: 'fit-content'
                                    }}
                                    className="shadow-2xl ring-1 ring-black/10"
                                >
                                    <TemplateRenderer
                                        key={selectedTemplateId}
                                        templateId={selectedTemplateId}
                                        data={data}
                                        id="resume-preview-container"
                                        onSectionClick={handleSectionFocus}
                                    />
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-xs z-20">
                                <button
                                    onClick={() => setShowDownloadModal(true)}
                                    className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-full font-bold hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Editor (Scrollable) - Adjusted to col-span-7 */}
                    <div className="lg:col-span-7 w-full">
                        <div className="mb-4 flex items-center justify-end gap-3">
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                        <span>Saving...</span>
                                    </>
                                ) : lastSavedAt ? (
                                    <>
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        <span>Saved {formatTimeAgo(lastSavedAt)}</span>
                                    </>
                                ) : (
                                    <span className="text-gray-400">Not saved</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={forceSave} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:shadow">
                                    <Save className="w-4 h-4 inline-block mr-2" /> Save Now
                                </button>
                                <button onClick={() => { previewContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:shadow">
                                    <Eye className="w-4 h-4 inline-block mr-2" /> Preview
                                </button>
                                <button onClick={() => { setShowDownloadModal(true); }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">
                                    <Download className="w-4 h-4 inline-block mr-2" /> Export
                                </button>
                            </div>
                        </div>

                        <Editor
                            data={data}
                            onChange={handleDataChange}
                            onSectionFocus={handleSectionFocus}
                            expanded={expandedSections}
                            onExpand={handleEditorExpand}
                        />
                    </div>

                </div>
            </div>

            {/* Off-screen Render Container for Reliable PDF Generation on Mobile */}
            <div
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: 0,
                    width: '210mm',
                    minHeight: '297mm'
                }}
            >
                <TemplateRenderer
                    key={`${selectedTemplateId}-pdf`}
                    templateId={selectedTemplateId}
                    data={data}
                    id="resume-pdf-render-container"
                />
            </div>

            <AdBanner position="Bottom" />
            <Footer />
            <ConfirmationModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} onConfirm={handleDownloadPDF} />
            <MobilePreviewModal
                isOpen={showMobilePreview}
                onClose={() => setShowMobilePreview(false)}
                templateId={selectedTemplateId}
                data={data}
                onDownload={handleDownloadPDF}
            />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </div>
    );
};

export default App;
