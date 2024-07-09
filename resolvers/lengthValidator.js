export function lengthValidator (str, len) {
  const validators = ['MIN', 'MAX', 'EXACT']
  return {
    validate: (validator) => {
      const validatorIndex = validators.indexOf(validator)
      if (validatorIndex === -1) return
      switch (validator) {
        case 'MIN':
          return str.length >= len
        case 'MAX':
          return str.length <= len
        case 'EXACT':
          return str.length === len
        default:
          return false
      }
    }
  }
}