import { useState } from "react";
import { removeBackground } from "@imgly/background-removal";

export function useScraper() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scrape = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("Failed to fetch product data from " + url);

      const json = await res.json();
      if (!json.imageUrl) throw new Error("No product image found at " + url);
      
      console.log("Scraped data:", json);

      try {
        // Client-side ML background removal with configuration
        const config = {
          debug: false,
          model: "medium", 
          progress: (p) => console.log(`Background removal progress: ${Math.round(p * 100)}%`),
        };

        const blob = await removeBackground(json.imageUrl, config);
        const transparentUrl = URL.createObjectURL(blob);
        setData({ ...json, imageUrl: transparentUrl });
      } catch (bgError) {
        console.error("Background removal failed:", bgError);
        setData(json); // Fallback
      }
    } catch (err) {
      console.error("Scraper error:", err);
      setError(err.message || "An error occurred during scraping");
    } finally {
      setLoading(false);
    }
  };

  return { scrape, data, loading, error };
}
