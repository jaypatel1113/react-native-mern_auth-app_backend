exports.sendError = (res, message, status=401) => {
    res
        .status(status)
        .json({
            success: false,
            message,
        });
}