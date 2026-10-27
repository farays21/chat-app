$body = @{username="test"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri http://localhost:3000/api/rooms/create -Method POST -ContentType "application/json" -Body $body
Write-Output $response
