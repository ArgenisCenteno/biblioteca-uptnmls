import express from "express";
import { createUser, deleteUserById, getAllUsers, getUserById, login, updateUserById } from "../controllers/userController.js";
import { requireSignIn } from "../middleware/authMiddleware.js";

const router = express.Router();

//CREAR USUARIO
router.post("/create-user", createUser)

//INICIAR SESIÓN
router.post("/login", login)
router.get("/traer-usuarios", getAllUsers)
router.get("/traer-usuario/:id_usuario", getUserById)
router.delete("/eliminar-usuario/:id_usuario", deleteUserById)
router.put("/actualizar-usuario/:id_usuario", updateUserById)
//PROTEGER RUTA
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });

export default router