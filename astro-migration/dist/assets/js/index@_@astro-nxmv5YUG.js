var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { a as createComponent, m as maybeRenderHead, b as renderScript, e as addAttribute, d as renderTemplate, c as createAstro, A as AstroError, U as UnknownContentCollectionError, R as RenderUndefinedEntryError, u as unescapeHTML, f as renderUniqueStylesheet, g as renderScriptElement, h as createHeadAndContent, r as renderComponent } from "./astro/server-CBzQw8Wf.js";
import "kleur/colors";
import { $ as $$BaseLayout } from "./BaseLayout-CTae8Gnc.js";
import "clsx";
/* empty css                        */
import { escape } from "html-escaper";
import { Traverse } from "neotraverse/modern";
import pLimit from "p-limit";
import { z } from "zod";
import { removeBase, isRemotePath, prependForwardSlash } from "@astrojs/internal-helpers/path";
import * as devalue from "devalue";
import "../../renderers.mjs";
const $$Navigation = createComponent(($$result, $$props, $$slots) => {
  const navItems = [
    { href: "#work", label: "work", description: "View my recent projects and case studies" },
    { href: "#process", label: "process", description: "Learn about my design and development process" },
    { href: "#about", label: "about", description: "Read about my background and skills" },
    { href: "#contact", label: "contact", description: "Get in touch for collaboration opportunities" }
  ];
  return renderTemplate`${maybeRenderHead()}<nav class="nav" role="navigation" aria-label="Main navigation" data-astro-cid-pux6a34n> <div class="nav-links" data-astro-cid-pux6a34n> ${navItems.map((item) => renderTemplate`<a${addAttribute(item.href, "href")} class="nav-link"${addAttribute(`${item.label}-description`, "aria-describedby")} data-astro-cid-pux6a34n> ${item.label} </a>`)} </div> <!-- Hidden descriptions for screen readers --> <div class="sr-only" data-astro-cid-pux6a34n> ${navItems.map((item) => renderTemplate`<div${addAttribute(`${item.label}-description`, "id")} data-astro-cid-pux6a34n>${item.description}</div>`)} </div> </nav>  ${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/Navigation.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/Navigation.astro", void 0);
const $$Astro$6 = createAstro("https://joellithgow.com");
const $$Hero = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Hero;
  const {
    title = "Joel Lithgow",
    subtitle = "I help people think visually",
    description = "I turn abstract ideas into clear visuals. Whether it's a complex process, a new product concept, or a data story - I help make the invisible visible so teams can understand and build together.",
    badgeText = "creative technologist",
    ctaText = "view my work",
    ctaHref = "#work"
  } = Astro2.props;
  const floatingElements = [
    {
      id: 1,
      text: "currently: building the future",
      class: "floating-element-1"
    },
    {
      id: 2,
      text: "status: open to opportunities",
      class: "floating-element-2"
    },
    {
      id: 3,
      text: "location: everywhere",
      class: "floating-element-3"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="hero" aria-labelledby="hero-heading" data-astro-cid-bbe6dxrz> <div class="hero-content" data-astro-cid-bbe6dxrz> <div class="hero-badge" aria-label="Professional role" data-astro-cid-bbe6dxrz>${badgeText}</div> <h1 id="hero-heading" class="main-title" data-astro-cid-bbe6dxrz>${title}</h1> <p class="subtitle" data-astro-cid-bbe6dxrz>${subtitle}</p> <div class="hero-description" data-astro-cid-bbe6dxrz> ${description} </div> <div class="hero-actions" data-astro-cid-bbe6dxrz> <a${addAttribute(ctaHref, "href")} class="cta-button" aria-describedby="work-cta-description" data-astro-cid-bbe6dxrz> ${ctaText} </a> <button id="themeControl" class="theme-control" aria-label="Open theme selector" aria-expanded="false" aria-controls="themeModal" title="Press Ctrl+T to cycle themes" data-astro-cid-bbe6dxrz> <div class="theme-control-text" data-astro-cid-bbe6dxrz> <span aria-hidden="true" data-astro-cid-bbe6dxrz>⚙</span> <span data-astro-cid-bbe6dxrz>themes</span> </div> </button> <div id="work-cta-description" class="sr-only" data-astro-cid-bbe6dxrz>
Explore my recent projects and case studies
</div> </div> </div> <!-- Floating Elements --> <div class="floating-elements" aria-hidden="true" data-astro-cid-bbe6dxrz> ${floatingElements.map((element) => renderTemplate`<div${addAttribute(`floating-element ${element.class}`, "class")} tabindex="0" role="img"${addAttribute(`Floating element: ${element.text}`, "aria-label")} data-astro-cid-bbe6dxrz> ${element.text} </div>`)} </div> </section>  ${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/Hero.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/Hero.astro", void 0);
const CONTENT_IMAGE_FLAG = "astroContentImageFlag";
const IMAGE_IMPORT_PREFIX = "__ASTRO_IMAGE_";
const VALID_INPUT_FORMATS = [
  "jpeg",
  "jpg",
  "png",
  "tiff",
  "webp",
  "gif",
  "svg",
  "avif"
];
const VALID_SUPPORTED_FORMATS = [
  "jpeg",
  "jpg",
  "png",
  "tiff",
  "webp",
  "gif",
  "svg",
  "avif"
];
const DEFAULT_OUTPUT_FORMAT = "webp";
const DEFAULT_HASH_PROPS = [
  "src",
  "width",
  "height",
  "format",
  "quality",
  "fit",
  "position"
];
function imageSrcToImportId(imageSrc, filePath) {
  imageSrc = removeBase(imageSrc, IMAGE_IMPORT_PREFIX);
  if (isRemotePath(imageSrc)) {
    return;
  }
  const ext = imageSrc.split(".").at(-1)?.toLowerCase();
  if (!ext || !VALID_INPUT_FORMATS.includes(ext)) {
    return;
  }
  const params = new URLSearchParams(CONTENT_IMAGE_FLAG);
  if (filePath) {
    params.set("importer", filePath);
  }
  return `${imageSrc}?${params.toString()}`;
}
class ImmutableDataStore {
  constructor() {
    __publicField(this, "_collections", /* @__PURE__ */ new Map());
    this._collections = /* @__PURE__ */ new Map();
  }
  get(collectionName, key) {
    return this._collections.get(collectionName)?.get(String(key));
  }
  entries(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.entries()];
  }
  values(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.values()];
  }
  keys(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.keys()];
  }
  has(collectionName, key) {
    const collection = this._collections.get(collectionName);
    if (collection) {
      return collection.has(String(key));
    }
    return false;
  }
  hasCollection(collectionName) {
    return this._collections.has(collectionName);
  }
  collections() {
    return this._collections;
  }
  /**
   * Attempts to load a DataStore from the virtual module.
   * This only works in Vite.
   */
  static async fromModule() {
    try {
      const data = await import("./_astro_data-layer-content-BZ2ewiF1.js");
      if (data.default instanceof Map) {
        return ImmutableDataStore.fromMap(data.default);
      }
      const map = devalue.unflatten(data.default);
      return ImmutableDataStore.fromMap(map);
    } catch {
    }
    return new ImmutableDataStore();
  }
  static async fromMap(data) {
    const store = new ImmutableDataStore();
    store._collections = data;
    return store;
  }
}
function dataStoreSingleton() {
  let instance = void 0;
  return {
    get: async () => {
      if (!instance) {
        instance = ImmutableDataStore.fromModule();
      }
      return instance;
    },
    set: (store) => {
      instance = store;
    }
  };
}
const globalDataStore = dataStoreSingleton();
const __vite_import_meta_env__ = { "ASSETS_PREFIX": void 0, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": "https://joellithgow.com", "SSR": true };
function createCollectionToGlobResultMap({
  globResult,
  contentDir: contentDir2
}) {
  const collectionToGlobResultMap = {};
  for (const key in globResult) {
    const keyRelativeToContentDir = key.replace(new RegExp(`^${contentDir2}`), "");
    const segments = keyRelativeToContentDir.split("/");
    if (segments.length <= 1) continue;
    const collection = segments[0];
    collectionToGlobResultMap[collection] ?? (collectionToGlobResultMap[collection] = {});
    collectionToGlobResultMap[collection][key] = globResult[key];
  }
  return collectionToGlobResultMap;
}
z.object({
  tags: z.array(z.string()).optional(),
  maxAge: z.number().optional(),
  lastModified: z.date().optional()
});
function createGetCollection({
  contentCollectionToEntryMap: contentCollectionToEntryMap2,
  dataCollectionToEntryMap: dataCollectionToEntryMap2,
  getRenderEntryImport,
  cacheEntriesByCollection: cacheEntriesByCollection2,
  liveCollections: liveCollections2
}) {
  return async function getCollection2(collection, filter) {
    if (collection in liveCollections2) {
      throw new AstroError({
        ...UnknownContentCollectionError,
        message: `Collection "${collection}" is a live collection. Use getLiveCollection() instead of getCollection().`
      });
    }
    const hasFilter = typeof filter === "function";
    const store = await globalDataStore.get();
    let type;
    if (collection in contentCollectionToEntryMap2) {
      type = "content";
    } else if (collection in dataCollectionToEntryMap2) {
      type = "data";
    } else if (store.hasCollection(collection)) {
      const { default: imageAssetMap } = await import("./content-assets-CPbsr5sg.js");
      const result = [];
      for (const rawEntry of store.values(collection)) {
        const data = updateImageReferencesInData(rawEntry.data, rawEntry.filePath, imageAssetMap);
        let entry = {
          ...rawEntry,
          data,
          collection
        };
        if (entry.legacyId) {
          entry = emulateLegacyEntry(entry);
        }
        if (hasFilter && !filter(entry)) {
          continue;
        }
        result.push(entry);
      }
      return result;
    } else {
      console.warn(
        `The collection ${JSON.stringify(
          collection
        )} does not exist or is empty. Please check your content config file for errors.`
      );
      return [];
    }
    const lazyImports = Object.values(
      type === "content" ? contentCollectionToEntryMap2[collection] : dataCollectionToEntryMap2[collection]
    );
    let entries = [];
    if (!Object.assign(__vite_import_meta_env__, { _: process.env._ })?.DEV && cacheEntriesByCollection2.has(collection)) {
      entries = cacheEntriesByCollection2.get(collection);
    } else {
      const limit = pLimit(10);
      entries = await Promise.all(
        lazyImports.map(
          (lazyImport) => limit(async () => {
            const entry = await lazyImport();
            return type === "content" ? {
              id: entry.id,
              slug: entry.slug,
              body: entry.body,
              collection: entry.collection,
              data: entry.data,
              async render() {
                return render({
                  collection: entry.collection,
                  id: entry.id,
                  renderEntryImport: await getRenderEntryImport(collection, entry.slug)
                });
              }
            } : {
              id: entry.id,
              collection: entry.collection,
              data: entry.data
            };
          })
        )
      );
      cacheEntriesByCollection2.set(collection, entries);
    }
    if (hasFilter) {
      return entries.filter(filter);
    } else {
      return entries.slice();
    }
  };
}
function emulateLegacyEntry({ legacyId, ...entry }) {
  const legacyEntry = {
    ...entry,
    id: legacyId,
    slug: entry.id
  };
  return {
    ...legacyEntry,
    // Define separately so the render function isn't included in the object passed to `renderEntry()`
    render: () => renderEntry(legacyEntry)
  };
}
const CONTENT_LAYER_IMAGE_REGEX = /__ASTRO_IMAGE_="([^"]+)"/g;
async function updateImageReferencesInBody(html, fileName) {
  const { default: imageAssetMap } = await import("./content-assets-CPbsr5sg.js");
  const imageObjects = /* @__PURE__ */ new Map();
  const { getImage } = await import("./_astro_assets-DCf0cMBG.js").then((n) => n._);
  for (const [_full, imagePath] of html.matchAll(CONTENT_LAYER_IMAGE_REGEX)) {
    try {
      const decodedImagePath = JSON.parse(imagePath.replaceAll("&#x22;", '"'));
      let image;
      if (URL.canParse(decodedImagePath.src)) {
        image = await getImage(decodedImagePath);
      } else {
        const id = imageSrcToImportId(decodedImagePath.src, fileName);
        const imported = imageAssetMap.get(id);
        if (!id || imageObjects.has(id) || !imported) {
          continue;
        }
        image = await getImage({ ...decodedImagePath, src: imported });
      }
      imageObjects.set(imagePath, image);
    } catch {
      throw new Error(`Failed to parse image reference: ${imagePath}`);
    }
  }
  return html.replaceAll(CONTENT_LAYER_IMAGE_REGEX, (full, imagePath) => {
    const image = imageObjects.get(imagePath);
    if (!image) {
      return full;
    }
    const { index, ...attributes } = image.attributes;
    return Object.entries({
      ...attributes,
      src: image.src,
      srcset: image.srcSet.attribute,
      // This attribute is used by the toolbar audit
      ...Object.assign(__vite_import_meta_env__, { _: process.env._ }).DEV ? { "data-image-component": "true" } : {}
    }).map(([key, value]) => value ? `${key}="${escape(value)}"` : "").join(" ");
  });
}
function updateImageReferencesInData(data, fileName, imageAssetMap) {
  return new Traverse(data).map(function(ctx, val) {
    if (typeof val === "string" && val.startsWith(IMAGE_IMPORT_PREFIX)) {
      const src = val.replace(IMAGE_IMPORT_PREFIX, "");
      const id = imageSrcToImportId(src, fileName);
      if (!id) {
        ctx.update(src);
        return;
      }
      const imported = imageAssetMap?.get(id);
      if (imported) {
        ctx.update(imported);
      } else {
        ctx.update(src);
      }
    }
  });
}
async function renderEntry(entry) {
  if (!entry) {
    throw new AstroError(RenderUndefinedEntryError);
  }
  if ("render" in entry && !("legacyId" in entry)) {
    return entry.render();
  }
  if (entry.deferredRender) {
    try {
      const { default: contentModules } = await import("./content-modules-DSTobNK3.js");
      const renderEntryImport = contentModules.get(entry.filePath);
      return render({
        collection: "",
        id: entry.id,
        renderEntryImport
      });
    } catch (e) {
      console.error(e);
    }
  }
  const html = entry?.rendered?.metadata?.imagePaths?.length && entry.filePath ? await updateImageReferencesInBody(entry.rendered.html, entry.filePath) : entry?.rendered?.html;
  const Content = createComponent(() => renderTemplate`${unescapeHTML(html)}`);
  return {
    Content,
    headings: entry?.rendered?.metadata?.headings ?? [],
    remarkPluginFrontmatter: entry?.rendered?.metadata?.frontmatter ?? {}
  };
}
async function render({
  collection,
  id,
  renderEntryImport
}) {
  const UnexpectedRenderError = new AstroError({
    ...UnknownContentCollectionError,
    message: `Unexpected error while rendering ${String(collection)} → ${String(id)}.`
  });
  if (typeof renderEntryImport !== "function") throw UnexpectedRenderError;
  const baseMod = await renderEntryImport();
  if (baseMod == null || typeof baseMod !== "object") throw UnexpectedRenderError;
  const { default: defaultMod } = baseMod;
  if (isPropagatedAssetsModule(defaultMod)) {
    const { collectedStyles, collectedLinks, collectedScripts, getMod } = defaultMod;
    if (typeof getMod !== "function") throw UnexpectedRenderError;
    const propagationMod = await getMod();
    if (propagationMod == null || typeof propagationMod !== "object") throw UnexpectedRenderError;
    const Content = createComponent({
      factory(result, baseProps, slots) {
        let styles = "", links = "", scripts = "";
        if (Array.isArray(collectedStyles)) {
          styles = collectedStyles.map((style) => {
            return renderUniqueStylesheet(result, {
              type: "inline",
              content: style
            });
          }).join("");
        }
        if (Array.isArray(collectedLinks)) {
          links = collectedLinks.map((link) => {
            return renderUniqueStylesheet(result, {
              type: "external",
              src: prependForwardSlash(link)
            });
          }).join("");
        }
        if (Array.isArray(collectedScripts)) {
          scripts = collectedScripts.map((script) => renderScriptElement(script)).join("");
        }
        let props = baseProps;
        if (id.endsWith("mdx")) {
          props = {
            components: propagationMod.components ?? {},
            ...baseProps
          };
        }
        return createHeadAndContent(
          unescapeHTML(styles + links + scripts),
          renderTemplate`${renderComponent(
            result,
            "Content",
            propagationMod.Content,
            props,
            slots
          )}`
        );
      },
      propagation: "self"
    });
    return {
      Content,
      headings: propagationMod.getHeadings?.() ?? [],
      remarkPluginFrontmatter: propagationMod.frontmatter ?? {}
    };
  } else if (baseMod.Content && typeof baseMod.Content === "function") {
    return {
      Content: baseMod.Content,
      headings: baseMod.getHeadings?.() ?? [],
      remarkPluginFrontmatter: baseMod.frontmatter ?? {}
    };
  } else {
    throw UnexpectedRenderError;
  }
}
function isPropagatedAssetsModule(module) {
  return typeof module === "object" && module != null && "__astroPropagation" in module;
}
const liveCollections = {};
const contentDir = "/src/content/";
const contentEntryGlob = "";
const contentCollectionToEntryMap = createCollectionToGlobResultMap({
  globResult: contentEntryGlob,
  contentDir
});
const dataEntryGlob = "";
const dataCollectionToEntryMap = createCollectionToGlobResultMap({
  globResult: dataEntryGlob,
  contentDir
});
createCollectionToGlobResultMap({
  globResult: { ...contentEntryGlob, ...dataEntryGlob },
  contentDir
});
let lookupMap = {};
lookupMap = {};
new Set(Object.keys(lookupMap));
function createGlobLookup(glob) {
  return async (collection, lookupId) => {
    const filePath = lookupMap[collection]?.entries[lookupId];
    if (!filePath) return void 0;
    return glob[collection][filePath];
  };
}
const renderEntryGlob = "";
const collectionToRenderEntryMap = createCollectionToGlobResultMap({
  globResult: renderEntryGlob,
  contentDir
});
const cacheEntriesByCollection = /* @__PURE__ */ new Map();
const getCollection = createGetCollection({
  contentCollectionToEntryMap,
  dataCollectionToEntryMap,
  getRenderEntryImport: createGlobLookup(collectionToRenderEntryMap),
  cacheEntriesByCollection,
  liveCollections
});
const $$Astro$5 = createAstro("https://joellithgow.com");
const $$Projects = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Projects;
  const {
    sectionTitle = "selected work",
    sectionSubtitle = "Recent projects and case studies",
    featuredOnly = true,
    limit
  } = Astro2.props;
  const allProjects = await getCollection("projects");
  let projects = featuredOnly ? allProjects.filter((project) => project.data.featured) : allProjects;
  projects = projects.sort((a, b) => a.data.number - b.data.number);
  if (limit && limit > 0) {
    projects = projects.slice(0, limit);
  }
  return renderTemplate`${maybeRenderHead()}<section id="work" class="projects" aria-labelledby="projects-heading" data-astro-cid-amng4zvp> <header class="section-header" data-astro-cid-amng4zvp> <h2 id="projects-heading" class="section-title" data-astro-cid-amng4zvp>${sectionTitle}</h2> <p class="section-subtitle" data-astro-cid-amng4zvp>${sectionSubtitle}</p> </header> <div class="projects-container" role="list" aria-label="Project portfolio" data-astro-cid-amng4zvp> ${projects.map((project) => renderTemplate`<article class="project-card" role="listitem"${addAttribute(project.data.id, "data-project-id")}${addAttribute(JSON.stringify(project.data), "data-project-data")} data-astro-cid-amng4zvp> <div class="project-header" data-astro-cid-amng4zvp> <div class="project-number" data-astro-cid-amng4zvp>${String(project.data.number).padStart(2, "0")}</div> <div class="project-type" data-astro-cid-amng4zvp>${project.data.type}</div> </div> ${project.data.images && project.data.images.length > 0 && renderTemplate`<div${addAttribute(`project-image-preview ${project.data.images[0].type === "video" ? "video-container" : ""}`, "class")} data-astro-cid-amng4zvp> ${project.data.images[0].type === "video" ? renderTemplate`<video class="project-preview-image" autoplay muted loop playsinline data-astro-cid-amng4zvp> <source${addAttribute(`/${project.data.images[0].src}`, "src")} type="video/webm" data-astro-cid-amng4zvp>
Your browser does not support the video tag.
</video>` : renderTemplate`<img${addAttribute(`/${project.data.images[0].src}`, "src")}${addAttribute(project.data.images[0].alt, "alt")} class="project-preview-image" loading="lazy" data-astro-cid-amng4zvp>`} </div>`} <div class="project-content" data-astro-cid-amng4zvp> <h3 class="project-title" data-astro-cid-amng4zvp>${project.data.title}</h3> <p class="project-description" data-astro-cid-amng4zvp>${project.data.description}</p> <div class="project-tech" data-astro-cid-amng4zvp> ${project.data.technologies.map((tech) => renderTemplate`<span class="tech-tag" data-astro-cid-amng4zvp>${tech}</span>`)} </div> <div class="project-impact" data-astro-cid-amng4zvp> <div class="impact-metric" data-astro-cid-amng4zvp>${project.data.impact}</div> </div> </div> </article>`)} </div> ${projects.length === 0 && renderTemplate`<div class="no-projects" data-astro-cid-amng4zvp> <p data-astro-cid-amng4zvp>No projects found.</p> </div>`} </section>  ${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/Projects.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/Projects.astro", void 0);
const $$Astro$4 = createAstro("https://joellithgow.com");
const $$Process = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Process;
  const {
    sectionTitle = "how i work",
    sectionSubtitle = "I leverage advanced technologies and streamlined methodologies to accelerate the design process while maintaining quality and stakeholder alignment. By utilizing modern tools and efficient workflows, I eliminate translation gaps and enable instant collaborative feedback."
  } = Astro2.props;
  const processSteps = [
    {
      id: "1",
      title: "rapid prototyping",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>`,
      subtitle: "Direct-to-prototype with real content, utilizing advanced tools and efficient workflows to create high-fidelity designs that eliminate translation issues between wireframes and final products.",
      example: {
        title: "Real Example: Proactive Feature Development",
        content: "Instead of waiting for requirements → presented working prototype at design meeting → gathered feedback and iterated in between other priority tasks → returned next week with updated version. Result: typical feature development timeline compressed from months to weeks."
      }
    },
    {
      id: "2",
      title: "live collaboration",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>`,
      subtitle: "Real-time stakeholder sessions with instant implementation and feedback loops, transforming traditional review meetings into collaborative creation sessions that align teams immediately.",
      example: {
        title: "Real Example: Marketing Campaign",
        content: "Marketing team meeting → live Figma session → 10 ad variations in 1 hour vs. usual 3-day cycle. By implementing feedback in real-time, stakeholders could see their ideas come to life instantly, leading to better decisions and faster alignment."
      }
    },
    {
      id: "3",
      title: "continuous learning",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>`,
      subtitle: "Embracing unfamiliar technologies and pushing beyond comfort zones to deliver innovative solutions, turning knowledge gaps into growth opportunities through systematic learning and experimentation.",
      example: {
        title: "Real Example: Learning Cloud Technologies",
        content: "Zero cloud experience → successful Kubernetes to Cloud Run migration in 3 weeks. By approaching unfamiliar technologies systematically and leveraging documentation, completed infrastructure modernization with zero downtime and 70% faster deployments."
      }
    },
    {
      id: "4",
      title: "ai research",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>`,
      subtitle: "Leverage AI tools for competitive analysis, user insights, and strategic documentation to accelerate research phases and uncover deeper insights faster than traditional methods.",
      example: {
        title: "Real Example: End-to-End Feature Development",
        content: "Complete feature cycle: AI competitive research → strategic planning → design prototyping → code generation → automated testing in 24 hours. Traditional multi-week process compressed into a single day while maintaining quality through AI-augmented planning, design, development, and QA phases."
      }
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="process" class="process" aria-labelledby="process-heading" data-astro-cid-fz4tclxl> <div class="process-content" data-astro-cid-fz4tclxl> <header class="process-header" data-astro-cid-fz4tclxl> <h2 id="process-heading" class="process-title" data-astro-cid-fz4tclxl>${sectionTitle}</h2> <p class="process-description" data-astro-cid-fz4tclxl> ${sectionSubtitle} </p> </header> <div class="process-layout" data-astro-cid-fz4tclxl> <nav class="process-nav" role="navigation" aria-label="Process steps navigation" data-astro-cid-fz4tclxl> ${processSteps.map((step, index) => renderTemplate`<div${addAttribute(`process-nav-item ${index === 0 ? "active" : ""}`, "class")}${addAttribute(step.id, "data-step")} tabindex="0" role="button"${addAttribute(index === 0 ? "true" : "false", "aria-pressed")} data-astro-cid-fz4tclxl> <div class="nav-step-icon" aria-hidden="true" data-astro-cid-fz4tclxl>${unescapeHTML(step.icon)}</div> <div class="nav-step-title" data-astro-cid-fz4tclxl>${step.title}</div> </div>`)} </nav> <div class="process-content-area" data-astro-cid-fz4tclxl> ${processSteps.map((step, index) => renderTemplate`<article${addAttribute(`process-step-content ${index === 0 ? "active" : ""}`, "class")}${addAttribute(`step-${step.id}`, "id")}${addAttribute(`step-${step.id}-title`, "aria-labelledby")} data-astro-cid-fz4tclxl> <header class="step-content-header" data-astro-cid-fz4tclxl> <h3${addAttribute(`step-${step.id}-title`, "id")} class="step-content-title" data-astro-cid-fz4tclxl>${step.title}</h3> <p class="step-content-description" data-astro-cid-fz4tclxl> ${step.subtitle} </p> </header> <div class="step-content-example" data-astro-cid-fz4tclxl> <h4 data-astro-cid-fz4tclxl>${step.example.title}</h4> <p data-astro-cid-fz4tclxl> ${step.example.content} </p> </div> </article>`)} </div> </div> </div> </section>  ${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/Process.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/Process.astro", void 0);
const $$Astro$3 = createAstro("https://joellithgow.com");
const $$About = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$About;
  const {
    sectionTitle = "about me",
    bio = "I'm passionate about creating digital experiences that feel both innovative and human. My journey spans from visual design to full-stack development, giving me a unique perspective on how to bridge the gap between what's possible and what's meaningful."
  } = Astro2.props;
  const skillCategories = [
    {
      title: "design",
      skills: ["figma", "sketch", "adobe cc", "prototyping", "user research", "design systems"]
    },
    {
      title: "development",
      skills: ["javascript", "typescript", "react", "node.js", "python", "docker"]
    },
    {
      title: "emerging tech",
      skills: ["claude code", "mcp servers", "webgl", "anime.js", "p5.js"]
    }
  ];
  const stats = [
    {
      number: "5",
      label: "years experience",
      suffix: "+"
    },
    {
      number: "50",
      label: "projects completed",
      suffix: "+"
    },
    {
      number: "1",
      label: "Art Degree",
      suffix: ""
    },
    {
      number: "∞",
      label: "ideas per day",
      suffix: "",
      isInfinity: true
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="about" class="about" aria-labelledby="about-heading" data-astro-cid-v2cbyr3p> <div class="about-content" data-astro-cid-v2cbyr3p> <header data-astro-cid-v2cbyr3p> <h2 id="about-heading" class="section-title" data-astro-cid-v2cbyr3p>${sectionTitle}</h2> </header> <div class="about-intro" data-astro-cid-v2cbyr3p> <div class="about-text" data-astro-cid-v2cbyr3p> ${bio} </div> <div class="about-stats" role="group" aria-label="Professional statistics" data-astro-cid-v2cbyr3p> ${stats.map((stat) => renderTemplate`<div class="stat-item" data-astro-cid-v2cbyr3p> <div${addAttribute(`stat-number ${stat.isInfinity ? "infinity" : ""}`, "class")} data-astro-cid-v2cbyr3p>${stat.number}${stat.suffix}</div> <div class="stat-label" data-astro-cid-v2cbyr3p>${stat.label}</div> </div>`)} </div> </div> <div class="skills-grid" role="group" aria-label="Technical skills" data-astro-cid-v2cbyr3p> ${skillCategories.map((category) => renderTemplate`<div class="skill-category" data-astro-cid-v2cbyr3p> <h3 class="skill-title" data-astro-cid-v2cbyr3p>${category.title}</h3> <div class="skill-list" role="list" data-astro-cid-v2cbyr3p> ${category.skills.map((skill) => renderTemplate`<span class="skill-item" role="listitem" data-astro-cid-v2cbyr3p>${skill}</span>`)} </div> </div>`)} </div> </div> </section>  ${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/About.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/About.astro", void 0);
const $$Astro$2 = createAstro("https://joellithgow.com");
const $$Contact = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Contact;
  const {
    title = "let's create",
    description = "Ready to bring your ideas to life? I'm always excited to collaborate on projects that push the boundaries of what's possible with design and technology.",
    emailAddress = "joelnotlithgow@gmail.com",
    linkedinUrl = "https://www.linkedin.com/in/joel-lithgow-40a9341b4/",
    githubUrl = "https://github.com/ASneakyToast"
  } = Astro2.props;
  const contactMethods = [
    {
      id: "email",
      label: "email",
      text: "send an email",
      href: `mailto:${emailAddress}`,
      description: "Send me an email to discuss your project",
      external: false
    },
    {
      id: "linkedin",
      label: "linkedin",
      text: "connect with me",
      href: linkedinUrl,
      description: "Connect with me on LinkedIn",
      external: true
    },
    {
      id: "github",
      label: "github",
      text: "see my code",
      href: githubUrl,
      description: "View my code repositories on GitHub",
      external: true
    }
  ];
  const floatingElements = [
    {
      id: 3,
      text: "collaboration: remote-friendly",
      class: "contact-floating-3"
    },
    {
      id: 4,
      text: "location: bay area",
      class: "contact-floating-4"
    },
    {
      id: 5,
      text: "coffee: essential fuel ☕",
      class: "contact-floating-5"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="contact" class="contact" aria-labelledby="contact-heading" data-astro-cid-xmivup5a> <div class="contact-content" data-astro-cid-xmivup5a> <header data-astro-cid-xmivup5a> <h2 id="contact-heading" class="contact-title" data-astro-cid-xmivup5a>${title}</h2> <p class="contact-description" data-astro-cid-xmivup5a> ${description} </p> </header> <div class="contact-methods" role="group" aria-label="Contact methods" data-astro-cid-xmivup5a> ${contactMethods.map((method) => renderTemplate`<a${addAttribute(method.href, "href")} class="contact-method"${addAttribute(`${method.id}-description`, "aria-describedby")}${addAttribute(method.external ? "_blank" : void 0, "target")}${addAttribute(method.external ? "noopener noreferrer" : void 0, "rel")} data-astro-cid-xmivup5a> <div class="contact-label" data-astro-cid-xmivup5a>${method.label}</div> <div class="contact-text" data-astro-cid-xmivup5a>${method.text}</div> </a>`)} </div> <!-- Contact Floating Elements --> <div class="contact-floating-elements" aria-hidden="true" data-astro-cid-xmivup5a> ${floatingElements.map((element) => renderTemplate`<div${addAttribute(`contact-floating-element ${element.class}`, "class")} tabindex="0" role="img"${addAttribute(`Floating element: ${element.text}`, "aria-label")} data-astro-cid-xmivup5a> ${element.text} </div>`)} </div> <!-- Hidden descriptions for screen readers --> <div class="sr-only" data-astro-cid-xmivup5a> ${contactMethods.map((method) => renderTemplate`<div${addAttribute(`${method.id}-description`, "id")} data-astro-cid-xmivup5a>${method.description}</div>`)} </div> </div> </section>  ${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/Contact.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/Contact.astro", void 0);
const $$Astro$1 = createAstro("https://joellithgow.com");
const $$InteractiveElements = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$InteractiveElements;
  return renderTemplate`<!-- Theme Modal -->${maybeRenderHead()}<div id="themeModal" class="theme-modal hidden" data-astro-cid-nnpqqodn> <div class="theme-modal-content" data-astro-cid-nnpqqodn> <div class="theme-modal-header" data-astro-cid-nnpqqodn> <h3 data-astro-cid-nnpqqodn>Choose Your Theme</h3> <button class="theme-modal-close" aria-label="Close theme selector" onclick="closeThemeModal()" data-astro-cid-nnpqqodn>&times;</button> </div> <div class="theme-options-grid" data-astro-cid-nnpqqodn> <div class="theme-option" data-theme="default" onclick="setTheme('default')" data-astro-cid-nnpqqodn> <div class="theme-preview theme-preview-default" data-astro-cid-nnpqqodn></div> <span data-astro-cid-nnpqqodn>Default</span> </div> <div class="theme-option" data-theme="cyber" onclick="setTheme('cyber')" data-astro-cid-nnpqqodn> <div class="theme-preview theme-preview-cyber" data-astro-cid-nnpqqodn></div> <span data-astro-cid-nnpqqodn>Cyber</span> </div> <!-- Forest theme temporarily removed due to green issue --> <!-- <div class="theme-option" data-theme="forest" onclick="setTheme('forest')">
        <div class="theme-preview theme-preview-forest"></div>
        <span>Forest</span>
      </div> --> <div class="theme-option" data-theme="ocean" onclick="setTheme('ocean')" data-astro-cid-nnpqqodn> <div class="theme-preview theme-preview-ocean" data-astro-cid-nnpqqodn></div> <span data-astro-cid-nnpqqodn>Ocean</span> </div> <div class="theme-option" data-theme="sunset" onclick="setTheme('sunset')" data-astro-cid-nnpqqodn> <div class="theme-preview theme-preview-sunset" data-astro-cid-nnpqqodn></div> <span data-astro-cid-nnpqqodn>Sunset</span> </div> <div class="theme-option" data-theme="minimal" onclick="setTheme('minimal')" data-astro-cid-nnpqqodn> <div class="theme-preview theme-preview-minimal" data-astro-cid-nnpqqodn></div> <span data-astro-cid-nnpqqodn>Minimal</span> </div> <div class="theme-option" data-theme="neon" onclick="setTheme('neon')" data-astro-cid-nnpqqodn> <div class="theme-preview theme-preview-neon" data-astro-cid-nnpqqodn></div> <span data-astro-cid-nnpqqodn>Neon</span> </div> </div> </div> </div> <!-- Case Study Modal --> <div id="caseStudyModal" class="modal-overlay hidden" data-astro-cid-nnpqqodn> <div class="modal-content" data-astro-cid-nnpqqodn> <div class="modal-header" data-astro-cid-nnpqqodn> <h3 class="modal-title" data-astro-cid-nnpqqodn>case study</h3> <button class="modal-close" aria-label="Close case study" data-astro-cid-nnpqqodn>&times;</button> </div> <div class="modal-body" data-astro-cid-nnpqqodn> <div class="case-study-content" data-astro-cid-nnpqqodn> <!-- Content will be populated dynamically --> </div> </div> </div> </div> <!-- Floating Elements Container - All floating elements removed as per requirements -->  <!-- Client-side JavaScript --> ${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/InteractiveElements.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/InteractiveElements.astro", void 0);
const $$UIInteractions = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- Client-side JavaScript for enhanced interactions -->${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/UIInteractions.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/UIInteractions.astro", void 0);
const $$Astro = createAstro("https://joellithgow.com");
const $$SnakeEasterEgg = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SnakeEasterEgg;
  return renderTemplate`<!-- Client-side JavaScript -->${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/SnakeEasterEgg.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/SnakeEasterEgg.astro", void 0);
const $$KeyboardShortcuts = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="keyboard-shortcuts-info" class="sr-only" aria-live="polite" data-astro-cid-bxhpuhhe> <div data-astro-cid-bxhpuhhe>Keyboard shortcuts available: Ctrl+T to cycle themes, Escape to close modals, Enter/Space to activate buttons</div> </div>  <!-- Client-side JavaScript for keyboard shortcuts and accessibility --> ${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/KeyboardShortcuts.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/KeyboardShortcuts.astro", void 0);
const $$PerformanceOptimizer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- Performance monitoring overlay (only shown in development) -->${maybeRenderHead()}<div id="performanceMonitor" class="performance-monitor" data-astro-cid-wt6nj36x> <div id="fpsCounter" data-astro-cid-wt6nj36x>FPS: --</div> <div id="memoryUsage" data-astro-cid-wt6nj36x>Memory: --</div> </div> <!-- Client-side performance optimization and monitoring --> ${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/PerformanceOptimizer.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/components/PerformanceOptimizer.astro", void 0);
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const pageTitle = "Joel Lithgow - Creative Technologist";
  const pageDescription = "I help people think visually. I turn abstract ideas into clear visuals through design thinking and technical expertise.";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": pageTitle, "description": pageDescription, "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<a href="#main-content" class="skip-link" aria-label="Skip to main content" data-astro-cid-j7pv25f6>Skip to main content</a>  ${renderComponent($$result2, "Navigation", $$Navigation, { "data-astro-cid-j7pv25f6": true })}  <main id="main-content" data-astro-cid-j7pv25f6> <!-- Hero Component --> ${renderComponent($$result2, "Hero", $$Hero, { "data-astro-cid-j7pv25f6": true })} <!-- Projects Component --> ${renderComponent($$result2, "Projects", $$Projects, { "data-astro-cid-j7pv25f6": true })} <!-- Process Component --> ${renderComponent($$result2, "Process", $$Process, { "data-astro-cid-j7pv25f6": true })} <!-- About Component --> ${renderComponent($$result2, "About", $$About, { "data-astro-cid-j7pv25f6": true })} <!-- Contact Component --> ${renderComponent($$result2, "Contact", $$Contact, { "data-astro-cid-j7pv25f6": true })} </main>  ${renderComponent($$result2, "InteractiveElements", $$InteractiveElements, { "data-astro-cid-j7pv25f6": true })}  ${renderComponent($$result2, "UIInteractions", $$UIInteractions, { "data-astro-cid-j7pv25f6": true })}  ${renderComponent($$result2, "SnakeEasterEgg", $$SnakeEasterEgg, { "data-astro-cid-j7pv25f6": true })}  ${renderComponent($$result2, "KeyboardShortcuts", $$KeyboardShortcuts, { "data-astro-cid-j7pv25f6": true })}  ${renderComponent($$result2, "PerformanceOptimizer", $$PerformanceOptimizer, { "data-astro-cid-j7pv25f6": true })}  <div class="sr-only" data-astro-cid-j7pv25f6> <div data-astro-cid-j7pv25f6>This website uses themes. Press Ctrl+T to cycle through available themes.</div> <div data-astro-cid-j7pv25f6>Some elements on this page are interactive and can be dragged around.</div> </div> ` })}  ${renderScript($$result, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/pages/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/pages/index.astro", void 0);
const $$file = "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/pages/index.astro";
const $$url = "";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  DEFAULT_OUTPUT_FORMAT as D,
  VALID_SUPPORTED_FORMATS as V,
  DEFAULT_HASH_PROPS as a,
  page as p
};
