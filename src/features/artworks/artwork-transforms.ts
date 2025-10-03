import type { Artwork } from '@content/config';
import type { APIArtwork } from './artwork-types';

/**
 * Transform API artwork to Astro content schema
 */
export function transformAPIArtwork(apiArtwork: APIArtwork): Artwork {
  const id = `api-artwork-${apiArtwork.id}`;
  const title = apiArtwork.title_plain || stripHTMLTags(apiArtwork.title) || `Untitled Artwork #${apiArtwork.id}`;
  const creationDate = apiArtwork.date ? new Date(apiArtwork.date) : new Date();

  // Debug: Log if no images found
  if (!apiArtwork.primary_image && (!apiArtwork.images || apiArtwork.images.length === 0)) {
    console.log(`⚠️ No images found for "${title}"`);
  }

  // Transform images
  const images = [];

  // Add primary image
  if (apiArtwork.primary_image) {
    images.push({
      src: apiArtwork.primary_image.original_url,
      alt: apiArtwork.primary_image.alt || `${title} - main view`,
      caption: `Main view of ${title}`,
      type: 'main' as const,
    });
  }

  // Add additional images
  if (apiArtwork.images) {
    apiArtwork.images.forEach((img, index) => {
      if (apiArtwork.primary_image && img.image.id === apiArtwork.primary_image.id) {
        return; // Skip duplicate primary image
      }

      images.push({
        src: img.image.original_url,
        alt: img.image.alt || `${title} - view ${index + 1}`,
        caption: img.caption || `Additional view of ${title}`,
        type: 'detail' as const,
      });
    });
  }

  // Add process images from artifacts
  if (apiArtwork.artifacts) {
    apiArtwork.artifacts.forEach((artifact) => {
      if (artifact.type === 'image' && artifact.image) {
        images.push({
          src: artifact.image.original_url,
          alt: artifact.image.alt || `${title} - process documentation`,
          caption: artifact.caption || 'Process documentation',
          type: 'process' as const,
        });
      }
    });
  }

  // Generate project context
  const collaborators = apiArtwork.artists?.map(artist => artist.name) || [];
  const hasCollaborators = collaborators.length > 1;
  const materials = apiArtwork.materials_list || [];

  let projectTitle, projectDescription;
  if (hasCollaborators) {
    const collaboratorNames = collaborators.join(' & ');
    projectTitle = `Collaborative Work with ${collaboratorNames}`;
    projectDescription = `Collaborative artwork exploring shared creative processes and ideas with ${collaboratorNames}.`;
  } else {
    const primaryMaterial = materials[0];
    if (primaryMaterial) {
      projectTitle = `${capitalizeFirst(primaryMaterial)} Works`;
      projectDescription = `Exploration of ${primaryMaterial} as a medium, investigating its properties and expressive possibilities.`;
    } else {
      projectTitle = 'Fine Art Practice';
      projectDescription = 'Individual works exploring various mediums and concepts in contemporary art practice.';
    }
  }

  // Determine medium
  let medium;
  if (materials.length === 0) {
    medium = 'Mixed media';
  } else if (materials.length === 1) {
    medium = materials[0];
  } else {
    medium = `${materials.slice(0, 2).join(' and ')}${materials.length > 2 ? ' and others' : ''}`;
  }

  // Extract content from artifacts
  let processNotes = '';
  let technicalNotes = '';
  if (apiArtwork.artifacts) {
    apiArtwork.artifacts.forEach((artifact) => {
      if (artifact.type === 'text' && artifact.text) {
        const text = artifact.text.toLowerCase();
        if (text.includes('process') || text.includes('making') || text.includes('created')) {
          processNotes += artifact.text + ' ';
        } else {
          technicalNotes += artifact.text + ' ';
        }
      }
    });
  }

  // Generate tags
  const tags = [];
  if (hasCollaborators) tags.push('collaborative');
  materials.forEach(material => {
    tags.push(material.toLowerCase().replace(/\s+/g, '-'));
  });
  if (apiArtwork.metadata?.image_count && apiArtwork.metadata.image_count > 3) {
    tags.push('process-documented');
  }

  // Categorize artwork
  let category: 'printmedia' | 'sculpture' | 'exhibition' | 'collaborative' | 'mixed-media';
  const materialString = materials.join(' ').toLowerCase();
  if (hasCollaborators) {
    category = 'collaborative';
  } else if (materialString.includes('print') || materialString.includes('screen')) {
    category = 'printmedia';
  } else if (materialString.includes('bronze') || materialString.includes('clay') || materialString.includes('wood') || materialString.includes('metal')) {
    category = 'sculpture';
  } else {
    category = 'mixed-media';
  }

  const artwork = {
    id,
    title,
    description: apiArtwork.description || '',
    projectTitle,
    projectDescription,
    creationDate,
    medium,
    dimensions: apiArtwork.size || undefined,
    images,
    materials: materials.length > 0 ? materials : undefined,
    techniques: extractTechniques(materials),
    series: undefined,
    collaborators: collaborators.length > 0 ? collaborators : undefined,
    artistStatement: apiArtwork.description && apiArtwork.description.length > 100 ? apiArtwork.description : undefined,
    processNotes: processNotes.trim() || undefined,
    inspiration: undefined,
    technicalNotes: technicalNotes.trim() || undefined,
    featured: false,
    draft: false,
    tags: tags.length > 0 ? tags : undefined,
    category,
  };

  return artwork;
}

/**
 * Utility functions
 */
function stripHTMLTags(html: string): string {
  return html?.replace(/<[^>]*>/g, '') || '';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractTechniques(materials: string[]): string[] | undefined {
  if (!materials || materials.length === 0) return undefined;

  const techniques = [];
  const techniqueKeywords = ['painting', 'drawing', 'printing', 'carving', 'casting', 'welding', 'sewing'];

  materials.forEach(material => {
    techniqueKeywords.forEach(technique => {
      if (material.toLowerCase().includes(technique)) {
        techniques.push(technique);
      }
    });
  });

  return techniques.length > 0 ? techniques : undefined;
}