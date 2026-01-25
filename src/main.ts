
import command from '../config.json';
import './css/explorer.css';
import { escapeHTML } from './core/Utils';
import { HELP } from "./commands/help";
import { getBanner } from "./commands/banner";
import { ABOUT } from "./commands/about"
import { createProject } from "./commands/projects";
import { EDUCATION } from "./commands/education";

import { createWhoami } from "./commands/whoami";
import { setTheme } from "./core/ThemeManager";
import { builtInThemes, THEME_HELP } from "./commands/themes";
import { getSkills } from "./commands/skills";
import { WindowManager } from './core/WindowManager';
import { InputManager } from './core/InputManager';
import { CommandDispatcher } from './core/CommandDispatcher';
import { ProjectViewer } from './ui/ProjectViewer';

// --- State ---
let mutWriteLines = document.getElementById("write-lines");
let isSudo = false;

let passwordCounter = 0;
let bareMode = false;

// We need to keep a copy of the initial write-lines element for the clear command
const WRITELINESCOPY = mutWriteLines ? mutWriteLines.cloneNode(true) as HTMLElement : null;

// --- DOM Elements ---
const TERMINAL = document.getElementById("terminal");
const PASSWORD = document.getElementById("password-input");
const PASSWORD_INPUT = document.getElementById("password-field") as HTMLInputElement;
const INPUT_HIDDEN = document.getElementById("input-hidden"); // Container for password input visibility toggle
const PRE_HOST = document.getElementById("pre-host");
const PRE_USER = document.getElementById("pre-user");
const HOST = document.getElementById("host");
const USER = document.getElementById("user");
const PROMPT = document.getElementById("prompt");
// Needed for references in legacy funcs if any

// --- Config ---
const SUDO_PASSWORD = command.password;
const REPO_LINK = command.repoLink;
const RESUME_LINK = command.resume;
const SOCIAL = command.social;

// --- Managers ---
const windowManager = new WindowManager();
const projectViewer = new ProjectViewer(windowManager);
const dispatcher = new CommandDispatcher();

// --- Globals for Legacy Support ---
(window as any).openProjectWindow = projectViewer.openProjectWindow.bind(projectViewer);
(window as any).openProjectExplorer = projectViewer.openProjectExplorer.bind(projectViewer);

// --- Helper Functions ---

const scrollToBottom = () => {
  const HEADER = document.getElementById("content-wrapper");
  if (!HEADER) return
  HEADER.scrollTop = HEADER.scrollHeight;
}

function writeLines(message: string[]) {
  message.forEach((item, idx) => {
    displayText(item, idx);
  });
}

function displayText(item: string, idx: number) {
  setTimeout(() => {
    if (!mutWriteLines) return
    const p = document.createElement("p");
    p.innerHTML = item;
    mutWriteLines.parentNode!.insertBefore(p, mutWriteLines);
    scrollToBottom();
  }, 40 * idx);
}

function easterEggStyles() {
  const bars = document.getElementById("bars");
  const body = document.body;
  const main = document.getElementById("main");
  const span = document.getElementsByTagName("span");

  if (!bars) return
  bars.innerHTML = "";
  bars.remove()

  if (main) main.style.border = "none";

  body.style.backgroundColor = "black";
  body.style.fontFamily = "VT323, monospace";
  body.style.fontSize = "20px";
  body.style.color = "white";

  for (let i = 0; i < span.length; i++) {
    span[i].style.color = "white";
  }

  const userInput = document.getElementById("user-input");
  if (userInput) {
    userInput.style.backgroundColor = "black";
    userInput.style.color = "white";
    userInput.style.fontFamily = "VT323, monospace";
    userInput.style.fontSize = "20px";
  }
  if (PROMPT) PROMPT.style.color = "white";
}

// --- Password Logic ---

function revertPasswordChanges() {
  if (!INPUT_HIDDEN || !PASSWORD) return
  PASSWORD_INPUT.value = "";
  inputManager.enable();
  INPUT_HIDDEN.style.display = "block";
  PASSWORD.style.display = "none";


  setTimeout(() => {
    inputManager.focus();
  }, 200)
}

