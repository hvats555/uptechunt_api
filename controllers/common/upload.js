exports.uploadFiles = async (req, res) => {      
    const response = {
        message: 'Files uploaded successfully',
        response: {
            results: req.files
        }
    }
    res.json(response);
}