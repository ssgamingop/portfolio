
export class CommandDispatcher {
    private commands: Map<string, (args: string[]) => void> = new Map();

    public register(name: string, handler: (args: string[]) => void) {
        this.commands.set(name, handler);
    }

    public dispatch(input: string): boolean {
        const parts = input.trim().split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (this.commands.has(commandName)) {
            const handler = this.commands.get(commandName);
            if (handler) {
                handler(args);
                return true;
            }
        }
        return false;
    }

    public getCommandNames(): string[] {
        return Array.from(this.commands.keys());
    }
}
