<#
.SYNOPSIS
    ANAMNESIS Windows Installer Script

.DESCRIPTION
    Downloads and installs ANAMNESIS desktop application.
    Creates desktop shortcut and Start menu entry.

.PARAMETER Uninstall
    Removes ANAMNESIS and all associated files.

.EXAMPLE
    .\installer.ps1
    Installs ANAMNESIS

.EXAMPLE
    .\installer.ps1 -Uninstall
    Uninstalls ANAMNESIS
#>

param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

# Configuration
$AppName = "ANAMNESIS"
$AppVersion = "3.0.0"
$InstallDir = Join-Path $env:LOCALAPPDATA $AppName
$Desktop = [Environment]::GetFolderPath('Desktop')
$StartMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
$ShortcutPath = Join-Path $Desktop "$AppName.lnk"
$StartMenuPath = Join-Path $StartMenu "$AppName.lnk"

function Write-Banner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                     ANAMNESIS v$AppVersion                      ║" -ForegroundColor Cyan
    Write-Host "║              The Mirror of Your Mind                      ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Install-Anamnesis {
    Write-Banner

    # Check if already installed
    if (Test-Path $InstallDir) {
        Write-Host "⚠ Existing installation found. Updating..." -ForegroundColor Yellow
    }

    # Create installation directory
    Write-Host "📁 Creating installation directory..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

    # Download latest release
    Write-Host "📥 Downloading ANAMNESIS..." -ForegroundColor Cyan
    $DownloadUrl = "https://github.com/anamnesis-app/anamnesis/releases/latest/download/ANAMNESIS-Setup.exe"
    $InstallerPath = Join-Path $env:TEMP "ANAMNESIS-Setup.exe"

    try {
        Invoke-WebRequest -Uri $DownloadUrl -OutFile $InstallerPath -UseBasicParsing
    }
    catch {
        Write-Host "❌ Download failed. Please check your internet connection." -ForegroundColor Red
        Write-Host "   You can manually download from: $DownloadUrl" -ForegroundColor Gray
        exit 1
    }

    # Run installer
    Write-Host "⚙ Installing..." -ForegroundColor Cyan
    Start-Process -FilePath $InstallerPath -ArgumentList "/S" -Wait

    # Create shortcuts
    Write-Host "🔗 Creating shortcuts..." -ForegroundColor Gray
    $WshShell = New-Object -ComObject WScript.Shell

    # Desktop shortcut
    $DesktopShortcut = $WshShell.CreateShortcut($ShortcutPath)
    $DesktopShortcut.TargetPath = Join-Path $InstallDir "$AppName.exe"
    $DesktopShortcut.WorkingDirectory = $InstallDir
    $DesktopShortcut.Description = "ANAMNESIS - The Mirror of Your Mind"
    $DesktopShortcut.Save()

    # Start Menu shortcut
    $StartMenuShortcut = $WshShell.CreateShortcut($StartMenuPath)
    $StartMenuShortcut.TargetPath = Join-Path $InstallDir "$AppName.exe"
    $StartMenuShortcut.WorkingDirectory = $InstallDir
    $StartMenuShortcut.Description = "ANAMNESIS - The Mirror of Your Mind"
    $StartMenuShortcut.Save()

    # Cleanup
    Remove-Item $InstallerPath -Force -ErrorAction SilentlyContinue

    Write-Host ""
    Write-Host "✅ ANAMNESIS installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Launch from:" -ForegroundColor Gray
    Write-Host "   • Desktop shortcut" -ForegroundColor White
    Write-Host "   • Start Menu" -ForegroundColor White
    Write-Host "   • $InstallDir\$AppName.exe" -ForegroundColor White
    Write-Host ""
}

function Uninstall-Anamnesis {
    Write-Banner
    Write-Host "🗑 Uninstalling ANAMNESIS..." -ForegroundColor Yellow

    # Remove installation directory
    if (Test-Path $InstallDir) {
        Remove-Item $InstallDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed installation files" -ForegroundColor Gray
    }

    # Remove shortcuts
    if (Test-Path $ShortcutPath) {
        Remove-Item $ShortcutPath -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed desktop shortcut" -ForegroundColor Gray
    }

    if (Test-Path $StartMenuPath) {
        Remove-Item $StartMenuPath -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed Start Menu shortcut" -ForegroundColor Gray
    }

    # Note: User data is preserved
    $UserDataPath = Join-Path $env:APPDATA $AppName
    if (Test-Path $UserDataPath) {
        Write-Host ""
        Write-Host "   ℹ User data preserved at:" -ForegroundColor Cyan
        Write-Host "   $UserDataPath" -ForegroundColor White
        Write-Host "   Delete manually if not needed." -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "✅ ANAMNESIS uninstalled." -ForegroundColor Yellow
    Write-Host ""
}

# Main
if ($Uninstall) {
    Uninstall-Anamnesis
}
else {
    Install-Anamnesis
}
