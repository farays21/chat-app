$roomId = "tbde2cva"

# Test join
$body = @{username="user2"} | ConvertTo-Json
$join = Invoke-RestMethod -Uri "http://localhost:3000/api/rooms/$roomId/join" -Method POST -ContentType "application/json" -Body $body
Write-Host "Join: $($join | ConvertTo-Json)"

# Test messages
$msgBody = @{username="user2"; text="Hello world"} | ConvertTo-Json
$msg = Invoke-RestMethod -Uri "http://localhost:3000/api/rooms/$roomId/messages" -Method POST -ContentType "application/json" -Body $msgBody
Write-Host "Message: $($msg | ConvertTo-Json)"

# Test events
$events = Invoke-RestMethod -Uri "http://localhost:3000/api/rooms/$roomId/events?username=user2"
Write-Host "Events: $($events | ConvertTo-Json -Depth 3)"
