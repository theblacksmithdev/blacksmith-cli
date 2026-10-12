import { exec } from './exec.js'

/** Spring Boot 4 needs Java 17. */
export const MINIMUM_JAVA_VERSION = 17

/**
 * The installed JDK's major version, or null when there is none. `java -version`
 * reports on stderr; macOS's /usr/bin/java stub fails when no JDK is installed.
 */
async function javaMajorVersion(): Promise<number | null> {
  try {
    const { stderr } = await exec('java', ['-version'], { silent: true })
    return parseJavaVersion(String(stderr))
  } catch {
    return null
  }
}

/** The installed JDK's major version when it is one Spring Boot can use, otherwise null. */
export async function supportedJavaVersion(): Promise<number | null> {
  const version = await javaMajorVersion()
  return version !== null && version >= MINIMUM_JAVA_VERSION ? version : null
}

/** `openjdk version "21.0.2"` → 21; the old `"1.8.0_292"` form → 8. */
export function parseJavaVersion(output: string): number | null {
  const match = output.match(/version "(\d+)(?:\.(\d+))?/)
  if (!match) return null
  const major = Number(match[1])
  return major === 1 ? Number(match[2]) : major
}
