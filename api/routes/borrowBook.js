import express from "express"
import { createBorrowBook, deleteBorrowBookByCode, getAllBorrowBook, getAllCopiesBookOfBorrowBook, getBorrowBookByCode, getBorrowBooksByDateParam, getBorrowBooksByDateRange, getBorrowBooksByReturnDateRange, getCountBorrowBookByStudentGender, getLoanCountByPnfForStudents, getReturnBooksByDateParam, updateBorrowBook } from "../controllers/borrowBookController.js";
import { finalizarPrestamo } from "../controllers/borrowProjectController.js";
 
 
const router =  express.Router();

router.post("/createBorrowBook", createBorrowBook);
router.put("/updateBorrowBook/:id_prestamo", updateBorrowBook)
router.get("/getAllBoorwBook", getAllBorrowBook)
router.get("/getBorrwoBookDateRange", getBorrowBooksByDateRange)
router.get("/getBorrowBooksByReturnDateRange", getBorrowBooksByReturnDateRange)
router.get("/getBorrowBooksByDateParam/:interval", getBorrowBooksByDateParam)
router.get("/getReturnBooksByDateParam/:interval", getReturnBooksByDateParam)
router.get("/getLoanCountByPnfForStudents", getLoanCountByPnfForStudents)
router.get("/getCountBorrowBookByStudentGender", getCountBorrowBookByStudentGender)
router.get("/getAllCopiesBookOfBorrowBook/:codigo", getAllCopiesBookOfBorrowBook)
router.delete("/deleteBorrowBookByCode/:codigo", deleteBorrowBookByCode)

 /* 


router.get("/topBorrower", getBorrowerByRes)

router.get("/getBorrowerByPnf/:pnf", getBorrowerByPnf)
router.delete("/deleteBorrower/:codigo", deleteBorrowerByCode)



*/ 
 




export default router