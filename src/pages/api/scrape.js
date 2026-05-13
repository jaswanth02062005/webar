import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract Product Title
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("h1").first().text().trim() ||
      $("title").text().trim();

    // Extract Product Description
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "No description available.";

    // Extract Brand Name
    const brandName =
      $('meta[property="og:site_name"]').attr("content") ||
      $('meta[name="author"]').attr("content") ||
      new URL(url).hostname.replace("www.", "").split(".")[0].toUpperCase();

    // Enhanced Image Extraction
    let imageUrl = null;
    const images = [];

    // 1. Check OpenGraph Image
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) images.push(ogImage);

    // 2. Check Schema.org JSON-LD (if present)
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const ld = JSON.parse($(el).html());
        if (ld.image) {
          if (Array.isArray(ld.image)) images.push(...ld.image);
          else images.push(ld.image);
        }
      } catch (e) {}
    });

    // 3. Find large images in the body
    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-original");
      const alt = $(el).attr("alt") || "";
      const className = $(el).attr("class") || "";
      const id = $(el).attr("id") || "";
      
      const isLikelyProduct = 
        alt.toLowerCase().includes("product") || 
        alt.toLowerCase().includes("model") || 
        className.toLowerCase().includes("product") ||
        id.toLowerCase().includes("product") ||
        id.toLowerCase().includes("main-image");

      if (src && isLikelyProduct) {
        images.push(src);
      }
    });

    // Heuristic: Pick the first "likely" product image
    imageUrl = images.find(img => img && img.startsWith("http")) || images[0];

    // Handle relative URLs
    if (imageUrl && imageUrl.startsWith("/")) {
      const urlObj = new URL(url);
      imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
    }

    // Proxy the image to Base64 to bypass CORS for client-side ML
    let proxiedImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith("http")) {
      try {
        const imgRes = await fetch(imageUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer();
          const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
          proxiedImageUrl = `data:${mimeType};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
        }
      } catch (proxyError) {
        console.warn("Failed to proxy image, returning raw URL.", proxyError);
      }
    }

    // Mock size chart extraction (can be improved later)
    let sizeChart = { S: 40, M: 45, L: 50, XL: 55 };

    res.status(200).json({
      imageUrl: proxiedImageUrl || imageUrl,
      brandName,
      title,
      description,
      sizeChart,
    });
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({ error: "Failed to scrape the provided URL" });
  }
}
