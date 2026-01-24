import command from '../../config.json';

const createAbout = (): string[] => {
  const about: string[] = [];

  const SPACE = "&nbsp;";

  const EMAIL = "Email";
  const GITHUB = "Github";
  const LINKEDIN = "Linkedin";

  const email = `<i class='fa-solid fa-envelope'></i> ${EMAIL}`;
  const github = `<i class='fa-brands fa-github'></i> ${GITHUB}`;
  const linkedin = `<i class='fa-brands fa-linkedin'></i> ${LINKEDIN}`;
  let string = "";

  about.push("<br>");
  about.push(command.aboutGreeting);
  about.push("<br>");

  // Professional Summary
  about.push("Building modern web apps with React, Node.js, and AI integrations.");
  about.push("<br>");
  about.push("I think about layout, interaction, and logic as parts of the same system.");
  about.push("<br>"); 
  about.push("I like having control from idea to implementation.");
  about.push("<br>");
  about.push("Most of my learning comes from building, experimenting, ");
  about.push("and refining how things work together.");
  about.push("<br>");

  string += SPACE.repeat(2);
  string += email;
  string += SPACE.repeat(Math.max(0, 17 - EMAIL.length));
  string += `<a target='_blank' href='mailto:${command.social.email}'>${command.social.email}</a>`;
  about.push(string);

  string = '';
  string += SPACE.repeat(2);
  string += github;
  string += SPACE.repeat(Math.max(0, 17 - GITHUB.length));
  string += `<a target='_blank' href='${command.social.github}'>${command.social.github}</a>`;
  about.push(string);

  string = '';
  string += SPACE.repeat(2);
  string += linkedin;
  string += SPACE.repeat(Math.max(0, 17 - LINKEDIN.length));
  string += `<a target='_blank' href='${command.social.linkedin}'>${command.social.linkedin}</a>`;
  about.push(string);

  about.push("<br>");
  return about
}

export const ABOUT = createAbout();
