const ErrorResponse = require("../utiles/errorResponse");

const errorHandler = (err, req, res, next) => {
    let error = {...err };
    error.message = err.message;

    console.log(err);




    //mongoose bad objectid
    if (err.name === 'CastError') {
        const message = `Bootcamp not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }


    res.status(error.statusCode || 500).json({
        sucess: false,
        error: error.message || "Server Error"

    });

};
module.exports = errorHandler;