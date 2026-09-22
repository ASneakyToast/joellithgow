/**
 * Compute the ProseMirror-JSON form of every blog_post body, for the one-time
 * migration of body_markdown from a Markdown string to a RichTextField.
 *
 * This half runs on a workstation and only READS the CMS. It reuses the exact
 * converter the editor round-trips through (prosemirror-markdown, basic+lists
 * schema) so what's stored matches what the editor produces. The write half
 * (apply.py) takes this output and updates SQLite directly, bypassing model
 * validation — the API's PATCH writes only draft_body, which is the wrong
 * target for migrating the published body.
 *
 * Usage:
 *   node compute.mjs <cms_base_url> <api_key> > bodymap.json
 *
 * Output: [{ id, body, draft_body|null }] where each is the full body dict with
 * body_markdown replaced by ProseMirror JSON. draft_body is present only for
 * docs with an actual unpublished draft.
 */
import { Schema, Node as PMNode } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { MarkdownParser, defaultMarkdownParser } from 'prosemirror-markdown';
import markdownit from 'markdown-it';

const [, , base, key] = process.argv;
if (!base || !key) {
  console.error('usage: node compute.mjs <cms_base_url> <api_key> > bodymap.json');
  process.exit(2);
}

const schemaWithLists = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
});
const parser = new MarkdownParser(schemaWithLists, markdownit(), defaultMarkdownParser.tokens);

/**
 * The basic schema has no table node, so the parser throws on GFM tables.
 * Convert them to HTML tables first — HTML passes through as text and renders
 * via marked, matching how the author's other raw HTML already round-trips.
 */
function htmlifyTables(md) {
  const lines = md.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const isRow = (s) => /^\s*\|.*\|\s*$/.test(s);
    const isSep = (s) => /^\s*\|[\s:|-]+\|\s*$/.test(s);
    if (isRow(lines[i]) && i + 1 < lines.length && isSep(lines[i + 1])) {
      const cells = (s) => s.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const header = cells(lines[i]);
      i += 2;
      const rows = [];
      while (i < lines.length && isRow(lines[i])) rows.push(cells(lines[i++]));
      i--;
      const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      // Render inline markdown (**bold** etc.) in cells via markdown-it inline.
      const cell = (s) => markdownit().renderInline(s);
      let html = '<table>\n<thead>\n<tr>' + header.map((h) => `<th>${cell(h)}</th>`).join('') + '</tr>\n</thead>\n<tbody>\n';
      for (const r of rows) html += '<tr>' + r.map((c) => `<td>${cell(c)}</td>`).join('') + '</tr>\n';
      html += '</tbody>\n</table>';
      out.push(html);
    } else {
      out.push(lines[i]);
    }
  }
  return out.join('\n');
}

function toPm(md) {
  return parser.parse(htmlifyTables(md ?? '')).toJSON();
}

/** Replace a body dict's body_markdown string with ProseMirror JSON, in place. */
function convertBody(body) {
  if (body && typeof body.body_markdown === 'string') {
    return { ...body, body_markdown: toPm(body.body_markdown) };
  }
  return null; // nothing to convert (already migrated, or no body_markdown)
}

async function api(path) {
  const res = await fetch(`${base}${path}`, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

const docs = [];
for (let offset = 0; ; offset += 100) {
  const page = await api(`/api/documents?type=blog_post&limit=100&offset=${offset}`);
  const list = page.documents || [];
  docs.push(...list);
  if (list.length < 100) break;
}

const out = [];
for (const d of docs) {
  const newBody = convertBody(d.body);
  let newDraft = null;
  if (d.has_draft) {
    const draftDoc = await api(`/api/documents/${d.id}?draft=true`);
    newDraft = convertBody(draftDoc.body);
  }
  if (newBody || newDraft) {
    out.push({ id: d.id, slug: d.slug, body: newBody, draft_body: newDraft });
  }
}

process.stdout.write(JSON.stringify(out));
process.stderr.write(`computed ${out.length} docs to migrate (of ${docs.length})\n`);
