import slugify from 'slugify'

/**
 * Converts human readable tokens into tailwind config friendly ones
 *
 * @param {array} tokens {name: string, value: any}
 * @return {object} {key, value}
 */
const tokensToTailwind = (tokens) => {
  const nameSlug = (text) => slugify(text, { lower: true })
  const response = {}

  tokens.forEach(({ name, value }) => {
    response[nameSlug(name)] = value
  })

  return response
}

export default tokensToTailwind