function handlePasswordCheck() {
  if (passwordCounter === 2) {
    if (!INPUT_HIDDEN || !mutWriteLines || !PASSWORD) return
    writeLines(["<br>", "INCORRECT PASSWORD.", "PERMISSION NOT GRANTED.", "<br>"])
    revertPasswordChanges();
    passwordCounter = 0;
    return
  }

  if (PASSWORD_INPUT.value === SUDO_PASSWORD) {
    if (!mutWriteLines || !mutWriteLines.parentNode) return
    writeLines(["<br>", "PERMISSION GRANTED.", "Try <span class='command'>'rm -rf'</span>", "<br>"])
    revertPasswordChanges();
    isSudo = true;
    return
  } else {
    PASSWORD_INPUT.value = "";
    passwordCounter++;
  }
}

// --- Command Registration ---

const registerCommands = () => {
  dispatcher.register("help", () => {
    if (bareMode) { writeLines(["maybe restarting your browser will fix this.", "<br>"]); return; }
    writeLines(HELP);
  });

  dispatcher.register("banner", () => {
    if (bareMode) { writeLines(["Welcome to Webterm v1.0.0", "<br>"]); return; }
    writeLines(getBanner());
  });

  dispatcher.register("clear", () => {
    if (!TERMINAL || !mutWriteLines) return
    TERMINAL.innerHTML = "";
    // Re-create write-lines
    const newWriteLines = document.createElement("div");
    newWriteLines.id = "write-lines";
    TERMINAL.appendChild(newWriteLines);
    mutWriteLines = newWriteLines;
  });

  dispatcher.register("whoami", () => {
    if (bareMode) { writeLines([`${command.username}`, "<br>"]); return; }
    writeLines(createWhoami());
  });

  dispatcher.register("about", () => {
    if (bareMode) { writeLines(["Nothing to see here.", "<br>"]); return; }
    writeLines(ABOUT);
  });

  dispatcher.register("education", () => {
    if (bareMode) { writeLines(["Stay in school.", "<br>"]); return; }
    writeLines(EDUCATION);
  });

  dispatcher.register("skills", () => {
    if (bareMode) { writeLines(["Skill issue.", "<br>"]); return; }
    writeLines(getSkills());
  });

  dispatcher.register("repo", () => {
    writeLines(["Redirecting to github.com...", "<br>"]);
    setTimeout(() => {
      window.open(REPO_LINK, '_blank');
    }, 500);
  });

  dispatcher.register("linkedin", () => {
    writeLines([`LinkedIn: <a href='${SOCIAL.linkedin}' target='_blank'>${SOCIAL.linkedin}</a>`, "<br>"]);
  });

  dispatcher.register("github", () => {
    writeLines(["Opening GitHub...", "<br>"]);
    setTimeout(() => {
      window.open(SOCIAL.github, '_blank');
    }, 500);
  });

  dispatcher.register("email", () => {
    writeLines([`Email: <a href='mailto:${SOCIAL.email}'>${SOCIAL.email}</a>`, "<br>"]);
  });

  dispatcher.register("projects", (args) => {
    if (bareMode) {
      writeLines(["I don't want you to break the other projects.", "<br>"]);
      return;
    }

    const isDesktop = window.innerWidth > 600;
    const hasGuiFlag = args.includes('--gui');

    if (isDesktop && !hasGuiFlag) {
      projectViewer.openProjectExplorer();
      writeLines(["Opening Project Explorer...", "<br>"]);
      return;
    }

    if (isDesktop && !args.includes('--gui')) {
      args.push('--gui');
    }

    writeLines(createProject(args));
  });

  dispatcher.register("resume", () => {
    if (bareMode) { writeLines(["resume not found.", "<br>"]); return; }

    if (window.innerWidth <= 600) {
      writeLines(["Opening resume...", "<br>"]);
      setTimeout(() => {
        window.open(RESUME_LINK, '_blank');
      }, 500);
    } else {
      const downloadBtn = `<a href="${RESUME_LINK}" download class="command" style="text-decoration: underline; margin-left: 10px;">[Download PDF]</a>`;

      fetch(RESUME_LINK, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            writeLines(["Launching Resume Viewer..." + downloadBtn, "<br>"]);
            setTimeout(() => {
              const content = `<iframe src="${RESUME_LINK}" style="width:100%; height:100%; border:none;"></iframe>`;
              windowManager.open('resume', 'Resume.pdf', content, 600, 800);
            }, 500);
          } else {
            writeLines(["Resume: Coming Soon...", "<br>"]);
          }
        })
        .catch(() => {
          writeLines(["Resume: Coming Soon...", "<br>"]);
        });
    }
  });

  dispatcher.register("sudo", () => {
    if (bareMode) { writeLines(["no.", "<br>"]); return; }
    if (!PASSWORD) return

    inputManager.disable(); // Disable main input

    if (INPUT_HIDDEN) INPUT_HIDDEN.style.display = "none";
    PASSWORD.style.display = "flex";
    setTimeout(() => {
      PASSWORD_INPUT.focus();
    }, 100);
  });

  dispatcher.register("ls", () => {
    if (bareMode) { writeLines(["", "<br>"]); return; }
    if (isSudo) {
      writeLines(["src", "<br>"]);
    } else {
      writeLines(["Permission not granted.", "<br>"]);
    }
  });

  dispatcher.register("rm", (args) => {
    if (bareMode) { writeLines(["don't try again.", "<br>"]); return; }

    // Handle "rm -rf"
    const isRf = args.includes("-rf");

    if (isSudo) {
      if (isRf) {
        if (args.includes("src") && !bareMode) {
          bareMode = true;
          setTimeout(() => {
            if (!TERMINAL || !WRITELINESCOPY) return;
            TERMINAL.innerHTML = "";
            // Restore initial state (empty)
            // Actually, WRITELINESCOPY was the element itself, so we clone it back
            const newWriteLines = document.createElement("div");
            newWriteLines.id = "write-lines";
            TERMINAL.appendChild(newWriteLines);
            mutWriteLines = newWriteLines;
          });

          easterEggStyles();
          setTimeout(() => { writeLines(["What made you think that was a good idea?", "<br>"]); }, 200);
          setTimeout(() => { writeLines(["Now everything is ruined.", "<br>"]); }, 1200);
        } else if (args.includes("src") && bareMode) {
          writeLines(["there's no more src folder.", "<br>"])
        } else {
          if (bareMode) {
            writeLines(["What else are you trying to delete?", "<br>"])
          } else {
            writeLines(["<br>", "Directory not found.", "type <span class='command'>'ls'</span> for a list of directories.", "<br>"]);
          }
        }
      } else {
        writeLines(["Usage: <span class='command'>'rm -rf &lt;dir&gt;'</span>", "<br>"]);
      }
    } else {
      writeLines(["Permission not granted.", "<br>"]);
    }
  });

  // Alias "rm -rf" to work as a single command string if typed that way?
  // Dispatcher splits by space. "rm -rf" becomes "rm", "-rf".
  // So "rm" handler above covers it.

  dispatcher.register("theme", (args) => {
    if (args.length === 0) {
      writeLines(THEME_HELP);
    } else {
      const themeName = args[0];
      if (builtInThemes[themeName]) {
        setTheme(builtInThemes[themeName]);
        writeLines([`Theme switched to ${themeName}`, "<br>"]);
        localStorage.setItem('currentTheme', themeName);
      } else {
        writeLines([`Theme '${themeName}' not found.`, "<br>", ...THEME_HELP]);
      }
    }
  });
}


