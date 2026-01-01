import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFile = path.join(__dirname, "tuf_2024Feb_Scrap_gfglinks.json");
const outFile = path.join(__dirname, "gfgDirectLinks.json");

const LIMIT = Number.isFinite(+process.env.LIMIT)
  ? +process.env.LIMIT
  : Infinity;
const CONCURRENCY = 5;

const axiosBaseConfig = {
  maxRedirects: 5,
  timeout: 10_000,
  validateStatus: (status) => status >= 200 && status < 400,
};

function resolveFinalUrl(resp, fallback) {
  return (
    resp?.request?.res?.responseUrl ||
    resp?.request?.responseURL ||
    resp?.config?.url ||
    fallback
  );
}

async function unshorten(url) {
  try {
    const resp = await axios.head(url, axiosBaseConfig);
    return resolveFinalUrl(resp, url);
  } catch {
    // HEAD sometimes breaks → fallback GET (stream, no body read)
    try {
      const resp = await axios.get(url, {
        ...axiosBaseConfig,
        responseType: "stream",
        validateStatus: () => true,
      });
      resp.data?.destroy?.();
      return resolveFinalUrl(resp, url);
    } catch {
      return url;
    }
  }
}

export default async function unShortenGFGLinks() {
  const data = JSON.parse(await fs.readFile(dataFile, "utf-8"));

  // shallow clone is enough
  const updated = data.map((entry) => ({
    ...entry,
    gfgLink: Array.isArray(entry.gfgLink) ? [...entry.gfgLink] : entry.gfgLink,
  }));

  const tasks = [];

  data.forEach((entry, i) => {
    if (!Array.isArray(entry.gfgLink)) return;
    entry.gfgLink.forEach((orig, j) => {
      if (orig && tasks.length < LIMIT) {
        tasks.push({ i, j, orig });
      }
    });
  });

  for (let k = 0; k < tasks.length; k += CONCURRENCY) {
    const batch = tasks.slice(k, k + CONCURRENCY);

    await Promise.all(
      batch.map(async ({ i, j, orig }) => {
        const final = await unshorten(orig);
        updated[i].gfgLink[j] = final;
        console.log(`Updated [${i}][${j}] → ${final}`);
      }),
    );

    await fs.writeFile(outFile, JSON.stringify(updated, null, 2));
    console.log(`Checkpoint saved (batch ${k / CONCURRENCY + 1})`);
  }

  console.log("Done.");
  return updated;
}

unShortenGFGLinks();
// console.log(await unshorten('http://bit.ly/3T3oW9M'));
