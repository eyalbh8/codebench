
function extractJsonFromOutput(content: string): string {
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '');
      cleanContent = cleanContent.replace(/\n?```\s*$/, '');
    } else {
      // look for any ```json ... ``` block inside the text
      const match = cleanContent.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
      if (match) {
        cleanContent = match[1].trim();
      }
    }
    return cleanContent;
  }