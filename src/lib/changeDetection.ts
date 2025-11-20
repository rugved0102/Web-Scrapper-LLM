// Change Detection Algorithm
// Compares two InsightData objects and identifies changes

import { InsightData } from "@/components/InsightEngine/InsightDisplay";

export type ChangeSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ChangeMagnitude = 'none' | 'minor' | 'moderate' | 'major' | 'critical';
export type ChangeType = 'content' | 'pricing' | 'sentiment' | 'structure' | 'keyword' | 'recommendation' | 'domain_insight';

export interface DetectedChange {
  type: ChangeType;
  fieldPath: string;
  oldValue: string;
  newValue: string;
  description: string;
  severity: ChangeSeverity;
  changePercentage?: number;
}

export interface ChangeDetectionResult {
  hasChanges: boolean;
  changeMagnitude: ChangeMagnitude;
  changes: DetectedChange[];
  summary: string;
  overallSimilarity: number; // 0-100
}

/**
 * Calculate similarity between two strings (0-100)
 * Uses Levenshtein distance normalized
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 100;
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 100;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return ((longer.length - editDistance) / longer.length) * 100;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity between two arrays of strings
 */
function calculateArraySimilarity(arr1: string[], arr2: string[]): number {
  if (!arr1?.length && !arr2?.length) return 100;
  if (!arr1?.length || !arr2?.length) return 0;
  
  const set1 = new Set(arr1.map(s => s.toLowerCase().trim()));
  const set2 = new Set(arr2.map(s => s.toLowerCase().trim()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return (intersection.size / union.size) * 100;
}

/**
 * Detect pricing changes in content
 */
function detectPricingChanges(oldData: InsightData, newData: InsightData): DetectedChange[] {
  const changes: DetectedChange[] = [];
  
  // Check domain-specific insights for price mentions
  const oldPrices = extractPricesFromText(
    [...(oldData.domain_specific_insights || []), oldData.tldr, ...oldData.key_points].join(' ')
  );
  const newPrices = extractPricesFromText(
    [...(newData.domain_specific_insights || []), newData.tldr, ...newData.key_points].join(' ')
  );
  
  if (oldPrices.length > 0 || newPrices.length > 0) {
    const priceChange = newPrices[0] - oldPrices[0];
    const percentChange = oldPrices[0] ? (priceChange / oldPrices[0]) * 100 : 0;
    
    if (Math.abs(percentChange) > 5) {
      changes.push({
        type: 'pricing',
        fieldPath: 'pricing',
        oldValue: `$${oldPrices[0]?.toFixed(2) || 'N/A'}`,
        newValue: `$${newPrices[0]?.toFixed(2) || 'N/A'}`,
        description: `Price changed by ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`,
        severity: Math.abs(percentChange) > 20 ? 'high' : Math.abs(percentChange) > 10 ? 'medium' : 'low',
        changePercentage: Math.abs(percentChange)
      });
    }
  }
  
  return changes;
}

/**
 * Extract prices from text (simple regex-based)
 */
function extractPricesFromText(text: string): number[] {
  const priceRegex = /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
  const matches = text.matchAll(priceRegex);
  return Array.from(matches, m => parseFloat(m[1].replace(/,/g, '')));
}

/**
 * Analyze sentiment changes
 */
function analyzeSentimentChange(oldData: InsightData, newData: InsightData): DetectedChange[] {
  const changes: DetectedChange[] = [];
  
  // Check for negative keywords increase
  const negativeKeywords = ['problem', 'issue', 'concern', 'negative', 'poor', 'bad', 'worse', 'decline', 'drop'];
  const positiveKeywords = ['excellent', 'great', 'improve', 'better', 'increase', 'growth', 'success', 'positive'];
  
  const oldText = [oldData.tldr, ...oldData.key_points, ...oldData.deep_insights].join(' ').toLowerCase();
  const newText = [newData.tldr, ...newData.key_points, ...newData.deep_insights].join(' ').toLowerCase();
  
  const oldNegativeCount = negativeKeywords.filter(kw => oldText.includes(kw)).length;
  const newNegativeCount = negativeKeywords.filter(kw => newText.includes(kw)).length;
  const oldPositiveCount = positiveKeywords.filter(kw => oldText.includes(kw)).length;
  const newPositiveCount = positiveKeywords.filter(kw => newText.includes(kw)).length;
  
  const sentimentShift = (newPositiveCount - newNegativeCount) - (oldPositiveCount - oldNegativeCount);
  
  if (Math.abs(sentimentShift) >= 2) {
    changes.push({
      type: 'sentiment',
      fieldPath: 'sentiment',
      oldValue: oldPositiveCount > oldNegativeCount ? 'Positive' : oldNegativeCount > oldPositiveCount ? 'Negative' : 'Neutral',
      newValue: newPositiveCount > newNegativeCount ? 'Positive' : newNegativeCount > newPositiveCount ? 'Negative' : 'Neutral',
      description: sentimentShift > 0 ? 'Sentiment improved' : 'Sentiment worsened',
      severity: Math.abs(sentimentShift) >= 3 ? 'high' : 'medium'
    });
  }
  
  return changes;
}

/**
 * Compare key points and deep insights
 */
function compareContentArrays(
  oldArray: string[],
  newArray: string[],
  fieldName: string,
  type: ChangeType
): DetectedChange[] {
  const changes: DetectedChange[] = [];
  
  // Find removed items
  oldArray.forEach((oldItem, idx) => {
    if (!newArray.some(newItem => calculateStringSimilarity(oldItem, newItem) > 80)) {
      changes.push({
        type,
        fieldPath: `${fieldName}[${idx}]`,
        oldValue: oldItem.substring(0, 100) + (oldItem.length > 100 ? '...' : ''),
        newValue: '',
        description: `Removed from ${fieldName}`,
        severity: 'medium'
      });
    }
  });
  
  // Find added items
  newArray.forEach((newItem, idx) => {
    if (!oldArray.some(oldItem => calculateStringSimilarity(oldItem, newItem) > 80)) {
      changes.push({
        type,
        fieldPath: `${fieldName}[${idx}]`,
        oldValue: '',
        newValue: newItem.substring(0, 100) + (newItem.length > 100 ? '...' : ''),
        description: `Added to ${fieldName}`,
        severity: 'medium'
      });
    }
  });
  
  return changes;
}

/**
 * Main change detection function
 */
export function detectChanges(
  previousData: InsightData,
  currentData: InsightData
): ChangeDetectionResult {
  const changes: DetectedChange[] = [];
  
  // 1. Compare summary (TLDR)
  const tldrSimilarity = calculateStringSimilarity(previousData.tldr, currentData.tldr);
  if (tldrSimilarity < 80) {
    changes.push({
      type: 'content',
      fieldPath: 'tldr',
      oldValue: previousData.tldr.substring(0, 150) + '...',
      newValue: currentData.tldr.substring(0, 150) + '...',
      description: 'Executive summary changed',
      severity: tldrSimilarity < 50 ? 'high' : 'medium',
      changePercentage: 100 - tldrSimilarity
    });
  }
  
  // 2. Compare key points
  const keyPointsSimilarity = calculateArraySimilarity(previousData.key_points, currentData.key_points);
  const keyPointChanges = compareContentArrays(
    previousData.key_points,
    currentData.key_points,
    'key_points',
    'content'
  );
  changes.push(...keyPointChanges);
  
  // 3. Compare deep insights
  const insightsSimilarity = calculateArraySimilarity(previousData.deep_insights, currentData.deep_insights);
  const insightChanges = compareContentArrays(
    previousData.deep_insights,
    currentData.deep_insights,
    'deep_insights',
    'content'
  );
  changes.push(...insightChanges);
  
  // 4. Compare recommendations
  const recommendationsSimilarity = calculateArraySimilarity(
    previousData.recommendations,
    currentData.recommendations
  );
  const recommendationChanges = compareContentArrays(
    previousData.recommendations,
    currentData.recommendations,
    'recommendations',
    'recommendation'
  );
  changes.push(...recommendationChanges);
  
  // 5. Detect pricing changes
  const pricingChanges = detectPricingChanges(previousData, currentData);
  changes.push(...pricingChanges);
  
  // 6. Analyze sentiment changes
  const sentimentChanges = analyzeSentimentChange(previousData, currentData);
  changes.push(...sentimentChanges);
  
  // 7. Compare domain-specific insights
  if (previousData.domain_specific_insights && currentData.domain_specific_insights) {
    const domainSimilarity = calculateArraySimilarity(
      previousData.domain_specific_insights,
      currentData.domain_specific_insights
    );
    const domainChanges = compareContentArrays(
      previousData.domain_specific_insights,
      currentData.domain_specific_insights,
      'domain_specific_insights',
      'domain_insight'
    );
    changes.push(...domainChanges);
  }
  
  // 8. Compare conflicts (if any)
  if (previousData.conflicts_across_sources || currentData.conflicts_across_sources) {
    const conflictChanges = compareContentArrays(
      previousData.conflicts_across_sources || [],
      currentData.conflicts_across_sources || [],
      'conflicts',
      'content'
    );
    changes.push(...conflictChanges);
  }
  
  // Calculate overall similarity
  const overallSimilarity = (
    tldrSimilarity +
    keyPointsSimilarity +
    insightsSimilarity +
    recommendationsSimilarity
  ) / 4;
  
  // Determine change magnitude
  let changeMagnitude: ChangeMagnitude = 'none';
  const criticalCount = changes.filter(c => c.severity === 'critical').length;
  const highCount = changes.filter(c => c.severity === 'high').length;
  const mediumCount = changes.filter(c => c.severity === 'medium').length;
  
  if (criticalCount > 0 || overallSimilarity < 40) {
    changeMagnitude = 'critical';
  } else if (highCount >= 3 || overallSimilarity < 60) {
    changeMagnitude = 'major';
  } else if (highCount > 0 || mediumCount >= 3 || overallSimilarity < 80) {
    changeMagnitude = 'moderate';
  } else if (changes.length > 0) {
    changeMagnitude = 'minor';
  }
  
  // Generate summary
  const summary = generateChangeSummary(changes, changeMagnitude);
  
  return {
    hasChanges: changes.length > 0,
    changeMagnitude,
    changes,
    summary,
    overallSimilarity
  };
}

/**
 * Generate human-readable summary of changes
 */
function generateChangeSummary(changes: DetectedChange[], magnitude: ChangeMagnitude): string {
  if (changes.length === 0) return 'No significant changes detected';
  
  const byType = changes.reduce((acc, change) => {
    acc[change.type] = (acc[change.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const parts: string[] = [];
  
  if (byType.pricing) parts.push(`${byType.pricing} pricing change${byType.pricing > 1 ? 's' : ''}`);
  if (byType.content) parts.push(`${byType.content} content change${byType.content > 1 ? 's' : ''}`);
  if (byType.sentiment) parts.push('sentiment shift');
  if (byType.recommendation) parts.push(`${byType.recommendation} new recommendation${byType.recommendation > 1 ? 's' : ''}`);
  if (byType.domain_insight) parts.push('domain-specific updates');
  
  let summary = `Detected ${parts.join(', ')}`;
  
  if (magnitude === 'critical' || magnitude === 'major') {
    summary = `🚨 ${summary}`;
  } else if (magnitude === 'moderate') {
    summary = `⚠️ ${summary}`;
  }
  
  return summary;
}

/**
 * Quick check if two analyses are similar enough (for deduplication)
 */
export function areSimilarAnalyses(data1: InsightData, data2: InsightData, threshold: number = 90): boolean {
  const tldrSim = calculateStringSimilarity(data1.tldr, data2.tldr);
  const keyPointsSim = calculateArraySimilarity(data1.key_points, data2.key_points);
  
  const avgSimilarity = (tldrSim + keyPointsSim) / 2;
  return avgSimilarity >= threshold;
}
