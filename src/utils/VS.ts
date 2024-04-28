export const VS = {
    operation: "https://vsolid.org/properties#operation",
    delete: "https://vsolid.org/properties#delete",
    insert: "https://vsolid.org/properties#insert",
    delta_date: "https://vsolid.org/properties#delta_date",
    delta_author: "https://vsolid.org/properties#delta_author",
    next_delta: "https://vsolid.org/properties#next_delta",
    contains_operation: "https://vsolid.org/properties#contains_operation",
} as const;

export type VS = typeof VS;