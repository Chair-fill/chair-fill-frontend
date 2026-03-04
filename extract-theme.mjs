import fs from "fs";
import { JSDOM } from "jsdom";

async function extractTheme() {
  const url = "https://chairfill.co/";
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url);
    const html = await res.text();
    fs.writeFileSync("chairfill_temp.html", html);

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Look for tailwind css configs or style tags
    const styles = Array.from(document.querySelectorAll("style")).map(
      (s) => s.innerHTML,
    );
    const links = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    ).map((l) => l.href);

    console.log(
      `Found ${styles.length} style tags and ${links.length} stylesheet links.`,
    );

    let combinedStyles = styles.join("\n\n");
    fs.writeFileSync("chairfill_styles_inline.css", combinedStyles);

    // Attempt to parse out basic css variables from :root if they exist in inline styles
    const rootMatch = combinedStyles.match(/:root\s*\{([^}]+)\}/);
    if (rootMatch) {
      console.log("Found :root variables in inline styles:");
      console.log(rootMatch[1].trim());
    } else {
      console.log("No :root variables found directly in inline styles.");
    }

    console.log("Links to external CSS:", links);
  } catch (err) {
    console.error("Error fetching theme:", err);
  }
}

extractTheme();
