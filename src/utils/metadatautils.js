export function isFieldEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    if (value.user || value.software) {
      let empty = false;
      if (Array.isArray(value.user)) empty = (value.user.length === 0);
      if (!empty) return false;
      if (Array.isArray(value.software)) empty = (value.software.length === 0);
      return empty;
    }
    return !value.name && !value.id; 
  }
  return false;
}

function pruneValue(value) {
    if (Array.isArray(value)) {
        const items = value.filter((item) => !isFieldEmpty(item));
        return items.length > 0 ? items : undefined;
    }
    return isFieldEmpty(value) ? undefined : value;
}
 
// complex fields hold rows of sub-fields; prune inside each row and drop rows that end up empty
function pruneComplex(field, value) {
    const rows = Array.isArray(value) ? value : (value === null || value === undefined ? [] : [value]);
    const kept = rows
        .filter((row) => row && typeof row === "object" && !Array.isArray(row))
        .map((row) => pruneEmptyValues(field.fields, row))
        .filter((row) => Object.keys(row).length > 0);
    if (kept.length === 0) return undefined;
    return Array.isArray(value) ? kept : kept[0];     // keep the shape the value came in
}
 
/**
 * @param fields  the field definitions the values belong to (sample type fields plus the general ones)
 * @param values  the metadata values object
 * @returns a new object without empty entries; the input is not modified
 */
export function pruneEmptyValues(fields, values) {
    const result = {};
    Object.keys(values ?? {}).forEach((key) => {
        const field = (fields ?? []).find((f) => f.id === key);
        const pruned = field && (field.type === "complex") && field.fields
            ? pruneComplex(field, values[key])
            : pruneValue(values[key]);
        if (pruned !== undefined) result[key] = pruned;
    });
    return result;
}

export function getXorPartners(fieldId, xorGroups) {
  if (!xorGroups) return [];
  const group = xorGroups.find((g) => g.fields.includes(fieldId));
  if (!group) return [];
  return { partners: group.fields.filter((id) => id !== fieldId), message: group.message };
}


export function validateXorGroups(values, xorGroups) {
  const violations = {};
  if (!xorGroups) return violations;

  xorGroups.forEach((group) => {
    const filledFields = group.fields.filter((id) => !isFieldEmpty(values[id]));
    if (filledFields.length > 1) {
      filledFields.forEach((id) => {
        violations[id] = group.message;
      });
    }
  });

  return violations;
}

export function getIdFromUri (uri) {
        if (!uri) return "";

        // Species URIs like ...?id=9606
        const idMatch = uri.match(/id=([^&]+)/);
        if (idMatch) {
            return idMatch[1];
        }

        // Other namespaces: take text after last '/'
        return uri.substring(uri.lastIndexOf("/") + 1);
    };