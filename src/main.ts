import command from '../config.json';
import './css/explorer.css';
import { escapeHTML } from './utils';
import { HELP } from "./commands/help";
import { getBanner } from "./commands/banner";
import { ABOUT } from "./commands/about"
import { PROJECTS, createProject } from "./commands/projects";
import { EDUCATION } from "./commands/education";
import { SKILLS } from "./commands/skills";
import { createWhoami } from "./commands/whoami";
import { setTheme } from "./styles";
import { builtInThemes, THEME_HELP } from "./commands/themes";
import { WindowManager } from './windowManager';

const windowManager = new WindowManager();

// Expose to window for inline onclicks
(window as any).openProjectWindow = (title: string, link: string, videoUrl?: string, screenshots?: string[]) => {
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
    windowManager.open(`proj-${title}`, title, iframeValue);
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

  windowManager.open(`proj-${title}`, title, galleryContainer);
};

(window as any).openProjectExplorer = () => {
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
    item.onclick = () => (window as any).openProjectWindow(title, link, video, screenshots);

    const img = document.createElement('img');
    img.src = imgPath || 'https://img.icons8.com/color/96/folder-invoices--v1.png';
    img.className = 'explorer-icon';
    img.onerror = () => { img.src = 'https://img.icons8.com/color/96/folder-invoices--v1.png'; };

    const label = document.createElement('span');
    label.className = 'explorer-label';
    label.innerText = rawTitle;

    item.appendChild(img);
    item.appendChild(label);
    container.appendChild(item);
  });

  windowManager.open('project-explorer', 'Project Explorer', container);
};



//mutWriteLines gets deleted and reassigned
let mutWriteLines = document.getElementById("write-lines");
let historyIdx = 0
let tempInput = ""
let isSudo = false;
let isPasswordInput = false;
let passwordCounter = 0;
let bareMode = false;

//WRITELINESCOPY is used to during the "clear" command
const WRITELINESCOPY = mutWriteLines;
const TERMINAL = document.getElementById("terminal");
const USERINPUT = document.getElementById("user-input") as HTMLInputElement;
const INPUT_HIDDEN = document.getElementById("input-hidden");
const PASSWORD = document.getElementById("password-input");
const PASSWORD_INPUT = document.getElementById("password-field") as HTMLInputElement;
const PRE_HOST = document.getElementById("pre-host");
const PRE_USER = document.getElementById("pre-user");
const HOST = document.getElementById("host");
const USER = document.getElementById("user");
const PROMPT = document.getElementById("prompt");
const COMMANDS = ["help", "about", "projects", "whoami", "education", "skills", "banner", "clear", "resume", "linkedin", "github", "email", "ls", "sudo", "rm -rf", "repo", "theme"];
const HISTORY: string[] = [];
const SUDO_PASSWORD = command.password;
const REPO_LINK = command.repoLink;
const RESUME_LINK = command.resume;
const SOCIAL = command.social;

const scrollToBottom = () => {
  const HEADER = document.getElementById("content-wrapper");
  if (!HEADER) return
  HEADER.scrollTop = HEADER.scrollHeight;
}

function userInputHandler(e: KeyboardEvent) {
  const key = e.key;
  const ctrl = e.ctrlKey;

  if (ctrl && key === "l") {
    e.preventDefault();
    runCommand("clear");
    return;
  }

  if (ctrl && key === "c") {
    e.preventDefault();
    const currentState = USERINPUT.value;
    const div = document.createElement("div");
    div.innerHTML = `<span id="prompt">${PROMPT?.innerHTML}</span> <span class='output'>${currentState}^C</span>`;

    if (mutWriteLines && mutWriteLines.parentNode) {
      mutWriteLines.parentNode.insertBefore(div, mutWriteLines);
    }

    USERINPUT.value = "";
    scrollToBottom();
    return;
  }

  switch (key) {
    case "Enter":
      e.preventDefault();
      if (!isPasswordInput) {
        enterKey();
      } else {
        passwordHandler();
      }

      scrollToBottom();
      break;
    case "Escape":
      USERINPUT.value = "";
      break;
    case "ArrowUp":
      arrowKeys(key);
      e.preventDefault();
      break;
    case "ArrowDown":
      arrowKeys(key);
      break;
    case "Tab":
      tabKey();
      e.preventDefault();
      break;
  }
}

