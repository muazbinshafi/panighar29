// Helpers for surfacing friendly database error messages.
// Specifically handles Postgres unique-constraint violations (SQLSTATE 23505)
// from the unique indexes on contacts(type, lower(name)) and products(lower(sku)).

type PgErrorLike = { code?: string; message?: string; details?: string } | null | undefined;

export function isUniqueViolation(error: PgErrorLike): boolean {
  if (!error) return false;
  if (error.code === "23505") return true;
  const msg = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  return msg.includes("duplicate key") || msg.includes("unique constraint");
}

export function friendlyContactDuplicateMessage(name?: string, type?: string): string {
  const who = type ? `${type}` : "contact";
  return name
    ? `A ${who} named "${name}" already exists. Please use a different name or edit the existing one.`
    : `A ${who} with this name already exists.`;
}

export function friendlyProductDuplicateMessage(sku?: string, name?: string): string {
  if (sku) {
    return `A product with SKU "${sku}" already exists. SKUs must be unique.`;
  }
  return name
    ? `A product named "${name}" already exists.`
    : `A product with these details already exists.`;
}

/** Generic resolver — picks the right message based on which entity failed. */
export function describeDbError(
  error: PgErrorLike,
  entity: "contact" | "product",
  ctx: { name?: string; type?: string; sku?: string } = {}
): string {
  if (isUniqueViolation(error)) {
    return entity === "contact"
      ? friendlyContactDuplicateMessage(ctx.name, ctx.type)
      : friendlyProductDuplicateMessage(ctx.sku, ctx.name);
  }
  return error?.message || "Something went wrong. Please try again.";
}
