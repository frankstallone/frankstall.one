export const buildHierarchy = (headings: any) => {
  const toc: any[] = [];
  const parentHeadings = new Map();

  if (!headings) return toc;

  headings.forEach((h: any) => {
    const heading = { ...h, subheadings: [] };
    parentHeadings.set(heading.depth, heading);
    // Change 2 to 1 if your markdown includes your <h1>
    if (heading.depth === 2) {
      toc.push(heading);
    } else {
      const parent = parentHeadings.get(heading.depth - 1);
      if (parent) {
        parent.subheadings.push(heading);
      } else {
        toc.push(heading);
      }
    }
  });
  return toc;
};
