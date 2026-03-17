import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
}

export function usePageSEO({ title, description }: SEOProps) {
  useEffect(() => {
    // Update page title
    document.title = title.includes("Blueladder")
      ? title
      : `${title} | Blueladder Infra`;

    // Update meta description
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      }

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute("content", description);
      }
    }

    // Update og:title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", title);
    }
  }, [title, description]);
}
