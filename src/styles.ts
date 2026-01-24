import { builtInThemes, ThemeColors } from './commands/themes';
import { hexToRgba } from './utils';

let styleElement: HTMLStyleElement | null = null;

export const setTheme = (colors: ThemeColors) => {
  if (!styleElement) {
    styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
  }

  const sheet = styleElement.sheet;
  if (!sheet) return;

  // Clear existing rules
  while (sheet.cssRules.length > 0) {
    sheet.deleteRule(0);
  }

  const background = `html {background: ${colors.background}}`
  const foreground = `body {color: ${colors.foreground}}`
  const inputBackground = `input {background: transparent}`
  const inputForeground = `input {color: ${colors.prompt.input}}`
  const outputColor = `.output {color: ${colors.prompt.input}}`
  const preHost = `#pre-host {color: ${colors.prompt.host}}`
  const host = `#host {color: ${colors.prompt.host}}`
  const preUser = `#pre-user {color: ${colors.prompt.user}}`
  const user = `#user {color: ${colors.prompt.user}}`
  const prompt = `#prompt {color: ${colors.prompt.default}}`
  const banner = `pre {color: ${colors.banner}}`
  const link = `a {color: ${colors.link.text}}`
  const linkHighlight = `a:hover {background: ${colors.link.highlightColor}}`
  const linkTextHighlight = `a:hover {color: ${colors.link.highlightText}}`
  const commandHighlight = `.command {color: ${colors.commands.textColor}}`
  const keys = `.keys {color: ${colors.banner}}`
  const scrollbar = `::-webkit-scrollbar-thumb {background: ${colors.banner}}`

  if (!colors.border.visible) {
    sheet.insertRule("#bars {display: none}", sheet.cssRules.length)
    sheet.insertRule("main {border: none}", sheet.cssRules.length)
  } else {
    // Need to handle display:block if it was hidden before? 
    // Simplified: we just insert rules. CSS specificity handles the rest usually, 
    // but here we are rewriting all rules on a fresh style tag/cleared sheet 
    // so we should be careful about 'display: none'.
    // Actually, if we clear rules, the default CSS styles apply. 
    // Check main.css/style.css for #bars default display.

    sheet.insertRule(`#bars {display: block; background: ${colors.background}}`, sheet.cssRules.length)
    sheet.insertRule(`main {border: 2px solid ${colors.border.color}}`, sheet.cssRules.length)
    sheet.insertRule(`#bar-1 {background: ${colors.border.color}; color: ${colors.background}}`, sheet.cssRules.length)
    sheet.insertRule(`#bar-2 {background: ${colors.border.color}}`, sheet.cssRules.length)
    sheet.insertRule(`#bar-3 {background: ${colors.border.color}}`, sheet.cssRules.length)
    sheet.insertRule(`#bar-4 {background: ${colors.border.color}}`, sheet.cssRules.length)
    sheet.insertRule(`#bar-5 {background: ${colors.border.color}}`, sheet.cssRules.length)
  }

  sheet.insertRule(background, sheet.cssRules.length)
  sheet.insertRule(foreground, sheet.cssRules.length)
  sheet.insertRule(inputBackground, sheet.cssRules.length)
  sheet.insertRule(inputForeground, sheet.cssRules.length)
  sheet.insertRule(outputColor, sheet.cssRules.length)
  sheet.insertRule(preHost, sheet.cssRules.length)
  sheet.insertRule(host, sheet.cssRules.length)
  sheet.insertRule(preUser, sheet.cssRules.length)
  sheet.insertRule(user, sheet.cssRules.length)
  sheet.insertRule(prompt, sheet.cssRules.length)
  sheet.insertRule(banner, sheet.cssRules.length)
  sheet.insertRule(link, sheet.cssRules.length)
  sheet.insertRule(linkHighlight, sheet.cssRules.length)
  sheet.insertRule(linkTextHighlight, sheet.cssRules.length)
  sheet.insertRule(commandHighlight, sheet.cssRules.length)
  sheet.insertRule(keys, sheet.cssRules.length)
  sheet.insertRule(scrollbar, sheet.cssRules.length)

  // Sidebar specific styles (Theme Colors only)
  // Layout is handled in style.css
  const sidebar = `#sidebar { border-left: none; background: transparent; }`;
  const actionBtn = `.action-btn { color: ${colors.prompt.default}; border: 1px solid ${colors.border.color}; }`;
  const actionBtnHover = `.action-btn:hover { background: ${colors.border.color}; color: ${colors.background} }`;

  sheet.insertRule(sidebar, sheet.cssRules.length);
  sheet.insertRule(actionBtn, sheet.cssRules.length);
  sheet.insertRule(actionBtnHover, sheet.cssRules.length);

  // Window System Variables
  const root = document.documentElement;
  root.style.setProperty('--win-bg', hexToRgba(colors.background, 0.95));
  root.style.setProperty('--win-border', colors.border.color);
  root.style.setProperty('--win-title-color', hexToRgba(colors.foreground, 0.9));
  root.style.setProperty('--win-scrollbar-thumb', colors.border.color);
  root.style.setProperty('--win-scrollbar-thumb-hover', colors.banner);
  root.style.setProperty('--win-active-border', colors.banner); // Using banner/accent color for active state
  root.style.setProperty('--win-controls-hover', colors.border.color);

  // Folder Icon Color (matches banner/accent)
  root.style.setProperty('--folder-color', colors.banner);
}

// Initial set
setTheme(builtInThemes.default);
