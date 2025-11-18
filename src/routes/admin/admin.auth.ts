import { Router } from "express";
import user from "../../models/user";
import { ApiError } from "../../utils/ApiError";
import requestValidator from "../../helpers/validation";
import { userLogin, userRegister } from "../../controllers/userController";

const router = Router();
router.get("/login", userLogin);

router.get("/register", requestValidator, userRegister);

//! CLEAR ALL THE ENTRY API ~
router.delete("/delAll", async (req, res) => {
  const delRes = await user.deleteMany();

  res.send({
    status: 1,
    msg: "All users has been deleted successfully ...",
    delRes,
  });
});

//!   View All Entrys ...
router.get("/view", async (req, res) => {
  const Users = await user.find();
  res.send({ Users });
});

export default router;
