#!/bin/bash

# Production Health Check Script

echo "=== Nimora Production Health Check ==="
echo ""

# Check backend
echo "Backend Health Check..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✓ Backend: OK"
else
    echo "✗ Backend: FAILED (HTTP $BACKEND_STATUS)"
fi

# Check frontend
echo "Frontend Health Check..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✓ Frontend: OK"
else
    echo "✗ Frontend: FAILED (HTTP $FRONTEND_STATUS)"
fi

# Check database
echo "Database Connection Check..."
psql $DATABASE_URL -c "SELECT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Database: OK"
else
    echo "✗ Database: FAILED"
fi

# Check Redis
echo "Redis Connection Check..."
redis-cli -u $REDIS_URL ping > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Redis: OK"
else
    echo "✗ Redis: FAILED"
fi

# Check disk space
echo "Disk Space Check..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo "✓ Disk Space: ${DISK_USAGE}% used"
else
    echo "⚠ Disk Space: ${DISK_USAGE}% used (warning)"
fi

# Check memory
echo "Memory Check..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", ($3/$2) * 100)}')
if [ "$MEMORY_USAGE" -lt 80 ]; then
    echo "✓ Memory: ${MEMORY_USAGE}% used"
else
    echo "⚠ Memory: ${MEMORY_USAGE}% used (warning)"
fi

echo ""
echo "=== Health Check Complete ==="
