
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { INITIAL_DATA, TEMPLATES, ResumeData, User } from './types';
import TemplateRenderer from './components/TemplateRenderer';
import Editor from './components/Editor';
import AuthModal from './components/AuthModal';
import { apiService } from './services/apiService';
import { Download, Moon, Sun, Menu, X, Sparkles, Eye, Check, Edit2, ChevronRight, ChevronLeft, LayoutTemplate, LogIn, LogOut, Save, Loader2 } from 'lucide-react';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'ATS Friendly Resume Builder';

const Footer = () => (
    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-4">
                <div className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    <Sparkles className="w-6 h-6 text-blue-400" /> <span className="text-slate-400">{APP_NAME}</span>
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
    onDownload,
    resumeHeight
}: {
    isOpen: boolean,
    onClose: () => void,
    templateId: string,
    data: ResumeData,
    onDownload: () => void,
    resumeHeight: number
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
    const scaledHeight = resumeHeight * scale; // Dynamic A4 height in px

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

const AdBanner = ({ position }: { position: string }) => {
    const adClient = import.meta.env.VITE_ADSENSE_CLIENT;
    const adSlot = position === 'Top' 
        ? import.meta.env.VITE_ADSENSE_TOP_SLOT 
        : import.meta.env.VITE_ADSENSE_BOTTOM_SLOT;

    useEffect(() => {
        if (adClient && adSlot) {
            try {
                // Initialize the loaded AdSense ad unit
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.warn('AdSense initialisation skipped or blocked by blocker:', err);
            }
        }
    }, [adClient, adSlot]);

    return (
        <div className="w-full bg-slate-50/50 dark:bg-slate-900/30 py-3 sm:py-6 flex justify-center border-b border-slate-200/50 dark:border-slate-800/40 mt-20 sm:mt-24 backdrop-blur-sm relative z-10 print:hidden">
            {adClient && adSlot ? (
                <div className="w-[728px] max-w-[92vw] overflow-hidden flex justify-center">
                    <ins
                        className="adsbygoogle"
                        style={{ display: 'block', width: '100%', minWidth: '250px', height: '90px' }}
                        data-ad-client={adClient}
                        data-ad-slot={adSlot}
                        data-ad-format="horizontal"
                        data-full-width-responsive="true"
                    ></ins>
                </div>
            ) : (
                <div className="w-[728px] max-w-[92vw] h-[55px] sm:h-[90px] bg-white/60 dark:bg-slate-900/40 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-[10px] sm:text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.01)] backdrop-blur-md">
                    <span className="font-bold uppercase tracking-wider mb-0.5 sm:mb-1 text-[8px] sm:text-[10px] text-indigo-500 dark:text-indigo-400">Sponsored</span>
                    <span className="font-semibold text-slate-500 dark:text-slate-400 text-center px-4">Ad Space ({position}) — Not Configured</span>
                    <span className="text-[9px] opacity-75 text-slate-400 mt-0.5">Add VITE_ADSENSE_CLIENT and VITE_ADSENSE_{position.toUpperCase()}_SLOT to .env to go live</span>
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
    const [data, setData] = useState<ResumeData>(INITIAL_DATA);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('modern');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [resumeHeight, setResumeHeight] = useState(1123);

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

    const builderRef = useRef<HTMLDivElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const templateContainerRef = useRef<HTMLDivElement>(null);
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
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
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
                const { clientWidth } = previewContainerRef.current;
                const padding = 32; // Standard padding for borders
                const a4Width = 794;

                const availableWidth = clientWidth - padding;
                const scale = Math.min(availableWidth / a4Width, 1.0);
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
        container.style.width = '794px'; // Strict A4 width in pixels (96 DPI)
        // allow height to expand for multi-page output
        container.style.height = 'auto';
        container.style.zIndex = '-9999';
        container.style.backgroundColor = 'white';
        container.style.overflow = 'visible';

        const clone = element.cloneNode(true) as HTMLElement;

        clone.style.margin = '0';
        clone.classList.remove('mx-auto');
        clone.style.transform = 'none';
        clone.style.width = '794px'; // Strict A4 width in pixels
        clone.style.minWidth = '794px';
        clone.style.maxWidth = '794px';
        clone.style.position = 'relative'; // Crucial root offsetParent for offsetTop calculations
        // let content determine height so html2canvas can paginate
        clone.style.height = 'auto';
        clone.style.boxShadow = 'none';
        clone.style.printColorAdjust = 'exact';
        (clone.style as any).webkitPrintColorAdjust = 'exact';

        // inject print CSS to help with paging and avoid breaking inside items
        const styleTag = document.createElement('style');
        styleTag.innerHTML = `
            @page { size: A4; margin: 0; }
            .avoid-break { page-break-inside: avoid; break-inside: avoid; }
            .page-break { page-break-after: always; }
            /* ensure images and tables scale correctly */
            #resume-pdf-render-container img { max-width: 100%; height: auto; }
        `;
        container.appendChild(styleTag);

        container.appendChild(clone);
        document.body.appendChild(container);

        await new Promise(r => setTimeout(r, 150));

        const pageHeightInPx = 1123; // Exact A4 height at 96 DPI

        // 1. Identify and mark individual items in multi-item sections as break-inside-avoid
        const sectionWrappers = clone.querySelectorAll('[data-section]');
        sectionWrappers.forEach((sectionContainer) => {
            const section = sectionContainer.getAttribute('data-section');
            const isMultiItemSection = ['experience', 'projects', 'education', 'references'].includes(section || '');

            if (isMultiItemSection) {
                const innerContainer = sectionContainer.firstElementChild;
                if (innerContainer) {
                    const children = Array.from(innerContainer.children);
                    if (children.length > 1) {
                        // Create a wrapper for heading (children[0]) and the first item (children[1])
                        // to prevent the heading from being orphaned at the bottom of the page
                        const firstGroupWrapper = document.createElement('div');
                        firstGroupWrapper.className = 'break-inside-avoid';
                        
                        // Insert the wrapper right before the heading in the DOM
                        innerContainer.insertBefore(firstGroupWrapper, children[0]);
                        
                        // Move both heading and the first item into the wrapper
                        firstGroupWrapper.appendChild(children[0]);
                        firstGroupWrapper.appendChild(children[1]);

                        // Mark any subsequent items (starting from index 2 in original list) with break-inside-avoid
                        children.slice(2).forEach((item) => {
                            item.classList.add('break-inside-avoid');
                        });
                    }
                }
            }
        });

        // Helper to calculate element top position relative to clone (independent of viewport scroll/zoom)
        const getElementTop = (el: HTMLElement) => {
            let top = 0;
            let current: HTMLElement | null = el;
            while (current && current !== clone) {
                top += current.offsetTop;
                current = current.offsetParent as HTMLElement | null;
            }
            return top;
        };

        // 2. Prevent sections and individual items from being cut in half across pages
        const elementsToAvoid = clone.querySelectorAll('.break-inside-avoid, .avoid-break');
        elementsToAvoid.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const elementTop = getElementTop(htmlEl);
            const elementHeight = htmlEl.offsetHeight;
            const elementBottom = elementTop + elementHeight;

            const pageOfTop = Math.floor(elementTop / pageHeightInPx);
            const pageOfBottom = Math.floor(elementBottom / pageHeightInPx);

            // Top gap for next pages (pages > 0) in pixels (e.g., 40px, approx 10mm)
            const topGap = 40;

            // If the element crosses a page boundary
            if (pageOfTop !== pageOfBottom) {
                const nextPageTop = (pageOfTop + 1) * pageHeightInPx;
                // Push it to start exactly topGap pixels below the top of the next page
                const pushOffset = (nextPageTop + topGap) - elementTop;
                
                if (pushOffset > 0 && pushOffset < pageHeightInPx) {
                    const spacer = document.createElement('div');
                    spacer.style.height = `${pushOffset}px`;
                    spacer.style.width = '100%';
                    spacer.style.display = 'block';
                    spacer.style.clear = 'both';
                    htmlEl.parentNode?.insertBefore(spacer, htmlEl);
                }
            } else if (pageOfTop > 0) {
                // Entirely on a subsequent page, but starts within the forbidden top gap area
                const relativeTop = elementTop % pageHeightInPx;
                if (relativeTop < topGap) {
                    const pushOffset = topGap - relativeTop;
                    if (pushOffset > 0 && pushOffset < topGap) {
                        const spacer = document.createElement('div');
                        spacer.style.height = `${pushOffset}px`;
                        spacer.style.width = '100%';
                        spacer.style.display = 'block';
                        spacer.style.clear = 'both';
                        htmlEl.parentNode?.insertBefore(spacer, htmlEl);
                    }
                }
            }
        });

        // 3. Now calculate exact page count and height in pixels after shifting
        const naturalHeight = clone.offsetHeight;
        const numPages = Math.max(1, Math.ceil(naturalHeight / pageHeightInPx));
        const targetHeight = numPages * pageHeightInPx;

        // Set the clone's height to the calculated multiple of page height
        clone.style.height = `${targetHeight}px`;
        clone.style.minHeight = `${targetHeight}px`;

        // --- Extreme Color Sanitization Pass for html2canvas ---

        // 1. Canvas-based RGB Resolver
        const canvasResolver = document.createElement('canvas');
        canvasResolver.width = 1;
        canvasResolver.height = 1;
        const ctx = canvasResolver.getContext('2d', { willReadFrequently: true });
        
        const forceToRgb = (color: string) => {
            if (!color || color === 'transparent' || color === 'none') return color;
            if (!ctx) return color;
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 1, 1);
            const data = ctx.getImageData(0, 0, 1, 1).data;
            if (data[3] === 0 && !color.includes('transparent') && !color.includes('rgba(0, 0, 0, 0)')) {
                return color; // Fallback if browser canvas failed to parse
            }
            return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
        };

        // 2. Recursive Regex Sanitizer for complex strings (like gradients or shadows)
        const sanitizeColorStrings = (str: string) => {
            if (!str) return str;
            // Matches any oklch(...), oklab(...), lch(...), color(...) with balanced parens
            const modernColorRegex = /(?:oklch|oklab|lch|color)\((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*\)/g;
            return str.replace(modernColorRegex, (match) => forceToRgb(match));
        };

        const elements = [clone, ...Array.from(clone.querySelectorAll('*'))];
        elements.forEach((el) => {
            if (!(el instanceof HTMLElement || el instanceof SVGElement)) return;

            const style = window.getComputedStyle(el);
            const props = [
                'color', 'backgroundColor', 'borderColor',
                'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
                'outlineColor', 'fill', 'stroke', 'stopColor', 'textDecorationColor', 'columnRuleColor',
                'boxShadow', 'textShadow', 'backgroundImage'
            ];

            props.forEach(prop => {
                const value = (style as any)[prop];
                if (value && value !== 'none') {
                    if (prop === 'boxShadow' || prop === 'textShadow' || prop === 'backgroundImage') {
                        if (value.includes('oklch') || value.includes('oklab') || value.includes('lch') || value.includes('color(')) {
                            (el.style as any)[prop] = sanitizeColorStrings(value);
                        }
                    } else {
                        // For generic color properties, force it to rgba if it uses modern color spaces
                        if (value.includes('oklch') || value.includes('oklab') || value.includes('lch') || value.includes('color(')) {
                            (el.style as any)[prop] = forceToRgb(value);
                        }
                    }
                }
            });
        });

        // 3. Stylesheet Isolation is REMOVED to preserve Tailwind CSS grid/flex classes
        // Stylesheets are required for layout. Our inline color substitutions above
        // take priority to prevent html2canvas color-parsing crashes.

        const widthInPx = 794;

        try {
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: widthInPx,
                height: clone.offsetHeight,
                windowWidth: widthInPx,
                onclone: () => {
                    // Do not strip stylesheets here, we need them for flex/grid layouts
                }
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm for A4
            const totalImgHeightInPdf = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = totalImgHeightInPdf;
            let position = 0;

            // Page 1
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalImgHeightInPdf);
            heightLeft -= pdfPageHeight;

            // Extra pages
            while (heightLeft > 0) {
                position = heightLeft - totalImgHeightInPdf; // mathematical shift upwards
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalImgHeightInPdf);
                heightLeft -= pdfPageHeight;
            }

            pdf.save(`${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`);

        } catch (error) {
            console.error("PDF generation failed:", error);
        } finally {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-sans text-[var(--text-main)] transition-colors duration-300 bg-[var(--bg-app)] relative overflow-hidden">

            {/* Glowing Ambient Lighting & Mesh Grids */}
            <div className="ambient-glow-container select-none">
                <div className="ambient-glow ambient-glow-1"></div>
                <div className="ambient-glow ambient-glow-2"></div>
                <div className="ambient-glow ambient-glow-3"></div>
                <div className="bg-grid-pattern"></div>
            </div>

            {/* Mobile Drawer (High Z-Index, Outside main flow) */}
            <div
                className={`fixed inset-0 z-[200] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}
            >
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Drawer Content */}
                <div
                    className={`
                absolute top-0 left-0 h-full w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 flex flex-col border-r border-gray-200/50 dark:border-slate-800/50
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
                >
                    {/* Mobile Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4 text-indigo-500" />
                            Templates
                        </h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Info Mobile */}
                    {/* {user ? (
                        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                                {user.name ? user.name[0] : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                            </div>
                            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"><LogOut className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                            <button onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all">
                                Login / Signup
                            </button>
                        </div>
                    )} */}

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {TEMPLATES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { setSelectedTemplateId(t.id); setIsMobileMenuOpen(false); }}
                                className={`
                            w-full text-left px-3 py-3 rounded-xl font-medium transition-all flex items-center justify-between group
                            ${selectedTemplateId === t.id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/80'
                                    }
                        `}
                            >
                                <div className="flex items-center gap-3">
                                    <TemplateThumbnail id={t.id} selected={selectedTemplateId === t.id} />
                                    <span className="truncate text-sm font-semibold">{t.name}</span>
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
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
                    ? 'bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/40 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_35px_-10px_rgba(0,0,0,0.3)]'
                    : 'bg-transparent py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div
                        className="flex items-center gap-2.5 sm:gap-3 text-lg sm:text-2xl font-bold cursor-pointer group"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <div className="bg-indigo-600 dark:bg-indigo-500 text-white p-2 rounded-xl group-hover:rotate-6 group-hover:scale-105 transition-all shadow-[0_4px_15px_-3px_rgba(99,102,241,0.4)] group-hover:shadow-[0_6px_20px_-3px_rgba(99,102,241,0.6)] flex-shrink-0">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                        </div>
                        <span className={`font-extrabold tracking-tight ${isScrolled ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900 dark:text-white'}`}>
                            <span className="inline md:hidden text-base sm:text-lg">{APP_NAME}</span>
                            <span className="hidden md:inline">{APP_NAME}</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
                        {/* Mobile controls */}
                        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
                            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500 mr-0.5" />}
                            <button
                                onClick={() => setShowDownloadModal(true)}
                                className={`p-2 rounded-xl transition-all active:scale-90 bg-white/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/30 text-emerald-600 dark:text-emerald-450`}
                                title="Download PDF"
                            >
                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            <button
                                onClick={() => setShowMobilePreview(true)}
                                className={`p-2 rounded-xl transition-all active:scale-90 bg-white/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/30 text-indigo-600 dark:text-indigo-400`}
                                title="Preview Resume"
                            >
                                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-xl transition-all active:scale-90 hover:rotate-12 bg-white/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/30`}
                            >
                                {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />}
                            </button>
                            <button
                                onClick={() => { setIsMobileMenuOpen(true); }}
                                className={`p-2 rounded-xl transition-all active:scale-90 bg-white/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/30 text-slate-700 dark:text-white`}
                            >
                                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                        {/* Desktop controls */}
                        <div className="hidden lg:flex items-center gap-3">
                            {/* Auth Button Desktop */}
                            {/* {user ? (
                                <div className={`flex items-center gap-3 mr-1 px-4 py-1.5 rounded-full border transition-all ${isScrolled ? 'bg-indigo-50/10 dark:bg-indigo-950/10 border-indigo-200/40 dark:border-indigo-900/30 text-slate-800 dark:text-indigo-200' : 'bg-white/75 border-slate-200/60 dark:border-indigo-900/30 text-slate-800 dark:text-indigo-200'} hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm`}>
                                    <div className="flex flex-col items-end leading-none">
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name || 'User'}</span>
                                        <span className="text-[10px] opacity-85 mt-0.5 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Auto-Saved
                                        </span>
                                    </div>
                                    <button onClick={handleLogout} className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Logout"><LogOut className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className={`text-xs font-bold flex items-center gap-1.5 mr-1 px-4 py-2 rounded-full border transition-all hover:scale-102 ${isScrolled ? 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/20 text-slate-900 hover:text-indigo-600 dark:border-slate-800 dark:hover:border-indigo-500/20 dark:bg-slate-900 dark:hover:bg-slate-950 dark:text-slate-300 dark:hover:text-indigo-400' : 'border-slate-200/60 hover:border-indigo-350 bg-white/70 hover:bg-white text-slate-900 hover:text-indigo-600 dark:border-white/10 dark:hover:border-white/20 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200'}`}
                                >
                                    <LogIn className="w-3.5 h-3.5" /> Login / Sign Up
                                </button>
                            )} */}

                            <div className={`h-6 w-px ${isScrolled ? 'bg-slate-200 dark:bg-slate-800' : 'bg-slate-300/30 dark:bg-white/10'}`}></div>

                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-xl border border-transparent transition-all hover:scale-110 hover:rotate-12 ${isScrolled ? 'text-slate-500 hover:bg-slate-100 hover:border-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-100/50 dark:text-slate-300 dark:hover:bg-white/10'}`}
                            >
                                {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                            </button>

                            <button
                                onClick={() => { scrollToBuilder(); setShowDownloadModal(true); }}
                                className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:shadow-[0_8px_20px_-3px_rgba(16,185,129,0.3)] hover:scale-[1.03] active:scale-95 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 border border-emerald-400/25"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <AdBanner position="Top" />

            {/* Builder Section - Grid Layout */}
            <div ref={builderRef} className="flex-1 max-w-[1920px] w-full mx-auto p-4 md:p-8 relative z-0 mt-2 sm:mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Combined Templates + Preview Panel */}
                    <div className="lg:col-span-6 lg:sticky lg:top-24 hidden lg:flex flex-col gap-5">
                        <div className="glass-panel p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                                    <LayoutTemplate className="w-4 h-4 text-indigo-500" /> Templates
                                </h3>
                                <div className="text-xs text-slate-400 font-medium">Select a design</div>
                            </div>
                            <div className="relative group w-full">
                                <button 
                                    onClick={() => templateContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-0 focus:outline-none"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                
                                <div 
                                    ref={templateContainerRef} 
                                    className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide snap-x" 
                                >
                                    {TEMPLATES.map(t => (
                                        <button 
                                            key={t.id} 
                                            onClick={() => setSelectedTemplateId(t.id)} 
                                            className={`snap-center flex-none w-36 p-2 rounded-xl border transition-all duration-300 ${
                                                selectedTemplateId === t.id 
                                                    ? 'border-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.2)]' 
                                                    : 'border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 bg-white/20 dark:bg-slate-900/10'
                                            } hover:shadow-md hover:scale-[1.02]`}
                                        >
                                            <div className="h-24 mb-2 overflow-hidden rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                                <TemplateThumbnail id={t.id} selected={selectedTemplateId === t.id} />
                                            </div>
                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate text-center">{t.name}</div>
                                        </button>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={() => templateContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 focus:outline-none"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-100/90 dark:bg-slate-950/80 rounded-2xl p-6 flex-1 flex flex-col items-center border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden shadow-inner h-[680px] min-h-[580px]">
                            <div className="absolute top-0 left-0 w-full h-9 bg-slate-200/80 dark:bg-slate-900/60 backdrop-blur-md flex items-center px-4 gap-2 z-10 border-b border-slate-300/30 dark:border-slate-800/30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 ml-2">preview.pdf</span>
                            </div>

                            <div className="w-full h-full flex flex-col items-center overflow-y-auto overflow-x-hidden pt-12 pb-24 scrollbar-hide" ref={previewContainerRef}>
                                <div
                                    style={{
                                        width: 794 * previewScale,
                                        height: resumeHeight * previewScale,
                                        position: 'relative',
                                        flexShrink: 0
                                    }}
                                >
                                    <div
                                        style={{
                                            transform: `scale(${previewScale})`,
                                            transformOrigin: 'top left',
                                            transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                            width: '794px',
                                            height: `${resumeHeight}px`,
                                            position: 'absolute',
                                            top: 0,
                                            left: 0
                                        }}
                                        className="shadow-2xl ring-1 ring-black/10 dark:ring-white/5 rounded-sm overflow-hidden"
                                    >
                                        <TemplateRenderer
                                            key={selectedTemplateId}
                                            templateId={selectedTemplateId}
                                            data={data}
                                            id="resume-preview-container"
                                            onSectionClick={handleSectionFocus}
                                            onHeightChange={setResumeHeight}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-xs z-20 px-4">
                                <button
                                    onClick={() => setShowDownloadModal(true)}
                                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white py-3 rounded-full font-bold shadow-[0_8px_25px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_12px_30px_-5px_rgba(99,102,241,0.7)] hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2 border border-indigo-500/20"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Editor (Scrollable) */}
                    <div className="lg:col-span-6 w-full">
                        {/* <div className="mb-4 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 bg-white/60 dark:bg-slate-900/20 p-3.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/30 backdrop-blur-md shadow-sm">
                            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-1">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                        <span className="font-semibold">Saving design...</span>
                                    </>
                                ) : lastSavedAt ? (
                                    <>
                                        <Check className="w-4 h-4 text-emerald-500 font-bold" />
                                        <span className="font-medium text-xs text-slate-500 dark:text-slate-400">Autosaved {formatTimeAgo(lastSavedAt)}</span>
                                    </>
                                ) : (
                                    <span className="text-slate-400 font-medium text-xs">Unsaved workspace</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={forceSave} 
                                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50/40 dark:hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-sm hover:border-indigo-200/50 dark:hover:border-indigo-500/20 transition-all flex items-center shadow-sm"
                                >
                                    <Save className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Save Now
                                </button>
                                <button 
                                    onClick={() => { 
                                        if (window.innerWidth < 1024) {
                                            setShowMobilePreview(true);
                                        } else {
                                            previewContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
                                        }
                                    }} 
                                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50/40 dark:hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-sm hover:border-indigo-200/50 dark:hover:border-indigo-500/20 transition-all flex items-center shadow-sm"
                                >
                                    <Eye className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Preview
                                </button>
                                <button 
                                    onClick={() => { setShowDownloadModal(true); }} 
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center"
                                >
                                    <Download className="w-3.5 h-3.5 mr-1.5" /> Export
                                </button>
                            </div>
                        </div> */}

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

            {/* Off-screen Render Container for Reliable PDF Generation */}
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
                resumeHeight={resumeHeight}
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

