export class WindowManager {
    private windows = new Map<string, HTMLElement>();
    private zIndexCounter = 100;
    private container: HTMLElement;

    constructor() {
        let container = document.getElementById("window-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "window-container";
            document.body.appendChild(container);
        }
        this.container = container;
    }

    private isMobile(): boolean {
        return window.innerWidth <= 600;
    }

    public open(id: string, title: string, content: string | HTMLElement, width?: number, height?: number): void {
        if (this.isMobile()) {
            return;
        }

        if (this.windows.has(id)) {
            this.bringToFront(this.windows.get(id)!);
            return;
        }

        const win = this.createWindowDOM(id, title, content, width, height);
        this.container.appendChild(win);
        this.windows.set(id, win);
        this.bringToFront(win);
    }

    public close(id: string): void {
        const win = this.windows.get(id);
        if (!win) return;

        win.remove();
        this.windows.delete(id);
    }

    private bringToFront(win: HTMLElement): void {
        this.zIndexCounter++;
        win.style.zIndex = String(this.zIndexCounter);
    }

    private createWindowDOM(
        id: string,
        title: string,
        content: string | HTMLElement,
        width?: number,
        height?: number
    ): HTMLElement {
        const win = document.createElement("div");
        win.className = "desktop-window";
        win.id = `window-${id}`;

        if (width) win.style.width = `${width}px`;
        if (height) win.style.height = `${height}px`;

        win.style.left = `${100 + this.windows.size * 20}px`;
        win.style.top = `${50 + this.windows.size * 20}px`;

        // Title bar
        const titleBar = document.createElement("div");
        titleBar.className = "window-title-bar";

        const titleText = document.createElement("span");
        titleText.textContent = title;

        const controls = document.createElement("div");
        controls.className = "window-controls";

        const closeBtn = document.createElement("button");
        closeBtn.className = "win-btn close-btn";
        closeBtn.textContent = "X";
        closeBtn.addEventListener("click", () => this.close(id));

        controls.appendChild(closeBtn);
        titleBar.appendChild(titleText);
        titleBar.appendChild(controls);

        // Content
        const contentArea = document.createElement("div");
        contentArea.className = "window-content";

        if (typeof content === "string") {
            contentArea.innerHTML = content;
        } else {
            contentArea.appendChild(content);
        }

        // Resize Handle
        const resizeHandle = document.createElement("div");
        resizeHandle.className = "resize-handle";

        win.appendChild(titleBar);
        win.appendChild(contentArea);
        win.appendChild(resizeHandle);

        this.makeDraggable(win, titleBar);
        this.makeResizable(win, resizeHandle);

        win.addEventListener("pointerdown", () => this.bringToFront(win));

        return win;
    }

    private makeDraggable(win: HTMLElement, handle: HTMLElement): void {
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        let animationFrameId: number | null = null;

        const updatePosition = () => {
            if (!isDragging) return;

            const dx = currentX - startX;
            const dy = currentY - startY;

            const maxX = window.innerWidth - win.offsetWidth;
            const maxY = window.innerHeight - win.offsetHeight;

            win.style.left = Math.max(0, Math.min(maxX, startLeft + dx)) + "px";
            win.style.top = Math.max(0, Math.min(maxY, startTop + dy)) + "px";

            animationFrameId = requestAnimationFrame(updatePosition);
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isDragging) return;
            currentX = e.clientX;
            currentY = e.clientY;
        };

        const onPointerUp = () => {
            isDragging = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
            win.style.willChange = "auto";
        };

        handle.addEventListener("pointerdown", (e: PointerEvent) => {
            e.preventDefault();

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            currentX = e.clientX;
            currentY = e.clientY;
            startLeft = win.offsetLeft;
            startTop = win.offsetTop;

            // Hint browser we are moving this
            win.style.willChange = "left, top";

            document.addEventListener("pointermove", onPointerMove);
            document.addEventListener("pointerup", onPointerUp);

            // Start the loop
            animationFrameId = requestAnimationFrame(updatePosition);
        });
    }

    private makeResizable(win: HTMLElement, handle: HTMLElement): void {
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;

        let currentX = 0;
        let currentY = 0;
        let isResizing = false;
        let animationFrameId: number | null = null;

        const updateSize = () => {
            if (!isResizing) return;

            const dx = currentX - startX;
            const dy = currentY - startY;

            // Enforce limits
            // Min: 350x300 (fits 3 icons), Max: 1000x800 (Prevents full screen takeover)
            let newWidth = Math.max(350, startWidth + dx);
            let newHeight = Math.max(300, startHeight + dy);

            // Apply Max Limits
            newWidth = Math.min(1000, newWidth);
            newHeight = Math.min(800, newHeight);

            win.style.width = `${newWidth}px`;
            win.style.height = `${newHeight}px`;

            animationFrameId = requestAnimationFrame(updateSize);
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isResizing) return;
            currentX = e.clientX;
            currentY = e.clientY;
        };

        const onPointerUp = () => {
            isResizing = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
            win.style.willChange = "auto";
        };

        handle.addEventListener("pointerdown", (e: PointerEvent) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent drag from starting if handle is clicked

            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            currentX = e.clientX;
            currentY = e.clientY;
            startWidth = win.offsetWidth;
            startHeight = win.offsetHeight;

            win.style.willChange = "width, height";

            document.addEventListener("pointermove", onPointerMove);
            document.addEventListener("pointerup", onPointerUp);

            animationFrameId = requestAnimationFrame(updateSize);
        });
    }
}
