import command from '../../config.json';

export const getSkills = (): string[] => {
    const config = (window as any).config || command;
    const skills: string[] = [];
    const SPACE = "&nbsp;";

    skills.push("<br>");

    if (config.skills) {
        const categories = [
            { key: 'languages', label: 'Languages' },
            { key: 'web', label: 'Web Technologies' },
            { key: 'backend', label: 'Backend' },
            { key: 'ai_ml', label: 'AI/ML' },
            { key: 'tools', label: 'Tools' }
        ];

        categories.forEach((category) => {
            const key = category.key as keyof typeof config.skills;
            // The type handling here might need adjustment if TS strictly checks config structure vs original json import
            // treating as any for flexibility since we just changed json
            const skillList = config.skills[key] as any[];

            if (skillList && skillList.length > 0) {
                let string = "";
                // Category header
                string += SPACE.repeat(2);
                string += `<span class='command'>${category.label}</span>`;
                skills.push(string);

                // Find max length of name for alignment
                // We want: "- Name   Description"
                // So we need to pad Name to max length + gap
                let maxNameLen = 0;
                skillList.forEach((item: any) => {
                    const name = typeof item === 'string' ? item : item.name;
                    if (name.length > maxNameLen) maxNameLen = name.length;
                });

                const gap = 4; // spaces between name and desc

                skillList.forEach((item: any) => {
                    const name = typeof item === 'string' ? item : item.name;
                    const desc = typeof item === 'string' ? "" : item.desc;

                    let line = "";
                    line += SPACE.repeat(4);
                    line += `- ${name}`;

                    if (desc) {
                        const padding = (maxNameLen - name.length) + gap;
                        line += SPACE.repeat(padding);
                        line += `<span class='desy'>${desc}</span>`; // 'desy' class might need to be defined or just use color span
                        // Actually, let's use a known class or standard color. 'command' is blueish. 
                        // Let's rely on default text color or a specific dim color.
                        // Since I can't easily add css right now without moving files, I'll style it inline or use existing.
                        // But wait, I am restructuring files in next step. I can add css there.
                        // For now let's just output text.
                    }
                    skills.push(line);
                });
                skills.push("<br>");
            }
        });
    }

    return skills;
}

export const SKILLS = []; // Legacy compatibility if needed, but we should switch to getSkills call.

