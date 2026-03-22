@echo off
docker logs openclaw > "%~dp0..\logs\log.txt" 2>&1
echo อัปเดต Log เรียบร้อยแล้วเมื่อวันที่ %DATE% เวลา %TIME%
