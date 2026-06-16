// Klient-sidig textextrahering ur PDF med pdfjs-dist.
//
// Hela PDF-filen stannar i webbläsaren. Endast den extraherade texten skickas
// vidare. pdfjs importeras dynamiskt så att den bara laddas i webbläsaren.

/** Extraherar all text ur en PDF-fil (sida för sida). */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  // Worker självhostas från /public så att inget laddas från ett CDN.
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;

  try {
    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const text = (content.items as Array<{ str?: string }>)
        .map((item) => item.str ?? "")
        .join(" ");
      pages.push(text);
      page.cleanup();
    }
    return normalize(pages.join("\n\n"));
  } finally {
    // destroy() finns på laddningsuppgiften och stänger även worker-tråden.
    await loadingTask.destroy();
  }
}

/** Snyggar till whitespace så texten blir läsbar i textrutan. */
function normalize(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
