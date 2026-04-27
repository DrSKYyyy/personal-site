param(
  [string]$Message = "",
  [switch]$SkipBuild = $false,
  [switch]$Help = $false
)

$ErrorActionPreference = "Stop"
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-Color($Text, $Color) {
  Write-Host $Text -ForegroundColor $Color
}

function Check-GitStatus {
  $status = git status --porcelain
  if (-not $status) {
    Write-Color "没有检测到变更，无需发布。" $Yellow
    exit 0
  }
  return $status
}

function Get-DefaultMessage {
  $changed = @()
  $added = @()

  git diff --cached --name-only | ForEach-Object { $changed += $_ }
  git diff --name-only | ForEach-Object { $changed += $_ }

  $addedFiles = git status --porcelain | Where-Object { $_ -match '^\?\?' } | ForEach-Object { $_ -replace '^\?\? ', '' }

  $parts = @()
  $hasBlog = $false
  $hasProject = $false
  $hasConfig = $false

  foreach ($f in $changed + $addedFiles) {
    if ($f -match 'src/content/blog/') { $hasBlog = $true }
    elseif ($f -match 'src/content/projects/') { $hasProject = $true }
    elseif ($f -match '\.(yml|json|config|js|css|astro)$') { $hasConfig = $true }
  }

  if ($hasBlog) { $parts += "📝 更新文章" }
  if ($hasProject) { $parts += "📦 更新项目" }
  if ($hasConfig) { $parts += "🔧 配置调整" }
  if ($parts.Count -eq 0) { $parts += "🔄 站点更新" }

  $date = Get-Date -Format "yyyy-MM-dd HH:mm"
  return "$($parts -join ' | ') | $date"
}

function Show-Help {
  Write-Color "══════════════════════════════════════" $Cyan
  Write-Color "      🌟 追风少年 - 一键发布脚本" $Cyan
  Write-Color "══════════════════════════════════════" $Cyan
  Write-Host ""
  Write-Color "用法:" $Yellow
  Write-Color "  .\deploy.ps1              - 交互式发布" $White
  Write-Color "  .\deploy.ps1 -Message 'xxx' - 直接提交" $White
  Write-Color "  .\deploy.ps1 -SkipBuild   - 跳过构建检查" $White
  Write-Color "  .\deploy.ps1 -Help        - 显示帮助" $White
  Write-Host ""
  Write-Color "工作流:" $Yellow
  Write-Color "  1. 在 Obsidian 写完文章" $White
  Write-Color "  2. 运行此脚本" $White
  Write-Color "  3. 自动构建验证 → 提交 → 推送" $White
  Write-Host ""
  Write-Color "软链接设置 (Obsidian):" $Yellow
  Write-Color "  New-Item -ItemType SymbolicLink -Path .\src\content\blog -Target D:\Obsidian\vault\blog" $White
  Write-Host ""
  exit 0
}

function Main {
  if ($Help) { Show-Help }

  Write-Color "══════════════════════════════════════" $Cyan
  Write-Color "      🌟 追风少年 - 一键发布" $Cyan
  Write-Color "══════════════════════════════════════" $Cyan
  Write-Host ""

  # Step 1: Check Git status
  Write-Color "📋 检查变更状态..." $Cyan
  $status = Check-GitStatus
  Write-Host $status
  Write-Host ""

  # Step 2: Build check (optional)
  if (-not $SkipBuild) {
    Write-Color "🔨 构建检查中..." $Cyan
    $buildResult = & npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
      Write-Color "❌ 构建失败！请修复错误后再发布。" $Red
      Write-Host $buildResult
      exit 1
    }
    Write-Color "✅ 构建成功！" $Green
    Write-Host ""
  }

  # Step 3: Stage all changes
  Write-Color "📦 暂存所有变更..." $Cyan
  git add -A
  Write-Color "✅ 暂存完成" $Green
  Write-Host ""

  # Step 4: Get commit message
  $defaultMsg = Get-DefaultMessage
  if ([string]::IsNullOrEmpty($Message)) {
    Write-Color "✏️  提交信息 (直接回车使用默认):" $Yellow
    Write-Color "   默认: $defaultMsg" $Gray
    $input = Read-Host "   输入"
    if ([string]::IsNullOrWhiteSpace($input)) {
      $Message = $defaultMsg
    } else {
      $Message = $input
    }
  }
  Write-Host ""

  # Step 5: Commit
  Write-Color "💾 提交中..." $Cyan
  git commit -m $Message
  Write-Color "✅ 提交完成: $Message" $Green
  Write-Host ""

  # Step 6: Push
  Write-Color "☁️  推送到 GitHub..." $Cyan
  $branch = git branch --show-current
  git push origin $branch
  if ($LASTEXITCODE -eq 0) {
    Write-Color "✅ 推送成功！" $Green
    Write-Color "🌐 GitHub Pages 将在几分钟内自动部署。" $Cyan
  } else {
    Write-Color "❌ 推送失败，请检查网络和 GitHub 权限。" $Red
    exit 1
  }
  Write-Host ""

  Write-Color "══════════════════════════════════════" $Cyan
  Write-Color "      ✨ 发布完成！ 少年继续追风吧！" $Cyan
  Write-Color "══════════════════════════════════════" $Cyan
}

Main
