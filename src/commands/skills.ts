import command from '../../config.json';

export const getSkills = (): string[] => {
    const config = (window as any).config || command; // Use window config or imported default
    const skills: string[] = [];
    const SPACE = "&nbsp;";

    // Check for mobile
    const isMobile = window.innerWidth <= 600;

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
            const skillList = config.skills[key];

            if (skillList && skillList.length > 0) {
                let string = "";
                string += SPACE.repeat(2);
                string += `<span class='command'>${category.label}</span>`;
                skills.push(string);

                // Mobile or single column fallback
                if (isMobile) {
                    skillList.forEach((skill: string) => {
                        string = "";
                        string += SPACE.repeat(4);
                        string += `- ${skill}`;
                        skills.push(string);
                    });
                } else {
                    // Desktop: 2 Rows Layout
                    const total = skillList.length;
                    const cols = Math.ceil(total / 2); // Calculate number of columns needed for 2 rows

                    let row1 = SPACE.repeat(4);
                    let row2 = SPACE.repeat(4);

                    for (let i = 0; i < cols; i++) {
                        const idx1 = i;           // Row 1 item index
                        const idx2 = i + cols;    // Row 2 item index (aligned below idx1)

                        const item1 = skillList[idx1] || "";
                        const item2 = skillList[idx2] || "";

                        // Calculate column width required (max of item1 and item2 + gap)
                        const width = Math.max(item1.length, item2.length) + 4; // 4 spaces gap

                        const pad1 = width - item1.length;
                        const pad2 = width - item2.length;

                        // Append to rows
                        if (item1) {
                            row1 += `- ${item1}` + SPACE.repeat(pad1);
                        }
                        if (item2) {
                            row2 += `- ${item2}` + SPACE.repeat(pad2);
                        } else if (item1) {
                            // If no item2, we still pad row2 to keep alignment if we had further columns? 
                            // Actually row strings are independent lines. We just need visual alignment.
                            // But since we built it column by column, row2 string length needs to "catch up" if we want strictly table?
                            // No, text simple append works.
                            // Wait, if Col 1 has width 20.
                            // Row 1 adds "Item1" + 15 spaces.
                            // Row 2 adds "Item2" + 15 spaces.
                            // Next iter (Col 2), Row 1 adds "Item3". Row 2 adds "Item4".
                            // They will start at same horizontal position relative to start of line?
                            // Yes, because prev columns padded them to equal length.
                            // Correct.
                        }
                    }

                    skills.push(row1);
                    if (row2.trim() !== "") {
                        skills.push(row2);
                    }
                }
                skills.push("<br>");
            }
        });
    }

    return skills;
}

export const SKILLS = []; // Legacy compatibility if needed, but we should switch to getSkills call.