function enterKey() {
  if (!mutWriteLines || !PROMPT) return
  const resetInput = "";
  let newUserInput;
  let userInput = USERINPUT.value; // Local variable

  if (bareMode) {
    // ...
    newUserInput = userInput;
  } else {
    newUserInput = `<span class='output'>${userInput}</span>`;
  }

  HISTORY.push(userInput);
  historyIdx = HISTORY.length

  //if clear then early return
  if (userInput === 'clear') {
    commandHandler(userInput.toLowerCase().trim());
    USERINPUT.value = resetInput;
    userInput = resetInput;
    return
  }

  const div = document.createElement("div");
  div.innerHTML = `<span id="prompt">${PROMPT.innerHTML}</span> ${newUserInput}`;

  if (mutWriteLines.parentNode) {
    mutWriteLines.parentNode.insertBefore(div, mutWriteLines);
  }

  /*
  if input is empty or a collection of spaces, 
  just insert a prompt before #write-lines
  */
  if (userInput.trim().length !== 0) {
    commandHandler(userInput.toLowerCase().trim());
  }

  USERINPUT.value = resetInput;
  userInput = resetInput;
}

function tabKey() {
  let currInput = USERINPUT.value;

  for (const ele of COMMANDS) {
    if (ele.startsWith(currInput)) {
      USERINPUT.value = ele;
      return
    }
  }
}

function arrowKeys(e: string) {
  switch (e) {
    case "ArrowDown":
      if (historyIdx !== HISTORY.length) {
        historyIdx += 1;
        USERINPUT.value = HISTORY[historyIdx];
        if (historyIdx === HISTORY.length) USERINPUT.value = tempInput;
      }
      break;
    case "ArrowUp":
      if (historyIdx === HISTORY.length) tempInput = USERINPUT.value;
      if (historyIdx !== 0) {
        historyIdx -= 1;
        USERINPUT.value = HISTORY[historyIdx];
      }
      break;
  }
}

