export const BOOLEAN_NONE = "None";
export const BOOLEAN_OR = "Or";
export const BOOLEAN_AND = "And";
export const BOOLEAN_NOT = "Not";
export const BOOLEAN_XOR = "Xor";

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
