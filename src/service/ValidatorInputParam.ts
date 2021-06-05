class QueryError extends Error {

    public status:number;

    constructor(status, message) {

        super(message);
        this.status = status;
    }

    static missing(param) {
        return new QueryError(400, `Missing mandatory parameter '${param}'`);
    }

    static empty(param) {
        return new QueryError(400, `Empty parameter '${param}'`);
    }

    static mailformed(param) {
        return new QueryError(400, `Malformed parameter '${param}'`);
    }

    static notFound(param) {
        return new QueryError(404, `Not found '${param}'`);
    }

    static other(message) {
        return new QueryError(400, message);
    }
}

function mandatory(req, param, regexp) {

    if (req.query[param] === undefined || req.query[param] === null) {

        throw QueryError.missing(param)
    }

    if (req.query[param] === '') {

        throw QueryError.empty(param)
    }

    if (regexp && !regexp.test(req.query[param])) {

        throw QueryError.mailformed(param)
    }
}

function validateInt(req, param) {

    if (req.query[param]) {

        const number = parseInt(req.query[param],10);

        if (Number.isNaN(number) && Number.isFinite(number)) {
            throw QueryError.mailformed(param)
        }

        req.query[param] = number;
    }
}

export { QueryError };

export default {
    Error: QueryError,

    from(req, res, next) {

        mandatory(req, 'from',/^\d+$/);
        validateInt(req,'from');
        next();
    },

    to(req, res, next) {

        mandatory(req, 'to',/^\d+$/);
        validateInt(req,'to');
        next();
    },

    search(req, res, next) {

        mandatory(req, 'search',/^\S+$/);
        next();
    },

    pair(req, res, next) {

        mandatory(req, 'pair',/^\S+$/);
        next();
    },
};