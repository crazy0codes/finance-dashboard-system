function isValidNumber(value) {
    return !isNaN(value) && Number(value) >= 0
}

function isValidDate(date) {
    return !isNaN(new Date(date).getTime())
}

export function validateGetSummary(req, res, next) {
    next()
}

export function validateGetCategoryTotals(req, res, next) {
    next()
}

export function validateGetRecentActivity(req, res, next) {
    const { limit } = req.query

    if (limit !== undefined) {
        const parsed = parseInt(limit);

        if (isNaN(parsed) || parsed <= 0) {
            return res.status(400).json({ error: "Invalid limit" })
        }
    }

    next()
}

export function validateGetMonthlyTrends(req, res, next) {
    const { startDate, endDate } = req.query

    if (startDate && !isValidDate(startDate)) {
        return res.status(400).json({ 
            error: "Invalid startDate" 
        });
    }

    if (endDate && !isValidDate(endDate)) {
        return res.status(400).json({ 
            error: "Invalid endDate" 
        });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({
            error: "startDate cannot be greater than endDate"
        })
    }

    next()
}