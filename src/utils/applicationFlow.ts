/**
 * Application Flow Data Transformation
 *
 * Transforms application statusHistory data into Sankey diagram format.
 * Used for visualizing job application flow at /applications/flow
 */

import type { Application, StatusEvent } from '../content/config';
import { STATUS_LABELS, ROUND_LABELS } from './applicationStatus';

// Sankey diagram data types
export interface SankeyNode {
  id: string;
  name: string;
  category: 'status' | 'round' | 'outcome';
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Get display name for a status or round
function getNodeName(status: string, round?: string): string {
  if (status === 'interviewing' && round) {
    return ROUND_LABELS[round as keyof typeof ROUND_LABELS] || round;
  }
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
}

// Get node ID (unique identifier)
function getNodeId(status: string, round?: string): string {
  if (status === 'interviewing' && round) {
    return `interview-${round}`;
  }
  return status;
}

// Determine node category for coloring
function getNodeCategory(status: string): 'status' | 'round' | 'outcome' {
  if (['offered'].includes(status)) return 'outcome';
  if (['rejected', 'withdrawn', 'ghosted'].includes(status)) return 'outcome';
  if (status === 'interviewing') return 'round';
  return 'status';
}

/**
 * Compute Sankey data from applications
 *
 * Extracts all status transitions from statusHistory and aggregates them
 * into nodes and links for the Sankey diagram.
 */
export function computeSankeyData(applications: { data: Application }[]): SankeyData {
  const nodeMap = new Map<string, SankeyNode>();
  const linkMap = new Map<string, number>(); // "source->target" -> count

  for (const app of applications) {
    const history = app.data.statusHistory || [];

    if (history.length === 0) {
      // No history, use current status as single node
      const id = getNodeId(app.data.status);
      if (!nodeMap.has(id)) {
        nodeMap.set(id, {
          id,
          name: getNodeName(app.data.status),
          category: getNodeCategory(app.data.status)
        });
      }
      continue;
    }

    // Process each transition in the history
    for (let i = 0; i < history.length; i++) {
      const event = history[i];
      const nodeId = getNodeId(event.status, event.round);

      // Add node if not exists
      if (!nodeMap.has(nodeId)) {
        nodeMap.set(nodeId, {
          id: nodeId,
          name: getNodeName(event.status, event.round),
          category: event.status === 'interviewing' ? 'round' : getNodeCategory(event.status)
        });
      }

      // Add link from previous status (if exists)
      if (i > 0) {
        const prevEvent = history[i - 1];
        const prevNodeId = getNodeId(prevEvent.status, prevEvent.round);
        const linkKey = `${prevNodeId}->${nodeId}`;

        linkMap.set(linkKey, (linkMap.get(linkKey) || 0) + 1);
      }
    }
  }

  // Convert maps to arrays
  const links: SankeyLink[] = Array.from(linkMap.entries()).map(([key, value]) => {
    const [source, target] = key.split('->');
    return { source, target, value };
  });

  // Only include nodes that participate in at least one link
  const linkedNodeIds = new Set(links.flatMap(l => [l.source, l.target]));
  const nodes = Array.from(nodeMap.values()).filter(n => linkedNodeIds.has(n.id));

  // Sort nodes by typical flow order
  const statusOrder = [
    'draft', 'applied',
    'interview-recruiter-call', 'interview-phone-screen',
    'interview-technical', 'interview-take-home',
    'interview-onsite', 'interview-hiring-manager',
    'interview-team-panel', 'interview-final', 'interview-other',
    'offered', 'rejected', 'withdrawn', 'ghosted'
  ];

  nodes.sort((a, b) => {
    const aIndex = statusOrder.indexOf(a.id);
    const bIndex = statusOrder.indexOf(b.id);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  return { nodes, links };
}

/**
 * Get color for a node based on its category
 */
export function getNodeColor(node: SankeyNode): string {
  switch (node.id) {
    case 'offered':
      return '#22c55e'; // green-500
    case 'rejected':
    case 'withdrawn':
    case 'ghosted':
      return '#ef4444'; // red-500
    case 'applied':
    case 'draft':
      return '#3b82f6'; // blue-500
    default:
      // Interview rounds
      return '#8b5cf6'; // purple-500
  }
}

/**
 * Get color for a link based on its target
 */
export function getLinkColor(link: SankeyLink): string {
  if (link.target === 'offered') return 'rgba(34, 197, 94, 0.4)';
  if (['rejected', 'withdrawn', 'ghosted'].includes(link.target)) return 'rgba(239, 68, 68, 0.3)';
  return 'rgba(107, 114, 128, 0.3)'; // gray
}
