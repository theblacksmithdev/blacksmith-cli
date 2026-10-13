import { execSilent } from './exec.js'

/** The first usable version on one Node.js release line, e.g. 20.19. */
export interface NodeVersionFloor {
  major: number
  minor: number
}

/** `v20.19.1` → { major: 20, minor: 19 }. */
export function parseNodeVersion(output: string): NodeVersionFloor | null {
  const match = output.trim().match(/^v?(\d+)\.(\d+)/)
  return match ? { major: Number(match[1]), minor: Number(match[2]) } : null
}

/**
 * Whether a version meets the floors, read like an npm `engines` range
 * (`^20.19.0 || >=22.12.0`): at or past the floor on a listed release line,
 * or on a line newer than the last one listed.
 */
export function meetsNodeFloors(version: NodeVersionFloor, floors: NodeVersionFloor[]): boolean {
  const sameLine = floors.find((floor) => floor.major === version.major)
  if (sameLine) return version.minor >= sameLine.minor
  return floors.every((floor) => version.major > floor.major)
}

/** The floors as a sentence: "20.19+ or 22.12+". */
export function describeNodeFloors(floors: NodeVersionFloor[]): string {
  return floors.map((floor) => `${floor.major}.${floor.minor}+`).join(' or ')
}

/** The installed Node.js version, or null when it cannot be read. */
export async function installedNodeVersion(): Promise<NodeVersionFloor | null> {
  try {
    return parseNodeVersion(await execSilent('node', ['--version']))
  } catch {
    return null
  }
}
