import command from '../../config.json';

const createProject = (): string[] => {
  const projects: string[] = [];
  const files = `${command.projects.length} File(s)`;
  const SPACE = "&nbsp;";

  projects.push("<br>")

  // Calculate max length for alignment
  let maxLength = 0;
  command.projects.forEach((ele) => {
    if (ele[0].length > maxLength) {
      maxLength = ele[0].length;
    }
  });

  // Add buffer
  maxLength += 2;

  command.projects.forEach((ele) => {
    let string = "";
    let link = `<a href="${ele[2]}" target="_blank">${ele[0]} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
    string += SPACE.repeat(2);
    string += link;
    // Ensure repeat count is never negative
    const padding = Math.max(0, maxLength - ele[0].length);
    string += SPACE.repeat(padding);
    string += ele[1];
    projects.push(string);
  });

  projects.push("<br>");
  projects.push(files);
  projects.push("<br>");
  return projects
}

export const PROJECTS = createProject()
