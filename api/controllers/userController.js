import JWT from "jsonwebtoken";
import bcrypt from "bcryptjs"
import {db} from "../connect.js"

//CREAR USUARIO
export const createUser = async (req, res)  => { 
    try {
        const {name, lastName, email, password, cardId } = req.body;

        //VALIDAR CAMPOS DEL FORMULARIO
        if (!name) {
            return res.send({ error: "Nombre es requerido" });
          }
          if (!email) {
            return res.send({ message: "Email es requerido" });
          }
          if (!password) {
            return res.send({ message: "Clave es requerida" });
          }
          if (!lastName) {
            return res.send({ message: "Apellido es requerido" });
          }
          if (!cardId) {
            return res.send({ message: "Cédula es requerida" });
          }

          //CONSULTAR SI EL USUARIO EXISTE
          const q = "SELECT * FROM usuario WHERE email = ?";
          db.query(q, [email],  (err, data) => {
            if (err) return res.status(500).json(err);
            if (data.length) return res.status(409).json("Este usuario se encuentra registrado");
        //CREAR USUARIO
            //ENCRIPTAR CLAVE
            const salt =   bcrypt.genSaltSync(10);
            const hashedPassword =  bcrypt.hashSync(password, salt);
        
            const q =
              "INSERT INTO usuario (`nombre`,`apellido`,`email`,`clave`,`cedula`) VALUE (?)";
        
            const values = [
              name,
              lastName,
              email,
              hashedPassword,
              cardId,
            ];
        
            db.query(q, [values], (err, data) => {
              if (err) return res.status(500).json(err);
              return res.status(200).json("Usuario creado correctamente");
            });
          })

    } catch (error) {
        console.log(error)
        return res.status(500).json("Error inesperado")
    }


}


//INICIAR SESIÓN
export const login = async( req, res) => {
    try {
      
         //CONSULTAR SI EL USUARIO YA EXISTE
        const user =  "SELECT * FROM usuario WHERE email = ?";
         

        db.query(user, [req.body.email], (err, data) =>{
            if(err) return res.status(500).json(err);
            if(data.length === 0) return res.status(404).json("Usuario o contraseña incorrecta");
            
        //COMPARAR CONTRASEÑAS
        const checkPassword = bcrypt.compareSync(req.body.password, data[0].clave);
        if(!checkPassword) return res.status(400).json("Usuario o contraseña incorrecta ")
       // Enviar la información del usuario en la respuesta
      const usuarioInfo = {
        id_usuario: data[0].id_usuario,
        nombre: data[0].nombre,
        apellido: data[0].apellido,
        email: data[0].email,
        cedula: data[0].cedula,
      };     
        //GENERAR TOKEN
        const token =  JWT.sign({id_usuario: data.id_usuario }, process.env.JWT_SECRET, {
        expiresIn: "30d",
        });
        console.log(data.id_usuario)
        res.status(200).send({
        success: true,
        message: "Inicio de sesión",
        user: usuarioInfo,
        token,
      });
        })

    } catch (error) {
        console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
    }
}