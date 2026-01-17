import command from '../../config.json';

const createSkills = (): string[] => {
    const skills: string[] = [];
    const SPACE = "&nbsp;";

    skills.push("<br>");

    if (command.skills) {
        const categories = [
            { key: 'languages', label: 'Languages' },
            { key: 'web', label: 'Web Technologies' },
            { key: 'ai_ml', label: 'AI/ML' },
            { key: 'tools', label: 'Tools' }
        ];

        categories.forEach((category) => {
            const key = category.key as keyof typeof command.skills;
            if (command.skills[key]) {
                let string = "";
                string += SPACE.repeat(2);
                string += `<span class='command'>${category.label}</span>`;
                skills.push(string);

                command.skills[key].forEach((skill: string) => {
                    string = "";
                    string += SPACE.repeat(4);
                    string += `- ${skill}`;
                    skills.push(string);
                });
                skills.push("<br>");
            }
        });
    }

    return skills;
}

export const SKILLS = createSkills();
