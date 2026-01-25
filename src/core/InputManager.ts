import { escapeHTML } from "./Utils";

export class InputManager {
    private userInput: HTMLInputElement;
    private ghostInput: HTMLElement | null;
    private commands: string[];
    private history: string[] = [];
    private historyIdx: number = 0;
    private tempInput: string = "";

    private onCommand: (cmd: string) => void;
    private onClear: () => void;
    private onAutoScroll: () => void; // Callback to scroll to bottom
    private onInterrupt: () => void;

    constructor(
        userInputId: string,
        ghostInputId: string,
        commands: string[],
        callbacks: {
            onCommand: (cmd: string) => void,
            onClear: () => void,
            onAutoScroll: () => void,
            onInterrupt: () => void
        }
    ) {
        this.userInput = document.getElementById(userInputId) as HTMLInputElement;
        this.ghostInput = document.getElementById(ghostInputId);
        this.commands = commands;
        this.onCommand = callbacks.onCommand;
        this.onClear = callbacks.onClear;
        this.onAutoScroll = callbacks.onAutoScroll;
        this.onInterrupt = callbacks.onInterrupt;

        this.initListeners();
    }

    private initListeners() {
        if (!this.userInput) return;

        this.userInput.addEventListener('input', () => this.renderInput());
        this.userInput.addEventListener('keydown', (e) => {
            setTimeout(() => this.renderInput(), 0);
            this.handleKey(e);
        });
        this.userInput.addEventListener('keyup', () => this.renderInput());
        this.userInput.addEventListener('click', () => this.renderInput());
        this.userInput.addEventListener('focus', () => this.renderInput());
        this.userInput.addEventListener('blur', () => this.renderInput());
    }

    public focus() {
        this.userInput.focus();
    }

    public setValue(val: string) {
        this.userInput.value = val;
        this.renderInput();
    }

    public getValue(): string {
        return this.userInput.value;
    }

    public disable() {
        this.userInput.disabled = true;
    }

    public enable() {
        this.userInput.disabled = false;
        this.focus();
    }

    private handleKey(e: KeyboardEvent) {
        const key = e.key;
        const ctrl = e.ctrlKey;

        if (ctrl && key === "l") {
            e.preventDefault();
            this.onClear();
            return;
        }

        if (ctrl && key === "c") {
            e.preventDefault();
            this.onInterrupt();
            return;
        }

        switch (key) {
            case "Enter":
                e.preventDefault();
                this.handleEnter();
                this.onAutoScroll();
                break;
            case "ArrowUp":
                this.handleArrowUp();
                e.preventDefault();
                break;
            case "ArrowDown":
                this.handleArrowDown();
                break;
            case "ArrowRight":
                this.handleArrowRight(e);
                break;
            case "Tab":
                this.handleTab(e);
                break;
        }
    }

    private handleEnter() {
        const value = this.userInput.value;
        this.history.push(value);
        this.historyIdx = this.history.length;
        this.onCommand(value);
        this.setValue("");
    }

    private handleArrowUp() {
        if (this.historyIdx === this.history.length) this.tempInput = this.userInput.value;
        if (this.historyIdx !== 0) {
            this.historyIdx -= 1;
            this.setValue(this.history[this.historyIdx]);
        }
    }

    private handleArrowDown() {
        if (this.historyIdx !== this.history.length) {
            this.historyIdx += 1;
            if (this.historyIdx === this.history.length) {
                this.setValue(this.tempInput);
            } else {
                this.setValue(this.history[this.historyIdx]);
            }
        }
    }

    private handleArrowRight(e: KeyboardEvent) {
        const currentSuggestion = this.getCurrentSuggestion();
        if (currentSuggestion && this.userInput.selectionStart === this.userInput.value.length) {
            this.setValue(currentSuggestion);
            e.preventDefault();
        }
    }

    private handleTab(e: KeyboardEvent) {
        e.preventDefault();
        const currInput = this.userInput.value;
        for (const ele of this.commands) {
            if (ele.startsWith(currInput)) {
                this.setValue(ele);
                return;
            }
        }
    }

    private getCurrentSuggestion(): string | null {
        const input = this.userInput.value.toLowerCase();
        const cursor = this.userInput.selectionStart || 0;

        if (input.length > 0 && cursor === input.length) {
            const match = this.commands.find(cmd => cmd.startsWith(input));
            if (match) return match;
        }
        return null;
    }

    public renderInput() {
        if (!this.ghostInput || !this.userInput) return;

        const input = this.userInput.value;
        const cursor = this.userInput.selectionStart || 0;
        const inputLower = input.toLowerCase();

        let suffix = "";
        if (input.length > 0 && cursor === input.length) {
            const match = this.commands.find(cmd => cmd.startsWith(inputLower));
            if (match) {
                suffix = match.slice(input.length);
            }
        }

        const leftText = input.slice(0, cursor);
        let cursorChar = input.charAt(cursor);
        let rightText = input.slice(cursor + 1);

        if (cursor === input.length) {
            cursorChar = " ";
            rightText = "";
        }

        const leftHtml = escapeHTML(leftText);
        const cursorContent = cursorChar === ' ' ? '&nbsp;' : escapeHTML(cursorChar);
        const cursorHtml = `<span class="cursor-block">${cursorContent}</span>`;
        const rightHtml = escapeHTML(rightText);

        const suffixHtml = suffix ? `<span class="ghost-text">${escapeHTML(suffix)}</span>` : "";

        this.ghostInput.innerHTML = leftHtml + cursorHtml + rightHtml + suffixHtml;
    }
}