function commandHandler(input: string) {
  if (input.startsWith("rm -rf") && input.trim() !== "rm -rf") {
    if (isSudo) {
      if (input === "rm -rf src" && !bareMode) {
        bareMode = true;

        setTimeout(() => {
          if (!TERMINAL || !WRITELINESCOPY) return
          TERMINAL.innerHTML = "";
          TERMINAL.appendChild(WRITELINESCOPY);
          mutWriteLines = WRITELINESCOPY;
        });

        easterEggStyles();
        setTimeout(() => {
          writeLines(["What made you think that was a good idea?", "<br>"]);
        }, 200)

        setTimeout(() => {
          writeLines(["Now everything is ruined.", "<br>"]);
        }, 1200)

      } else if (input === "rm -rf src" && bareMode) {
        writeLines(["there's no more src folder.", "<br>"])
      } else {
        if (bareMode) {
          writeLines(["What else are you trying to delete?", "<br>"])
        } else {
          writeLines(["<br>", "Directory not found.", "type <span class='command'>'ls'</span> for a list of directories.", "<br>"]);
        }
      }
    } else {
      writeLines(["Permission not granted.", "<br>"]);
    }
    return
  }

  if (input.startsWith("theme")) {
    const args = input.trim().split(/\s+/);
    if (args[0] === "theme") {
      if (args.length === 1) {
        writeLines(THEME_HELP);
      } else {
        const themeName = args[1];
        if (builtInThemes[themeName]) {
          setTheme(builtInThemes[themeName]);
          writeLines([`Theme switched to ${themeName}`, "<br>"]);
        } else {
          writeLines([`Theme '${themeName}' not found.`, "<br>", ...THEME_HELP]);
        }
      }
      return;
    }
  }

  if (input.startsWith("projects")) {
    const args = input.trim().split(/\s+/);
    if (bareMode) {
      writeLines(["I don't want you to break the other projects.", "<br>"]);
      return;
    }

    const isDesktop = window.innerWidth > 600;
    const hasGuiFlag = args.includes('--gui');

    // Default to GUI on desktop if not explicitly asking for text mode (though current logic forces gui unless overridden/logic changed)
    // Here we ensure desktop users get the explorer by default as requested.
    if (isDesktop && !hasGuiFlag) {
      (window as any).openProjectExplorer();
      writeLines(["Opening Project Explorer...", "<br>"]);
      return;
    }

    if (isDesktop && !args.includes('--gui')) {
      args.push('--gui');
    }

    writeLines(createProject(args));
    return;
  }

  switch (input) {
    case 'clear':
      setTimeout(() => {
        if (!TERMINAL || !WRITELINESCOPY) return
        TERMINAL.innerHTML = "";
        TERMINAL.appendChild(WRITELINESCOPY);
        mutWriteLines = WRITELINESCOPY;
      })
      break;
    case 'banner':
      if (bareMode) {
        writeLines(["Welcome to Webterm v1.0.0", "<br>"])
        break;
      }
      writeLines(getBanner());
      break;
    case 'help':
      if (bareMode) {
        writeLines(["maybe restarting your browser will fix this.", "<br>"])
        break;
      }
      writeLines(HELP);
      break;
    case 'whoami':
      if (bareMode) {
        writeLines([`${command.username}`, "<br>"])
        break;
      }
      writeLines(createWhoami());
      break;
    case 'about':
      if (bareMode) {
        writeLines(["Nothing to see here.", "<br>"])
        break;
      }
      writeLines(ABOUT);
      break;
    case 'education':
      if (bareMode) {
        writeLines(["Stay in school.", "<br>"])
        break;
      }
      writeLines(EDUCATION);
      break;
    case 'skills':
      if (bareMode) {
        writeLines(["Skill issue.", "<br>"])
        break;
      }
      writeLines(SKILLS);
      break;
    case 'projects':
      if (bareMode) {
        writeLines(["I don't want you to break the other projects.", "<br>"])
        break;
      }
      writeLines(PROJECTS);
      break;
    case 'repo':
      writeLines(["Redirecting to github.com...", "<br>"]);
      setTimeout(() => {
        window.open(REPO_LINK, '_blank');
      }, 500);
      break;
    case 'resume':
      if (bareMode) {
        writeLines(["resume not found.", "<br>"])
        break;
      }

      // Check for mobile
      if (window.innerWidth <= 600) {
        writeLines(["Opening resume...", "<br>"]);
        setTimeout(() => {
          window.open(RESUME_LINK, '_blank');
        }, 500);
      } else {
        const downloadBtn = `<a href="${RESUME_LINK}" download class="command" style="text-decoration: underline; margin-left: 10px;">[Download PDF]</a>`;
        writeLines(["Launching Resume Viewer..." + downloadBtn, "<br>"]);
        setTimeout(() => {
          // Just the iframe, no header
          const content = `<iframe src="${RESUME_LINK}" style="width:100%; height:100%; border:none;"></iframe>`;

          // Open with specific A4-like dimensions (e.g. 600x850)
          windowManager.open('resume', 'Resume.pdf', content, 600, 800);
        }, 500);
      }
      break;
    case 'linkedin':
      writeLines([`LinkedIn: <a href='${SOCIAL.linkedin}' target='_blank'>${SOCIAL.linkedin}</a>`, "<br>"]);
      break;
    case 'github':
      writeLines(["Opening GitHub...", "<br>"]);
      setTimeout(() => {
        window.open(SOCIAL.github, '_blank');
      }, 500);
      break;
    case 'email':
      writeLines([`Email: <a href='mailto:${SOCIAL.email}'>${SOCIAL.email}</a>`, "<br>"]);
      break;
    case 'rm -rf':
      if (bareMode) {
        writeLines(["don't try again.", "<br>"])
        break;
      }

      if (isSudo) {
        writeLines(["Usage: <span class='command'>'rm -rf &lt;dir&gt;'</span>", "<br>"]);
      } else {
        writeLines(["Permission not granted.", "<br>"])
      }
      break;
    case 'sudo':
      if (bareMode) {
        writeLines(["no.", "<br>"])
        break;
      }
      if (!PASSWORD) return
      isPasswordInput = true;
      USERINPUT.disabled = true;

      if (INPUT_HIDDEN) INPUT_HIDDEN.style.display = "none";
      PASSWORD.style.display = "block";
      setTimeout(() => {
        PASSWORD_INPUT.focus();
      }, 100);

      break;
    case 'ls':
      if (bareMode) {
        writeLines(["", "<br>"])
        break;
      }

      if (isSudo) {
        writeLines(["src", "<br>"]);
      } else {
        writeLines(["Permission not granted.", "<br>"]);
      }
      break;
    default:
      if (bareMode) {
        writeLines(["type 'help'", "<br>"])
        break;
      }

      writeLines([`Command not found: ${input}`, "<br>", "Type <span class='command'>'help'</span> for a list of commands.", "<br>"]);
      break;
  }
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

function revertPasswordChanges() {
  if (!INPUT_HIDDEN || !PASSWORD) return
  PASSWORD_INPUT.value = "";
  USERINPUT.disabled = false;
  INPUT_HIDDEN.style.display = "block";
  PASSWORD.style.display = "none";
  isPasswordInput = false;

  setTimeout(() => {
    USERINPUT.focus();
  }, 200)
}

function passwordHandler() {
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

  USERINPUT.style.backgroundColor = "black";
  USERINPUT.style.color = "white";
  USERINPUT.style.fontFamily = "VT323, monospace";
  USERINPUT.style.fontSize = "20px";
  if (PROMPT) PROMPT.style.color = "white";

}

const initEventListeners = () => {
  if (HOST) {
    HOST.innerText = command.hostname;
  }

  if (USER) {
    USER.innerText = command.username;
  }

  if (PRE_HOST) {
    PRE_HOST.innerText = command.hostname;
  }

  if (PRE_USER) {
    PRE_USER.innerText = command.username;
  }

  window.addEventListener('load', () => {
    writeLines(getBanner());
  });

  USERINPUT.addEventListener('keypress', userInputHandler);
  USERINPUT.addEventListener('keydown', userInputHandler);
  PASSWORD_INPUT.addEventListener('keypress', userInputHandler);

  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button');

    if (button && button.classList.contains('action-btn')) {
      const cmd = button.getAttribute('data-cmd');
      if (cmd === 'theme-random') {
        const themeNames = Object.keys(builtInThemes);
        // Sequential Cycling
        const currentTheme = localStorage.getItem('currentTheme') || 'classic';
        let nextIndex = themeNames.indexOf(currentTheme) + 1;
        if (nextIndex >= themeNames.length) nextIndex = 0;

        const nextTheme = themeNames[nextIndex];
        // Store for next cycle (setTheme should probably handle this, but we'll do it here to ensure cycle works)
        localStorage.setItem('currentTheme', nextTheme);
        runCommand(`theme ${nextTheme}`);
      } else if (cmd) {
        runCommand(cmd);
      }
      return; // Stop here, do not focus input
    }
    if (target.classList.contains('clickable')) {
      const cmd = target.getAttribute('data-command');
      if (cmd) {
        runCommand(cmd);
      }
      return; // Stop here, do not focus input
    }

    // Only focus if clicking elsewhere (like the terminal background) or specifically the input line
    // Just blindly focusing might be annoying if selecting text, but on mobile it's key.
    // Let's assume user wants to type if they click the background.
    USERINPUT.focus();
  });


}

function runCommand(cmd: string) {
  const resetInput = "";

  // Create an animated system message: "Executing: <cmd>..."
  const p = document.createElement("p");
  p.innerHTML = `<span class="keys">Executing:</span> ${cmd}...`;

  if (mutWriteLines && mutWriteLines.parentNode) {
    mutWriteLines.parentNode.insertBefore(p, mutWriteLines);
  }

  // Slight delay to allow the "Executing" animation to start/finish before dumping output
  setTimeout(() => {
    commandHandler(cmd.toLowerCase().trim());
  }, 200);

  USERINPUT.value = resetInput;
}

initEventListeners();
