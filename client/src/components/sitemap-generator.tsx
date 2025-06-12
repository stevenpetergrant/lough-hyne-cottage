// SEO Sitemap Generator for Lough Hyne Cottage
export const generateSitemap = () => {
  const baseUrl = 'https://loughhynecottage.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const pages = [
    {
      url: baseUrl,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      url: `${baseUrl}/booking`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: `${baseUrl}/blog`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${baseUrl}/our-story`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: `${baseUrl}/events-experiences`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${baseUrl}/cabin-booking`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: `${baseUrl}/sauna-booking`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      url: `${baseUrl}/yoga-booking`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/bread-booking`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.7'
    }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: https://loughhynecottage.com/sitemap.xml

# Block admin areas
Disallow: /admin/
Disallow: /api/

# Allow specific booking pages
Allow: /booking
Allow: /cabin-booking
Allow: /sauna-booking
Allow: /yoga-booking
Allow: /bread-booking

# Crawl delay
Crawl-delay: 1`;
};