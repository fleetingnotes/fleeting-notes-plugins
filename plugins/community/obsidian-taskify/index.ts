// Fleeting Notes plugin to convert simple checkbox tasks to Obsidian Task format
// kjarnot - 2024-01-28

function formatISODate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default async (request: Request): Promise<Response> => {
    const json = await request.json();
    const note = json['note'];
    const content: string = note?.content || "";
    let today = new Date();
    let todayISO = formatISODate(today);

    if (!note) {
        return new Response("Couldn't find note in request", { status: 400 });
    }

    // Step through each line in content and look for checkboxes
    const lines = content.split('\n');
    const newlines : string[] = [];
    for (let line of lines) {
        console.log('line = ' + line);
        let newline = '';

        // Is this a checkbox task?
        if (line.startsWith('- [ ] ')) {
            // Look for the ➕ emoji.  If it is not in line, we need to format the line.
            if (!line.includes('➕')) {
                // Get the text after the checkbox
                const text = line.substring(6);

                // If text ends with a date in the format YYYY-MM-DD, then we need to split
                // the line into two lines, one with the date and one with the text.
                const dateRegex = /\d{4}-\d{2}-\d{2}/;
                const dateMatch = text.match(dateRegex);
                if (dateMatch) {
                    const date = dateMatch[0];
                    const textWithoutDate = text.replace(date, '').trim();
                    newline = `- [ ] ${textWithoutDate} ➕ ${todayISO} 📅 ${date}`;
                } else {
                    newline = `- [ ] ${text} ➕ ${todayISO}`;
                }
                console.log('Pushing newline = ' + newline);
                newlines.push(newline);
            } else {
                // Just add the current line to the newlines array
                console.log('Pushing line = ' + line);
                newlines.push(line);
            }
        }
    }
    const newcontent = newlines.join('\n');
    note.content = newcontent;
    console.log('note = ' + JSON.stringify(note));
    return new Response(JSON.stringify(note));
};
