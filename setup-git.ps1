# One-shot script: clean up any broken .git folder, init, commit, push.
# Run from PowerShell:  cd E:\obsidian\vault\Projects\lumina ; .\setup-git.ps1
#
# Requires: git installed, and GitHub auth already configured (gh auth login,
# Git Credential Manager, or a Personal Access Token cached).

$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

if (Test-Path .git) {
    Write-Host "Removing existing .git folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .git
}

Write-Host "Initializing git repo..." -ForegroundColor Cyan
git init -b main
git config user.email "lonnyupson@gmail.com"
git config user.name  "Lonny Upson"

Write-Host "Staging files..." -ForegroundColor Cyan
git add -A

Write-Host "Files to be committed:" -ForegroundColor Cyan
git status --short

Write-Host "`nCommitting..." -ForegroundColor Cyan
git commit -m "Initial commit: Lumina by Mirra Professional site"

Write-Host "Setting remote origin..." -ForegroundColor Cyan
git remote add origin https://github.com/erynjii/lumina.git

Write-Host "Pushing to origin/main..." -ForegroundColor Cyan
git push -u origin main

Write-Host "`nDone. Repo: https://github.com/erynjii/lumina" -ForegroundColor Green
