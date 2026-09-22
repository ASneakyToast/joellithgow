/**
 * Render ProseMirror document JSON back to Markdown at build time.
 *
 * Rich-text fields (body_markdown) are stored as ProseMirror JSON so the live
 * editor gets true WYSIWYG + collaborative editing. The site still renders via
 * `marked`, so the loader converts that JSON back to Markdown here — using the
 * same schema (basic + lists) and serializer the editor round-trips through, so
 * what renders matches what was authored. Raw HTML the author embedded survives
 * as text through this path and is rendered by `marked`, which a direct
 * PM-JSON→HTML renderer would escape instead.
 */
import { Schema, Node as PMNode } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';

// Must match starlette-editor's schemaWithLists exactly, or a node the editor
// produced could fail to deserialize here.
const schemaWithLists = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
});

/** A stored value that is a ProseMirror document rather than a plain string. */
export function isProseMirrorDoc(value: unknown): value is { type: 'doc' } {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { type?: unknown }).type === 'doc'
  );
}

/**
 * Serialize a ProseMirror document JSON value to a Markdown string.
 *
 * @param json a ProseMirror doc node as plain JSON
 * @returns Markdown, or '' if the JSON can't be deserialized
 */
export function proseMirrorDocToMarkdown(json: unknown): string {
  try {
    const node = PMNode.fromJSON(schemaWithLists, json as Parameters<typeof PMNode.fromJSON>[1]);
    return defaultMarkdownSerializer.serialize(node);
  } catch {
    // A malformed doc should not fail the whole build; render nothing for it.
    return '';
  }
}
