import command from '../../config.json';
import { escapeHTML } from '../utils';

const createProject = (args?: string[]): string[] => {
  const projects: string[] = [];

  if (args && args.includes('--gui')) {
    (window as any).openProjectExplorer();
    return ["Opening Project Explorer..."];
  }

  const SPACE = "&nbsp;";

  projects.push("<br>")

  command.projects.forEach((ele: any[]) => {
    let string = "";
    // Config: [Title, Desc, Link, Img, Video, Screenshots[]]
    const rawTitle = ele[0];
    const rawUrl = ele[2];
    const rawVideoUrl = ele[4];
    const rawScreenshots = ele[5];

    // For Display: standard HTML escaping
    const displayTitle = escapeHTML(rawTitle);

    // For JS Arguments (inside onclick):
    // 1. JSON.stringify() to get a valid JS string literal (e.g. "It's time")
    // 2. escapeHTML() to make it safe to sit inside an HTML attribute (encodes " to &quot;)
    const jsTitle = escapeHTML(JSON.stringify(rawTitle));
    const jsUrl = escapeHTML(JSON.stringify(rawUrl));

    const jsVideo = rawVideoUrl
      ? escapeHTML(JSON.stringify(rawVideoUrl))
      : 'undefined';

    const jsScreenshots = rawScreenshots
      ? escapeHTML(JSON.stringify(rawScreenshots))
      : 'undefined';

    const onClickCall = `window.openProjectWindow(${jsTitle}, ${jsUrl}, ${jsVideo}, ${jsScreenshots})`;

    // WebDesktop Link (Main Click)
    let link = `<span class="command" style="cursor: pointer;" onclick="${onClickCall}">${displayTitle}</span>`;

    // External Icon (GitHub) - rawUrl ok here because it's inside href="..." which browsers handle if standardly quoted, 
    // but better to escapeHTML(rawUrl) for safety in case of double quotes in URL.
    let ext = `<a href="${escapeHTML(rawUrl)}" target="_blank" style="margin-left: 8px; text-decoration: none;"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;

    string += SPACE.repeat(2);
    string += link + ext;
    projects.push(string);
  });

  projects.push("<br>");
  return projects;
}

export const PROJECTS = createProject();
export { createProject };
