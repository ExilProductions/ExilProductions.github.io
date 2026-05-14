$base = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer"

# we enable the DisallowRun policy for the current user
New-Item -Path $base -Force | Out-Null
New-ItemProperty -Path $base -Name "DisallowRun" -PropertyType DWord -Value 1 -Force | Out-Null

# we create the application block list container
$block = Join-Path $base "DisallowRun"
New-Item -Path $block -Force | Out-Null

# we block VLC executable explicitly
New-ItemProperty -Path $block -Name "1" -PropertyType String -Value "vlc.exe" -Force | Out-Null

# we refresh Explorer so policy applies immediately
Stop-Process -Name explorer -Force
Start-Process explorer.exe
