export function isFieldEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return !value.name && !value.id; // MultiAutoComplete canonical shape
  return false;
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