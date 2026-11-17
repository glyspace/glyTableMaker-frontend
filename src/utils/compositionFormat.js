// Pure helpers for the composition format dialog (no React, easy to unit test).
//
// Form state used by the dialog:
//   texts   : { [residueId]: string }   text each residue is written as (raw, as typed)
//   order   : [residueId, ...]          badge list, maintained by syncOrder()
//   noOrder : boolean                   "No defined order" ticked
//   left / right : opening / closing character around a count
//   omitOne : a count of 1 may be omitted
//
// Stored definition (CompositionFormatDescriptor.definition) = serialized CompositionFormat:
//   {
//     "stringToResidue": { "H": "HEX", "N": "HEXNAC", ... },   text -> ResidueType constant name
//     "allowedOrder": ["H", "N", ...] | null,                   every defined text, or null = no order
//     "openingDelimiter": "(" | null,
//     "closingDelimiter": ")" | null,
//     "allowNumberOmission": true
//   }

export const DEFAULT_LEFT = "(";
export const DEFAULT_RIGHT = ")";

// residues shown when "Show all" is off
export const COMMON_RESIDUES = ["Hex", "HexNAc", "dHex", "Neu5Ac", "HexN", "HexA", "Pen", "P", "S", "Ac"];

// a residue field that has anything typed in it (it owns a badge)
export const entered = (v) => typeof v === "string" && v.length > 0;
// a residue text that counts (not blank after trimming)
export const defined = (v) => typeof v === "string" && v.trim() !== "";

export const emptyForm = () => ({
    name: "",
    description: "",
    texts: {},
    order: [],
    noOrder: false,
    left: DEFAULT_LEFT,
    right: DEFAULT_RIGHT,
    omitOne: true,
});

/**
 * Keeps the badge list in step with the residue texts:
 * badges of cleared residues disappear, residues that gained a text are appended at the end,
 * everything else keeps its position (a changed text only relabels its badge).
 */
export function syncOrder(order, texts, residueIds) {
    const kept = order.filter((id) => entered(texts[id]));
    const added = residueIds.filter((id) => entered(texts[id]) && !kept.includes(id));
    return [...kept, ...added];
}

/** Splits a list over `columns` columns, filling column by column (27 -> 9/9/9, 10 -> 4/3/3). */
export function splitIntoColumns(items, columns = 3) {
    const base = Math.floor(items.length / columns);
    const extra = items.length % columns;
    const result = [];
    let start = 0;
    for (let i = 0; i < columns; i++) {
        const size = base + (i < extra ? 1 : 0);
        result.push(items.slice(start, start + size));
        start += size;
    }
    return result;
}

/**
 * Column layout of the full list, the same as the composition dialog (Composition.js):
 * the first two columns hold `size` residues each, the third one the rest.
 */
export function splitByCapacity(items, size = 10) {
    return [items.slice(0, size), items.slice(size, size * 2), items.slice(size * 2)];
}

/** Example composition: residues in order, counts 1, 2, 3 ... */
export function buildExample({ texts, order, noOrder, left, right, omitOne }, residueIds) {
    const sequence = (noOrder ? residueIds : order).filter((id) => defined(texts[id]));
    return sequence
        .map((id, index) => {
            const count = index + 1;
            const text = texts[id].trim();
            if (count === 1 && omitOne) return text;
            return text + (left || "") + count + (left ? right || "" : "");
        })
        .join("");
}

/** Pairs where one text is the beginning of another, e.g. S and SA (a warning, not an error). */
export function findPrefixConflicts(texts, residueIds) {
    const defs = residueIds.filter((id) => defined(texts[id])).map((id) => ({ id, text: texts[id].trim() }));
    const seen = new Set();
    const result = [];
    defs.forEach((a) =>
        defs.forEach((b) => {
            if (a.id !== b.id && a.text !== b.text && b.text.startsWith(a.text)) {
                const key = a.text + "|" + b.text;
                if (!seen.has(key)) {
                    seen.add(key);
                    result.push({ prefix: a.text, longer: b.text });
                }
            }
        })
    );
    return result;
}

const hasWhitespace = (s) => /\s/.test(s || "");

/**
 * Same rules as the endpoint (see CompositionFormatValidator.java).
 * existing : [{id, name}] formats the account can see (system formats included)
 * currentId: id of the format being edited (null for add / clone)
 */
export function validateFormat({ name, texts, left, right }, residueIds, existing, currentId) {
    const errors = { name: null, residues: null, residueTexts: {}, left: null, right: null };

    const trimmedName = (name || "").trim();
    if (!trimmedName) {
        errors.name = "Name is required";
    } else if (
        (existing || []).some(
            (f) =>
                f.id !== currentId &&
                (f.name || "").trim().toLowerCase() === trimmedName.toLowerCase()
        )
    ) {
        errors.name = "A format with this name already exists. Please choose a different name.";
    }

    const byText = {};
    residueIds.forEach((id) => {
        const raw = texts[id];
        if (!entered(raw)) return;
        if (!defined(raw)) {
            errors.residueTexts[id] = "The text cannot be blank";
            return;
        }
        const t = raw.trim();
        (byText[t] = byText[t] || []).push(id);
    });
    Object.values(byText).forEach((ids) => {
        if (ids.length > 1) {
            ids.forEach((id) => {
                errors.residueTexts[id] = "Also used for " + ids.filter((o) => o !== id).join(", ");
            });
        }
    });

    if (!residueIds.some((id) => defined(texts[id]))) {
        errors.residues = "Enter a text for at least one residue";
    }

    if (hasWhitespace(left)) errors.left = "Cannot contain spaces";
    if (hasWhitespace(right)) errors.right = "Cannot contain spaces";

    const valid =
        !errors.name &&
        !errors.residues &&
        Object.keys(errors.residueTexts).length === 0 &&
        !errors.left &&
        !errors.right;

    return { errors, warnings: findPrefixConflicts(texts, residueIds), valid };
}

/** form state -> definition JSON that is sent to the server */
export function toDefinition({ texts, order, noOrder, left, right, omitOne }, residueIds, typeById) {
    const stringToResidue = {};
    residueIds.forEach((id) => {
        if (defined(texts[id]) && typeById[id]) stringToResidue[texts[id].trim()] = typeById[id];
    });
    return {
        stringToResidue,
        allowedOrder: noOrder
            ? null
            : order.filter((id) => defined(texts[id])).map((id) => texts[id].trim()),
        openingDelimiter: left ? left : null,
        closingDelimiter: left && right ? right : null, // a closing character alone has no effect
        allowNumberOmission: !!omitOne,
    };
}

/** stored definition -> form state */
export function fromDefinition(definition, residueIds, typeById) {
    const stored = (definition && definition.stringToResidue) || {};
    // enum constant name (or the plain residue name) -> residue id
    const idOf = (value) =>
        residueIds.find((id) => typeById[id] === value) || residueIds.find((id) => id === value);
    const texts = {};
    const idByText = {};
    Object.keys(stored).forEach((text) => {
        const id = idOf(stored[text]);
        if (id) {
            texts[id] = text;
            idByText[text] = id;
        }
    });
    const noOrder = !(definition && Array.isArray(definition.allowedOrder));
    const fromStored = noOrder ? [] : definition.allowedOrder.map((t) => idByText[t]).filter(Boolean);
    const left = (definition && definition.openingDelimiter) || "";
    return {
        texts,
        order: syncOrder(fromStored, texts, residueIds),
        noOrder,
        left,
        right: left ? (definition && definition.closingDelimiter) || "" : "",
        omitOne: !!(definition && definition.allowNumberOmission),
    };
}