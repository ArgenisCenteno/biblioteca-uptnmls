import {db} from "../connect.js"

export const createBorrowBook = async (req, res) => {
  try {
    const { fecha_prestamo, id_solicitante, estado, id_ejemplar } = req.body;

    // VALIDAR CAMPOS
    
    if (!id_solicitante) {
      return res.status(400).json({ message: "El ID del solicitante es requerido" });
    }
    
    if (!id_ejemplar || !Array.isArray(id_ejemplar) || id_ejemplar.length === 0) {
      return res.status(400).json({ message: "El arreglo de ID de ejemplar es requerido y debe contener al menos un elemento" });
    }

    // Lógica para guardar la información del préstamo en la tabla "prestamo"
    const insertPrestamoQuery = "INSERT INTO prestamo (`fecha_prestamo`, `id_solicitante`, `estado`) VALUES (?, ?, ?)";
    const prestamoValues = [fecha_prestamo, id_solicitante, 'En proceso'];

    db.query(insertPrestamoQuery, prestamoValues, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error al crear el préstamo" });
      }

      // Obtener el ID del préstamo recién creado
      const id_prestamo = result.insertId;

      // Ahora, guarda los id_prestamo y los id_ejemplar en la tabla "ejemplar_prestado"
      const insertEjemplarPrestadoQuery = "INSERT INTO ejemplar_prestado (`id_ejemplar`, `id_prestamo`) VALUES (?, ?)";

      // Usamos map para insertar cada ID de ejemplar en la tabla
      id_ejemplar.forEach((id) => {
        const ejemplarPrestadoValues = [id.id_ejemplar, id_prestamo];
      
        db.query(insertEjemplarPrestadoQuery, ejemplarPrestadoValues, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error al crear el registro en ejemplar_prestado" });
          }
        });
      });

      return res.status(200).json({ message: "Préstamo creado correctamente" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el préstamo" });
  }
};


  export const updateBorrowBook = async (req, res) => {
    try {
      const { id_prestamo } = req.params;
  
      // Validar que se proporcione un ID de préstamo válido
      if (!id_prestamo) {
        return res.status(400).json({ message: "Se requiere un ID de préstamo válido" });
      }
  
      // Obtener la fecha y hora actual en formato 'yyyy-mm-dd hh:mm:ss'
      const fecha_devolucion = new Date().toISOString().slice(0, 19).replace("T", " ");
  
      // Actualizar el préstamo en la base de datos
      const q = "UPDATE prestamo SET fecha_devolucion = ?, estado = 'completado' WHERE id_prestamo = ?";
  
      db.query(q, [fecha_devolucion, id_prestamo], (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error al actualizar el préstamo" });
        }
  
        if (data.affectedRows === 0) {
          return res.status(404).json({ message: "Préstamo no encontrado" });
        }
  
        return res.status(200).json({ message: "Préstamo actualizado correctamente" });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar el préstamo" });
    }
  };
  

  //OBTENER TODOS LOS LIBROS
  export const getAllBorrowBook = async (req, res) => {
    try {
      // Consulta para obtener todos los libros ordenados por título
      const query = "SELECT * FROM prestamo ORDER BY id_prestamo";
      
      db.query(query, (err, data) => {
        if (err) return res.status(500).json(err);
  
        // Devolver la lista de libros ordenados por título
        return res.status(200).json(data);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener la lista de libros" });
    }
  };

  //OBTENER TODOS LOS EJEMPLARES DE UN PRESTAMO

  export const getAllCopiesBookOfBorrowBook = async (req, res) =>{
    try {

      const {codigo} = req.params 
      const query = "SELECT * FROM ejemplar_prestado WHERE id_prestamo = ?";

      db.query(query, [codigo], (err, data) => {
          if(err) return res.status(500).json(err);

          return res.status(200).json(data)
      } )
      
    } catch (error) {
      
    }
  }
 
// OBTENER UN LIBRO POR SU CÓDIGO
export const getBorrowBookByCode = async (req, res) => {
    try {
      const { codigo } = req.params;
  
      // Consulta para obtener un libro por su código
      const query = "SELECT * FROM prestamo WHERE id_prestamo = ?";
      
      db.query(query, [codigo], (err, data) => {
        if (err) return res.status(500).json(err);
  
        if (data.length === 0) {
          return res.status(404).json("Libro no encontrado");
        }
  
        // Devolver el libro encontrado en la respuesta JSON
        return res.status(200).json(data[0]);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener el libro" });
    }
  };

  export const getBorrowBooksByDateRange = async (req, res) => {
    try {
      const { fechaDesde, fechaHasta } = req.query;
  
      // Validar que se proporcionen ambas fechas
      if (!fechaDesde || !fechaHasta) {
        return res.status(400).json({ message: "Se requieren ambas fechas: fechaDesde y fechaHasta" });
      }
  
      // Consultar los préstamos en el rango de fechas
      const q = "SELECT * FROM prestamo WHERE fecha_prestamo BETWEEN ? AND ?";
  
      db.query(q, [fechaDesde, fechaHasta], (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error al obtener los préstamos por rango de fecha" });
        }
  
        if (data.length === 0) {
          return res.status(404).json({ message: "No se encontraron préstamos en el rango de fecha proporcionado" });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener los préstamos por rango de fecha" });
    }
  };

  export const getBorrowBooksByReturnDateRange = async (req, res) => {
    try {
      const { fechaDesde, fechaHasta } = req.query;
  
      // Validar que se proporcionen ambas fechas
      if (!fechaDesde || !fechaHasta) {
        return res.status(400).json({ message: "Se requieren ambas fechas: fechaDesde y fechaHasta" });
      }
  
      // Consultar los préstamos en el rango de fechas de devolución
      const q = "SELECT * FROM prestamo WHERE fecha_devolucion BETWEEN ? AND ?";
  
      db.query(q, [fechaDesde, fechaHasta], (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error al obtener los préstamos por rango de fecha de devolución" });
        }
  
        if (data.length === 0) {
          return res.status(404).json({ message: "No se encontraron préstamos en el rango de fecha de devolución proporcionado" });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener los préstamos por rango de fecha de devolución" });
    }
  };
  
  export const getBorrowBooksByDateParam = async (req, res) => {
    try {
      const { interval } = req.params;
      let fromDate, toDate;
  
      // Get the current date
      const currentDate = new Date();
  
      // Calculate start and end dates based on the interval
      switch (interval) {
        case 'today':
          fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
          toDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);
          break;
        case 'yesterday':
          const yesterday = new Date(currentDate);
          yesterday.setDate(yesterday.getDate() - 1);
          fromDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
          toDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
          break;
        case 'week':
          fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay(), 0, 0, 0);
          toDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);
          break;
        case 'month':
          fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
          toDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
          break;
        case 'year':
          fromDate = new Date(currentDate.getFullYear(), 0, 1, 0, 0, 0);
          toDate = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59);
          break;
        default:
          return res.status(400).json({ message: "Parametro incorrecto" });
      }
  
      // Query loans within the date range
      const query = "SELECT * FROM prestamo WHERE fecha_prestamo BETWEEN ? AND ?";
  
      db.query(query, [fromDate, toDate], (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error al traer los prestamos por rango de fecha" });
        }
  
        if (data.length === 0) {
          return res.status(404).json({ message: "No hay prestamos encontrados por este rango de fecha" });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching loans within the specified time interval" });
    }
  };
  export const getReturnBooksByDateParam = async (req, res) => {
    try {
      const { interval } = req.params;
      let fromDate, toDate;
  
      // Get the current date
      const currentDate = new Date();
  
      // Calculate start and end dates based on the interval
      switch (interval) {
        case 'today':
          fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
          toDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);
          break;
        case 'yesterday':
          const yesterday = new Date(currentDate);
          yesterday.setDate(yesterday.getDate() - 1);
          fromDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
          toDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
          break;
        case 'week':
          fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay(), 0, 0, 0);
          toDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);
          break;
        case 'month':
          fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
          toDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
          break;
        case 'year':
          fromDate = new Date(currentDate.getFullYear(), 0, 1, 0, 0, 0);
          toDate = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59);
          break;
        default:
          return res.status(400).json({ message: "Invalid time interval" });
      }
  
      // Query loans based on the return date range
      const query = "SELECT * FROM prestamo WHERE fecha_devolucion BETWEEN ? AND ?";
  
      db.query(query, [fromDate, toDate], (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error fetching loans within the specified return date interval" });
        }
  
        if (data.length === 0) {
          return res.status(404).json({ message: "No loans found within the specified return date interval" });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching loans within the specified return date interval" });
    }
  };

  export const getLoanCountByPnfForStudents = async (req, res) => {
    try {
      // Consulta SQL para contar los préstamos realizados por estudiantes agrupados por PNF
      const query =
      "SELECT s.pnf, COUNT(p.id_prestamo) AS prestamo " +
      "FROM solicitante AS s " +
      "INNER JOIN prestamo AS p ON s.id_solicitante = p.id_solicitante " +
      "WHERE s.ocupacion = 'estudiante' " +
      "GROUP BY s.pnf";
  
      db.query(query, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error al obtener el número de préstamos por PNF para estudiantes" });
        }
  
        // Devolver los resultados como un objeto JSON
        const loanCountsByPnfForStudents = {};
        data.forEach((row) => {
          loanCountsByPnfForStudents[row.pnf] = row.prestamo;
        });
  
        return res.status(200).json(loanCountsByPnfForStudents);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener el número de préstamos por PNF para estudiantes" });
    }
  };
  
export const getCountBorrowBookByStudentGender = async(req, res) =>{
    try {
        // Consulta SQL para contar los préstamos realizados por estudiantes agrupados por PNF
        const query =
        "SELECT s.sexo, COUNT(p.id_prestamo) AS prestamo " +
        "FROM solicitante AS s " +
        "INNER JOIN prestamo AS p ON s.id_solicitante = p.id_solicitante " +
        "WHERE s.ocupacion = 'estudiante' " +
        "GROUP BY s.sexo";
    
        db.query(query, (err, data) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error al obtener el número de préstamos por PNF para estudiantes" });
          }
    
          // Devolver los resultados como un objeto JSON
          const loanCountsByPnfForStudents = {};
          data.forEach((row) => {
            loanCountsByPnfForStudents[row.sexo] = row.prestamo;
          });
    
          return res.status(200).json(loanCountsByPnfForStudents);
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el número de préstamos por PNF para estudiantes" });
      }
} 


export const deleteBorrowBookByCode = async (req, res) => {
    try {
      const { codigo } = req.params;
  
      // Consulta para eliminar un pretamo por su código
      const deleteQuery = "DELETE FROM prestamo WHERE id_prestamo = ?";
  
      db.query(deleteQuery, [codigo], (err, result) => {
        if (err) return res.status(500).json(err);
  
        if (result.affectedRows === 0) {
          return res.status(404).json("Prestamo no encontrado, no se pudo eliminar");
        }
       
        // Prestamo eliminado exitosamente
        return res.status(200).json("Prestamo eliminado correctamente");
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar el prestamo" });
    }
  };