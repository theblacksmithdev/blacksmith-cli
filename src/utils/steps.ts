import { log, spinner } from './logger.js'

/** One spinner-wrapped piece of work a command runs against a directory. */
export interface Step {
  pending: string
  done: string
  failed: string
  run(dir: string): Promise<unknown>
}

/** Run a step under its spinner. A failure is fatal: it is reported and the CLI exits. */
export async function runStep(step: Step, dir: string): Promise<void> {
  const s = spinner(step.pending)
  try {
    await step.run(dir)
    s.succeed(step.done)
  } catch (error: any) {
    s.fail(step.failed)
    log.error(error.message || error)
    process.exit(1)
  }
}
