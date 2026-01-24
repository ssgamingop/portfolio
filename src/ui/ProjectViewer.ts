
import { WindowManager } from '../windowManager';
import { escapeHTML } from '../utils';
import command from '../../config.json';

export class ProjectViewer {
    private windowManager: WindowManager;

    constructor(windowManager: WindowManager) {
        this.windowManager = windowManager;
    }

    public openProjectWindow(title: string, link: string, videoUrl?: string, screenshots?: string[]) {
        // Security Check: Ensure link is HTTPS
        if (link && !link.startsWith("https://")) {
            console.error("Blocked insecure or invalid link:", link);
            return;
        }

        if (window.innerWidth <= 600) {
            window.open(link, '_blank');
            return;
        }

        // Collect all media items: Video first, then screenshots
        const mediaItems: { type: 'video' | 'image', src: string }[] = [];

        if (videoUrl) {
            mediaItems.push({ type: 'video', src: videoUrl });
        }

        if (screenshots && Array.isArray(screenshots)) {
            screenshots.forEach(src => {
                const isVideo = src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm');
                mediaItems.push({
                    type: isVideo ? 'video' : 'image',
                    src
                });
            });
        }

        // If no visual media, fallback to iframe
        if (mediaItems.length === 0) {
            const iframeValue = document.createElement("iframe");
            iframeValue.src = link;
            iframeValue.style.width = "100%";
            iframeValue.style.height = "100%";
            iframeValue.style.border = "none";
            this.windowManager.open(`proj-${title}`, title, iframeValue);
            return;
        }

        // Create Gallery Container
        const galleryContainer = document.createElement("div");
        galleryContainer.className = "gallery-container";

        // Create Slides
        mediaItems.forEach((item, index) => {
            let element: HTMLElement;
            if (item.type === 'video') {
                const video = document.createElement("video");
                video.src = item.src;
                video.className = "gallery-slide";
                video.controls = true;
                // video.autoplay = true; // Auto-play only active slide? Complex. Let user play.
                video.loop = true;
                element = video;
            } else {
                const img = document.createElement("img");
                img.src = item.src;
                img.className = "gallery-slide";
                element = img;
            }

            if (index === 0) element.classList.add('active');
            galleryContainer.appendChild(element);
        });

        // Navigation Logic
        let currentIndex = 0;

        const showSlide = (index: number) => {
            const slides = galleryContainer.querySelectorAll('.gallery-slide');
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                    if (slide instanceof HTMLVideoElement) {
                        // Optional: slide.play(); 
                    }
                } else {
                    slide.classList.remove('active');
                    if (slide instanceof HTMLVideoElement) {
                        slide.pause();
                    }
                }
            });
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % mediaItems.length;
            showSlide(currentIndex);
        };

        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
            showSlide(currentIndex);
        };

        // Buttons (Only if > 1 item)
        if (mediaItems.length > 1) {
            const prevBtn = document.createElement("button");
            prevBtn.className = "gallery-nav gallery-prev";
            prevBtn.innerHTML = "&#10094;"; // <
            prevBtn.onclick = (e) => { e.stopPropagation(); prevSlide(); };

            const nextBtn = document.createElement("button");
            nextBtn.className = "gallery-nav gallery-next";
            nextBtn.innerHTML = "&#10095;"; // >
            nextBtn.onclick = (e) => { e.stopPropagation(); nextSlide(); };

            galleryContainer.appendChild(prevBtn);
            galleryContainer.appendChild(nextBtn);
        }

        this.windowManager.open(`proj-${title}`, title, galleryContainer);
    }

    public openProjectExplorer() {
        const container = document.createElement('div');
        container.className = 'explorer-grid';

        command.projects.forEach((proj: any[]) => {
            // Destructure based on new config structure: 
            // [Title, Desc, Link, Thumb, Video, Screenshots[]]
            const [rawTitle, _desc, rawLink, imgPath, videoUrl, screenshots] = proj;

            const title = escapeHTML(rawTitle);
            const link = escapeHTML(rawLink);
            const video = videoUrl ? escapeHTML(videoUrl) : undefined;
            // Screenshots are array, no need to escape array object itself, but items inside logic handled in openProjectWindow

            const item = document.createElement('div');
            item.className = 'explorer-item';

            // Pass screenshots array
            item.onclick = () => this.openProjectWindow(title, link, video, screenshots);

            let img: HTMLElement;
            // If a custom image is provided in config (and not null), use it as an IMG tag
            // Otherwise use a DIV which will get the default folder CSS mask
            if (imgPath) {
                const imageElement = document.createElement('img');
                imageElement.src = imgPath;
                imageElement.className = 'explorer-icon';
                // If custom image fails, fallback to the mask style? 
                // Actually, if it fails, let's replace it with a div
                imageElement.onerror = () => {
                    const replacement = document.createElement('div');
                    replacement.className = 'explorer-icon';
                    imageElement.replaceWith(replacement);
                };
                // Reset styles for IMG to ensure it shows normally (override mask if needed)
                imageElement.style.background = 'transparent';
                (imageElement.style as any).webkitMaskImage = 'none';
                imageElement.style.maskImage = 'none';

                img = imageElement;
            } else {
                const divElement = document.createElement('div');
                divElement.className = 'explorer-icon';
                img = divElement;
            }

            const label = document.createElement('span');
            label.className = 'explorer-label';
            label.innerText = rawTitle;

            item.appendChild(img);
            item.appendChild(label);
            container.appendChild(item);
        });

        this.windowManager.open('project-explorer', 'Project Explorer', container);
    }
}
