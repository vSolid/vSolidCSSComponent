export const VS_PREFIX = "https://vsolid.org/properties#" as const;

export const VS = {
    operation: `${VS_PREFIX}operation`,
    delete: `${VS_PREFIX}delete`,
    insert: `${VS_PREFIX}insert`,
    delta_date: `${VS_PREFIX}delta_date`,
    delta_author: `${VS_PREFIX}delta_author`,
    next_delta: `${VS_PREFIX}next_delta`,
    contains_operation: `${VS_PREFIX}contains_operation`,
} as const;

export type VS = typeof VS;