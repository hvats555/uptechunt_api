const setUploadOptions = (uploadOptions) => {
    return (req, res, next) => {
      req.uploadOptions = uploadOptions;
      next();
    }
}

module.exports = setUploadOptions;