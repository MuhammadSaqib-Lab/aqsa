import { Router } from "express";
import {
  listMessages,
  getMessage,
  updateMessage,
  deleteMessage,
} from "../../controllers/admin/message.controller";
import { validate } from "../../middleware/validate";
import { contactFiltersSchema, updateContactSchema, idParamSchema } from "../../validators/contact.validators";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", validate(contactFiltersSchema, "query"), listMessages);
router.get("/:id", validate(idParamSchema, "params"), getMessage);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateContactSchema),
  updateMessage
);
router.delete("/:id", validate(idParamSchema, "params"), deleteMessage);

export default router;
