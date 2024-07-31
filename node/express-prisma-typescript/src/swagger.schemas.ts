export const SignupInputDTO = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
    },
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
  },
  required: ['email', 'username', 'password']
}

export const token = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
    }
  }
}

export const validationError = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
    },
    code: {
      type: 'number',
      default: 400
    },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          property: {
            type: 'string'
          },
          children: {
            type: 'array'
          },
          constraints: {
            type: 'object'
          }
        }
      }
    }
  }
}