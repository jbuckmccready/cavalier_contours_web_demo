export const BOOLEAN_NONE = "NONE";
export const BOOLEAN_OR = "OR";
export const BOOLEAN_AND = "AND";
export const BOOLEAN_NOT = "NOT";
export const BOOLEAN_XOR = "XOR";

export const ALL_BOOLEAN_OPS = [
    BOOLEAN_NONE,
    BOOLEAN_OR,
    BOOLEAN_AND,
    BOOLEAN_NOT,
    BOOLEAN_XOR
];

export function booleanOpAsInt(op) {
    switch (op) {
    case BOOLEAN_OR:
        return 0;
    case BOOLEAN_AND:
        return 1;
    case BOOLEAN_NOT:
        return 2;
    case BOOLEAN_XOR:
        return 3;
    }

    return 0;
}
