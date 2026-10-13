import { pascalCase, snakeCase, kebabCase, camelCase, noCase, sentenceCase } from 'change-case'
import pluralize from 'pluralize'

export interface NameVariants {
  /** PascalCase singular: Post */
  Name: string
  /** PascalCase plural: Posts */
  Names: string
  /** camelCase singular: post */
  name: string
  /** camelCase plural: posts */
  names: string
  /** snake_case singular: post */
  snake: string
  /** snake_case plural: posts */
  snakes: string
  /** kebab-case singular: post */
  kebab: string
  /** kebab-case plural: posts */
  kebabs: string
  /** UPPER_SNAKE singular: POST */
  UPPER: string
  /** UPPER_SNAKE plural: POSTS */
  UPPERS: string
  /** Words for UI text, sentence case singular: Blog post */
  Label: string
  /** Words for UI text, sentence case plural: Blog posts */
  Labels: string
  /** Words for UI text, lower case singular: blog post */
  label: string
  /** Words for UI text, lower case plural: blog posts */
  labels: string
}

/**
 * Generate all name variants from a singular PascalCase name
 *
 * @example
 * generateNames('BlogPost')
 * // {
 * //   Name: 'BlogPost', Names: 'BlogPosts',
 * //   name: 'blogPost', names: 'blogPosts',
 * //   snake: 'blog_post', snakes: 'blog_posts',
 * //   kebab: 'blog-post', kebabs: 'blog-posts',
 * //   UPPER: 'BLOG_POST', UPPERS: 'BLOG_POSTS',
 * //   Label: 'Blog post', Labels: 'Blog posts',
 * //   label: 'blog post', labels: 'blog posts',
 * // }
 */
export function generateNames(input: string): NameVariants {
  const singular = pascalCase(input)
  const plural = pluralize(singular)

  return {
    Name: singular,
    Names: plural,
    name: camelCase(singular),
    names: camelCase(plural),
    snake: snakeCase(singular),
    snakes: snakeCase(plural),
    kebab: kebabCase(singular),
    kebabs: kebabCase(plural),
    UPPER: snakeCase(singular).toUpperCase(),
    UPPERS: snakeCase(plural).toUpperCase(),
    Label: sentenceCase(singular),
    Labels: sentenceCase(plural),
    label: noCase(singular),
    labels: noCase(plural),
  }
}
