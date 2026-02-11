param(
  [Parameter(Mandatory = $true)]
  [string]$RepoUrl
)

$ErrorActionPreference = 'Stop'

function Resolve-GitPath {
  $gitCmd = Get-Command git -ErrorAction SilentlyContinue
  if ($gitCmd) {
    return $gitCmd.Source
  }

  $toolsDir = Join-Path (Get-Location) '.tools'
  $dest = Join-Path $toolsDir 'mingit'
  New-Item -ItemType Directory -Force -Path $dest | Out-Null

  $zip = Join-Path $dest 'MinGit.zip'
  $urls = @(
    'https://github.com/git-for-windows/git/releases/download/v2.53.0.windows.1/MinGit-2.53.0-64-bit.zip',
    'https://sourceforge.net/projects/git-for-windows.mirror/files/v2.45.0.windows.1/MinGit-2.45.0-64-bit.zip/download'
  )

  $downloaded = $false
  foreach ($u in $urls) {
    try {
      Write-Host "Baixando MinGit: $u"
      Invoke-WebRequest -Uri $u -OutFile $zip -UseBasicParsing
      if ((Get-Item $zip).Length -gt 1000000) {
        $downloaded = $true
        break
      }
    } catch {
      Write-Host "Falha ao baixar: $u"
    }
  }

  if (-not $downloaded) {
    throw 'Git não encontrado e não foi possível baixar MinGit.'
  }

  Expand-Archive -Path $zip -DestinationPath $dest -Force

  $gitExe = Join-Path $dest 'cmd\\git.exe'
  if (-not (Test-Path $gitExe)) {
    throw "MinGit foi extraído, mas não encontrei: $gitExe"
  }

  return $gitExe
}

$git = Resolve-GitPath
Write-Host "Git: $(& $git --version)"

if (-not (Test-Path (Join-Path (Get-Location) '.git'))) {
  & $git init | Out-Host
}

try {
  & $git branch -M main | Out-Host
} catch {
}

$hasOrigin = $false
try {
  $remotes = & $git remote
  if ($remotes -match 'origin') { $hasOrigin = $true }
} catch {
}

if ($hasOrigin) {
  & $git remote set-url origin $RepoUrl | Out-Host
} else {
  & $git remote add origin $RepoUrl | Out-Host
}

& $git add -A | Out-Host

$needCommit = $true
try {
  & $git rev-parse --verify HEAD | Out-Null
  $needCommit = $false
} catch {
}

if ($needCommit) {
  & $git commit -m 'Initial commit' | Out-Host
} else {
  $status = & $git status --porcelain
  if ($status) {
    & $git commit -am 'Update project files' | Out-Host
  }
}

try {
  & $git pull origin main --allow-unrelated-histories | Out-Host
} catch {
  try {
    & $git pull origin master --allow-unrelated-histories | Out-Host
  } catch {
  }
}

& $git push -u origin main | Out-Host
