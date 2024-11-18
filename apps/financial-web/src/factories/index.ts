export const alphaAdvantagedKeys = {
  all: ['AAK'] as const,
  lists: () => [...alphaAdvantagedKeys.all, 'list'] as const,
  list: (filters: string) => [...alphaAdvantagedKeys.lists(), { filters }] as const,
  details: () => [...alphaAdvantagedKeys.all, 'detail'] as const,
  detail: (id: string) => [...alphaAdvantagedKeys.details(), id] as const,
}

export const financialModelingPrepKeys = {
  all: ['FMPK'] as const,
  lists: () => [...financialModelingPrepKeys.all, 'list'] as const,
  list: (filters: string) => [...financialModelingPrepKeys.lists(), { filters }] as const,
  details: () => [...financialModelingPrepKeys.all, 'detail'] as const,
  detail: (id: string) => [...financialModelingPrepKeys.details(), id] as const,
}

export const polygonKeys = {
  all: ['PO'] as const,
  lists: () => [...polygonKeys.all, 'list'] as const,
  list: (filters: string) => [...polygonKeys.lists(), { filters }] as const,
  details: () => [...polygonKeys.all, 'detail'] as const,
  detail: (id: string) => [...polygonKeys.details(), id] as const,
}
