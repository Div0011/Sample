const fs = require('fs');
let css = fs.readFileSync('c:/Users/divya/.vscode/pitch/virsat-chai/styles.css', 'utf8');

css = css.replace(/:root\s*\{[\s\S]*?--ease-out: cubic-bezier\(0\.16, 1, 0\.3, 1\);\s*\}/, `:root {
    /* Modern Minimalist Colors */
    --clr-terracotta: #E07A5F;
    --clr-navy: #3D405B;
    --clr-slate: #2D2D2D;
    --clr-sprout: #81B29A;

    --bg-color: #F4F1DE;
    --text-color: var(--clr-slate);
    --text-muted: #5A5A5A;
    --border-color: #E2DFCA;

    /* Brew Colors */
    --bg-brew-black: #6B2D26; /* Deep red for black tea */
    --text-brew-black: #F4F1DE;
    --bg-brew-green: #EADCA6; /* Pale yellow */
    --text-brew-green: #2D2D2D;

    --font-heading: 'Instrument Serif', serif;
    --font-body: 'Manrope', sans-serif;

    --spacing-sm: 1rem;
    --spacing-md: 2.5rem;
    --spacing-lg: 7rem;
    --spacing-xl: 14rem;

    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}`);

// Mapping old colors to new ones
css = css.replace(/var\(--clr-red-orange\)/g, 'var(--clr-terracotta)'); /* Was primary accent -> Terracotta */
css = css.replace(/var\(--clr-java\)/g, 'var(--clr-navy)'); /* Was dark roast (text/headings) -> let's make it Navy */
css = css.replace(/var\(--clr-dark-green\)/g, 'var(--clr-navy)'); /* Navy for headings */
css = css.replace(/var\(--clr-campsite\)/g, 'var(--clr-terracotta)'); /* Terracotta for buttons/brand */
css = css.replace(/var\(--clr-warm-olive\)/g, 'var(--clr-sprout)'); /* Sprout green for accents/eyebrows */

// Update transparency backgrounds (244, 239, 230 was the old bg #F4EFE6)
// New bg is #F4F1DE (244, 241, 222)
css = css.replace(/244,\s*239,\s*230/g, '244, 241, 222');

// Text color might need specific attention depending on where java was used
// --text-color is in root.

fs.writeFileSync('c:/Users/divya/.vscode/pitch/virsat-chai/styles.css', css);
