const MAX_LOGS = 500;

const logs = [];

function addLog(entry) {
    const normalized = {
        id: entry.id || `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
        method: entry.method || 'Unknown',
        status: entry.status || 'success',
        user: entry.user || entry.userId || entry.identifier || entry.uid || entry.fingerprintId || 'unknown',
        deviceId: entry.deviceId || 'unknown',
        location: entry.location || 'Smart Office',
    };

    logs.unshift(normalized);
    if (logs.length > MAX_LOGS) {
        logs.length = MAX_LOGS;
    }

    return normalized;
}

function getLogs(limit = 100) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
    return logs.slice(0, safeLimit);
}

module.exports = {
    addLog,
    getLogs,
};
