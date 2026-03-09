import { describe, it, expect } from 'vitest'
import { generateNames } from '../names.js'

describe('generateNames', () => {
  it('should generate all variants for a single word', () => {
    const result = generateNames('Post')

    expect(result).toEqual({
      Name: 'Post',
      Names: 'Posts',
      name: 'post',
      names: 'posts',
      snake: 'post',
      snakes: 'posts',
      kebab: 'post',
      kebabs: 'posts',
      UPPER: 'POST',
      UPPERS: 'POSTS',
    })
  })

  it('should generate all variants for a compound word', () => {
    const result = generateNames('BlogPost')

    expect(result.Name).toBe('BlogPost')
    expect(result.Names).toBe('BlogPosts')
    expect(result.name).toBe('blogPost')
    expect(result.names).toBe('blogPosts')
    expect(result.snake).toBe('blog_post')
    expect(result.snakes).toBe('blog_posts')
    expect(result.kebab).toBe('blog-post')
    expect(result.kebabs).toBe('blog-posts')
    expect(result.UPPER).toBe('BLOG_POST')
    expect(result.UPPERS).toBe('BLOG_POSTS')
  })

  it('should handle snake_case input', () => {
    const result = generateNames('user_profile')

    expect(result.Name).toBe('UserProfile')
    expect(result.snake).toBe('user_profile')
    expect(result.kebab).toBe('user-profile')
  })

  it('should handle kebab-case input', () => {
    const result = generateNames('order-item')

    expect(result.Name).toBe('OrderItem')
    expect(result.snake).toBe('order_item')
    expect(result.kebab).toBe('order-item')
  })

  it('should handle lowercase input', () => {
    const result = generateNames('category')

    expect(result.Name).toBe('Category')
    expect(result.Names).toBe('Categories')
    expect(result.snake).toBe('category')
    expect(result.snakes).toBe('categories')
  })
})
