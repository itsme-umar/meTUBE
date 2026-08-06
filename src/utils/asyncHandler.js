const asyncHandler = (func) => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        req.status(error.code || 500).json({
            success: false,
            message: error.message
        })

    }
}


export default asyncHandler;