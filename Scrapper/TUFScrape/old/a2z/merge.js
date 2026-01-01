import fs from "fs";

// const dataGfg = JSON.parse(fs.readFileSync('./tuf_2024Feb_Scrap_gfglinks.json', 'utf-8'));
const dataGfg = JSON.parse(fs.readFileSync("./gfgDirectLinks.json", "utf-8"));
const dataCode = JSON.parse(
  fs.readFileSync("./tuf_2024Feb_Scrap_codeingninjaslinks.json", "utf-8"),
);
const data2 = JSON.parse(fs.readFileSync("../../tufProblems.json", "utf-8"));

// map sources by problemName
const gfgMap = new Map(dataGfg.map((item) => [item.problemName, item]));
const codeMap = new Map(dataCode.map((item) => [item.problemName, item]));

let matchCount = 0;
let noMatchCount = 0;
let gfgAddedCount = 0;
let codestudioAddedCount = 0;

const mergedData = data2.map((item) => {
  const matchGfg = gfgMap.get(item.problemName);
  const matchCode = codeMap.get(item.problemName);

  if (matchGfg || matchCode) {
    matchCount++;
    const updated = { ...item };

    if (matchGfg && Array.isArray(matchGfg.gfgLink) && !item.gfgLink) {
      gfgAddedCount += matchGfg.gfgLink.length;
      updated.gfgLink = matchGfg.gfgLink[0];
    }

    if (
      matchCode &&
      Array.isArray(matchCode.codestudio) &&
      !item.codestudioLink
    ) {
      codestudioAddedCount += matchCode.codestudio.length;
      updated.codestudioLink = matchCode.codestudio[0];
    }

    // detect multiple links in sources
    if (
      (matchGfg?.gfgLink?.length ?? 0) > 1 ||
      (matchCode?.codestudio?.length ?? 0) > 1
    ) {
      console.log(`Multiple Links for Problem: , "${item.problemName}"`);
      if ((matchGfg?.gfgLink?.length ?? 0) > 1) {
        console.log(
          `> gfgLink count: ${matchGfg.gfgLink.length}, ${matchGfg.gfgLink}`,
        );
      }
      if ((matchCode?.codestudio?.length ?? 0) > 1) {
        console.log(
          `> codestudio count: ${matchCode.codestudio.length}, ${matchCode.codestudio}`,
        );
      }
    }

    return updated;
  } else {
    noMatchCount++;
  }

  return item;
});

// metadata
const meta = {
  totalInGfgSource: dataGfg.length,
  totalInCodeSource: dataCode.length,
  totalInSource2: data2.length,
  matchedProblems: matchCount,
  unmatchedProblems: noMatchCount,
  gfgLinkAdded: gfgAddedCount,
  codestudioLinkAdded: codestudioAddedCount,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync("./merged.json", JSON.stringify(mergedData, null, 2), "utf-8");

// console logs
console.log("\n✅ Merge Completed");
console.log("📊 Summary:");
console.log(`   Total GFG Source Problems  : ${dataGfg.length}`);
console.log(`   Total CodeStudio Problems : ${dataCode.length}`);
console.log(`   Total Target Problems     : ${data2.length}`);
console.log(`   Matched Problems       : ${matchCount}`);
console.log(`   Unmatched Problems     : ${noMatchCount}`);
console.log(`   GFG Links Added        : ${gfgAddedCount}`);
console.log(`   CodeStudio Links Added : ${codestudioAddedCount}`);
