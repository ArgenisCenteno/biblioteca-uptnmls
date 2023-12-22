import JWT from "jsonwebtoken";
import bcrypt from "bcryptjs"
import {db} from "../connect.js"

//CREAR USUARIO
export const createUser = async (req, res)  => { 
    try {
        const {nombre, apellido, email, clave, cedula } = req.body;

        //VALIDAR CAMPOS DEL FORMULARIO
        if (!nombre) {
            return res.send({ error: "Nombre es requerido" });
          }
          if (!apellido) {
            return res.send({ message: "Apellido es requerido" });
          }
          if (!email) {
            return res.send({ message: "Email es requerida" });
          }
          if (!clave) {
            return res.send({ message: "Clave es requerido" });
          }
          if (!cedula) {
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
            const hashedPassword =  bcrypt.hashSync(clave, salt);
        
            const q =
              "INSERT INTO usuario (`nombre`,`apellido`,`email`,`clave`,`cedula`) VALUE (?)";
        
            const values = [
              nombre, apellido, email, hashedPassword, cedula
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

export const getAllUsers = async (req, res) => {
  try {
    const query = "SELECT id_usuario, nombre, apellido, email, cedula FROM usuario";
    
    db.query(query, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error inesperado");
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const query = "SELECT id_usuario, nombre, apellido, email, cedula FROM usuario WHERE id_usuario = ?";

    db.query(query, [id_usuario], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0) return res.status(404).json("Usuario no encontrado");
      return res.status(200).json(data[0]);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error inesperado");
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const query = "DELETE FROM usuario WHERE id_usuario = ?";
    
    db.query(query, [id_usuario], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows === 0) return res.status(404).json("Usuario no encontrado");
      return res.status(200).json("Usuario eliminado correctamente");
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error inesperado");
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const {nombre, apellido, email, clave, cedula } = req.body;

    // Validar que al menos uno de los campos a actualizar esté presente
    if (!nombre && !apellido && !email && !cedula) {
      return res.status(400).json("Se requiere al menos un campo para actualizar.");
    }

    const query = "UPDATE usuario SET ? WHERE id_usuario = ?";

    const updatedUser = {};

    if (nombre) updatedUser.nombre = nombre;
    if (apellido) updatedUser.apellido = apellido;
    if (email) updatedUser.email = email;
    if (cedula) updatedUser.cedula = cedula;

    db.query(query, [updatedUser, id_usuario], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows === 0) return res.status(404).json("Usuario no encontrado");
      return res.status(200).json("Usuario actualizado correctamente");
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error inesperado");
  }
};
