import { Project } from '../types';
import { formatAmountWithCurrency } from './currency';

/**
 * Calculate project progress percentage
 */
export function calculateProjectProgress(project: Project): number {
  if (!project.milestones || project.milestones.length === 0) return 0;
  
  const completedMilestones = project.milestones.filter(
    (m) => m.status === 'approved' || m.status === 'released'
  ).length;
  
  return Math.round((completedMilestones / project.milestones.length) * 100);
}

/**
 * Format project budget range
 */
export function formatBudget(project: Project): string {
  if (project.budget_min && project.budget_max) {
    return `${formatAmountWithCurrency(project.budget_min)} - ${formatAmountWithCurrency(project.budget_max)}`;
  }
  if (project.budget_min) {
    return `${formatAmountWithCurrency(project.budget_min)}+`;
  }
  if (project.budget_max) {
    return `Up to ${formatAmountWithCurrency(project.budget_max)}`;
  }
  return 'Not specified';
}

/**
 * Format date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
