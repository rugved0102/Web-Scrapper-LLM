import { InsightData } from "@/components/InsightEngine/InsightDisplay";

/**
 * Flattens nested insight data into CSV-friendly rows
 */
export function exportAsCSV(insights: InsightData, purpose: string): string {
  const rows: string[][] = [];
  
  // Header
  rows.push(["Section", "Item #", "Content"]);
  
  // Purpose
  rows.push(["Purpose", "", purpose]);
  rows.push([]); // Empty row for spacing
  
  // Summary/TLDR
  rows.push(["Summary", "1", insights.tldr]);
  rows.push([]); // Empty row
  
  // Key Points
  insights.key_points.forEach((point, idx) => {
    rows.push(["Key Points", String(idx + 1), point]);
  });
  rows.push([]); // Empty row
  
  // Deep Insights
  insights.deep_insights.forEach((insight, idx) => {
    rows.push(["Deep Insights", String(idx + 1), insight]);
  });
  rows.push([]); // Empty row
  
  // Conflicts
  if (insights.conflicts_across_sources && insights.conflicts_across_sources.length > 0) {
    insights.conflicts_across_sources.forEach((conflict, idx) => {
      rows.push(["Conflicts", String(idx + 1), conflict]);
    });
    rows.push([]); // Empty row
  }
  
  // Opportunities
  if (insights.opportunities_or_gaps && insights.opportunities_or_gaps.length > 0) {
    insights.opportunities_or_gaps.forEach((opportunity, idx) => {
      rows.push(["Opportunities & Gaps", String(idx + 1), opportunity]);
    });
    rows.push([]); // Empty row
  }
  
  // Recommendations
  insights.recommendations.forEach((rec, idx) => {
    rows.push(["Recommendations", String(idx + 1), rec]);
  });
  rows.push([]); // Empty row
  
  // Domain-Specific Insights
  if (insights.domain_specific_insights && insights.domain_specific_insights.length > 0) {
    insights.domain_specific_insights.forEach((insight, idx) => {
      rows.push(["Domain Insights", String(idx + 1), insight]);
    });
    rows.push([]); // Empty row
  }
  
  // Comparison (if exists)
  if (insights.comparison) {
    rows.push(["Comparison Summary", "1", insights.comparison.summary]);
    rows.push([]); // Empty row
    
    // Similarities
    insights.comparison.similarities.forEach((sim, idx) => {
      rows.push(["Similarities", String(idx + 1), sim]);
    });
    rows.push([]); // Empty row
    
    // Differences
    insights.comparison.differences.forEach((diff, idx) => {
      rows.push(["Differences", String(idx + 1), diff]);
    });
    rows.push([]); // Empty row
    
    // Per-site comparison
    insights.comparison.site_comparisons.forEach((site, siteIdx) => {
      rows.push([`Site ${siteIdx + 1}`, "URL", site.url]);
      rows.push([`Site ${siteIdx + 1}`, "Title", site.title]);
      
      site.strengths.forEach((strength, idx) => {
        rows.push([`Site ${siteIdx + 1} Strengths`, String(idx + 1), strength]);
      });
      
      site.weaknesses.forEach((weakness, idx) => {
        rows.push([`Site ${siteIdx + 1} Weaknesses`, String(idx + 1), weakness]);
      });
      
      site.unique_features.forEach((feature, idx) => {
        rows.push([`Site ${siteIdx + 1} Unique`, String(idx + 1), feature]);
      });
      
      rows.push([]); // Empty row between sites
    });
    
    if (insights.comparison.winner && insights.comparison.winner_reasoning) {
      rows.push(["Winner", "URL", insights.comparison.winner]);
      rows.push(["Winner", "Reasoning", insights.comparison.winner_reasoning]);
    }
  }
  
  // Convert to CSV string
  return rows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const escaped = cell.replace(/"/g, '""');
      return /[",\n]/.test(cell) ? `"${escaped}"` : escaped;
    }).join(',')
  ).join('\n');
}

/**
 * Enhanced text export with better formatting
 */
