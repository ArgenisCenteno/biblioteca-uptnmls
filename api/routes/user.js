import express from "express";
import { createUser, login } from "../controllers/userController.js";
import { requireSignIn } from "../middleware/authMiddleware.js";

const router = express.Router();

//CREAR USUARIO
router.post("/create-user", createUser)

//INICIAR SESIÓN
router.post("/login", login)

//PROTEGER RUTA
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });

export default router