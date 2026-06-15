import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export const useSEO = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogImage,
  canonicalUrl,
}: SEOProps) => {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = `${title} | AppointIndia`;
    } else {
      document.title = 'AppointIndia - Find Jobs, Recruitment & Hiring Portal';
    }

    // Helper to update/create meta tag
    const updateMetaTag = (name: string, content: string | undefined, attribute: 'name' | 'property' = 'name') => {
      if (!content) return;
      let el = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Update standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // 3. Update Open Graph (OG) tags for social sharing (Facebook, LinkedIn)
    updateMetaTag('og:title', ogTitle || title, 'property');
    updateMetaTag('og:description', ogDescription || description, 'property');
    updateMetaTag('og:type', ogType, 'property');
    if (ogImage) {
      updateMetaTag('og:image', ogImage, 'property');
    }

    // 4. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogType, ogImage, canonicalUrl]);
};