export function exportAsEnhancedText(insights: InsightData, purpose: string): string {
  const separator = "═".repeat(80);
  const minorSeparator = "─".repeat(80);
  
  let text = "";
  
  // Header
  text += separator + "\n";
  text += "                         ANALYSIS REPORT\n";
  text += separator + "\n\n";
  
  text += `Analysis Purpose: ${purpose.toUpperCase()}\n`;
  text += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Summary
  text += separator + "\n";
  text += "EXECUTIVE SUMMARY\n";
  text += separator + "\n\n";
  text += insights.tldr + "\n\n";
  
  // Key Points
  text += separator + "\n";
  text += "KEY POINTS\n";
  text += separator + "\n\n";
  insights.key_points.forEach((point, idx) => {
    text += `${idx + 1}. ${point}\n\n`;
  });
  
  // Deep Insights
  text += separator + "\n";
  text += "DEEP INSIGHTS & ANALYSIS\n";
  text += separator + "\n\n";
  insights.deep_insights.forEach((insight, idx) => {
    text += `${idx + 1}. ${insight}\n\n`;
  });
  
  // Conflicts
  if (insights.conflicts_across_sources && insights.conflicts_across_sources.length > 0) {
    text += separator + "\n";
    text += "CONFLICTS & CONTRADICTIONS\n";
    text += separator + "\n\n";
    insights.conflicts_across_sources.forEach((conflict, idx) => {
      text += `⚠️  ${idx + 1}. ${conflict}\n\n`;
    });
  }
  
  // Opportunities
  if (insights.opportunities_or_gaps && insights.opportunities_or_gaps.length > 0) {
    text += separator + "\n";
    text += "OPPORTUNITIES & GAPS\n";
    text += separator + "\n\n";
    insights.opportunities_or_gaps.forEach((opportunity, idx) => {
      text += `→  ${idx + 1}. ${opportunity}\n\n`;
    });
  }
  
  // Recommendations
  text += separator + "\n";
  text += "ACTIONABLE RECOMMENDATIONS\n";
  text += separator + "\n\n";
  insights.recommendations.forEach((rec, idx) => {
    text += `✓  ${idx + 1}. ${rec}\n\n`;
  });
  
  // Domain-Specific Insights
  if (insights.domain_specific_insights && insights.domain_specific_insights.length > 0) {
    text += separator + "\n";
    text += "DOMAIN-SPECIFIC INSIGHTS\n";
    text += separator + "\n\n";
    insights.domain_specific_insights.forEach((insight, idx) => {
      text += `${idx + 1}. ${insight}\n\n`;
    });
  }
  
  // Comparison
  if (insights.comparison) {
    text += separator + "\n";
    text += "MULTI-SITE COMPARISON\n";
    text += separator + "\n\n";
    
    text += `Overview: ${insights.comparison.summary}\n\n`;
    
    // Similarities
    if (insights.comparison.similarities.length > 0) {
      text += minorSeparator + "\n";
      text += "Common Similarities\n";
      text += minorSeparator + "\n\n";
      insights.comparison.similarities.forEach((sim, idx) => {
        text += `  • ${sim}\n`;
      });
      text += "\n";
    }
    
    // Differences
    if (insights.comparison.differences.length > 0) {
      text += minorSeparator + "\n";
      text += "Key Differences\n";
      text += minorSeparator + "\n\n";
      insights.comparison.differences.forEach((diff, idx) => {
        text += `  • ${diff}\n`;
      });
      text += "\n";
    }
    
    // Per-site breakdown
    text += minorSeparator + "\n";
    text += "Site-by-Site Analysis\n";
    text += minorSeparator + "\n\n";
    
    insights.comparison.site_comparisons.forEach((site, idx) => {
      text += `Site ${idx + 1}: ${site.title}\n`;
      text += `URL: ${site.url}\n\n`;
      
      if (insights.comparison?.winner === site.url) {
        text += `🏆 RECOMMENDED CHOICE\n\n`;
      }
      
      if (site.strengths.length > 0) {
        text += `  Strengths:\n`;
        site.strengths.forEach(s => text += `    ✓ ${s}\n`);
        text += "\n";
      }
      
      if (site.weaknesses.length > 0) {
        text += `  Weaknesses:\n`;
        site.weaknesses.forEach(w => text += `    ✗ ${w}\n`);
        text += "\n";
      }
      
      if (site.unique_features.length > 0) {
        text += `  Unique Features:\n`;
        site.unique_features.forEach(f => text += `    ★ ${f}\n`);
        text += "\n";
      }
      
      text += "\n";
    });
    
    if (insights.comparison.winner && insights.comparison.winner_reasoning) {
      text += minorSeparator + "\n";
      text += "Overall Recommendation\n";
      text += minorSeparator + "\n\n";
      text += insights.comparison.winner_reasoning + "\n\n";
    }
  }
  
  // Footer
  text += separator + "\n";
  text += "                      END OF REPORT\n";
  text += separator + "\n";
  
  return text;
}
