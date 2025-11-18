# Sonic Identity Project - Setup Checklist

## Project File Created
✅ `/src/content/projects/sonic-identity.json` - Project #4 is ready

## Next Steps Required

### 1. Deploy the Prototype
The prototype needs to be deployed to get a live URL.

**Recommended options:**
- **Netlify** (easiest): `netlify deploy --prod`
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Via GitHub Actions

**Once deployed:**
- Update line 82 in `sonic-identity.json`
- Replace `"url": "DEPLOYMENT_URL_PLACEHOLDER"` with actual URL
- Example: `"url": "https://sonic-identity.netlify.app"`

### 2. Create Visual Assets
You need to create 5 images/videos and place them in `/public/assets/images/projects/`:

#### Required Assets:

1. **Hero image** (`sonic-identity-hero--processed.png`)
   - Screenshot of the 3D headphone model in default/neutral state
   - Show the full interface
   - Recommended size: 1920x1080 or 16:9 aspect ratio

2. **Demo video** (`sonic-identity-demo.webm`)
   - 15-30 second screen recording showing:
     - User rotating the 3D model (camera controls)
     - Switching between themes
     - Visual transitions between themes
   - Format: WebM (use tools like OBS, QuickTime + converter, or browser screen recorder)
   - Keep file size reasonable (<5MB if possible)

3. **Bass theme screenshot** (`sonic-identity-bass-theme--processed.png`)
   - Screenshot showing the bass-heavy theme active
   - Capture the warm colors and visual treatment

4. **Balanced theme screenshot** (`sonic-identity-balanced-theme--processed.png`)
   - Screenshot showing the balanced theme active
   - Neutral aesthetic

5. **Treble theme screenshot** (`sonic-identity-treble-theme--processed.png`)
   - Screenshot showing the treble-focused theme active
   - Cool color palette

#### Asset Creation Tips:
- Use browser DevTools to ensure consistent viewport size
- Take screenshots at 2x resolution for retina displays, then scale down
- Use consistent aspect ratios across all screenshots
- Export PNGs with optimization (use tools like ImageOptim, TinyPNG, or Squoosh)
- For video: Use HandBrake or FFmpeg to convert to WebM format

**Example FFmpeg command for video conversion:**
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 1M -c:a libopus sonic-identity-demo.webm
```

### 3. Verify Project Display

After adding assets, test the project appears correctly:

```bash
npm run dev
```

Then visit:
- **Portfolio listing**: http://localhost:4321/work
- **Project detail page**: http://localhost:4321/work/sonic-identity

Check that:
- ✅ Project appears as #4 in the portfolio grid
- ✅ All images load correctly
- ✅ Video plays smoothly
- ✅ Theme screenshots display properly
- ✅ Live link works (after deployment)
- ✅ Metrics, insights, and process sections render correctly

### 4. Build and Deploy Portfolio Site

Once everything looks good locally:

```bash
npm run build
npm run deploy  # or your deployment command
```

### 5. Optional: Add Web Audio API & GLSL Shaders

The current JSON mentions these as planned features. When you implement them:

1. Update the `technologies` array in `sonic-identity.json`:
```json
"technologies": [
  "three.js",
  "web audio api",
  "glsl shaders",
  "javascript (es6+)",
  "vite",
  "3d web graphics"
]
```

2. Update relevant sections:
   - Add to `tools` field
   - Mention in `solution` if EQ visualization is added
   - Update `insights` if new learnings emerge

---

## Project Content Summary

**Framing:** Transparent about speculative nature, positioned as capability demonstration
**Tone:** Professional, confident, forward-looking
**Key strengths:**
- Shows 3D web development capability
- Demonstrates creative + technical skills
- Frames prototype work as valuable learning
- Positions browser-based 3D as production-ready

**What to highlight when sharing:**
- Interactive brand experience design
- Performance-optimized 3D rendering (60fps)
- Creative coding + UX design intersection
- Initiative (built beyond client scope)

---

## Technical Notes

**Schema compliance:** ✅ All required fields present
**Validation:** ✅ JSON syntax valid
**Naming conventions:** ✅ Follows existing pattern
**Asset paths:** ✅ Uses standard `/assets/images/projects/` structure
**Featured status:** ✅ Will appear in main portfolio

**File references in codebase:**
- Schema: `/src/content/config.ts`
- Display component: `/src/components/sections/Projects.astro`
- Listing page: `/src/pages/work/index.astro`
- Detail page: `/src/pages/work/[slug].astro`

---

## Placeholder that needs updating:

**Line 82:** `"url": "DEPLOYMENT_URL_PLACEHOLDER"`

Once you have the deployment URL, run:
```bash
# Edit the file and replace the placeholder
# Or use this quick sed command (macOS):
sed -i '' 's|DEPLOYMENT_URL_PLACEHOLDER|https://your-actual-url.com|g' src/content/projects/sonic-identity.json
```

---

## Questions?

If you need to adjust any content:
- Technology stack: Update `technologies` and `tools` fields
- Metrics: Update `metrics` array with actual performance data
- Timeline: Adjust `duration` field
- Process: Add/edit steps in `process` array
- Features: Update `solution` and `insights` to reflect actual implementation

The project is ready to go once assets are created and deployment is complete!
