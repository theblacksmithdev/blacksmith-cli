import fs from 'node:fs'
import path from 'node:path'

/** Where `./gradlew jacocoTestReport` writes its reports, relative to the backend root. */
export const JACOCO_XML_REPORT = path.join('build', 'reports', 'jacoco', 'test', 'jacocoTestReport.xml')
export const JACOCO_HTML_REPORT = path.join('build', 'reports', 'jacoco', 'test', 'html', 'index.html')

/**
 * The whole report's line coverage as a percentage, or null when the report
 * has no line counter. The report-wide counters close the file, after every
 * package's own, so the last LINE counter is the total.
 */
export function jacocoLineCoverage(xml: string): number | null {
  const counters = [...xml.matchAll(/<counter type="LINE" missed="(\d+)" covered="(\d+)"\/>/g)]
  const total = counters.at(-1)
  if (!total) return null
  const missed = Number(total[1])
  const covered = Number(total[2])
  return missed + covered === 0 ? null : (covered / (missed + covered)) * 100
}

/** Read the backend's JaCoCo XML report and return its line coverage, or null. */
export function readJacocoLineCoverage(backendDir: string): number | null {
  const report = path.join(backendDir, JACOCO_XML_REPORT)
  return fs.existsSync(report) ? jacocoLineCoverage(fs.readFileSync(report, 'utf-8')) : null
}
