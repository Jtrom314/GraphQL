const validators = Object.freeze({
  MIN: 'MIN',
  MAX: 'MAX',
  EXACT: 'EXACT'
})


function lengthValidator (str, len) {
  return {
    validate: (validator) => {
      switch (validator) {
        case validators.MIN:
          return str.length >= len
        case validators.MAX:
          return str.length <= len
        case validators.EXACT:
          return str.length === len
        default:
          return false
      }
    }
  }
}

export { validators, lengthValidator }