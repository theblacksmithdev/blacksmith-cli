import type { BackendFramework, FrontendFramework, ProjectType } from '../utils/paths.js'
import type { Skill } from './types.js'
import { coreRulesSkill } from './core-rules.js'
import { projectOverviewSkill } from './project-overview.js'
import { djangoSkill } from './django.js'
import { djangoRestAdvancedSkill } from './django-rest-advanced.js'
import { apiDocumentationSkill } from './api-documentation.js'
import { backendModularizationSkill } from './backend-modularization.js'
import { expressSkill } from './express.js'
import { expressPrismaSkill } from './express-prisma.js'
import { expressOpenApiSkill } from './express-openapi.js'
import { fastapiSkill } from './fastapi.js'
import { fastapiSqlalchemySkill } from './fastapi-sqlalchemy.js'
import { springSkill } from './spring.js'
import { springJpaSkill } from './spring-jpa.js'
import { reactSkill } from './react.js'
import { reactQuerySkill } from './react-query.js'
import { pageStructureSkill } from './page-structure.js'
import { chakraUiReactSkill } from './chakra-ui-react.js'
import { chakraUiFormsSkill } from './chakra-ui-forms.js'
import { chakraUiAuthSkill } from './chakra-ui-auth.js'
import { blacksmithHooksSkill } from './blacksmith-hooks.js'
import { blacksmithCliSkill } from './blacksmith-cli.js'
import { uiDesignSkill } from './ui-design.js'
import { programmingParadigmsSkill } from './programming-paradigms.js'
import { frontendModularizationSkill } from './frontend-modularization.js'
import { frontendTestingSkill } from './frontend-testing.js'
import { cleanCodeSkill } from './clean-code.js'
import { aiGuidelinesSkill } from './ai-guidelines.js'
import { vueSkill } from './vue.js'
import { vueQuerySkill } from './vue-query.js'
import { vuePageStructureSkill } from './vue-page-structure.js'
import { vueModularizationSkill } from './vue-modularization.js'
import { vueTestingSkill } from './vue-testing.js'
import { nuxtUiSkill } from './nuxt-ui.js'
import { nuxtUiFormsSkill } from './nuxt-ui-forms.js'
import { vueAuthSkill } from './vue-auth.js'
import { blacksmithComposablesSkill } from './blacksmith-composables.js'

/**
 * Backend conventions per framework. They have entirely separate
 * conventions, so shipping the wrong set is worse than shipping none.
 */
const BACKEND_SKILLS: Record<BackendFramework, Skill[]> = {
  django: [djangoSkill, djangoRestAdvancedSkill, apiDocumentationSkill, backendModularizationSkill],
  express: [expressSkill, expressPrismaSkill, expressOpenApiSkill],
  fastapi: [fastapiSkill, fastapiSqlalchemySkill],
  spring: [springSkill, springJpaSkill],
}

interface FrontendSkills {
  /** The framework, data fetching and code layout. */
  core: Skill[]
  /** The UI kit; `--no-ui-skill` leaves these out. */
  ui: Skill[]
  testing: Skill[]
}

/** Frontend conventions per framework, for the same reason as the backend's. */
const FRONTEND_SKILLS: Record<FrontendFramework, FrontendSkills> = {
  react: {
    core: [reactSkill, reactQuerySkill, pageStructureSkill, frontendModularizationSkill],
    ui: [chakraUiReactSkill, chakraUiFormsSkill, chakraUiAuthSkill, blacksmithHooksSkill, uiDesignSkill],
    testing: [frontendTestingSkill],
  },
  vue: {
    core: [vueSkill, vueQuerySkill, vuePageStructureSkill, vueModularizationSkill],
    ui: [nuxtUiSkill, nuxtUiFormsSkill, vueAuthSkill, blacksmithComposablesSkill, uiDesignSkill],
    testing: [vueTestingSkill],
  },
}

export interface SkillSelection {
  projectType: ProjectType
  backendFramework: BackendFramework
  frontendFramework: FrontendFramework
  includeUiSkill: boolean
}

/** Every skill a project gets, in the order they are written. */
export function selectSkills({
  projectType,
  backendFramework,
  frontendFramework,
  includeUiSkill,
}: SkillSelection): Skill[] {
  const needsBackend = projectType === 'fullstack' || projectType === 'backend'
  const needsFrontend = projectType === 'fullstack' || projectType === 'frontend'
  const frontendSkills = FRONTEND_SKILLS[frontendFramework]

  return [
    coreRulesSkill,
    projectOverviewSkill,
    ...(needsBackend ? BACKEND_SKILLS[backendFramework] : []),
    ...(needsFrontend
      ? [
          ...frontendSkills.core,
          ...(includeUiSkill ? frontendSkills.ui : []),
          ...frontendSkills.testing,
        ]
      : []),
    blacksmithCliSkill,
    programmingParadigmsSkill,
    cleanCodeSkill,
    aiGuidelinesSkill,
  ]
}