// --- Input Manager Init ---

const commandList = ["help", "about", "projects", "whoami", "education", "skills", "banner", "clear", "resume", "linkedin", "github", "email", "ls", "sudo", "rm -rf", "repo", "theme"];

const inputManager = new InputManager(
  "user-input",
  "ghost-input",
  commandList,
  {
    onCommand: (cmd) => {
      // Echo
      const div = document.createElement("div");
      div.innerHTML = `<span id="prompt">${PROMPT?.innerHTML}</span> <span class='output'>${escapeHTML(cmd)}</span>`;
      if (mutWriteLines && mutWriteLines.parentNode) {
        mutWriteLines.parentNode.insertBefore(div, mutWriteLines);
      }

      if (cmd.trim() !== '') {
        const handled = dispatcher.dispatch(cmd);
        if (!handled) {
          if (bareMode) {
            writeLines(["type 'help'", "<br>"]);
          } else {
            writeLines([`Command not found: ${escapeHTML(cmd)}`, "<br>", "Type <span class='command'>'help'</span> for a list of commands.", "<br>"]);
          }
        }
      }
      scrollToBottom();
    },
    onClear: () => {
      if (!TERMINAL || !mutWriteLines) return;
      TERMINAL.innerHTML = "";
      const newWriteLines = document.createElement("div");
      newWriteLines.id = "write-lines";
      TERMINAL.appendChild(newWriteLines);
      mutWriteLines = newWriteLines;
    },
    onAutoScroll: () => scrollToBottom(),
    onInterrupt: () => {
      const currentState = inputManager.getValue();
      const div = document.createElement("div");
      div.innerHTML = `<span id="prompt">${PROMPT?.innerHTML}</span> <span class='output'>${escapeHTML(currentState)}^C</span>`;
      if (mutWriteLines && mutWriteLines.parentNode) {
        mutWriteLines.parentNode.insertBefore(div, mutWriteLines);
      }
      inputManager.setValue("");
      scrollToBottom();
    }
  }
);

