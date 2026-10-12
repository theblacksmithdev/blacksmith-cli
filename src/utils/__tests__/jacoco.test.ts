import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { useTmpDir } from '../../__tests__/helpers.js'
import { JACOCO_XML_REPORT, jacocoLineCoverage, readJacocoLineCoverage } from '../jacoco.js'

// A package's counters come first; the report-wide totals close the file
const REPORT = `<report name="app"><package name="app/posts">
<counter type="INSTRUCTION" missed="11" covered="64"/><counter type="LINE" missed="3" covered="19"/></package>
<counter type="INSTRUCTION" missed="183" covered="2107"/><counter type="LINE" missed="39" covered="414"/></report>`

describe('jacocoLineCoverage', () => {
  it('reads the report-wide line counter, not a package one', () => {
    expect(jacocoLineCoverage(REPORT)).toBeCloseTo((414 / 453) * 100)
  })

  it('is null for a report without lines', () => {
    expect(jacocoLineCoverage('<report name="app"></report>')).toBeNull()
    expect(jacocoLineCoverage('<counter type="LINE" missed="0" covered="0"/>')).toBeNull()
  })
})

describe('readJacocoLineCoverage', () => {
  const getTmpDir = useTmpDir()

  it('reads the XML report under the backend directory', () => {
    const report = path.join(getTmpDir(), JACOCO_XML_REPORT)
    fs.mkdirSync(path.dirname(report), { recursive: true })
    fs.writeFileSync(report, REPORT)

    expect(readJacocoLineCoverage(getTmpDir())).toBeCloseTo(91.4, 1)
  })

  it('is null when the tests wrote no report', () => {
    expect(readJacocoLineCoverage(getTmpDir())).toBeNull()
  })
})
