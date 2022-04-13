const error = require('../utils/error');

module.exports = async (pageNumber, queryLimit, model, query, select, populate) =>  {
    let page = 1;
    let limit = 10;

    if(pageNumber) page = parseInt(pageNumber);
    if(queryLimit) limit = parseInt(queryLimit);

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {
      meta: {}
    }

    const queryResultCount = await model.find(query).skip(startIndex).countDocuments().exec();

    results.meta.totalResults = queryResultCount;

    if (endIndex < queryResultCount) {
      results.meta.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.meta.previous = {
        page: page - 1,
        limit: limit
      }
    }

    try {
      results.results = await model.find(query).sort('-createdAt').select(select).limit(limit).skip(startIndex).populate(populate).exec();

      return results;
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: e.message });
    }
}