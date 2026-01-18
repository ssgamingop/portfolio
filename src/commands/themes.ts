
import command from '../../config.json';

export interface ThemeColors {
    background: string;
    foreground: string;
    banner: string;
    border: {
        visible: boolean;
        color: string;
    };
    prompt: {
        default: string;
        user: string;
        host: string;
        input: string;
    };
    link: {
        text: string;
        highlightColor: string;
        highlightText: string;
    };
    commands: {
        textColor: string;
    };
}

export const builtInThemes: Record<string, ThemeColors> = {
    default: command.colors as ThemeColors,
    matrix: {
        background: "#0D0208",
        foreground: "#00FF41",
        banner: "#00FF41",
        border: { visible: true, color: "#003B00" },
        prompt: { default: "#008F11", user: "#00FF41", host: "#003B00", input: "#00FF41" },
        link: { text: "#00FF41", highlightColor: "#003B00", highlightText: "#00FF41" },
        commands: { textColor: "#008F11" }
    },
    dracula: {
        background: "#282a36",
        foreground: "#f8f8f2",
        banner: "#bd93f9",
        border: { visible: true, color: "#44475a" },
        prompt: { default: "#ffb86c", user: "#ff79c6", host: "#8be9fd", input: "#f8f8f2" },
        link: { text: "#8be9fd", highlightColor: "#44475a", highlightText: "#f8f8f2" },
        commands: { textColor: "#ff79c6" }
    },
    gruvbox: {
        background: "#282828",
        foreground: "#ebdbb2",
        banner: "#d79921",
        border: { visible: true, color: "#504945" },
        prompt: { default: "#a89984", user: "#fb4934", host: "#b8bb26", input: "#ebdbb2" },
        link: { text: "#83a598", highlightColor: "#504945", highlightText: "#ebdbb2" },
        commands: { textColor: "#d3869b" }
    },
    nord: {
        background: "#2E3440",
        foreground: "#D8DEE9",
        banner: "#88C0D0",
        border: { visible: true, color: "#4C566A" },
        prompt: { default: "#81A1C1", user: "#88C0D0", host: "#81A1C1", input: "#ECEFF4" },
        link: { text: "#8FBCBB", highlightColor: "#434C5E", highlightText: "#ECEFF4" },
        commands: { textColor: "#88C0D0" }
    }
};

const createThemeHelp = (): string[] => {
    const help: string[] = [];
    help.push("<br>");
    help.push("Usage: <span class='command'>theme [name]</span>");
    help.push("<br>");
    help.push("Available themes:");
    Object.keys(builtInThemes).forEach(t => {
        help.push(`  <span class='command'>${t}</span>`);
    });
    help.push("<br>");
    return help;
}

export const THEME_HELP = createThemeHelp();
