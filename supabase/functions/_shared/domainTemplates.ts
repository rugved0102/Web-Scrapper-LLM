export interface DomainTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  extractionPrompt: string;
  analysisPrompt: string;
  exampleUrls: string[];
}

export const domainTemplates: Record<string, DomainTemplate> = {
  ecommerce: {
    id: "ecommerce",
    name: "E-commerce",
    description: "Extract product details, pricing, and customer reviews",
    icon: "🛍️",
    extractionPrompt: `Extract the following information from this e-commerce page:
      - Product name and brand
      - Price (current, original if on sale)
      - Product ratings and number of reviews
      - Key product features and specifications
      - Stock availability
      - Shipping information
      - Customer review highlights (top positive and negative points)`,
    analysisPrompt: `Analyze this e-commerce product data focusing on:
      - Value proposition and competitive pricing
      - Product quality indicators from reviews
      - Customer satisfaction patterns
      - Common complaints or concerns
      - Purchase decision factors
      - Recommendations for buyers`,
    exampleUrls: ["amazon.com", "shopify.com", "etsy.com"]
  },
  news: {
    id: "news",
    name: "News & Articles",
    description: "Analyze news content, journalism quality, and source credibility",
    icon: "📰",
    extractionPrompt: `Extract the following from this news article:
      - Headline and subheadline
      - Author and publication date
      - Main facts and claims
      - Sources cited
      - Quotes from key figures
      - Context and background information
      - Related events or previous coverage`,
    analysisPrompt: `Analyze this news content focusing on:
      - Factual accuracy and verification
      - Source credibility and bias
      - Story significance and impact
      - Multiple perspectives presented
      - Missing context or information
      - Journalistic quality
      - Implications and future developments`,
    exampleUrls: ["nytimes.com", "bbc.com", "reuters.com"]
  },
  research: {
    id: "research",
    name: "Academic Research",
    description: "Extract research methodology, findings, and citations",
    icon: "🔬",
    extractionPrompt: `Extract these elements from the research paper:
      - Title, authors, and institution
      - Abstract and key findings
      - Research methodology and approach
      - Data sources and sample size
      - Results and statistical significance
      - Conclusions and implications
      - Limitations acknowledged
      - Citations and references`,
    analysisPrompt: `Analyze this research focusing on:
      - Methodology rigor and validity
      - Strength of evidence and findings
      - Statistical significance and effect sizes
      - Practical applications
      - Research gaps identified
      - Reproducibility considerations
      - Contribution to the field`,
    exampleUrls: ["arxiv.org", "nature.com", "sciencedirect.com"]
  },
  jobs: {
    id: "jobs",
    name: "Job Listings",
    description: "Extract job requirements, compensation, and company info",
    icon: "💼",
    extractionPrompt: `Extract from this job posting:
      - Job title and level
      - Company name and industry
      - Location and remote options
      - Salary range and compensation
      - Required qualifications and experience
      - Preferred skills
      - Job responsibilities
      - Benefits and perks
      - Application process`,
    analysisPrompt: `Analyze this job listing focusing on:
      - Compensation competitiveness
      - Required vs preferred qualifications
      - Career growth opportunities
      - Work-life balance indicators
      - Company culture signals
      - Red flags or concerns
      - Market demand for this role
      - Recommendations for applicants`,
    exampleUrls: ["linkedin.com/jobs", "indeed.com", "glassdoor.com"]
  },
  realestate: {
    id: "realestate",
    name: "Real Estate",
    description: "Analyze property listings, pricing, and location details",
    icon: "🏠",
    extractionPrompt: `Extract from this property listing:
      - Property address and type
      - Price and price history
      - Size (sq ft, bedrooms, bathrooms)
      - Year built and condition
      - Key features and amenities
      - Neighborhood information
      - School district ratings
      - HOA fees and property taxes
      - Days on market`,
    analysisPrompt: `Analyze this property focusing on:
      - Price per square foot comparison
      - Value relative to neighborhood
      - Investment potential
      - Location advantages and drawbacks
      - Condition and renovation needs
      - Market trend indicators
      - Deal quality assessment
      - Recommendations for buyers/investors`,
    exampleUrls: ["zillow.com", "redfin.com", "realtor.com"]
  },
  socialmedia: {
    id: "socialmedia",
    name: "Social Media",
    description: "Analyze social content, engagement, and sentiment",
    icon: "📱",
    extractionPrompt: `Extract from this social media content:
      - Author/account information
      - Post content and media
      - Engagement metrics (likes, shares, comments)
      - Posting time and reach
      - Hashtags and mentions
      - Comment sentiment
      - Viral indicators
      - Discussion themes`,
    analysisPrompt: `Analyze this social content focusing on:
      - Engagement quality and authenticity
      - Audience sentiment and reactions
      - Influence and reach
      - Content effectiveness
      - Trending topics and themes
      - Community response patterns
      - Virality factors
      - Strategic recommendations`,
    exampleUrls: ["twitter.com", "linkedin.com", "instagram.com"]
  },
  documentation: {
    id: "documentation",
    name: "Documentation",
    description: "Extract technical docs, APIs, and implementation guides",
    icon: "📚",
    extractionPrompt: `Extract from this documentation:
      - Title and overview
      - Main topics covered
      - Prerequisites and requirements
      - Step-by-step instructions
      - Code examples and snippets
      - Configuration options
      - Troubleshooting guidance
      - Related resources and links`,
    analysisPrompt: `Analyze this documentation focusing on:
      - Clarity and completeness
      - Organization and structure
      - Example quality and relevance
      - Common use cases covered
      - Missing information or gaps
      - User-friendliness
      - Technical accuracy
      - Improvement suggestions`,
    exampleUrls: ["docs.github.com", "developer.mozilla.org", "stackoverflow.com"]
  },
  general: {
    id: "general",
    name: "General Purpose",
    description: "Comprehensive analysis for any website type",
    icon: "🌐",
    extractionPrompt: `Extract key information from this website:
      - Main purpose and topic
      - Key content sections
      - Important facts and data
      - Author/organization information
      - Dates and timeliness
      - Call-to-action elements
      - Credibility indicators
      - Related resources`,
    analysisPrompt: `Provide comprehensive analysis covering:
      - Main themes and messages
      - Content quality and credibility
      - Information completeness
      - Actionable insights
      - Strengths and weaknesses
      - Target audience
      - Practical applications
      - General recommendations`,
    exampleUrls: ["*"]
  }
};

export function getDomainTemplate(domainId: string): DomainTemplate {
  return domainTemplates[domainId] || domainTemplates.general;
}

export function getAllDomains(): DomainTemplate[] {
  return Object.values(domainTemplates);
}
