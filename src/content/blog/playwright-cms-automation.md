---
title: "Automating CMS Workflows with Playwright"
description: "How I used browser automation to fix hundreds of broken links in a fraction of the time it would have taken manually."
publishDate: 2025-06-11
author: "Joel Lithgow"
tags: ["automation", "testing", "playwright", "wagtail", "qa"]
type: "article"
featured: false
draft: false
---

When our IT team updated the internal intranet search engine, they changed all the URL parameters and query structures. Suddenly, hundreds of links across our marketing site were going to break. The links were scattered throughout our Wagtail CMS—embedded in rich text fields, inline links, and various other content blocks.

The initial estimate for manual remediation? Several weeks of tedious copy-paste work.

I finished it in a day.

## The Problem

URL migrations are deceptively complex. It's not just finding and replacing text in a database—links in a CMS live in:

- **Rich text fields** where they're wrapped in HTML anchor tags
- **Inline links** within body content that might have surrounding text
- **Structured content blocks** with their own schemas
- **StreamField components** (Wagtail's flexible content system)

A simple find-and-replace query wouldn't cut it. Each link needed to be found in context, the new URL structure applied, and the change saved back through the CMS interface to maintain proper revision history and trigger any associated workflows.

## Why Playwright?

I chose [Playwright](https://playwright.dev/) for this automation task for several reasons:

1. **Real browser automation**: Unlike HTTP-based approaches, Playwright actually drives a browser. This means JavaScript-rendered content, authentication flows, and dynamic CMS interfaces work correctly.

2. **Modern API**: Playwright's async/await syntax and auto-waiting make tests reliable without explicit sleeps or waits.

3. **Cross-browser support**: Though not critical for this task, knowing the same code works across Chromium, Firefox, and WebKit is reassuring.

4. **Debugging tools**: Playwright's trace viewer and codegen features made development much faster.

## The Approach

### 1. Audit First

Before writing any automation, I exported all pages with their content to identify exactly which links needed updating. This gave me:

- A complete inventory of affected URLs
- The specific pages where each link appeared
- The context around each link (rich text, structured block, etc.)

### 2. Authentication Handling

Wagtail requires authentication, so the first step was handling login. Playwright's persistent context feature meant I could authenticate once and reuse the session:

```typescript
const context = await browser.newContext({
  storageState: 'auth.json' // Saved session state
});
```

### 3. Navigating the CMS

Each page edit followed a predictable pattern:

1. Navigate to the page's edit URL in Wagtail admin
2. Locate the content blocks containing links
3. Find links matching the old URL pattern
4. Update to the new URL structure
5. Save (or save as draft for review)

### 4. Rich Text Handling

Rich text fields were the trickiest part. Wagtail's Draftail editor stores content as structured data, but Playwright sees the rendered HTML. The solution was to:

1. Click into the rich text field to activate it
2. Use browser developer tools to understand the DOM structure
3. Target link elements directly and update their href attributes
4. Ensure the editor registered the changes

```typescript
// Find links in rich text that match our pattern
const oldPattern = 'intranet.example.com/search?';
const links = await page.locator(`a[href*="${oldPattern}"]`);

for (const link of await links.all()) {
  const oldHref = await link.getAttribute('href');
  const newHref = transformUrl(oldHref); // Apply URL mapping
  await link.evaluate((el, newUrl) => {
    el.setAttribute('href', newUrl);
  }, newHref);
}
```

### 5. Verification

After each batch, I ran a verification pass to confirm:

- Links were updated to the correct new format
- No unintended changes were made
- Page content remained otherwise intact

## Results

What was estimated as weeks of manual work took about a day:

- **Setup and testing**: ~4 hours
- **Running the automation**: ~2 hours (with manual spot-checks)
- **Verification and cleanup**: ~2 hours

Beyond the time savings, automation eliminated the human error factor. Manual copy-paste across hundreds of links would inevitably introduce typos or missed items. The automated approach was consistent and verifiable.

## Lessons Learned

### When to Automate

Not every repetitive task deserves automation. The decision factors:

- **Volume**: 10-20 items? Maybe just do it manually. 100+? Automation pays off.
- **Complexity**: Simple tasks compound quickly. Complex tasks might take longer to automate than to do by hand.
- **Error cost**: If mistakes are costly to fix, automation's consistency becomes valuable.
- **Recurrence**: One-time task vs. recurring need affects ROI significantly.

### Test Your Transformations

Before running automation on production, I tested the URL transformation logic extensively on a subset of known URLs. Edge cases like query parameters with special characters, URLs with fragments, and already-updated URLs needed handling.

### Keep Humans in the Loop

For this project, I ran the automation in batches with manual verification between runs. This caught a few edge cases the initial logic missed and gave stakeholders confidence in the process.

### Document Everything

Automation scripts are technical debt if they're not documented. I created a README explaining:

- What the script does
- How to run it
- What environment variables/config are needed
- Known limitations

## Beyond This Project

This experience reinforced my belief that QA thinking extends beyond testing into process improvement. The same mindset that asks "how do we verify this works correctly?" also asks "how do we do this efficiently and reliably?"

Playwright has since become a regular tool in my toolkit—not just for testing, but for any task where browser automation makes sense. The investment in learning it continues to pay dividends.

---

*Interested in discussing automation strategies or Playwright specifically? Feel free to [reach out](/about#contact).*
