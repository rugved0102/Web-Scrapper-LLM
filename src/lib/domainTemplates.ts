// Domain-specific templates for website analysis
// These provide pre-built prompts optimized for different types of websites

export interface DomainTemplate {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon name instead of emoji
  extractionPrompt: string;
  analysisPrompt: string;
  exampleUrls: string[];
}

export const domainTemplates: Record<string, DomainTemplate> = {
  ecommerce: {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Extract product details, prices, ratings, and reviews",
    iconName: "ShoppingCart",
    extractionPrompt: `Extract the following information from this e-commerce page:
- Product name and brand
- Current price and original price (if discounted)
- Customer ratings and number of reviews
- Key product specifications and features
- Stock availability
- Shipping information
- Product category and tags
- Customer review highlights (positive and negative sentiments)

Focus on structured data that helps understand the product offering and value proposition.`,
    analysisPrompt: `Analyze this e-commerce product page focusing on:
1. Pricing strategy and value proposition
2. Product differentiation and unique selling points
3. Customer sentiment and review patterns
4. Competitive positioning
5. Purchase barriers or concerns from reviews
6. Opportunities for optimization (pricing, description, images)
7. Target audience insights from product features`,
    exampleUrls: [
      "amazon.com",
      "ebay.com",
      "etsy.com",
      "shopify stores"
    ]
  },

  news: {
    id: "news",
    name: "News & Media",
    description: "Analyze news articles, headlines, and media content",
    iconName: "Newspaper",
    extractionPrompt: `Extract the following from this news article:
- Headline and subheadline
- Author(s) and publication date
- Article category/section
- Main story/topic
- Key facts and quotes
- Sources cited
- Related articles or topics
- Sentiment and tone (neutral, positive, negative)
- Geographic focus

Focus on factual content and journalistic elements.`,
    analysisPrompt: `Analyze this news article focusing on:
1. Main narrative and key takeaways
2. Credibility and source quality
3. Bias or editorial stance (if any)
4. Completeness of coverage
5. Context and background provided
6. Impact and significance of the story
7. Comparison with other coverage (if multiple sources)`,
    exampleUrls: [
      "cnn.com",
      "nytimes.com",
      "reuters.com",
      "bbc.com"
    ]
  },

  research: {
    id: "research",
    name: "Research & Academic",
    description: "Extract scholarly content, citations, and methodology",
    iconName: "Microscope",
    extractionPrompt: `Extract the following from this research/academic page:
- Paper/study title and authors
- Abstract or summary
- Research methodology
- Key findings and conclusions
- Data sources and sample size
- Publication date and journal
- Citations and references
- Keywords and topics
- Limitations acknowledged

Focus on scientific rigor and academic structure.`,
    analysisPrompt: `Analyze this research content focusing on:
1. Research question and hypothesis
2. Methodology strength and validity
3. Significance of findings
4. Limitations and potential biases
5. Practical applications
6. Contribution to the field
7. Areas for further research`,
    exampleUrls: [
      "scholar.google.com",
      "arxiv.org",
      "pubmed.gov",
      "researchgate.net"
    ]
  },

  jobs: {
    id: "jobs",
    name: "Job Listings",
    description: "Extract job requirements, salary, and company details",
    iconName: "Briefcase",
    extractionPrompt: `Extract the following from this job posting:
- Job title and level (entry, mid, senior)
- Company name and industry
- Location and remote work options
- Salary range (if provided)
- Required skills and qualifications
- Preferred qualifications
- Job responsibilities
- Benefits and perks
- Application deadline
- Company culture indicators

Focus on requirements and what makes this role unique.`,
    analysisPrompt: `Analyze this job posting focusing on:
1. Role clarity and expectations
2. Required vs. preferred qualifications gap
3. Compensation competitiveness (if visible)
4. Growth and learning opportunities
5. Work-life balance indicators
6. Company culture fit signals
7. Red flags or concerns (unrealistic requirements, etc.)`,
    exampleUrls: [
      "linkedin.com/jobs",
      "indeed.com",
      "glassdoor.com",
      "monster.com"
    ]
  },

  realestate: {
    id: "realestate",
    name: "Real Estate",
    description: "Extract property details, pricing, and location info",
    iconName: "Home",
    extractionPrompt: `Extract the following from this real estate listing:
- Property address and location
- Price and price per square foot
- Property type (house, condo, land, etc.)
- Bedrooms, bathrooms, square footage
- Lot size and year built
- Key features and amenities
- Property condition and recent updates
- HOA fees (if applicable)
- School district and ratings
- Neighborhood characteristics

Focus on both quantitative specs and qualitative features.`,
    analysisPrompt: `Analyze this real estate listing focusing on:
1. Value assessment and price positioning
2. Property condition and maintenance needs
3. Location advantages and disadvantages
4. Investment potential
5. Comparison to market averages
6. Target buyer profile
7. Deal breakers or major selling points`,
    exampleUrls: [
      "zillow.com",
      "realtor.com",
      "redfin.com",
      "trulia.com"
    ]
  },

  socialmedia: {
    id: "socialmedia",
    name: "Social Media",
    description: "Analyze social posts, engagement, and trends",
    iconName: "Smartphone",
    extractionPrompt: `Extract the following from this social media content:
- Post author/account and verification status
- Post date and time
- Main message or content
- Media type (text, image, video, link)
- Engagement metrics (likes, shares, comments if visible)
- Hashtags and mentions
- Tone and sentiment
- Call-to-action (if any)
- Thread or conversation context

Focus on content, engagement, and social signals.`,
    analysisPrompt: `Analyze this social media content focusing on:
1. Message effectiveness and clarity
2. Audience engagement patterns
3. Sentiment and reactions
4. Viral potential or reach
5. Brand voice and authenticity
6. Timing and relevance
7. Controversy or notable responses`,
    exampleUrls: [
      "twitter.com",
      "linkedin.com/posts",
      "facebook.com",
      "instagram.com"
    ]
  },

  documentation: {
    id: "documentation",
    name: "Documentation & Guides",
    description: "Extract technical docs, tutorials, and how-to content",
    iconName: "BookOpen",
    extractionPrompt: `Extract the following from this documentation:
- Document title and version
- Target audience (beginner, advanced, etc.)
- Main topics covered
- Step-by-step instructions or procedures
- Code examples or snippets
- Prerequisites and requirements
- Common issues and troubleshooting
- Related documentation links
- Last updated date

Focus on clarity, completeness, and usability.`,
    analysisPrompt: `Analyze this documentation focusing on:
1. Clarity and readability
2. Completeness and depth
3. Organization and navigation
4. Code example quality
5. Beginner-friendliness
6. Missing information or gaps
7. Maintenance and up-to-date status`,
    exampleUrls: [
      "docs.github.com",
      "developer.mozilla.org",
      "stackoverflow.com",
      "readthedocs.io"
    ]
  },

  general: {
    id: "general",
    name: "General Purpose",
    description: "Extract all text content and main information",
    iconName: "Globe",
    extractionPrompt: `Extract the main content from this webpage:
- Page title and description
- Main headings and sections
- Key information and facts
- Important links
- Contact information (if present)
- Date/time information (if relevant)
- Any structured data (lists, tables, etc.)

Provide a comprehensive overview of the page content.`,
    analysisPrompt: `Analyze this webpage focusing on:
1. Main purpose and goal
2. Content quality and accuracy
3. User experience and accessibility
4. Information hierarchy
5. Credibility and trustworthiness
6. Call-to-action effectiveness
7. Areas for improvement`,
    exampleUrls: [
      "Any website",
      "Landing pages",
      "About pages",
      "Contact pages"
    ]
  }
};

export const getDomainTemplate = (domainId: string): DomainTemplate => {
  return domainTemplates[domainId] || domainTemplates.general;
};

export const getAllDomains = (): DomainTemplate[] => {
  return Object.values(domainTemplates);
};
