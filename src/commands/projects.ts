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
    const title = escapeHTML(ele[0]);
    const url = escapeHTML(ele[2]);
    const videoUrl = ele[4] ? escapeHTML(ele[4]) : undefined;
    const screenshots = ele[5] ? ele[5] as string[] : undefined;

    // Prepare arguments for openProjectWindow
    // We need to pass screenshots as a JS array literal string if it exists.
    // e.g. openProjectWindow('t', 'l', 'v', ['s1', 's2'])

    // Quote and escape strings for the array
    const screenshotsArg = screenshots
      ? `[${screenshots.map(s => `'${escapeHTML(s)}'`).join(', ')}]`
      : 'undefined';

    const videoArg = videoUrl ? `'${videoUrl}'` : 'undefined';

    const onClickCall = `window.openProjectWindow('${title}', '${url}', ${videoArg}, ${screenshotsArg})`;

    // WebDesktop Link (Main Click)
    let link = `<span class="command" style="cursor: pointer;" onclick="${onClickCall}">${title}</span>`;

    // External Icon (GitHub)
    let ext = `<a href="${url}" target="_blank" style="margin-left: 8px; text-decoration: none;"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;

    string += SPACE.repeat(2);
    string += link + ext;
    projects.push(string);
  });

  projects.push("<br>");
  return projects;
}

export const PROJECTS = createProject();
export { createProject };
