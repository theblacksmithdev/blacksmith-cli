import { log, promptSelect } from './logger.js'

interface FrameworkChoice<T extends string> {
  /** The value passed with `--backend` or `--frontend`, if any. */
  flag: string | undefined
  /** Whether the project type has this half at all. */
  needed: boolean
  frameworks: T[]
  fallback: T
  /** The prompt, e.g. "Backend framework". */
  label: string
}

/**
 * The framework for one half of a new project: the flag's value, or the answer
 * to a prompt when the project needs one and no flag was given.
 */
export async function chooseFramework<T extends string>({
  flag,
  needed,
  frameworks,
  fallback,
  label,
}: FrameworkChoice<T>): Promise<T> {
  // A bad value is an error even when the project has no such half and the
  // flag is otherwise ignored — silently accepting a typo helps nobody.
  if (flag && !frameworks.includes(flag as T)) {
    log.error(`Invalid ${label.toLowerCase()}: "${flag}". Must be one of: ${frameworks.join(', ')}`)
    process.exit(1)
  }
  if (!needed) return fallback
  if (flag) return flag as T

  const selected = await promptSelect(label, frameworks, fallback)
  // The config must never record a framework the CLI cannot act on, so an
  // unrecognised answer falls back to the default rather than being stored.
  return frameworks.includes(selected as T) ? (selected as T) : fallback
}
