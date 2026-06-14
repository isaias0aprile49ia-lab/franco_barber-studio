const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://francobarberstudio.com';

export default function sitemap() {
  const now = new Date();
  return [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/servizi`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/prodotti`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contatti`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