registerCommands();

const initEventListeners = () => {
  if (HOST) HOST.innerText = command.hostname;
  if (USER) USER.innerText = command.username;
  if (PRE_HOST) PRE_HOST.innerText = command.hostname;
  if (PRE_USER) PRE_USER.innerText = command.username;

  window.addEventListener('load', () => {
    writeLines(getBanner());
    inputManager.focus();
  });

  PASSWORD_INPUT.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
      handlePasswordCheck();
    }
  });

  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button');

    // Handle Project Gallery Navigation manually if needed? 
    // ProjectViewer adds clicks to its buttons, so they bubble up.
    // But we added e.stopPropagation() there.

    if (button && button.classList.contains('action-btn')) {
      const cmd = button.getAttribute('data-cmd');
      if (cmd === 'theme-random') {
        const themeNames = Object.keys(builtInThemes);
        const currentTheme = localStorage.getItem('currentTheme') || 'classic';
        let nextIndex = themeNames.indexOf(currentTheme) + 1;
        if (nextIndex >= themeNames.length) nextIndex = 0;
        const nextTheme = themeNames[nextIndex];
        // Call dispatcher directly for cleaner flow
        dispatcher.dispatch(`theme ${nextTheme}`);
      } else if (cmd) {
        // runCommand simulation
        inputManager.setValue(cmd);
        // We want to trigger the "Enter" or "execution".
        // InputManager doesn't expose "submit" but we can direct call callback?
        // Or better, let's just make inputManager.setValue not trigger default?
        // We want to SHOW the command then execute.
        // So we manually do what Enter does:
        // But wait, runCommand originally mimicked "Executing: cmd...".

        // Let's bring back runCommand helper
        runCommand(cmd);
      }
      return;
    }

    if (target.classList.contains('clickable')) {
      const cmd = target.getAttribute('data-command');
      if (cmd) {
        runCommand(cmd);
      }
      return;
    }

    // Only focus if not clicking interactive elements
    inputManager.focus();
  });
}

function runCommand(cmd: string) {
  // Create an animated system message: "Executing: <cmd>..."
  const p = document.createElement("p");
  p.innerHTML = `<span class="keys">Executing:</span> ${cmd}...`;

  if (mutWriteLines && mutWriteLines.parentNode) {
    mutWriteLines.parentNode.insertBefore(p, mutWriteLines);
  }

  setTimeout(() => {
    // Execute the command via dispatcher, BUT we also want to echo it?
    // Actually runCommand acts like typing it.
    // Standard "renderInput" style dispatch?
    // No, runCommand is a direct execution shortcut.
    // It bypasses the "user typed this" echo usually.
    dispatcher.dispatch(cmd);
    scrollToBottom();
  }, 200);

  inputManager.setValue("");
}

initEventListeners();
