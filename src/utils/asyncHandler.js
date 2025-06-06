const asyncHandler = (requsetHandler) => {
  return (req, res, next) => {
    Promise.resolve(requsetHandler(req, res, next))
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  }
}

export default asyncHandler;




// const asyncHandler = (requsetHandler) => {async(req, res, next) => {
//     try {
//         await requsetHandler(req, res, next);
//         // next();
//     } catch (error) {
//         console.error(error);
//         res.status(err.code || 500).json({ 
//         Success: false,
//         message: err.message || 'Internal Server Error'
//         });
//     }
// }
    
    




