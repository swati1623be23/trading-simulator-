const { z } = require("zod");

const emailSchema = z.string().email().max(255);
const passwordSchema = z.string().min(8).max(72);

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
      const firstIssue = result.error.issues?.[0];
      const firstMessage = firstIssue?.message || "Invalid request payload";
      return next(
        Object.assign(new Error(firstMessage), {
          status: 400,
          details: result.error.flatten(),
        })
      );
    }
    req.validated = result.data;
    return next();
  };
}

module.exports = { z, validate, emailSchema, passwordSchema };

