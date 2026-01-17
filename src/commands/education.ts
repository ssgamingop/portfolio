import command from '../../config.json';

const createEducation = (): string[] => {
    const education: string[] = [];
    const SPACE = "&nbsp;";

    education.push("<br>");

    if (command.education) {
        command.education.forEach((edu: any) => {
            let string = "";
            string += SPACE.repeat(2);
            string += `<span class='command'>${edu.degree}</span>`;
            education.push(string);

            string = "";
            string += SPACE.repeat(4);
            string += `${edu.institution}`;
            education.push(string);

            string = "";
            string += SPACE.repeat(4);
            string += `${edu.period}`;
            education.push(string);

            education.push("<br>");
        });
    }

    return education;
}

export const EDUCATION = createEducation();
