$ErrorActionPreference = "Stop"
$sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$latest = Join-Path $sdk "cmdline-tools\latest"
$sdkmanager = Join-Path $latest "bin\sdkmanager.bat"
New-Item -ItemType Directory -Force -Path (Join-Path $sdk "cmdline-tools") | Out-Null

if (-not (Test-Path -LiteralPath $sdkmanager)) {
  $zip = Join-Path $env:TEMP "commandlinetools-win.zip"
  $url = "https://dl.google.com/android/repository/commandlinetools-win-15859902_latest.zip"
  Write-Output "Downloading command line tools..."
  curl.exe -L --fail -o $zip $url
  if ($LASTEXITCODE -ne 0) { throw "Download failed: $url" }
  $extract = Join-Path $env:TEMP "cmdline-tools-extract"
  if (Test-Path $extract) { Remove-Item -LiteralPath $extract -Recurse -Force }
  Expand-Archive -LiteralPath $zip -DestinationPath $extract
  if (Test-Path $latest) { Remove-Item -LiteralPath $latest -Recurse -Force }
  Move-Item -LiteralPath (Join-Path $extract "cmdline-tools") -Destination $latest
}

$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$yes = (1..200 | ForEach-Object { "y" }) -join "`n"
$yes | & $sdkmanager --sdk_root=$sdk `
  "platform-tools" `
  "platforms;android-37" `
  "build-tools;37.0.0" `
  "ndk;27.1.12297006" `
  "cmake;3.22.1"
if ($LASTEXITCODE -ne 0) { throw "sdkmanager install failed" }
Write-Output "SDK_READY $sdk"
